"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import axiosMember from "@/axiosInstances/axiosMember";
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
  AlertTriangle,
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
  isExpired?: boolean;
  canAcceptDonations?: boolean;
  daysRemaining?: number;
  status?: string;
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  isAnonymous: boolean;
  status: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nic?: string;
  regNo?: string;
  batch?: number;
}

export default function DonationsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);

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

  // Fetch member profile
  const fetchMemberProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Use the user data from auth as member profile
      const userAny = user as any;
      const profile: Member = {
        id: parseInt(user.id),
        name: user.name || "",
        email: user.email || "",
        phone: userAny.phone || undefined,
        nic: userAny.nic || undefined,
        regNo: userAny.regNo || undefined,
        batch: userAny.batch || undefined,
      };

      setMemberProfile(profile);
    } catch (error) {
      console.error("Error setting member profile:", error);
      handleApiError(error, "Failed to load member profile");
    }
  }, [user]);

  // Fetch campaigns from backend
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching campaigns...");
      const response = await axiosMember.get("/campaign/active");

      console.log("Campaign response:", response);

      if (response.status === 200 && response.data) {
        // Handle different response structures
        let campaignsData = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          campaignsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          campaignsData = response.data;
        } else {
          console.warn("Unexpected response format:", response.data);
          campaignsData = [];
        }

        console.log("Raw campaigns data:", campaignsData);

        const transformedCampaigns: Campaign[] = campaignsData
          .map((campaign: any) => {
            try {
              return {
                id: campaign.id.toString(),
                title: campaign.title || "",
                description: campaign.description || "",
                goal: safeParseNumber(campaign.goal),
                raised: safeParseNumber(campaign.raised),
                endDate: campaign.endDate
                  ? new Date(campaign.endDate).toISOString()
                  : new Date().toISOString(),
                category: mapCategoryFromBackend(campaign.type),
                donorCount: campaign.donorCount || 0,
                isActive: campaign.isActive || false,
                progressPercentage: campaign.progressPercentage || 0,
                isExpired: campaign.isExpired || false,
                canAcceptDonations: campaign.canAcceptDonations !== false,
                daysRemaining: campaign.daysRemaining || 0,
                status: campaign.status || "ACTIVE",
              };
            } catch (error) {
              console.error(
                "Error transforming individual campaign:",
                campaign,
                error
              );
              return null;
            }
          })
          .filter(Boolean); // Remove null values

        console.log("Transformed campaigns:", transformedCampaigns);
        setCampaigns(transformedCampaigns);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      setCampaigns([]); // Set empty array on error
      handleApiError(error, "Failed to load campaigns. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch member donations
  const fetchMyDonations = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log("Fetching my donations...");
      const response = await axiosMember.get(
        `/donations/my-donations/${user.id}`
      );

      if (response.status === 200 && response.data) {
        // Handle different response structures
        let donationsData = [];

        if (response.data.data && Array.isArray(response.data.data)) {
          donationsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          donationsData = response.data;
        } else {
          console.warn("Unexpected donations response format:", response.data);
          donationsData = [];
        }

        const transformedDonations: Donation[] = donationsData
          .map((donation: any) => {
            try {
              return {
                id: donation.id.toString(),
                campaignId: donation.campaignId.toString(),
                campaignTitle: donation.campaignTitle || "",
                amount: safeParseNumber(donation.amount),
                date: donation.date,
                isAnonymous: donation.isAnonymous || false,
                status: donation.status || "COMPLETED",
              };
            } catch (error) {
              console.error(
                "Error transforming individual donation:",
                donation,
                error
              );
              return null;
            }
          })
          .filter(Boolean); // Remove null values

        setMyDonations(transformedDonations);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      handleApiError(error, "Failed to load donation history.");
    }
  }, [user?.id]);

  // Fetch member donation statistics
  const fetchDonationStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log("Fetching donation stats...");
      const response = await axiosMember.get(`/donations/stats/${user.id}`);

      if (response.status === 200 && response.data) {
        const statsData = response.data.data || response.data;

        // Transform BigDecimal strings to numbers for frontend
        const transformedStats = {
          ...statsData,
          totalDonated: safeParseNumber(statsData.totalDonated),
          totalDonations: statsData.totalDonations || 0,
          campaignsSupported: statsData.campaignsSupported || 0,
          averageDonation: safeParseNumber(statsData.averageDonation),
        };

        setDonationStats(transformedStats);
      }
    } catch (error) {
      console.error("Error fetching donation stats:", error);
      // Don't show error toast for stats as it's not critical
    }
  }, [user?.id]);

  // Fetch all data on component mount
  useEffect(() => {
    if (user?.id) {
      fetchMemberProfile();
      fetchCampaigns();
      fetchMyDonations();
      fetchDonationStats();
    }
  }, [
    user?.id,
    fetchMemberProfile,
    fetchCampaigns,
    fetchMyDonations,
    fetchDonationStats,
  ]);

  const totalDonated = donationStats?.totalDonated || 0;
  const totalDonations = donationStats?.totalDonations || 0;
  const campaignsSupported = donationStats?.campaignsSupported || 0;

  const handleDonateClick = (campaign: Campaign) => {
    if (!memberProfile) {
      toast.error("Member profile not loaded. Please refresh the page.");
      return;
    }

    if (!campaign.canAcceptDonations) {
      toast.error("This campaign is not currently accepting donations.");
      return;
    }

    setSelectedCampaign(campaign);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (orderId: string) => {
    toast.success("Thank you for your donation!");
    setShowPaymentForm(false);
    setSelectedCampaign(null);
    // Refresh data to show updated amounts
    fetchCampaigns();
    fetchMyDonations();
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

  const getStatusBadge = (campaign: Campaign) => {
    if (!campaign.canAcceptDonations) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Not Accepting Donations
        </Badge>
      );
    }
    if (
      campaign.daysRemaining !== undefined &&
      campaign.daysRemaining <= 7 &&
      campaign.daysRemaining > 0
    ) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-700">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {campaign.daysRemaining} days left
        </Badge>
      );
    }
    return null;
  };

  // Show payment form
  if (showPaymentForm && selectedCampaign && memberProfile) {
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
          member={memberProfile}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onError={handlePaymentError}
        />
      </div>
    );
  }

  return (
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
          <Badge variant="outline">
            <DollarSign className="h-3 w-3 mr-1" />
            LKR {totalDonated.toLocaleString()} Total Donated
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              LKR {totalDonated.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              Your Total Donations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {totalDonations}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Donations Made
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {campaignsSupported}
            </div>
            <p className="text-sm text-muted-foreground">Campaigns Supported</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="history">My Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Active Campaigns
                  </h3>
                  <p className="text-muted-foreground">
                    There are currently no active campaigns accepting donations.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Active Campaigns */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => {
                const progressPercentage = campaign.progressPercentage || 0;
                const daysLeft = campaign.daysRemaining || 0;

                return (
                  <Card key={campaign.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {campaign.title}
                          </CardTitle>
                          <CardDescription>
                            {campaign.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge
                            className={getCategoryColor(campaign.category)}
                          >
                            {getCategoryIcon(campaign.category)}
                            <span className="ml-1 capitalize">
                              {campaign.category}
                            </span>
                          </Badge>
                          {getStatusBadge(campaign)}
                        </div>
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
                          <span>{Math.round(progressPercentage)}% funded</span>
                          <span>
                            {daysLeft > 0
                              ? `${daysLeft} days left`
                              : campaign.isExpired
                              ? "Campaign ended"
                              : "Active"}
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
                        <Button
                          onClick={() => handleDonateClick(campaign)}
                          disabled={
                            !campaign.canAcceptDonations || campaign.isExpired
                          }
                          className="w-full"
                        >
                          {!campaign.canAcceptDonations ? (
                            "Not Accepting Donations"
                          ) : campaign.isExpired ? (
                            "Campaign Ended"
                          ) : (
                            <>
                              <Heart className="mr-2 h-4 w-4" />
                              Donate Now
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Donation History</CardTitle>
              <CardDescription>
                Track your contributions to various campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myDonations.length > 0 ? (
                <div className="space-y-4">
                  {myDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <h4 className="font-medium">
                          {donation.campaignTitle}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>
                            {format(new Date(donation.date), "MMM d, yyyy")}
                          </span>
                          {donation.isAnonymous && (
                            <span>• Anonymous donation</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {donation.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          LKR {donation.amount.toLocaleString()}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Thank you!
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Donations Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Start supporting causes that matter to you and your
                    community.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Summary */}
          {myDonations.length > 0 && (
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
                      LKR {totalDonated.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total Contributed
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {campaignsSupported}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Campaigns Supported
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {donationStats?.averageDonation
                        ? `LKR ${Math.round(
                            donationStats.averageDonation
                          ).toLocaleString()}`
                        : "LKR 0"}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average Donation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
