"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import AddSingleMember from "./singlemember";
import BulkCsvUpload from "./bulkupload";
import ManageMembers from "./managemembers";
import { useEffect, useState } from "react";

export default function MembersPage() {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrg();
  const router = useRouter();
  const pathname = usePathname();

  // Determine tab from URL
  const pathToTab = {
    "/org/admin/members/singlemember": "add-single",
    "/org/admin/members/bulkupload": "bulk-upload",
    "/org/admin/members/managemembers": "manage-members",
    "/org/admin/members": "add-single", // default
  };

  const tabToPath = {
    "add-single": "/org/admin/members/singlemember",
    "bulk-upload": "/org/admin/members/bulkupload",
    "manage-members": "/org/admin/members/managemembers",
  };

  const [tab, setTab] = useState("add-single");

  useEffect(() => {
    const selectedTab = pathToTab[pathname as keyof typeof pathToTab] || "add-single";
    setTab(selectedTab);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    setTab(value); // Only update tab state, not URL
  };


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
      status: "active" as const,
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
      status: "pending" as const,
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
            <p className="text-muted-foreground">Loading member management...</p>
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
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Member Management</h1>
          <p className="text-muted-foreground">Add and manage organization members</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {members.length} Total Members
          </Badge>
          <Badge variant="outline">
            {organization?.memberCount || 0} / {organization?.memberLimit || 0} Used
          </Badge>
        </div>
      </div>

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
                    You’re using {organization.memberCount} of {organization.memberLimit} members.
                    Consider upgrading your plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
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
        <TabsContent value="bulk-upload">
          <BulkCsvUpload />
        </TabsContent>
        <TabsContent value="manage-members">
          <ManageMembers members={members} setMembers={setMembers} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
