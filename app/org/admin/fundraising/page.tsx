"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import axiosAdmin from "@/axiosInstances/axiosAdmin";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  DollarSign,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  X,
  Power,
  PowerOff,
  BarChart3,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { DeleteCampaignConfirmationModal } from "./delete-confirmation";
import { EditCampaignModal } from "./edit-campaign-modal";

// ===========================================
// INTERFACES - Match Backend Exactly
// ===========================================

interface BackendCampaignResponse {
  id: number;
  title: string;
  description: string;
  type:
    | "FUNDRAISING"
    | "EMERGENCY"
    | "GENERAL"
    | "SCHOLARSHIP"
    | "INFRASTRUCTURE"
    | "OTHER";
  goal: string; // BigDecimal comes as string
  raised: string; // BigDecimal comes as string
  startDate: string; // LocalDate as string
  endDate: string; // LocalDate as string
  donorCount: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  progressPercentage?: number;
  isExpired?: boolean;
  canAcceptDonations?: boolean;
  daysRemaining?: number;
  status?: string;
  remainingAmount?: string; // BigDecimal as string
  isGoalAchieved?: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  category:
    | "general"
    | "scholarship"
    | "infrastructure"
    | "emergency"
    | "fundraising"
    | "other";
  donorCount: number;
  isActive: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  progressPercentage?: number;
  isExpired?: boolean;
  canAcceptDonations?: boolean;
  daysRemaining?: number;
  status?: string;
  remainingAmount?: number;
  isGoalAchieved?: boolean;
}

interface CampaignFormData {
  title: string;
  description: string;
  goal: string;
  endDate: string;
  category: Campaign["category"];
  isActive: boolean;
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  inactiveCampaigns: number;
  expiredCampaigns: number;
  totalGoal: number;
  totalRaised: number;
  totalDonors: number;
  averageProgress: number;
  averageDonationAmount: number;
  mostPopularCampaignType: string;
  campaignsNeedingAttention: number;
}

export default function AdminFundraisingPage() {
  const { user } = useAuth();
  const { organization } = useOrg();

  // ===========================================
  // STATE MANAGEMENT
  // ===========================================

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    goal: "",
    endDate: "",
    category: "general",
    isActive: true,
  });

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  // Safe number conversion for BigDecimal strings
  const safeParseNumber = (value: string | number | undefined): number => {
    if (typeof value === "number") return value;
    if (!value || value === "") return 0;

    try {
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  // Map frontend category to backend enum
  const mapCategoryToBackend = (category: Campaign["category"]): string => {
    const mapping: Record<Campaign["category"], string> = {
      general: "GENERAL",
      scholarship: "SCHOLARSHIP",
      infrastructure: "INFRASTRUCTURE",
      emergency: "EMERGENCY",
      fundraising: "FUNDRAISING",
      other: "OTHER",
    };
    return mapping[category] || "GENERAL";
  };

  // Map backend enum to frontend category
  const mapCategoryFromBackend = (type: string): Campaign["category"] => {
    const mapping: Record<string, Campaign["category"]> = {
      GENERAL: "general",
      SCHOLARSHIP: "scholarship",
      INFRASTRUCTURE: "infrastructure",
      EMERGENCY: "emergency",
      FUNDRAISING: "fundraising",
      OTHER: "other",
    };
    return mapping[type?.toUpperCase()] || "general";
  };

  // Transform backend response to frontend format
  const transformBackendCampaign = (
    backendCampaign: BackendCampaignResponse
  ): Campaign => {
    try {
      return {
        id: backendCampaign.id.toString(),
        title: backendCampaign.title || "",
        description: backendCampaign.description || "",
        goal: safeParseNumber(backendCampaign.goal),
        raised: safeParseNumber(backendCampaign.raised),
        startDate:
          backendCampaign.startDate || new Date().toISOString().split("T")[0],
        endDate:
          backendCampaign.endDate || new Date().toISOString().split("T")[0],
        category: mapCategoryFromBackend(backendCampaign.type),
        donorCount: backendCampaign.donorCount || 0,
        isActive: Boolean(backendCampaign.isActive), // Explicit boolean conversion
        isDeleted: Boolean(backendCampaign.isDeleted),
        createdAt: backendCampaign.createdAt,
        updatedAt: backendCampaign.updatedAt,
        progressPercentage: backendCampaign.progressPercentage || 0,
        isExpired: Boolean(backendCampaign.isExpired),
        canAcceptDonations: Boolean(backendCampaign.canAcceptDonations),
        daysRemaining: backendCampaign.daysRemaining || 0,
        status: backendCampaign.status || "INACTIVE",
        remainingAmount: safeParseNumber(backendCampaign.remainingAmount),
        isGoalAchieved: Boolean(backendCampaign.isGoalAchieved),
      };
    } catch (error) {
      console.error("Error transforming campaign:", error);
      throw new Error(`Failed to transform campaign: ${error}`);
    }
  };

  // ===========================================
  // API FUNCTIONS
  // ===========================================

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error("API Error:", error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;

      if (status === 401 || status === 403) {
        toast.error("Authentication required. Please login again.");
      } else if (status >= 400 && status < 500) {
        toast.error(message || "Invalid request");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(message || defaultMessage);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error(error.message || defaultMessage);
    }
  };

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching campaigns...");
      const response = await axiosAdmin.get("/campaign/get/all");

      if (response.status === 200 && response.data) {
        let campaignsData = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          campaignsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          campaignsData = response.data;
        } else {
          console.warn("Unexpected response format:", response.data);
          campaignsData = [];
        }

        const transformedCampaigns = campaignsData
          .map((campaign: any) => {
            try {
              return transformBackendCampaign(campaign);
            } catch (error) {
              console.error(
                "Error transforming individual campaign:",
                campaign,
                error
              );
              return null;
            }
          })
          .filter(Boolean);

        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]);
      handleApiError(error, "Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosAdmin.get("/campaign/stats");

      if (response.status === 200 && response.data) {
        const statsData = response.data.data || response.data;

        const transformedStats = {
          ...statsData,
          totalGoal: safeParseNumber(statsData.totalGoal),
          totalRaised: safeParseNumber(statsData.totalRaised),
          averageProgress: safeParseNumber(statsData.averageProgress),
          averageDonationAmount: safeParseNumber(
            statsData.averageDonationAmount
          ),
        };

        setStats(transformedStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "ADMIN")) {
      fetchCampaigns();
      fetchStats();
    }
  }, [user, fetchCampaigns, fetchStats]);

  // ===========================================
  // EVENT HANDLERS
  // ===========================================

  const handleInputChange = (
    field: keyof CampaignFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.goal || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const goalValue = parseFloat(formData.goal);
    if (goalValue <= 0) {
      toast.error("Goal amount must be greater than zero");
      return;
    }

    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (endDate <= today) {
      toast.error("End date must be in the future");
      return;
    }

    setLoading(true);

    try {
      const requestPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: mapCategoryToBackend(formData.category),
        goal: goalValue,
        endDate: formData.endDate,
        isActive: formData.isActive,
      };

      const response = await axiosAdmin.post(
        "/campaign/create",
        requestPayload
      );

      if (response.status === 201 || response.status === 200) {
        await fetchCampaigns();
        await fetchStats();

        setFormData({
          title: "",
          description: "",
          goal: "",
          endDate: "",
          category: "general",
          isActive: true,
        });
        setShowCreateForm(false);
        toast.success("Campaign created successfully!");
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      handleApiError(error, "Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED TOGGLE FUNCTION
  const handleToggleCampaign = async (campaignId: string) => {
    try {
      setActionLoading(campaignId);

      const currentCampaign = campaigns.find((c) => c.id === campaignId);
      if (!currentCampaign) {
        toast.error("Campaign not found");
        return;
      }

      const newStatus = !currentCampaign.isActive;

      console.log("=== FRONTEND TOGGLE DEBUG START ===");
      console.log(`Campaign ID: ${campaignId}`);
      console.log(`Campaign Title: "${currentCampaign.title}"`);
      console.log(
        `Current Status: ${currentCampaign.isActive} (${
          currentCampaign.isActive ? "ACTIVE" : "INACTIVE"
        })`
      );
      console.log(
        `Requested New Status: ${newStatus} (${
          newStatus ? "ACTIVE" : "INACTIVE"
        })`
      );
      console.log(
        `Action: ${currentCampaign.isActive ? "ACTIVE" : "INACTIVE"} -> ${
          newStatus ? "ACTIVE" : "INACTIVE"
        }`
      );

      // Use the dedicated toggle endpoint with query parameter
      console.log(
        `Making API call: PUT /campaign/${campaignId}/toggle-status?isActive=${newStatus}`
      );

      const response = await axiosAdmin.put(
        `/campaign/${campaignId}/toggle-status`,
        null, // No body needed
        {
          params: {
            isActive: newStatus,
          },
        }
      );

      console.log(`API Response Status: ${response.status}`);
      console.log("Full API Response:", response.data);

      if (response.status === 200 && response.data) {
        console.log("Toggle API Response:", response.data);

        // Extract the updated campaign data
        const updatedCampaignData = response.data.data || response.data;
        console.log("Extracted campaign data:", updatedCampaignData);

        if (updatedCampaignData && typeof updatedCampaignData === "object") {
          const transformedCampaign =
            transformBackendCampaign(updatedCampaignData);

          console.log("Transformed campaign:", {
            id: transformedCampaign.id,
            title: transformedCampaign.title,
            isActive: transformedCampaign.isActive,
            status: transformedCampaign.isActive ? "ACTIVE" : "INACTIVE",
          });

          // Update the campaigns array
          setCampaigns((prevCampaigns) => {
            const updatedCampaigns = prevCampaigns.map((campaign) =>
              campaign.id === campaignId ? transformedCampaign : campaign
            );

            // Verify the update in the array
            const updatedCampaign = updatedCampaigns.find(
              (c) => c.id === campaignId
            );
            console.log("Campaign in updated array:", {
              id: updatedCampaign?.id,
              title: updatedCampaign?.title,
              isActive: updatedCampaign?.isActive,
              status: updatedCampaign?.isActive ? "ACTIVE" : "INACTIVE",
            });

            return updatedCampaigns;
          });

          // Show success message
          const successMessage = transformedCampaign.isActive
            ? "Campaign activated successfully!"
            : "Campaign deactivated successfully!";
          toast.success(successMessage);
          console.log("SUCCESS: Toggle completed successfully");
        } else {
          console.warn("Invalid response data, refetching all campaigns");
          await fetchCampaigns();
          toast.success("Campaign status updated!");
        }

        // Update stats
        await fetchStats();
      } else {
        console.error(
          `FAILURE: Unexpected response status: ${response.status}`
        );
        throw new Error(`Unexpected response status: ${response.status}`);
      }

      console.log("=== FRONTEND TOGGLE DEBUG END ===");
    } catch (error) {
      console.error("=== FRONTEND TOGGLE ERROR ===");
      console.error("Toggle campaign error:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || "Cannot update campaign status";
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        toast.error("Campaign not found");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again.");
      } else {
        toast.error("Failed to update campaign status. Please try again.");
      }

      // Refetch campaigns to ensure UI is in sync
      await fetchCampaigns();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setShowDeleteModal(true);
  };

  const confirmDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      setLoading(true);

      const response = await axiosAdmin.delete(
        `/campaign/${campaignToDelete.id}/delete`
      );

      if (response.status === 200 || response.status === 204) {
        setCampaigns((prev) =>
          prev.filter((campaign) => campaign.id !== campaignToDelete.id)
        );
        await fetchStats();
        toast.success("Campaign deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting campaign:", error);
      handleApiError(error, "Failed to delete campaign");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCampaignToDelete(null);
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  const handleUpdateCampaign = async (updatedCampaign: Campaign) => {
    try {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === updatedCampaign.id ? updatedCampaign : campaign
        )
      );

      await fetchStats();
      setShowEditModal(false);
      setEditingCampaign(null);
      toast.success("Campaign updated successfully!");
    } catch (error) {
      await fetchCampaigns();
      handleApiError(error, "Failed to update campaign");
    }
  };

  // ===========================================
  // UTILITY FUNCTIONS
  // ===========================================

  const getFilteredCampaigns = () => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      switch (filterType) {
        case "active":
          filtered = filtered.filter((c) => c.isActive && !c.isExpired);
          break;
        case "inactive":
          filtered = filtered.filter((c) => !c.isActive && !c.isExpired);
          break;
        case "expired":
          filtered = filtered.filter((c) => c.isExpired);
          break;
        case "completed":
          filtered = filtered.filter((c) => c.isGoalAchieved);
          break;
      }
    }

    return filtered;
  };

  const getCategoryColor = (category: Campaign["category"]) => {
    switch (category) {
      case "scholarship":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "infrastructure":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "emergency":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "fundraising":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "other":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getCategoryDisplayName = (category: Campaign["category"]) => {
    const names: Record<Campaign["category"], string> = {
      general: "General",
      scholarship: "Scholarship",
      infrastructure: "Infrastructure",
      emergency: "Emergency",
      fundraising: "Fundraising",
      other: "Other",
    };
    return names[category];
  };

  // FIXED STATUS FUNCTIONS with proper priority
  const getStatusColor = (campaign: Campaign) => {
    if (campaign.isDeleted) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
    if (campaign.isExpired) {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    if (campaign.isGoalAchieved) {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (!campaign.isActive) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  };

  const getStatusDisplayName = (campaign: Campaign) => {
    if (campaign.isDeleted) return "Deleted";
    if (campaign.isExpired) return "Expired";
    if (campaign.isGoalAchieved) return "Completed";
    if (!campaign.isActive) return "Inactive";
    return "Active";
  };

  // FIXED TOGGLE BUTTON RENDERING
  const renderToggleButton = (campaign: Campaign) => {
    const isLoading = actionLoading === campaign.id;
    const canToggle =
      !campaign.isDeleted && !campaign.isExpired && !campaign.isGoalAchieved;

    if (!canToggle) {
      return (
        <Button variant="outline" size="sm" disabled>
          <Eye className="h-4 w-4 mr-1" />
          View Only
        </Button>
      );
    }

    const isActive = Boolean(campaign.isActive);
    const buttonText = isLoading
      ? "Updating..."
      : isActive
      ? "Deactivate"
      : "Activate";

    return (
      <Button
        variant={isActive ? "destructive" : "default"}
        size="sm"
        onClick={() => handleToggleCampaign(campaign.id)}
        disabled={isLoading}
        className={
          !isActive ? "bg-green-600 hover:bg-green-700 text-white" : ""
        }
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : isActive ? (
          <PowerOff className="h-4 w-4 mr-1" />
        ) : (
          <Power className="h-4 w-4 mr-1" />
        )}
        <span className="ml-1">{buttonText}</span>
      </Button>
    );
  };

  // Check authentication
  if (!user || (user.role !== "admin" && user.role !== "ADMIN")) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Loading component with fallback
  const LoadingComponent = LoadingSpinner
    ? LoadingSpinner
    : () => (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );

  if (loading && campaigns.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <LoadingComponent />
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Fundraising Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage donation campaigns
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Raised
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                LKR {stats.totalRaised.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalGoal > 0
                  ? Math.round((stats.totalRaised / stats.totalGoal) * 100)
                  : 0}
                % of total goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Campaigns
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.inactiveCampaigns} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donors
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
              <p className="text-xs text-muted-foreground">
                Across all campaigns
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Donation
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                LKR {Math.round(stats.averageDonationAmount).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Per donation</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Campaigns</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Create Campaign Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>
                      Set up a new fundraising campaign
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  {/* Title field - should be first */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter campaign title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal">Fundraising Goal (LKR) *</Label>
                      <Input
                        id="goal"
                        type="number"
                        step="0.01"
                        min="100"
                        value={formData.goal}
                        onChange={(e) =>
                          handleInputChange("goal", e.target.value)
                        }
                        placeholder="50000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange(
                            "category",
                            e.target.value as Campaign["category"]
                          )
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="general">General</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="emergency">Emergency</option>
                        <option value="fundraising">Fundraising</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Describe the purpose and goals of this campaign"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label htmlFor="isActive">
                      Create campaign as active (ready to receive donations)
                    </Label>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoadingComponent />
                          <span className="ml-2">Creating...</span>
                        </>
                      ) : (
                        "Create Campaign"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Campaigns List */}
          <div className="space-y-4">
            {filteredCampaigns.length === 0 && !loading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm || filterType !== "all"
                        ? "No Matching Campaigns"
                        : "No Campaigns Yet"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || filterType !== "all"
                        ? "Try adjusting your search or filters."
                        : "Create your first fundraising campaign to get started."}
                    </p>
                    {!searchTerm && filterType === "all" && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <CardTitle className="text-lg">
                            {campaign.title}
                          </CardTitle>
                          <Badge
                            className={getCategoryColor(campaign.category)}
                          >
                            {getCategoryDisplayName(campaign.category)}
                          </Badge>
                          <Badge className={getStatusColor(campaign)}>
                            {getStatusDisplayName(campaign)}
                          </Badge>
                          {campaign.daysRemaining !== undefined &&
                            campaign.daysRemaining <= 7 &&
                            campaign.daysRemaining > 0 && (
                              <Badge
                                variant="outline"
                                className="border-orange-500 text-orange-700"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {campaign.daysRemaining} days left
                              </Badge>
                            )}
                        </div>
                        <CardDescription>
                          {campaign.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCampaign(campaign)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          LKR {campaign.raised.toLocaleString()} / LKR{" "}
                          {campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(campaign.progressPercentage || 0, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {Math.round(campaign.progressPercentage || 0)}% funded
                        </span>
                        <span>
                          {campaign.daysRemaining !== undefined
                            ? campaign.daysRemaining > 0
                              ? `${campaign.daysRemaining} days left`
                              : "Ended"
                            : ""}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.donorCount} donors</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Started{" "}
                          {format(new Date(campaign.startDate), "MMM d")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Ends {format(new Date(campaign.endDate), "MMM d")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Avg: LKR{" "}
                          {Math.round(
                            campaign.raised / Math.max(campaign.donorCount, 1)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {renderToggleButton(campaign)}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Campaign Analytics</span>
              </CardTitle>
              <CardDescription>
                Detailed insights into your fundraising performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">Campaign Overview</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Campaigns:</span>
                        <span className="font-medium">
                          {stats.totalCampaigns}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active:</span>
                        <span className="font-medium text-green-600">
                          {stats.activeCampaigns}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inactive:</span>
                        <span className="font-medium text-gray-600">
                          {stats.inactiveCampaigns}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expired:</span>
                        <span className="font-medium text-red-600">
                          {stats.expiredCampaigns}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Financial Performance</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Goal:</span>
                        <span className="font-medium">
                          LKR {stats.totalGoal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Raised:</span>
                        <span className="font-medium text-green-600">
                          LKR {stats.totalRaised.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Progress:</span>
                        <span className="font-medium">
                          {Math.round(stats.averageProgress)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Donation:</span>
                        <span className="font-medium">
                          LKR{" "}
                          {Math.round(
                            stats.averageDonationAmount
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Additional Insights</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Most Popular Type:</span>
                        <span className="font-medium">
                          {stats.mostPopularCampaignType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Needs Attention:</span>
                        <span className="font-medium text-orange-600">
                          {stats.campaignsNeedingAttention}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <LoadingComponent />
                  <p className="text-muted-foreground mt-4">
                    Loading analytics...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCampaign(null);
          }}
          onUpdate={handleUpdateCampaign}
        />
      )}

      {/* Delete Campaign Confirmation Modal */}
      {showDeleteModal && campaignToDelete && (
        <DeleteCampaignConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setCampaignToDelete(null);
          }}
          onConfirm={confirmDeleteCampaign}
          campaignTitle={campaignToDelete.title}
          isDeleting={loading}
          campaignData={{
            raised: campaignToDelete.raised,
            donorCount: campaignToDelete.donorCount,
            isActive: campaignToDelete.isActive,
            goal: campaignToDelete.goal,
          }}
        />
      )}
    </div>
  );
}
