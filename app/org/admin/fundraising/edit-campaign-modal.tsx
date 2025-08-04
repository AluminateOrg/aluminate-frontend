"use client";

import { useState, useEffect } from "react";
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
import { X, Edit, Save } from "lucide-react";
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
  category:
    | "general"
    | "scholarship"
    | "infrastructure"
    | "emergency"
    | "fundraising"
    | "other";
  donorCount: number;
  isActive: boolean;
  createdBy?: string;
}

interface EditCampaignFormData {
  title: string;
  description: string;
  goal: string;
  endDate: string;
  category: Campaign["category"];
}

interface EditCampaignModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedCampaign: Campaign) => void;
}

export function EditCampaignModal({
  campaign,
  isOpen,
  onClose,
  onUpdate,
}: EditCampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditCampaignFormData>({
    title: "",
    description: "",
    goal: "",
    endDate: "",
    category: "general",
  });

  // Initialize form data when campaign changes
  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title,
        description: campaign.description || "",
        goal: campaign.goal.toString(),
        endDate: campaign.endDate.split("T")[0], // Convert to YYYY-MM-DD format
        category: campaign.category,
      });
    }
  }, [campaign]);

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

  const handleInputChange = (
    field: keyof EditCampaignFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.goal || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate goal is positive
    const goalValue = parseFloat(formData.goal);
    if (goalValue <= 0) {
      toast.error("Goal amount must be greater than zero");
      return;
    }

    // Validate goal is not less than already raised amount
    if (goalValue < campaign.raised) {
      toast.error("Goal cannot be less than the amount already raised");
      return;
    }

    // Validate end date is in the future (only if the campaign hasn't ended yet)
    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Allow editing end date to past only if the current end date is already in the past
    const currentEndDate = new Date(campaign.endDate);
    if (endDate <= today && currentEndDate > today) {
      toast.error("End date must be in the future for active campaigns");
      return;
    }

    setLoading(true);

    try {
      // For now, we'll create a PUT endpoint for updating campaigns
      // This would need to be implemented in the backend
      const requestPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: mapCategoryToBackend(formData.category),
        goal: goalValue,
        endDate: formData.endDate,
      };

      console.log("Updating campaign with payload:", requestPayload);

      // Make API call to your backend (this endpoint needs to be implemented)
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const apiEndpoint = `${backendUrl}/api/v1/portal/campaign/${campaign.id}/update`;

      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update campaign");
      }

      const responseData = await response.json();
      console.log("Campaign updated successfully:", responseData);

      // Create updated campaign object
      const updatedCampaign: Campaign = {
        ...campaign,
        title: formData.title.trim(),
        description: formData.description.trim(),
        goal: goalValue,
        endDate: new Date(formData.endDate).toISOString(),
        category: formData.category,
      };

      // Call the parent update handler
      onUpdate(updatedCampaign);

      toast.success("Campaign updated successfully!");
    } catch (error) {
      console.error("Error updating campaign:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update campaign. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: Campaign["category"]) => {
    switch (category) {
      case "scholarship":
        return "Scholarship";
      case "infrastructure":
        return "Infrastructure";
      case "emergency":
        return "Emergency";
      case "fundraising":
        return "Fundraising";
      case "other":
        return "Other";
      default:
        return "General";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5" />
                <span>Edit Campaign</span>
              </CardTitle>
              <CardDescription>
                Update campaign details and settings
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Campaign Info Banner */}
          <div className="bg-muted/20 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">Current Campaign Status</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  campaign.isActive
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                }`}
              >
                {campaign.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Raised:</span>
                <span className="ml-2 font-medium">
                  LKR {campaign.raised.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Donors:</span>
                <span className="ml-2 font-medium">{campaign.donorCount}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Campaign Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter campaign title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <select
                    id="edit-category"
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the purpose and goals of this campaign"
                  rows={4}
                />
              </div>
            </div>

            {/* Financial Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Financial Goals</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-goal">Fundraising Goal (LKR) *</Label>
                  <Input
                    id="edit-goal"
                    type="number"
                    step="0.01"
                    min={campaign.raised.toString()}
                    value={formData.goal}
                    onChange={(e) => handleInputChange("goal", e.target.value)}
                    placeholder="50000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: LKR {campaign.raised.toLocaleString()} (already
                    raised)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">End Date *</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Current end date:{" "}
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Progress Visualization */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">
                  Updated Progress Preview
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Raised</span>
                    <span>
                      LKR {campaign.raised.toLocaleString()} / LKR{" "}
                      {formData.goal
                        ? parseFloat(formData.goal).toLocaleString()
                        : campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (campaign.raised /
                            (formData.goal
                              ? parseFloat(formData.goal)
                              : campaign.goal)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {Math.round(
                        (campaign.raised /
                          (formData.goal
                            ? parseFloat(formData.goal)
                            : campaign.goal)) *
                          100
                      )}
                      % funded
                    </span>
                    <span>{campaign.donorCount} donors</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Campaign
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
