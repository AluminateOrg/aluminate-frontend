"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  UserPlus,
  Download,
  FileText,
  Users,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  company?: string;
  graduationYear?: string;
  degree?: string;
  location?: string;
  avatar?: string;
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  groupIds: string[];
}

interface CSVUploadResult {
  success: number;
  failed: number;
  errors: string[];
  members: Member[];
}

export default function MembersPage() {
  const { user } = useAuth();
  const { organization, groups, loading: orgLoading } = useOrg();
  const [activeTab, setActiveTab] = useState("add-single");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "inactive"
  >("all");

  // Single member form state
  const [singleMemberForm, setSingleMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    company: "",
    graduationYear: "",
    degree: "",
    location: "",
    selectedGroups: [] as string[],
  });

  // Bulk upload form state
  const [bulkUploadForm, setBulkUploadForm] = useState({
    selectedGroups: [] as string[],
  });

  // Mock members data
  const [members, setMembers] = useState<Member[]>([
    {
      id: "1",
      name: "Shane Mario",
      email: "shane.mario@example.com",
      phone: "+1234567890",
      designation: "Software Engineer",
      company: "Tech Corp",
      graduationYear: "2019",
      degree: "Computer Science",
      location: "Colombo 07, Sri Lanka",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
      status: "active",
      joinedAt: new Date().toISOString(),
      groupIds: ["1", "2"],
    },
    {
      id: "2",
      name: "Satheera Nirmal",
      email: "satheera.nirmal@example.com",
      designation: "Product Manager",
      company: "Innovation Inc",
      graduationYear: "2020",
      degree: "Business Administration",
      location: "New York, NY",
      status: "pending",
      joinedAt: new Date().toISOString(),
      groupIds: ["3"],
    },
  ]);

  if (orgLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">
              Loading member management...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSingleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!singleMemberForm.name || !singleMemberForm.email) {
        toast.error("Name and email are required");
        return;
      }

      if (singleMemberForm.selectedGroups.length === 0) {
        toast.error("Please select at least one group for the member");
        return;
      }

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMember: Member = {
        id: Date.now().toString(),
        ...singleMemberForm,
        groupIds: singleMemberForm.selectedGroups,
        status: "pending",
        joinedAt: new Date().toISOString(),
      };

      setMembers((prev) => [newMember, ...prev]);
      setSingleMemberForm({
        name: "",
        email: "",
        phone: "",
        designation: "",
        company: "",
        graduationYear: "",
        degree: "",
        location: "",
        selectedGroups: [],
      });

      toast.success(
        `Member added successfully! Invitation email sent. Added to ${singleMemberForm.selectedGroups.length} group(s).`
      );
    } catch (error) {
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.error("Please select a CSV file");
      return;
    }

    if (bulkUploadForm.selectedGroups.length === 0) {
      toast.error("Please select at least one group for the bulk upload");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Simulate file processing with progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Mock upload result
      const result: CSVUploadResult = {
        success: 45,
        failed: 3,
        errors: [
          "Row 12: Invalid email format",
          'Row 25: Missing required field "name"',
          "Row 33: Duplicate email address",
        ],
        members: [],
      };

      setUploadResult(result);
      toast.success(
        `Successfully processed ${result.success} members! All added to ${bulkUploadForm.selectedGroups.length} group(s).`
      );

      // Reset form
      setCsvFile(null);
      setUploadProgress(0);
      setBulkUploadForm({ selectedGroups: [] });
    } catch (error) {
      toast.error("Failed to process CSV file. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,designation,company,graduationYear,degree,location
Shane Mario,shane.mario@example.com,+1234567890,Software Engineer,Tech Corp,2019,Computer Science,Colombo 07, Sri Lanka
Satheera Nirmal,satheera.nirmal@example.com,+0987654321,Product Manager,Innovation Inc,2020,Business Administration,Colombo 07, Sri Lanka`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field: string, value: string) => {
    setSingleMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelection = (
    groupId: string,
    formType: "single" | "bulk"
  ) => {
    if (formType === "single") {
      setSingleMemberForm((prev) => ({
        ...prev,
        selectedGroups: prev.selectedGroups.includes(groupId)
          ? prev.selectedGroups.filter((id) => id !== groupId)
          : [...prev.selectedGroups, groupId],
      }));
    } else {
      setBulkUploadForm((prev) => ({
        ...prev,
        selectedGroups: prev.selectedGroups.includes(groupId)
          ? prev.selectedGroups.filter((id) => id !== groupId)
          : [...prev.selectedGroups, groupId],
      }));
    }
  };

  const deleteMember = async (memberId: string) => {
    try {
      // TODO: Replace with actual API call
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const resendInvitation = async (memberId: string) => {
    try {
      // TODO: Replace with actual API call
      toast.success("Invitation email sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const getMemberGroups = (groupIds: string[]) => {
    return groups.filter((group) => groupIds.includes(group.id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Member Management
          </h1>
          <p className="text-muted-foreground">
            Add and manage organization members
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {members.length} Total Members
          </Badge>
          <Badge variant="outline">
            {organization?.memberCount || 0} / {organization?.memberLimit || 0}{" "}
            Used
          </Badge>
        </div>
      </div>

      {/* Member Limit Warning */}
      {organization &&
        organization.memberCount >= organization.memberLimit * 0.9 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Approaching Member Limit
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You &apos re using {organization.memberCount} of{" "}
                    {organization.memberLimit} members. Consider upgrading your
                    plan to add more members.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-single">Add Single Member</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk CSV Upload</TabsTrigger>
          <TabsTrigger value="manage-members">Manage Members</TabsTrigger>
        </TabsList>

        {/* Single Member Addition */}
        <TabsContent value="add-single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Add New Member</span>
              </CardTitle>
              <CardDescription>
                Add a single member to your organization and assign them to
                groups. An invitation email will be sent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleMemberSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={singleMemberForm.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Shane Mario"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={singleMemberForm.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="shane.mario@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={singleMemberForm.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        placeholder="+1234567890"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation">Current Position</Label>
                      <Input
                        id="designation"
                        value={singleMemberForm.designation}
                        onChange={(e) =>
                          handleInputChange("designation", e.target.value)
                        }
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={singleMemberForm.company}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                        placeholder="Tech Corp"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        value={singleMemberForm.graduationYear}
                        onChange={(e) =>
                          handleInputChange("graduationYear", e.target.value)
                        }
                        placeholder="2019"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree</Label>
                      <Input
                        id="degree"
                        value={singleMemberForm.degree}
                        onChange={(e) =>
                          handleInputChange("degree", e.target.value)
                        }
                        placeholder="Computer Science"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={singleMemberForm.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        placeholder="Colombo 07, Sri Lanka"
                      />
                    </div>
                  </div>
                </div>

                {/* Group Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Group Assignment *</h3>
                  <p className="text-sm text-muted-foreground">
                    Select which groups this member should join. They will
                    receive access to group discussions and events.
                  </p>

                  {groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            singleMemberForm.selectedGroups.includes(group.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-accent"
                          }`}
                          onClick={() =>
                            handleGroupSelection(group.id, "single")
                          }
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                                {group.name.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground">
                                {group.name}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {group.description ||
                                  "No description available"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {group.currentMembers} / {group.maxMembers}{" "}
                                members
                              </p>
                            </div>
                            {singleMemberForm.selectedGroups.includes(
                              group.id
                            ) && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Groups Available
                      </h3>
                      <p className="text-muted-foreground">
                        Create groups first before adding members.
                      </p>
                    </div>
                  )}

                  {singleMemberForm.selectedGroups.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">
                        Selected Groups:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {singleMemberForm.selectedGroups.map((groupId) => {
                          const group = groups.find((g) => g.id === groupId);
                          return group ? (
                            <Badge key={groupId} variant="secondary">
                              {group.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setSingleMemberForm({
                        name: "",
                        email: "",
                        phone: "",
                        designation: "",
                        company: "",
                        graduationYear: "",
                        degree: "",
                        location: "",
                        selectedGroups: [],
                      })
                    }
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || groups.length === 0}
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Adding Member...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk CSV Upload */}
        <TabsContent value="bulk-upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Bulk CSV Upload</span>
              </CardTitle>
              <CardDescription>
                Upload multiple members at once using a CSV file and assign them
                to groups. Download the template to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Download */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">CSV Template</h4>
                    <p className="text-sm text-muted-foreground">
                      Download the template file with the correct format and
                      required columns
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Group Selection for Bulk Upload */}
              <div className="space-y-4">
                <h4 className="font-medium">
                  Group Assignment for All Members *
                </h4>
                <p className="text-sm text-muted-foreground">
                  Select which groups all uploaded members should join. You can
                  modify individual assignments later.
                </p>

                {groups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          bulkUploadForm.selectedGroups.includes(group.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-accent"
                        }`}
                        onClick={() => handleGroupSelection(group.id, "bulk")}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                              {group.name.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground">
                              {group.name}
                            </h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {group.description || "No description available"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {group.currentMembers} / {group.maxMembers}{" "}
                              members
                            </p>
                          </div>
                          {bulkUploadForm.selectedGroups.includes(group.id) && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Groups Available
                    </h3>
                    <p className="text-muted-foreground">
                      Create groups first before bulk uploading members.
                    </p>
                  </div>
                )}

                {bulkUploadForm.selectedGroups.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Selected Groups for All Members:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bulkUploadForm.selectedGroups.map((groupId) => {
                        const group = groups.find((g) => g.id === groupId);
                        return group ? (
                          <Badge key={groupId} variant="secondary">
                            {group.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* File Upload */}
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
                      Selected: {csvFile.name} (
                      {(csvFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>

                {/* Upload Progress */}
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
                    !csvFile ||
                    loading ||
                    groups.length === 0 ||
                    bulkUploadForm.selectedGroups.length === 0
                  }
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload CSV
                    </>
                  )}
                </Button>
              </form>

              {/* Upload Results */}
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
                        <h4 className="font-medium text-destructive mb-2">
                          Errors:
                        </h4>
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
        </TabsContent>

        {/* Manage Members */}
        <TabsContent value="manage-members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Manage Members</span>
              </CardTitle>
              <CardDescription>
                View, edit, and manage all organization members and their group
                assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex space-x-1">
                    {[
                      { value: "all", label: "All" },
                      { value: "active", label: "Active" },
                      { value: "pending", label: "Pending" },
                      { value: "inactive", label: "Inactive" },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={
                          statusFilter === filter.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(filter.value as any)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-4">
                {filteredMembers.map((member) => {
                  const memberGroups = getMemberGroups(member.groupIds);

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{member.name}</h4>
                            <Badge
                              variant={
                                member.status === "active"
                                  ? "default"
                                  : member.status === "pending"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {member.status}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            {member.company && (
                              <div className="flex items-center space-x-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{member.company}</span>
                              </div>
                            )}
                          </div>

                          {member.designation && (
                            <p className="text-sm text-muted-foreground">
                              {member.designation}
                            </p>
                          )}

                          {/* Member Groups */}
                          {memberGroups.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {memberGroups.map((group) => (
                                <Badge
                                  key={group.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {group.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {member.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendInvitation(member.id)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                        )}

                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMember(member.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Members Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Start by adding your first member."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
