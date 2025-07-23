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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  AlertCircle,
  X,
  Send,
  Mail,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  category: "scholarship" | "infrastructure" | "emergency" | "general";
  donorCount: number;
  isActive: boolean;
  createdBy: string;
}
interface Donation {
  id: string;
  campaignId: string;
  donorName: string;
  donorEmail: string;
  donorAvatar?: string;
  amount: number;
  date: string;
  isAnonymous: boolean;
  paymentMethod: "credit_card" | "bank_transfer" | "paypal";
  message?: string;
  status: "completed" | "pending" | "failed";
}

interface UpdateForm {
  subject: string;
  message: string;
  includeProgress: boolean;
  sendToAll: boolean;
  selectedDonors: string[];
}

export default function AdminFundraisingPage() {
  const { user } = useAuth();
  const { organization } = useOrg();
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      title: "Student Scholarship Fund",
      description:
        "Supporting deserving students with financial assistance for their education",
      goal: 50000,
      raised: 32500,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: "scholarship",
      donorCount: 145,
      isActive: true,
      createdBy: user?.id || "",
    },
    {
      id: "2",
      title: "Campus Infrastructure Upgrade",
      description:
        "Modernizing campus facilities and technology infrastructure",
      goal: 100000,
      raised: 67800,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: "infrastructure",
      donorCount: 89,
      isActive: true,
      createdBy: user?.id || "",
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);

  // New state for modals
  const [showDonationsModal, setShowDonationsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [donationsLoading, setDonationsLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [donationSearchTerm, setDonationSearchTerm] = useState("");
  const [donationFilter, setDonationFilter] = useState<
    "all" | "completed" | "pending" | "anonymous"
  >("all");

  // Mock donations data
  const [donations, setDonations] = useState<Donation[]>([
    {
      id: "1",
      campaignId: "1",
      donorName: "Sheane Mario",
      donorEmail: "sheane.mario@example.com",
      donorAvatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
      amount: 500,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
      paymentMethod: "credit_card",
      message: "Happy to support education for future generations!",
      status: "completed",
    },
    {
      id: "2",
      campaignId: "1",
      donorName: "Anonymous Donor",
      donorEmail: "anonymous@example.com",
      amount: 1000,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: true,
      paymentMethod: "bank_transfer",
      status: "completed",
    },
    {
      id: "3",
      campaignId: "1",
      donorName: "Sheane Mario",
      donorEmail: "sheane.mario@example.com",
      donorAvatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
      amount: 250,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
      paymentMethod: "paypal",
      message: "Education is the key to success!",
      status: "completed",
    },
    {
      id: "4",
      campaignId: "2",
      donorName: "Pulasthi Abishek",
      donorEmail: "pulasthi.abishek@example.com",
      donorAvatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
      amount: 750,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
      paymentMethod: "credit_card",
      message: "Excited to see the new facilities!",
      status: "completed",
    },
    {
      id: "5",
      campaignId: "1",
      donorName: "Hashir Ahamad",
      donorEmail: "hashir.ahamad@example.com",
      amount: 100,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
      paymentMethod: "credit_card",
      status: "pending",
    },
  ]);

  // Update form state
  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    subject: "",
    message: "",
    includeProgress: true,
    sendToAll: true,
    selectedDonors: [],
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal: "",
    endDate: "",
    category: "general" as Campaign["category"],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.goal || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const newCampaign: Campaign = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        goal: Number(formData.goal),
        raised: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        category: formData.category,
        donorCount: 0,
        isActive: true,
        createdBy: user?.id || "",
      };

      setCampaigns((prev) => [newCampaign, ...prev]);
      setFormData({
        title: "",
        description: "",
        goal: "",
        endDate: "",
        category: "general",
      });
      setShowCreateForm(false);
      toast.success("Campaign created successfully!");
    } catch (error) {
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCampaign = async (campaignId: string) => {
    try {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, isActive: !campaign.isActive }
            : campaign
        )
      );
      toast.success("Campaign status updated successfully!");
    } catch (error) {
      toast.error("Failed to update campaign status.");
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;

    try {
      setCampaigns((prev) =>
        prev.filter((campaign) => campaign.id !== campaignId)
      );
      toast.success("Campaign deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete campaign.");
    }
  };

  const handleViewDonations = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowDonationsModal(true);
    setDonationsLoading(true);

    try {
      // TODO: Replace with actual API call to fetch donations
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Donations are already loaded in state for demo
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleSendUpdate = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setUpdateForm({
      subject: `Update on ${campaign.title}`,
      message: "",
      includeProgress: true,
      sendToAll: true,
      selectedDonors: [],
    });
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!updateForm.subject.trim() || !updateForm.message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setUpdateLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const recipientCount = updateForm.sendToAll
        ? selectedCampaign?.donorCount || 0
        : updateForm.selectedDonors.length;

      toast.success(`Update sent successfully to ${recipientCount} donors!`);
      setShowUpdateModal(false);
      setUpdateForm({
        subject: "",
        message: "",
        includeProgress: true,
        sendToAll: true,
        selectedDonors: [],
      });
    } catch (error) {
      toast.error("Failed to send update. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleExportDonations = async (campaignId: string) => {
    try {
      const campaignDonations = donations.filter(
        (d) => d.campaignId === campaignId
      );
      const csvContent = [
        "Donor Name,Email,Amount,Date,Payment Method,Status,Message",
        ...campaignDonations.map(
          (d) =>
            `"${d.isAnonymous ? "Anonymous" : d.donorName}","${
              d.donorEmail
            }","LKR ${d.amount}","${format(new Date(d.date), "yyyy-MM-dd")}","${
              d.paymentMethod
            }","${d.status}","${d.message || ""}"`
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `donations-${campaignId}-${format(
        new Date(),
        "yyyy-MM-dd"
      )}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Donations exported successfully!");
    } catch (error) {
      toast.error("Failed to export donations");
    }
  };

  const getCampaignDonations = (campaignId: string) => {
    return donations.filter((d) => d.campaignId === campaignId);
  };

  const getFilteredDonations = (campaignId: string) => {
    let campaignDonations = getCampaignDonations(campaignId);

    // Apply search filter
    if (donationSearchTerm) {
      campaignDonations = campaignDonations.filter(
        (d) =>
          d.donorName
            .toLowerCase()
            .includes(donationSearchTerm.toLowerCase()) ||
          d.donorEmail
            .toLowerCase()
            .includes(donationSearchTerm.toLowerCase()) ||
          (d.message &&
            d.message.toLowerCase().includes(donationSearchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    switch (donationFilter) {
      case "completed":
        return campaignDonations.filter((d) => d.status === "completed");
      case "pending":
        return campaignDonations.filter((d) => d.status === "pending");
      case "anonymous":
        return campaignDonations.filter((d) => d.isAnonymous);
      default:
        return campaignDonations;
    }
  };

  const handleUpdateInputChange = (field: keyof UpdateForm, value: any) => {
    setUpdateForm((prev) => ({ ...prev, [field]: value }));
  };

  const totalRaised = campaigns.reduce(
    (sum, campaign) => sum + campaign.raised,
    0
  );
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0);
  const activeCampaigns = campaigns.filter((campaign) => campaign.isActive);

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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return "💳";
      case "bank_transfer":
        return "🏦";
      case "paypal":
        return "💰";
      default:
        return "💳";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
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
            Fundraising Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage donation campaigns
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              LKR {totalRaised.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalRaised / totalGoal) * 100)}% of total goal
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
            <div className="text-2xl font-bold">{activeCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.length - activeCampaigns.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaigns.reduce(
                (sum, campaign) => sum + campaign.donorCount,
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Donation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              LKR
              {Math.round(
                totalRaised /
                  Math.max(
                    campaigns.reduce(
                      (sum, campaign) => sum + campaign.donorCount,
                      0
                    ),
                    1
                  )
              )}
            </div>
            <p className="text-xs text-muted-foreground">Per donation</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Create Campaign Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Campaign</CardTitle>
                <CardDescription>
                  Set up a new fundraising campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCampaign} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Campaign Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="Enter campaign title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goal">Fundraising Goal ($) *</Label>
                      <Input
                        id="goal"
                        type="number"
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
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="general">General</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="infrastructure">Infrastructure</option>
                        <option value="emergency">Emergency</option>
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

                  <div className="flex space-x-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Creating..." : "Create Campaign"}
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
            {campaigns.map((campaign) => {
              const progressPercentage =
                (campaign.raised / campaign.goal) * 100;
              const daysLeft = Math.ceil(
                (new Date(campaign.endDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">
                            {campaign.title}
                          </CardTitle>
                          <Badge
                            className={getCategoryColor(campaign.category)}
                          >
                            {campaign.category}
                          </Badge>
                          <Badge
                            variant={
                              campaign.isActive ? "default" : "secondary"
                            }
                          >
                            {campaign.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {campaign.description}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCampaign(campaign.id)}
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
                          ${campaign.raised.toLocaleString()} / $
                          {campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progressPercentage)}% funded</span>
                        <span>
                          {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
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
                          Avg: $
                          {Math.round(
                            campaign.raised / Math.max(campaign.donorCount, 1)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2 border-t">
                      <Button
                        variant={campaign.isActive ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleToggleCampaign(campaign.id)}
                      >
                        {campaign.isActive
                          ? "Pause Campaign"
                          : "Activate Campaign"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDonations(campaign)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Donations
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendUpdate(campaign)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fundraising Analytics</CardTitle>
              <CardDescription>
                Detailed insights into your fundraising performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Detailed analytics and reporting features will be available in
                  the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Donations Modal */}
      {showDonationsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>Donations for {selectedCampaign.title}</span>
                  </CardTitle>
                  <CardDescription>
                    View and manage all donations for this campaign
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportDonations(selectedCampaign.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDonationsModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {donationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search donations..."
                        value={donationSearchTerm}
                        onChange={(e) => setDonationSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={donationFilter}
                        onChange={(e) =>
                          setDonationFilter(e.target.value as any)
                        }
                        className="px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="all">All Donations</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="anonymous">Anonymous</option>
                      </select>
                    </div>
                  </div>

                  {/* Donations List */}
                  <div className="space-y-3">
                    {getFilteredDonations(selectedCampaign.id).map(
                      (donation) => (
                        <div
                          key={donation.id}
                          className="border rounded-lg p-4 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={donation.donorAvatar}
                                  alt={donation.donorName}
                                />
                                <AvatarFallback>
                                  {donation.isAnonymous
                                    ? "?"
                                    : donation.donorName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium">
                                    {donation.isAnonymous
                                      ? "Anonymous Donor"
                                      : donation.donorName}
                                  </h4>
                                  <Badge
                                    className={getStatusColor(donation.status)}
                                  >
                                    {donation.status}
                                  </Badge>
                                  {donation.isAnonymous && (
                                    <Badge variant="outline">Anonymous</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {donation.donorEmail}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>
                                    {format(
                                      new Date(donation.date),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <span>
                                      {getPaymentMethodIcon(
                                        donation.paymentMethod
                                      )}
                                    </span>
                                    <span>
                                      {donation.paymentMethod.replace("_", " ")}
                                    </span>
                                  </span>
                                </div>
                                {donation.message && (
                                  <p className="text-sm bg-muted p-2 rounded mt-2 italic">
                                    &quot{donation.message}&quot
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                ${donation.amount.toLocaleString()}
                              </div>
                              <div className="flex space-x-1 mt-2">
                                <Button size="sm" variant="outline">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Contact
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {getFilteredDonations(selectedCampaign.id).length === 0 && (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No Donations Found
                      </h3>
                      <p className="text-muted-foreground">
                        {donationSearchTerm || donationFilter !== "all"
                          ? "Try adjusting your search or filters."
                          : "No donations have been made to this campaign yet."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Send Update Modal */}
      {showUpdateModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Send Campaign Update</span>
                  </CardTitle>
                  <CardDescription>
                    Send an update to donors of {selectedCampaign.title}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitUpdate} className="space-y-6">
                {/* Campaign Progress Summary */}
                <div className="bg-accent/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Campaign Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Raised: ${selectedCampaign.raised.toLocaleString()}
                      </span>
                      <span>
                        Goal: ${selectedCampaign.goal.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedCampaign.raised / selectedCampaign.goal) * 100
                      }
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {Math.round(
                          (selectedCampaign.raised / selectedCampaign.goal) *
                            100
                        )}
                        % funded
                      </span>
                      <span>{selectedCampaign.donorCount} donors</span>
                    </div>
                  </div>
                </div>

                {/* Update Content */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={updateForm.subject}
                      onChange={(e) =>
                        handleUpdateInputChange("subject", e.target.value)
                      }
                      placeholder="Update on Campaign Progress"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={updateForm.message}
                      onChange={(e) =>
                        handleUpdateInputChange("message", e.target.value)
                      }
                      placeholder="Write your update message to donors..."
                      rows={6}
                      required
                    />
                  </div>
                </div>

                {/* Update Options */}
                <div className="space-y-4">
                  <h4 className="font-medium">Update Options</h4>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeProgress"
                        checked={updateForm.includeProgress}
                        onChange={(e) =>
                          handleUpdateInputChange(
                            "includeProgress",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <Label htmlFor="includeProgress">
                        Include campaign progress chart
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="sendToAll"
                        checked={updateForm.sendToAll}
                        onChange={(e) =>
                          handleUpdateInputChange("sendToAll", e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label htmlFor="sendToAll">
                        Send to all donors ({selectedCampaign.donorCount}{" "}
                        recipients)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Email Preview</Label>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <div className="space-y-3">
                      <div className="border-b pb-2">
                        <h4 className="font-medium">
                          {updateForm.subject || "Subject will appear here"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          From: {organization?.name || "Your Organization"}
                        </p>
                      </div>
                      <div className="text-sm">
                        <p>Dear Supporter,</p>
                        <div className="mt-2 whitespace-pre-wrap">
                          {updateForm.message ||
                            "Your message will appear here..."}
                        </div>
                        {updateForm.includeProgress && (
                          <div className="mt-4 p-3 bg-background rounded border">
                            <p className="font-medium text-sm">
                              Campaign Progress
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${selectedCampaign.raised.toLocaleString()} raised
                              of ${selectedCampaign.goal.toLocaleString()} goal
                            </p>
                          </div>
                        )}
                        <p className="mt-4 text-xs text-muted-foreground">
                          Thank you for your continued support!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Update
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
