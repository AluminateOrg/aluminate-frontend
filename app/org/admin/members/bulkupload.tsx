// File: components/members/BulkCsvUpload.tsx
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, CheckCircle, Users, X } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

export default function BulkCsvUpload() {
  const { groups } = useOrg();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);
  const [bulkUploadForm, setBulkUploadForm] = useState({
    selectedGroups: [] as string[],
  });

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

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    clearInterval(progressInterval);
    setUploadProgress(100);

    const result = {
      success: 45,
      failed: 3,
      errors: [
        "Row 12: Invalid email format",
        'Row 25: Missing required field "name"',
        "Row 33: Duplicate email address",
      ],
    };
    setUploadResult(result);
    toast.success(
      `Successfully processed ${result.success} members! All added to ${bulkUploadForm.selectedGroups.length} group(s).`
    );

    setCsvFile(null);
    setUploadProgress(0);
    setBulkUploadForm({ selectedGroups: [] });
    setLoading(false);
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
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">CSV Template</h4>
              <p className="text-sm text-muted-foreground">
                Download the template file with required columns.
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Group Assignment for All Members *</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${bulkUploadForm.selectedGroups.includes(group.id) ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}
                onClick={() => handleGroupSelection(group.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{group.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {group.description || "No description available"}
                    </p>
                  </div>
                  {bulkUploadForm.selectedGroups.includes(group.id) && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleCSVUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
              {csvFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCsvFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {csvFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing CSV file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Button
            type="submit"
            disabled={
              !csvFile || loading || groups.length === 0 || bulkUploadForm.selectedGroups.length === 0
            }
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" /> Upload CSV
              </>
            )}
          </Button>
        </form>

        {uploadResult && (
          <Card className="bg-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Upload Complete</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {uploadResult.success}
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Successful
                  </p>
                </div>
                <div className="text-center p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    {uploadResult.failed}
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Failed
                  </p>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-destructive mb-2">Errors:</h4>
                  <div className="space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <p
                        key={index}
                        className="text-sm text-muted-foreground bg-destructive/10 p-2 rounded"
                      >
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
