"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Heart,
  DollarSign,
  Target,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Award,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import axios from "axios";
import PaymentComponent from "@/components/payment/PaymentComponent"; // Adjust path as needed

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  endDate: string;
  category: "scholarship" | "infrastructure" | "emergency" | "general";
  type?: string;
  donorCount: number;
  isActive: boolean;
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  isAnonymous: boolean;
}

export default function DonationsPage() {
  const { user } = useAuth();
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [amounts, setAmounts] = useState<{ [key: string]: string }>({});
  const [anonymous, setAnonymous] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("backend url", backend_url);
    console.log("api.prefix", process.env.NEXT_PUBLIC_API_PREFIX);

    const endpoint = `${backend_url}/${process.env.NEXT_PUBLIC_API_PREFIX}`;

    setLoading(true);
    try {
      console.log("Fetching donation data...");
      console.log(`Endpoint: ${endpoint}`);

      // Try to fetch only active campaigns first
      let activeCampaignsData = [];
      let allCampaignsData = [];

      try {
        // First, try to get active campaigns from dedicated endpoint
        console.log("Attempting to fetch active campaigns only...");
        const activeCampaignsRes = await axios.get(
          `${endpoint}/campaign/get/active`
        );
        activeCampaignsData = activeCampaignsRes.data.data || [];
        console.log(
          `Fetched ${activeCampaignsData.length} active campaigns from dedicated endpoint`
        );

        // For impact calculations, we might still need all campaigns count
        // But only fetch if we have donations to show impact for
        try {
          const allCampaignsRes = await axios.get(
            `${endpoint}/campaign/get/all`
          );
          allCampaignsData = allCampaignsRes.data.data || [];
        } catch (error) {
          console.log(
            "Could not fetch all campaigns for impact calculation, using active campaigns"
          );
          allCampaignsData = activeCampaignsData;
        }
      } catch (error) {
        console.log(
          "Active campaigns endpoint not available, falling back to filtering all campaigns"
        );
        // Fallback: fetch all and filter
        const campaignsRes = await axios.get(`${endpoint}/campaign/get/all`);
        allCampaignsData = campaignsRes.data.data || [];

        // Filter active campaigns client-side
        activeCampaignsData = allCampaignsData.filter((campaign: Campaign) => {
          const now = new Date();
          const endDate = new Date(campaign.endDate);

          return (
            campaign.isActive !== false &&
            endDate > now &&
            campaign.raised < campaign.goal
          );
        });
      }

      // Fetch user donation data in parallel
      const [donationsRes, totalRes] = await Promise.all([
        axios.get(`${endpoint}/donation/member/${user.id}`),
        axios.get(`${endpoint}/donation/member/${user.id}/total`),
      ]);

      console.log(`Active campaigns: ${activeCampaignsData.length}`);
      console.log(`Total campaigns: ${allCampaignsData.length}`);

      setActiveCampaigns(activeCampaignsData);
      setAllCampaigns(allCampaignsData);
      setMyDonations(donationsRes.data.data || []);
      setTotalDonated(totalRes.data.data || 0);

      if (activeCampaignsData.length === 0) {
        toast.info("No active campaigns available at the moment");
      } else {
        toast.success(`Found ${activeCampaignsData.length} active campaigns`);
      }
    } catch (error) {
      console.error("Failed to load donation data:", error);
      toast.error("Failed to load donation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveCampaignsOnly = async () => {
    const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
    const endpoint = `${backend_url}/${process.env.NEXT_PUBLIC_API_PREFIX}`;

    setRefreshing(true);
    try {
      console.log("Refreshing active campaigns only...");

      // Only fetch active campaigns for refresh
      const campaignsRes = await axios.get(`${endpoint}/campaign/get/active`);
      const activeCampaignsData = campaignsRes.data.data || [];

      console.log(`Refreshed ${activeCampaignsData.length} active campaigns`);

      setActiveCampaigns(activeCampaignsData);
      toast.success(`Refreshed ${activeCampaignsData.length} active campaigns`);
    } catch (error) {
      console.error(
        "Active campaigns endpoint failed, trying fallback:",
        error
      );

      // Fallback to filtering all campaigns
      try {
        const campaignsRes = await axios.get(`${endpoint}/campaign/get/all`);
        const allCampaignsData = campaignsRes.data.data || [];

        const activeCampaignsData = allCampaignsData.filter(
          (campaign: Campaign) => {
            const now = new Date();
            const endDate = new Date(campaign.endDate);

            return (
              campaign.isActive !== false &&
              endDate > now &&
              campaign.raised < campaign.goal
            );
          }
        );

        setActiveCampaigns(activeCampaignsData);
        setAllCampaigns(allCampaignsData); // Update all campaigns too
        toast.success(
          `Refreshed ${activeCampaignsData.length} active campaigns (filtered)`
        );
      } catch (fallbackError) {
        console.error("Failed to refresh campaigns:", fallbackError);
        toast.error("Failed to refresh campaigns");
      }
    } finally {
      setRefreshing(false);
    }
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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const isValidCampaign = (campaign: Campaign) => {
    const now = new Date();
    const endDate = new Date(campaign.endDate);
    const daysLeft = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysLeft > 0 && campaign.raised < campaign.goal;
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchActiveCampaignsOnly}
            disabled={refreshing}
            className="flex items-center space-x-1"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
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
              {myDonations.length}
            </div>
            <p className="text-sm text-muted-foreground">Campaigns Supported</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {activeCampaigns.length}
            </div>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">
            Active Campaigns ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="history">My Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading active campaigns...</p>
            </div>
          )}

          {/* No Active Campaigns */}
          {!loading && activeCampaigns.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Active Campaigns
                </h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no active campaigns available for
                  donations.
                </p>
                <Button onClick={fetchActiveCampaignsOnly} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Campaigns
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Active Campaigns Grid */}
          {!loading && activeCampaigns.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeCampaigns.map((campaign) => {
                const progressPercentage = Math.min(
                  (campaign.raised / campaign.goal) * 100,
                  100
                );
                const daysLeft = Math.ceil(
                  (new Date(campaign.endDate).getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24)
                );
                const category =
                  (campaign?.type?.toLowerCase() as Campaign["category"]) ??
                  "general";

                // Double-check if campaign is still valid
                if (!isValidCampaign(campaign)) {
                  return null;
                }

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
                        <div className="flex flex-col space-y-1">
                          <Badge className={getCategoryColor(category)}>
                            {getCategoryIcon(category)}
                            <span className="ml-1 capitalize">{category}</span>
                          </Badge>
                          {daysLeft <= 7 && (
                            <Badge variant="destructive" className="text-xs">
                              Urgent
                            </Badge>
                          )}
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
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(progressPercentage)}% funded</span>
                          <span
                            className={
                              daysLeft <= 7 ? "text-red-600 font-medium" : ""
                            }
                          >
                            {daysLeft} days left
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

                      <div className="space-y-3 pt-2 border-t">
                        <Input
                          type="number"
                          placeholder="Amount (LKR)"
                          value={amounts[campaign.id] || ""}
                          onChange={(e) =>
                            setAmounts({
                              ...amounts,
                              [campaign.id]: e.target.value,
                            })
                          }
                          className="w-full"
                          min="1"
                        />
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`anon-${campaign.id}`}
                            checked={anonymous[campaign.id] || false}
                            onCheckedChange={(checked) =>
                              setAnonymous({
                                ...anonymous,
                                [campaign.id]: !!checked,
                              })
                            }
                          />
                          <Label htmlFor={`anon-${campaign.id}`}>
                            Donate anonymously
                          </Label>
                        </div>
                        <PaymentComponent
                          campaignId={campaign.id}
                          memberId={user?.id}
                          amount={amounts[campaign.id] || ""}
                          isAnonymous={anonymous[campaign.id] || false}
                          memberName={user?.name}
                          memberEmail={user?.email}
                          campaignTitle={campaign.title}
                          onPaymentSuccess={(orderId, paymentData) => {
                            console.log("Payment successful:", orderId);
                            toast.success(
                              `Thank you for your donation of LKR ${paymentData.amount}!`
                            );
                            fetchData(); // Refresh the data
                            setAmounts({ ...amounts, [campaign.id]: "" });
                            setAnonymous({
                              ...anonymous,
                              [campaign.id]: false,
                            });
                          }}
                          onPaymentCancel={() => {
                            console.log("Payment cancelled");
                            // Don't clear the amount on cancel - user might want to try again
                          }}
                          onPaymentError={(error) => {
                            console.error("Payment error:", error);
                            // Don't clear the amount on error - user might want to try again
                          }}
                        />
                        <div className="flex gap-2">
                          {[50, 100, 250, 500].map((amt) => (
                            <Button
                              key={amt}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setAmounts({
                                  ...amounts,
                                  [campaign.id]: amt.toString(),
                                })
                              }
                              className="flex-1"
                            >
                              LKR {amt}
                            </Button>
                          ))}
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
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(donation.date), "MMM d, yyyy")}
                          {donation.isAnonymous && " • Anonymous donation"}
                        </p>
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
                      {myDonations.length}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Campaigns Supported
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {allCampaigns.length > 0
                        ? Math.round(
                            (totalDonated /
                              allCampaigns.reduce(
                                (sum, c) => sum + c.goal,
                                0
                              )) *
                              100 *
                              100
                          ) / 100
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Of Total Goals
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

function DebugEnv() {
  return (
    <div className="bg-red-100 p-4 rounded mb-4">
      <h3>Environment Debug:</h3>
      <p>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL}</p>
      <p>API Prefix: {process.env.NEXT_PUBLIC_API_PREFIX}</p>
      <p>
        Full Endpoint: {process.env.NEXT_PUBLIC_BACKEND_URL}/
        {process.env.NEXT_PUBLIC_API_PREFIX}
      </p>
    </div>
  );
}
