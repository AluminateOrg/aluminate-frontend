"use client";

import { useState } from "react";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Download } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { set } from "date-fns";
import { useSelector } from "react-redux";
import axiosAdmin from "@/axiosInstances/axiosAdmin";

export default function BulkCsvUpload() {
  const { groups } = useOrg();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    invalidRows: any[];
  } | null>(null);
  const [bulkUploadForm, setBulkUploadForm] = useState({
    selectedGroups: [] as string[],
  });
  const [showInvalidPopup, setShowInvalidPopup] = useState(false);
  const [editableRows, setEditableRows] = useState<any[]>([]);

  const [finalizeProgress, setFinalizeProgress] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const orgId = useSelector((state: any) => state.user?.organization?.id)

  const handleGroupSelection = (groupId: string) => {
    setBulkUploadForm((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter((id) => id !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setUploadResult(null);
    } else {
      toast.error("Please select a valid CSV file");
    }
  };



  console.log("selected group data: ", bulkUploadForm.selectedGroups);
  console.log("groups from redux: ", groups);

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }
    if (bulkUploadForm.selectedGroups.length === 0) {
      toast.error("Please select at least one group");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("groups", JSON.stringify(bulkUploadForm.selectedGroups));
    formData.append("organizationId", orgId || "");

    console.log("formData::", formData.get("groups"));

    try {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/admin/bulk-upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = async () => {
        setLoading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          console.log("data from upload:", data);
          setUploadResult(data);

          if (data.invalidRows && data.invalidRows.length > 0) {
            setEditableRows(data.invalidRows);
            setShowInvalidPopup(true);
          }
          setCsvFile(null);

          toast.success("Upload completed");
        } else {
          const errorData = JSON.parse(xhr.responseText);
          toast.error(`Upload failed: ${errorData.message || "Unknown error"}`);
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        toast.error("Upload failed due to network error.");
      };

      xhr.send(formData);
    } catch (error: any) {
      setLoading(false);
      console.error("Bulk upload error:", error);
      toast.error(`Upload failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    const updatedRows = [...editableRows];
    updatedRows[rowIndex][field] = value;
    setEditableRows(updatedRows);
  };

  const finalizeBulkUpload = async () => {
    setFinalizing(true);
    setFinalizeProgress(0);

    const interval = setInterval(() => {
      setFinalizeProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 200);

    const formData = new FormData();
    formData.append("rows", JSON.stringify(editableRows));
    formData.append("groups", JSON.stringify(bulkUploadForm.selectedGroups));
    formData.append("organizationId", JSON.stringify(orgId));

    try {
      
      const response = await axiosAdmin.post('/member/bulk-finalize', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const data = await response.data;
      console.log("data from finalize:", data);
      setUploadResult(data);

      if (data.invalidRows && data.invalidRows.length > 0) {
        setEditableRows(data.invalidRows);
        toast.error("Some rows are still invalid. Please fix them.");
      } else {
        toast.success(`${data.savedCount} members saved successfully!`);
        setShowInvalidPopup(false);
      }
    } catch (error: any) {
      console.error("Finalize error:", error);
      toast.error(`Finalize failed: ${error.message || "Unknown error"}`);
    } finally {
      clearInterval(interval);
      setFinalizeProgress(100);
      setTimeout(() => {
        setFinalizing(false);
      }, 500);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,designation,company,graduationYear,degree,location\nJohn Doe,john.doe@example.com,+1234567890,Software Engineer,Tech Corp,2019,Computer Science,San Francisco CA\nJane Smith,jane.smith@example.com,+0987654321,Product Manager,Innovation Inc,2020,Business Administration,New York NY`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Bulk CSV Upload</span>
          </CardTitle>
          <CardDescription>
            Upload multiple members using a CSV file and assign them to groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CSV Template */}
          <div className="bg-muted p-4 rounded-lg flex justify-between">
            <div>
              <h4 className="font-medium">CSV Template</h4>
              <p className="text-sm text-muted-foreground">
                Download the template file with required columns.
              </p>
            </div>
            <Button variant="outline" onClick={() => downloadTemplate()}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          </div>

          {/* Group Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Group Assignment *</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.isArray(groups) &&
                groups.map((group) => (
                  <div
                    key={group.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      bulkUploadForm.selectedGroups.includes(group.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={() => handleGroupSelection(group.id)}
                  >
                    <h4 className="font-medium">{group.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {group.description || "No description available"}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* File Upload */}
          <form onSubmit={handleCSVUpload} className="space-y-4">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            {csvFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </p>
            )}

            {loading && (
              <div className="space-y-2">
                <Progress
                  value={uploadProgress}
                  className="h-2 transition-all duration-300"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button type="submit" disabled={!csvFile || loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload CSV
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invalid Rows Popup */}
      <Dialog open={showInvalidPopup} onOpenChange={setShowInvalidPopup}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Invalid Rows - Fix and Resubmit</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto max-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIC</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>RegNo</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="hover:bg-accent/50">
                    {["nic", "name", "email", "phone", "regNo", "batch"].map(
                      (field) => (
                        <TableCell key={field}>
                          <Input
                            value={row[field]}
                            onChange={(e) =>
                              handleCellChange(rowIndex, field, e.target.value)
                            }
                            className={`${
                              row.errors?.[field] ? "border-red-500" : ""
                            }`}
                          />
                          {row.suggestions?.[field] && (
                            <p className="text-green-600 text-xs">
                              Suggestion: {row.suggestions[field]}
                            </p>
                          )}
                        </TableCell>
                      )
                    )}
                    <TableCell className="text-red-500 text-xs">
                      {Object.values(row.errors || {}).join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter className="flex flex-col space-y-3">
            {finalizing && (
              <div className="w-full">
                <Progress
                  value={finalizeProgress}
                  className="h-2 transition-all duration-300"
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  Saving... {finalizeProgress}%
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowInvalidPopup(false)}
                disabled={finalizing}
              >
                Cancel
              </Button>
              <Button onClick={finalizeBulkUpload} disabled={finalizing}>
                {finalizing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" /> Saving...
                  </>
                ) : (
                  "Save & Resubmit"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
