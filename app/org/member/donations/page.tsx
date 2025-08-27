"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import axiosAdmin from "@/axiosInstances/axiosAdmin";
import axiosMember from "@/axiosInstances/axiosMember";
import axiosCommon from "@/axiosInstances/axiosCommon";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "@/components/organisms/PaymentForm";
import {
  Heart,
  DollarSign,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Award,
  ArrowLeft,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  endDate: string;
  category:
    | "scholarship"
    | "infrastructure"
    | "emergency"
    | "general"
    | "fundraising"
    | "other";
  donorCount: number;
  isActive: boolean;
  progressPercentage?: number;
  daysRemaining?: number;
  status?: string;
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  status: string;
  paymentStatus: string;
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  transactionId?: string;
}

interface DonationStats {
  totalDonated: number;
  totalDonations: number;
  completedDonations: number;
  pendingDonations: number;
  campaignsSupported: number;
  averageDonation: number;
}

export default function DonationsPage() {
  const { user, getInfo } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(
    null
  );
  const [authRetries, setAuthRetries] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedCampaignDetails, setSelectedCampaignDetails] =
    useState<Campaign | null>(null);
  const [showCampaignDetails, setShowCampaignDetails] = useState(false);
  const [campaignDetailsLoading, setCampaignDetailsLoading] = useState(false);

  // Filter states
  const [campaignFilter, setCampaignFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const mapCategoryFromBackend = useCallback(
    (type: string): Campaign["category"] => {
      const mapping: Record<string, Campaign["category"]> = {
        GENERAL: "general",
        SCHOLARSHIP: "scholarship",
        INFRASTRUCTURE: "infrastructure",
        EMERGENCY: "emergency",
        FUNDRAISING: "fundraising",
        OTHER: "other",
      };
      return mapping[type?.toUpperCase()] || "general";
    },
    []
  );

  // Helper function to check if campaign is still active and accepting donations
  const isCampaignAcceptingDonations = useCallback(
    (campaign: Campaign): boolean => {
      const now = new Date();
      const endDate = new Date(campaign.endDate);

      console.log("now", now);
      console.log("endDate", endDate);
      console.log("campaign.status", campaign.status);
      // Campaign must be active AND end date must be in the future
      return (
        campaign.isActive &&
        endDate > now &&
        campaign.status !== "COMPLETED" &&
        campaign.status !== "CANCELLED"
      );
    },
    []
  );

  // Transform backend campaign data
  const transformBackendCampaign = useCallback(
    (backendCampaign: any): Campaign => {
      const goal = parseFloat(backendCampaign.goal) || 0;
      const raised = parseFloat(backendCampaign.raised) || 0;
      const endDate = backendCampaign.endDate || new Date().toISOString();

      // Calculate days remaining more accurately
      const now = new Date();
      const campaignEndDate = new Date(endDate);
      const timeDifference = campaignEndDate.getTime() - now.getTime();
      const daysRemaining = Math.max(
        0,
        Math.ceil(timeDifference / (1000 * 3600 * 24))
      );

      return {
        id: backendCampaign.id.toString(),
        title: backendCampaign.title || "",
        description: backendCampaign.description || "",
        goal: goal,
        raised: raised,
        endDate: endDate,
        category: mapCategoryFromBackend(backendCampaign.type),
        donorCount: backendCampaign.donorCount || 0,
        isActive: Boolean(backendCampaign.active),
        progressPercentage: goal > 0 ? (raised / goal) * 100 : 0,
        daysRemaining: daysRemaining,
        status: backendCampaign.status || "ACTIVE",
      };
    },
    [mapCategoryFromBackend]
  );

  // Fetch active campaigns
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);

    try {
      console.log("Fetching campaigns using axiosMember...");
      const response = await axiosMember.get("/campaign/get/active");
      console.log("Response data:", response.data);

      const campaignsData = response.data.data || response.data || [];
      console.log("Campaigns data:", campaignsData);

      if (Array.isArray(campaignsData)) {
        const transformedCampaigns = campaignsData.map(
          transformBackendCampaign
        );
        console.log("Transformed campaigns:", transformedCampaigns);
        setCampaigns(transformedCampaigns);
      } else {
        console.error(
          "Expected array but got:",
          typeof campaignsData,
          campaignsData
        );
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Detailed error fetching campaigns:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to load campaigns: ${errorMessage}`);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, [transformBackendCampaign]);

  // Fetch campaign details
  const fetchCampaignDetails = useCallback(
    async (campaignId: string) => {
      setCampaignDetailsLoading(true);
      try {
        console.log("Fetching campaign details for ID:", campaignId);
        const response = await axiosAdmin.get(`/campaign/${campaignId}`);
        console.log("Campaign details response:", response.data);

        const campaignData = response.data.data || response.data;

        if (campaignData) {
          const transformedCampaign = transformBackendCampaign(campaignData);
          setSelectedCampaignDetails(transformedCampaign);
          setShowCampaignDetails(true);
        }
      } catch (error) {
        console.error("Error fetching campaign details:", error);
        toast.error("Failed to load campaign details.");
      } finally {
        setCampaignDetailsLoading(false);
      }
    },
    [transformBackendCampaign]
  );

  // Enhanced authentication check with better error handling
  const ensureAuthenticated = useCallback(async () => {
    if (!user?.id) {
      console.warn("❌ No user ID available");
      toast.error("Please log in to view your donations");
      return false;
    }

    if (user.role !== "member") {
      console.warn("❌ User is not a member:", user.role);
      toast.error("This page is for members only");
      return false;
    }

    // Check authentication tokens
    const csrfToken = document.cookie.match(/csrf-token=([^;]+)/)?.[1];
    const sessionId = document.cookie.match(/sessionId=([^;]+)/)?.[1];

    console.log("🔍 Authentication check:", {
      userId: user.id,
      role: user.role,
      hasCSRF: !!csrfToken,
      hasSession: !!sessionId,
    });

    if (!csrfToken || !sessionId) {
      console.warn("❌ Missing authentication tokens");
      toast.error("Authentication tokens missing. Please log in again.");
      return false;
    }

    console.log("✅ Authentication check passed");
    return true;
  }, [user]);

  // Fetch user's donations - try multiple axios instances like other pages do
  const fetchMyDonations = useCallback(
    async (page: number = 0) => {
      if (!(await ensureAuthenticated())) {
        return;
      }

      setDonationsLoading(true);
      try {
        console.log(
          "Fetching donations for member user:",
          user?.id,
          "page:",
          page
        );
        console.log(
          "Following pattern from events page - trying axiosCommon first..."
        );

        // First try the member-specific endpoint
        console.log("🔄 Trying member endpoint first...");
        let response;

        try {
          // Try member endpoint: /member/donations/my-donations
          response = await axiosMember.get(`/donations/my-donations`, {
            params: {
              page: page.toString(),
              size: "10",
              sort: "createdAt,desc",
            },
          });
          console.log("✅ Member endpoint successful:", response.data);
        } catch (memberError: any) {
          console.log(
            "❌ Member endpoint failed:",
            memberError.response?.status
          );

          // Fallback to common endpoint with user ID
          console.log("🔄 Trying common endpoint as fallback...");
          response = await axiosCommon.get(`/donations/user/${user?.id}`, {
            params: {
              page: page.toString(),
              size: "10",
              sort: "createdAt,desc",
            },
          });
          console.log("✅ Common endpoint successful:", response.data);
        }

        console.log("SUCCESS! Donations response:", response.data);
        const donationsData = response.data.data || response.data;

        if (donationsData && donationsData.content) {
          setDonations(donationsData.content);
          setTotalPages(donationsData.totalPages || 0);
          setCurrentPage(donationsData.number || 0);
        } else if (Array.isArray(donationsData)) {
          setDonations(donationsData);
          setTotalPages(1);
          setCurrentPage(0);
        } else {
          setDonations([]);
          setTotalPages(0);
          setCurrentPage(0);
        }

        console.log("Donations loaded successfully!");
      } catch (error: any) {
        console.error(
          "Error fetching donations from both axios instances:",
          error
        );
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
        console.error("Response headers:", error.response?.headers);

        if (error.response?.status === 403) {
          toast.error(
            "Access denied. Please check your permissions or login again."
          );
        } else if (error.response?.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (error.response?.status === 404) {
          toast.error(
            "Donations endpoint not found. Please check your configuration."
          );
        } else {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Unknown error occurred";
          toast.error(`Failed to load donation history: ${errorMessage}`);
        }

        setDonations([]);
      } finally {
        setDonationsLoading(false);
      }
    },
    [user, ensureAuthenticated]
  );

  // Fetch donation statistics - try multiple axios instances like other pages do
  const fetchDonationStats = useCallback(async () => {
    if (!(await ensureAuthenticated())) {
      return;
    }

    setStatsLoading(true);
    try {
      console.log("Fetching donation stats for member user:", user?.id);
      console.log(
        "Following pattern from events page - trying axiosCommon first..."
      );

      // First try the member-specific endpoint
      console.log("🔄 Trying member endpoint for stats...");
      let response;

      try {
        // Try member endpoint: /member/donations/stats
        response = await axiosMember.get(`/donations/stats`);
        console.log("✅ Member stats endpoint successful:", response.data);
      } catch (memberError: any) {
        console.log(
          "❌ Member stats endpoint failed:",
          memberError.response?.status
        );

        // Fallback to common endpoint with user ID
        console.log("🔄 Trying common endpoint for stats as fallback...");
        response = await axiosCommon.get(`/donations/stats/${user?.id}`);
        console.log("✅ Common stats endpoint successful:", response.data);
      }

      console.log("SUCCESS! Stats response:", response.data);
      setDonationStats(response.data.data || response.data);
      console.log("Stats loaded successfully!");
    } catch (error: any) {
      console.error(
        "Error fetching donation stats from both axios instances:",
        error
      );
      console.error("Stats response status:", error.response?.status);
      console.error("Stats response data:", error.response?.data);
      setDonationStats(null);
      // Don't show error toast for stats as it's not critical
    } finally {
      setStatsLoading(false);
    }
  }, [user, ensureAuthenticated]);

  // Authentication initialization effect with better retry logic
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔄 Initializing member authentication...");

      // If no user and haven't exceeded retries
      if (!user && authRetries < 3) {
        console.log(
          `Attempting to get member info (attempt ${authRetries + 1}/3)...`
        );

        // Small delay to ensure cookies are available
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          const success = await getInfo("member");
          if (success) {
            console.log("✅ Member authentication successful");
            setAuthRetries(0);
          } else {
            console.warn("❌ Failed to get member info, will retry");
            setTimeout(() => setAuthRetries((prev) => prev + 1), 2000);
          }
        } catch (error) {
          console.error("❌ Member authentication error:", error);
          setTimeout(() => setAuthRetries((prev) => prev + 1), 2000);
        }
      } else if (user) {
        console.log("✅ User already authenticated:", {
          id: user.id,
          role: user.role,
        });
        setAuthRetries(0);
      } else if (authRetries >= 3) {
        console.error("❌ Max authentication retries reached");
        toast.error(
          "Unable to authenticate. Please refresh the page or log in again."
        );
      }
    };

    initializeAuth();
  }, [user, getInfo, authRetries]);

  useEffect(() => {
    if (user) {
      console.log("🎯 User authenticated, fetching data...", {
        userId: user.id,
        role: user.role,
      });
      fetchCampaigns();
      fetchMyDonations(0);
      fetchDonationStats();
    } else {
      console.log("❌ No user available yet");
    }
  }, [user, fetchCampaigns, fetchMyDonations, fetchDonationStats]);

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      fetchMyDonations(page);
    }
  };

  const handleDonateClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (orderId: string) => {
    toast.success("Thank you for your donation!");
    setShowPaymentForm(false);
    setSelectedCampaign(null);
    // Refresh data
    fetchCampaigns();
    fetchMyDonations(currentPage);
    fetchDonationStats();
  };

  const handlePaymentCancel = () => {
    toast.info("Payment was cancelled");
    setShowPaymentForm(false);
    setSelectedCampaign(null);
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setShowPaymentForm(false);
    setSelectedCampaign(null);
  };

  // Filter functions
  const getFilteredCampaigns = () => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  };

  const getFilteredDonations = () => {
    return donations.filter((donation) => {
      const matchesStatus =
        statusFilter === "all" ||
        donation.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesCampaign =
        !campaignFilter ||
        donation.campaignTitle
          .toLowerCase()
          .includes(campaignFilter.toLowerCase());

      return matchesStatus && matchesCampaign;
    });
  };

  // Utility functions
  const getCategoryIcon = (category: Campaign["category"]) => {
    switch (category) {
      case "scholarship":
        return <Award className="h-4 w-4" />;
      case "infrastructure":
        return <Target className="h-4 w-4" />;
      case "emergency":
        return <Heart className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
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

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Show payment form
  if (showPaymentForm && selectedCampaign && user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>

        <PaymentForm
          campaign={selectedCampaign}
          member={{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
          }}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onError={handlePaymentError}
        />
      </div>
    );
  }

  const filteredCampaigns = getFilteredCampaigns();
  const filteredDonations = getFilteredDonations();

  return (
    <>
      {/* Campaign Details Dialog */}
      <Dialog open={showCampaignDetails} onOpenChange={setShowCampaignDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedCampaignDetails && (
                <>
                  {getCategoryIcon(selectedCampaignDetails.category)}
                  <span>{selectedCampaignDetails.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Campaign details and progress information
            </DialogDescription>
          </DialogHeader>

          {selectedCampaignDetails && (
            <div className="space-y-6">
              {/* Campaign Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedCampaignDetails.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Category</h4>
                    <Badge
                      className={getCategoryColor(
                        selectedCampaignDetails.category
                      )}
                    >
                      {getCategoryIcon(selectedCampaignDetails.category)}
                      <span className="ml-1 capitalize">
                        {selectedCampaignDetails.category}
                      </span>
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    <Badge
                      variant={
                        isCampaignAcceptingDonations(selectedCampaignDetails)
                          ? "default"
                          : "secondary"
                      }
                    >
                      {isCampaignAcceptingDonations(selectedCampaignDetails)
                        ? "Active"
                        : "Ended"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-3">
                <h4 className="font-medium">Funding Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised</span>
                    <span className="font-medium">
                      LKR {selectedCampaignDetails.raised.toLocaleString()} /
                      LKR {selectedCampaignDetails.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      selectedCampaignDetails.progressPercentage || 0,
                      100
                    )}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {Math.round(
                        selectedCampaignDetails.progressPercentage || 0
                      )}
                      % completed
                    </span>
                    <span>
                      {(selectedCampaignDetails.daysRemaining || 0) > 0 &&
                      isCampaignAcceptingDonations(selectedCampaignDetails)
                        ? `${selectedCampaignDetails.daysRemaining} days remaining`
                        : "Campaign ended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-lg font-bold">
                    {selectedCampaignDetails.donorCount}
                  </div>
                  <div className="text-xs text-muted-foreground">Donors</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    {format(
                      new Date(selectedCampaignDetails.endDate),
                      "MMM d, yyyy"
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">End Date</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    LKR{" "}
                    {(
                      selectedCampaignDetails.goal -
                      selectedCampaignDetails.raised
                    ).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Remaining</div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowCampaignDetails(false);
                    handleDonateClick(selectedCampaignDetails);
                  }}
                  disabled={
                    !isCampaignAcceptingDonations(selectedCampaignDetails)
                  }
                  className="w-full"
                >
                  {!isCampaignAcceptingDonations(selectedCampaignDetails) ? (
                    "Campaign Ended"
                  ) : (
                    <>
                      <Heart className="mr-2 h-4 w-4" />
                      Donate to This Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Donations</h1>
            <p className="text-muted-foreground mt-1">
              Support causes that matter to our community
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {/* Debug button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCampaigns}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Target className="h-4 w-4 mr-1" />
              )}
              Refresh Campaigns
            </Button>
            {/* Debug auth button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("=== Authentication Debug ===");
                console.log(
                  "axiosAdmin baseURL:",
                  (axiosAdmin.defaults as any).baseURL
                );
                console.log(
                  "axiosMember baseURL:",
                  (axiosMember.defaults as any).baseURL
                );
                console.log("User:", user);
                console.log("All cookies:", document.cookie);

                const csrfToken =
                  document.cookie.match(/csrf-token=([^;]+)/)?.[1];
                const sessionId =
                  document.cookie.match(/sessionId=([^;]+)/)?.[1];
                console.log("CSRF Token:", csrfToken);
                console.log("Session ID:", sessionId);

                toast.info(
                  `Auth Status - CSRF: ${csrfToken ? "Yes" : "No"}, Session: ${
                    sessionId ? "Yes" : "No"
                  }, User: ${user?.id || "None"}`
                );
              }}
            >
              Debug Auth
            </Button>
            {/* Test member endpoints */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log("=== Testing Member Endpoints After Fix ===");
                try {
                  await fetchMyDonations(0);
                  await fetchDonationStats();
                  toast.success("Member endpoints working! ✅");
                } catch (error: any) {
                  console.error("Test failed:", error);
                  toast.error("Still having issues - check console");
                }
              }}
            >
              Test Fix
            </Button>
            {/* Test direct endpoint access */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log("=== Direct Endpoint Test ===");
                try {
                  // Test if member info endpoint works
                  const infoResponse = await axiosMember.get(
                    "/info/getMemberInfo"
                  );
                  console.log("✅ Member info working:", infoResponse.data);
                  toast.success("Member info endpoint works!");
                } catch (error: any) {
                  console.log("❌ Member info failed:", error.response?.status);
                  console.log(
                    "This confirms the issue is with ALL member endpoints"
                  );

                  // Test a simple member endpoint if it exists
                  try {
                    const testResponse = await axiosMember.get("/test");
                    console.log(
                      "✅ Member test endpoint works:",
                      testResponse.data
                    );
                  } catch (testError: any) {
                    console.log(
                      "❌ Member test endpoint also failed:",
                      testError.response?.status
                    );
                    console.log(
                      "🔍 DIAGNOSIS: ALL /member/** endpoints are blocked"
                    );
                    console.log(
                      "🔧 SOLUTION: Check for @PreAuthorize annotations or other security configs"
                    );
                    toast.error(
                      "ALL member endpoints blocked - check backend security"
                    );
                  }
                }
              }}
            >
              Test Member Info
            </Button>
            {/* Test admin endpoint access for comparison */}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log("=== Testing Admin Endpoint Access ===");
                try {
                  // Test if we can access admin endpoints with current auth
                  const response = await axiosAdmin.get("/campaign/get/active");
                  console.log("✅ Admin endpoint working:", response.data);
                  toast.success(
                    "Admin endpoints work - issue is member-specific"
                  );
                } catch (error: any) {
                  console.log(
                    "❌ Admin endpoint also failing:",
                    error.response?.status
                  );
                  console.log("This suggests a general auth issue");
                  toast.error(`Admin test failed: ${error.response?.status}`);
                }
              }}
            >
              Test Admin Access
            </Button>
            {donationStats && !statsLoading && (
              <Badge variant="outline">
                <DollarSign className="h-3 w-3 mr-1" />
                LKR {donationStats.totalDonated.toLocaleString()} Total Donated
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {statsLoading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))
          ) : donationStats ? (
            <>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    LKR {donationStats.totalDonated.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Donated</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {donationStats.totalDonations}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Donations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {donationStats.campaignsSupported}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Campaigns Supported
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    LKR{" "}
                    {Math.round(donationStats.averageDonation).toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average Donation
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="col-span-4">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">
                  No donation statistics available
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
            <TabsTrigger value="history">My Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm
                        ? "No Matching Campaigns"
                        : "No Active Campaigns"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "There are currently no active campaigns accepting donations."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Active Campaigns */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCampaigns.map((campaign) => {
                  const progressPercentage = campaign.progressPercentage || 0;
                  const daysLeft = campaign.daysRemaining || 0;
                  const canDonate = isCampaignAcceptingDonations(campaign);

                  return (
                    <Card
                      key={campaign.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">
                              {campaign.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {campaign.description}
                            </CardDescription>
                          </div>
                          <Badge
                            className={getCategoryColor(campaign.category)}
                          >
                            {getCategoryIcon(campaign.category)}
                            <span className="ml-1 capitalize">
                              {campaign.category}
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              LKR {campaign.raised.toLocaleString()} / LKR{" "}
                              {campaign.goal.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(progressPercentage, 100)}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              {Math.round(progressPercentage)}% funded
                            </span>
                            <span>
                              {canDonate && daysLeft > 0
                                ? `${daysLeft} days left`
                                : "Campaign ended"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{campaign.donorCount} donors</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Ends {format(new Date(campaign.endDate), "MMM d")}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchCampaignDetails(campaign.id)}
                              disabled={campaignDetailsLoading}
                              className="flex-1"
                            >
                              {campaignDetailsLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Target className="mr-2 h-4 w-4" />
                              )}
                              Details
                            </Button>
                            <Button
                              onClick={() => handleDonateClick(campaign)}
                              disabled={!canDonate}
                              className="flex-2"
                            >
                              {!canDonate ? (
                                "Campaign Ended"
                              ) : (
                                <>
                                  <Heart className="mr-2 h-4 w-4" />
                                  Donate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Filters for donation history */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by campaign name..."
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Donation History */}
            <Card>
              <CardHeader>
                <CardTitle>Your Donation History</CardTitle>
                <CardDescription>
                  Track your contributions to various campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donationsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Loading donations...
                    </p>
                  </div>
                ) : filteredDonations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-medium">
                            {donation.campaignTitle}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>
                              {format(
                                new Date(donation.createdAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                            {donation.isAnonymous && (
                              <span>• Anonymous donation</span>
                            )}
                            {donation.transactionId && (
                              <span>
                                • ID: {donation.transactionId.substring(0, 10)}
                                ...
                              </span>
                            )}
                          </div>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground italic">
                              "
                              {donation.message.length > 100
                                ? `${donation.message.substring(0, 100)}...`
                                : donation.message}
                              "
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            LKR {donation.amount.toLocaleString()}
                          </div>
                          <Badge className={getStatusColor(donation.status)}>
                            {getStatusIcon(donation.status)}
                            <span className="ml-1">{donation.status}</span>
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage + 1} of {totalPages}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 0 || donationsLoading}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={
                              currentPage >= totalPages - 1 || donationsLoading
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {campaignFilter || statusFilter !== "all"
                        ? "No Matching Donations"
                        : "No Donations Yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {campaignFilter || statusFilter !== "all"
                        ? "Try adjusting your filters."
                        : "Start supporting causes that matter to you and your community."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Impact Summary */}
            {donationStats &&
              donationStats.totalDonations > 0 &&
              !statsLoading && (
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Your Impact</span>
                    </CardTitle>
                    <CardDescription>
                      See how your contributions are making a difference
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          LKR {donationStats.totalDonated.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Total Contributed
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {donationStats.campaignsSupported}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Campaigns Supported
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Math.round(
                            (donationStats.completedDonations /
                              donationStats.totalDonations) *
                              100
                          )}
                          %
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Success Rate
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
