"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  Users,
  Settings,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  UserPlus,
  MessageSquare,
  Crown,
  AlertCircle,
  X,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import axiosAdmin from "@/axiosInstances/axiosAdmin";

interface Group {
  id: string;
  name: string;
  description: string;
  maxMembers: number;
  currentMembers: number;
  createdAt: string;
  isActive: boolean;
  category: "professional" | "social" | "academic" | "hobby";
  requiredApproval?: boolean;
}

interface GroupFormData {
  name: string;
  description: string;
  maxMembers: string;
  category: Group["category"];
  requiredApproval?: boolean;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string;
  isDeleting: boolean;
}

interface PendingRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  groupId: string;
  groupName: string;
  requestDate: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  groupName,
  isDeleting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-foreground">
            Delete Group
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">
                Are you sure you want to delete this group?
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 mb-6">
            <p className="text-sm">
              <span className="font-medium">Group:</span> {groupName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All group data, members, and associated content will be
              permanently removed.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-muted/50">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AdminGroupsPage() {
  const { user } = useAuth();
  const { organization } = useOrg();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const [groupForm, setGroupForm] = useState<GroupFormData>({
    name: "",
    description: "",
    maxMembers: "50",
    category: "professional",
    requiredApproval: false,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    groupId: "",
    groupName: "",
    isDeleting: false,
  });

  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    setLoading(true);

    try {
      const response = await axiosAdmin.get("/group/get/all");

      if (response.status != 200) {
        throw new Error("Failed to fetch groups");
      }

      const Data = response.data;
      const groups = Data.data;
      console.log("Fetched groups from API:", groups);

      // Transform API response to match Group interface
      const transformedGroups: Group[] = groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        maxMembers: group.maxMembers,
        currentMembers: group.currentMembers,
        createdAt: group.createdDate, // Transform `createdDate` to `createdAt`
        isActive: group.active, // Transform `active` to `isActive`
        category: group.category.toLowerCase() as Group["category"], // Ensure lowercase categories
        requiredApproval: group.requiredApproval || false, // Default to false if not provided
      }));

      setGroups(transformedGroups);
      console.log("Fetched groups:", transformedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchPendingRequests = async () => {
    setRequestsLoading(true);
    try {
      const response = await axiosAdmin.get("/group/get/pending-requests");

      if (response.status != 200) {
        throw new Error("Failed to fetch pending requests");
      }

      const data = await response.data;
      setPendingRequests(data.data || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      toast.error("Failed to load pending requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  // Add this useEffect to fetch pending requests
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApproveRequest = async (groupId: string, memberId: string) => {
    try {
      const response = await axiosAdmin.put(
        `/group/${groupId}/approve/${memberId}`
      );

      if (response.status != 200) {
        const errorData = await response.data;
        if (errorData.message?.includes("maximum capacity")) {
          toast.error("Cannot approve: Group has reached maximum capacity");
        } else {
          toast.error(errorData.message || "Failed to approve request");
        }
        return;
      }

      // Remove from pending requests
      setPendingRequests((prev) =>
        prev.filter(
          (req) => !(req.groupId === groupId && req.memberId === memberId)
        )
      );

      // Refresh groups to update member count
      await fetchGroups();

      toast.success("Join request approved successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve request. Please try again.");
    }
  };

  const handleRejectRequest = async (groupId: string, memberId: string) => {
    try {
      const response = await axiosAdmin.put(
        `/group/${groupId}/reject/${memberId}`
      );

      if (response.status != 200) {
        const errorData = await response.data.catch(() => ({}));
        toast.error(errorData.message || "Failed to reject request");
        return;
      }

      // Remove from pending requests
      setPendingRequests((prev) =>
        prev.filter(
          (req) => !(req.groupId === groupId && req.memberId === memberId)
        )
      );

      toast.success("Join request rejected successfully!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject request. Please try again.");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!groupForm.name || !groupForm.description) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const payload = {
        name: groupForm.name,
        description: groupForm.description,
        maxMembers: parseInt(groupForm.maxMembers, 10),
        category: groupForm.category.toUpperCase(),
        requiredApproval: groupForm.requiredApproval || false,
      };
      const response = await axiosAdmin.post("/group/create", payload);

      if (response.status != 200) {
        throw new Error("Failed to create group");
      }

      await response.data;

      await fetchGroups();

      setShowCreateForm(false);
      resetForm();
      toast.success("Group created successfully!");
    } catch (error) {
      toast.error("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupForm({
      name: "",
      description: "",
      maxMembers: "50",
      category: "professional",
      requiredApproval: false,
    });
  };

  const handleInputChange = (
    field: keyof GroupFormData,
    value: string | boolean
  ) => {
    setGroupForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGroupStatus = async (groupId: string) => {
    const updatedGroups = groups.map((group) =>
      group.id === groupId ? { ...group, isActive: !group.isActive } : group
    );
    setGroups(updatedGroups);

    try {
      const response = await axiosAdmin.put(`/group/${groupId}/toggle-status`);

      if (response.status != 200) {
        throw new Error("Failed to toggle group status");
      }

      toast.success("Group status updated successfully!");
    } catch (error) {
      const revertedGroups = updatedGroups.map((group) =>
        group.id === groupId ? { ...group, isActive: !group.isActive } : group
      );
      setGroups(revertedGroups);

      toast.error("Failed to update group status. Please try again.");
      console.error(error);
    }
  };

  const deleteGroup = async (groupId: string, groupName: string) => {
    setDeleteModal({
      isOpen: true,
      groupId,
      groupName,
      isDeleting: false,
    });
  };

  const confirmDeleteGroup = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      // Remove the group optimistically from the list
      const updatedGroups = groups.filter(
        (group) => group.id !== deleteModal.groupId
      );
      setGroups(updatedGroups);

      const response = await axiosAdmin.delete(
        `/group/${deleteModal.groupId}/delete`
      );

      if (response.status != 200) {
        throw new Error("Failed to delete the group");
      }

      toast.success("Group deleted successfully!");
      setDeleteModal({
        isOpen: false,
        groupId: "",
        groupName: "",
        isDeleting: false,
      });
    } catch (error) {
      // Rollback the optimistic update in case of an error
      await fetchGroups(); // Re-load the groups to ensure data integrity

      toast.error("Failed to delete group. Please try again.");
      console.error(error);
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        groupId: "",
        groupName: "",
        isDeleting: false,
      });
    }
  };

  const filteredGroups = groups.filter((group) => {
    const groupName = group.name || "";
    const groupDescription = group.description || "";

    const matchesSearch =
      groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      groupDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && group.isActive) ||
      (statusFilter === "inactive" && !group.isActive);

    return matchesSearch && matchesStatus;
  });

  const groupStats = {
    total: groups.length,
    active: groups.filter((g) => g.isActive).length,
    totalMembers: groups.reduce((sum, g) => sum + g.currentMembers, 0),
    avgMembersPerGroup:
      groups.length === 0
        ? 0
        : Math.round(
            groups.reduce((sum, g) => sum + g.currentMembers, 0) / groups.length
          ),
  };

  const getCategoryColor = (category: Group["category"]) => {
    switch (category) {
      case "professional":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "social":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "academic":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "hobby":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Group Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage organization groups
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {groupStats.total} Total Groups
          </Badge>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {groupStats.total}
            </div>
            <p className="text-sm text-muted-foreground">Total Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {groupStats.active}
            </div>
            <p className="text-sm text-muted-foreground">Active Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {groupStats.totalMembers}
            </div>
            <p className="text-sm text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {groupStats.avgMembersPerGroup}
            </div>
            <p className="text-sm text-muted-foreground">Avg per Group</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Group Overview</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Pending Join Requests</span>
              </CardTitle>
              <CardDescription>
                Review and manage group join requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                  <span className="ml-2">Loading pending requests...</span>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Pending Requests
                  </h3>
                  <p className="text-muted-foreground">
                    All join requests have been processed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={`${request.groupId}-${request.memberId}`}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1`}
                            />
                            <AvatarFallback>
                              {request.memberName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">
                              {request.memberName}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {request.memberEmail}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{request.groupName}</p>
                            <p className="text-sm text-muted-foreground">
                              Requested{" "}
                              {new Date(
                                request.requestDate
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleApproveRequest(
                                  request.groupId,
                                  request.memberId
                                )
                              }
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRejectRequest(
                                  request.groupId,
                                  request.memberId
                                )
                              }
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Create Group Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Group</span>
                </CardTitle>
                <CardDescription>
                  Create a new group for your organization members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Group Name *</Label>
                      <Input
                        id="name"
                        value={groupForm.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Software Engineers"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxMembers">Max Members</Label>
                      <Input
                        id="maxMembers"
                        type="number"
                        value={groupForm.maxMembers}
                        onChange={(e) =>
                          handleInputChange("maxMembers", e.target.value)
                        }
                        placeholder="50"
                        min="1"
                        max="1000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={groupForm.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="SOCIAL">Social</option>
                        <option value="ACADEMIC">Academic</option>
                        <option value="HOBBY">Hobby</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={groupForm.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe the purpose and goals of this group..."
                      rows={3}
                      required
                    />
                  </div>

                  {/* Add the new checkbox here */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresApproval"
                        checked={groupForm.requiredApproval}
                        onChange={(e) =>
                          handleInputChange(
                            "requiredApproval",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <Label
                        htmlFor="requiresApproval"
                        className="text-sm font-medium"
                      >
                        Requires approval to join
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      When enabled, members will need admin approval before
                      joining this group
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Clear Form
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Group
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Groups List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>All Groups</span>
              </CardTitle>
              <CardDescription>Manage all organization groups</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">All Groups</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Groups Grid */}
              <div className="space-y-4">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className="border rounded-lg p-6 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {group.name}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              {group.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={group.isActive ? "default" : "secondary"}
                            >
                              {group.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge className={getCategoryColor(group.category)}>
                              {group.category.toLowerCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {group.currentMembers} / {group.maxMembers}{" "}
                              members
                            </span>
                          </div>
                          {/*<div className="flex items-center space-x-2">*/}
                          {/*  <Crown className="h-4 w-4 text-muted-foreground" />*/}
                          {/*  <span>Admin: {group.adminName}</span>*/}
                          {/*</div>*/}
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Created{" "}
                              {new Date(group.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            {group.requiredApproval ? (
                              <>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-orange-600">
                                  Approval Required
                                </span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-600">
                                  Open Join
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="w-full max-w-xs">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Capacity</span>
                              <span>
                                {Math.round(
                                  (group.currentMembers / group.maxMembers) *
                                    100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${
                                    (group.currentMembers / group.maxMembers) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>

                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleGroupStatus(group.id)}
                            >
                              {group.isActive ? "Deactivate" : "Activate"}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteGroup(group.id, group.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredGroups.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Groups Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Create your first group to get started."}
                  </p>
                  {!showCreateForm && (
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Analytics</CardTitle>
              <CardDescription>
                Insights and metrics for your groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Detailed group analytics and reporting features will be
                  available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteGroup}
        groupName={deleteModal.groupName}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
}
