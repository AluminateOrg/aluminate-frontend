"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Types
interface Campaign {
  id: string;
  title: string;
  description: string;
  category:
  | "general"
  | "scholarship"
  | "infrastructure"
  | "emergency"
  | "fundraising"
  | "other";
  goal: number;
  raised: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  donorCount: number;
  progressPercentage?: number;
}

interface FormData {
  title: string;
  description: string;
  category: Campaign["category"];
  goal: string;
  endDate: string;
}

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onUpdate: (updatedCampaign: Campaign) => void;
}

// Constants
const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "scholarship", label: "Scholarship" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "emergency", label: "Emergency" },
  { value: "fundraising", label: "Fundraising" },
  { value: "other", label: "Other" },
];

// Utility functions
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

export function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
  onUpdate,
}: EditCampaignModalProps) {
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "general",
    goal: "",
    endDate: "",
  });

  // Initialize form with campaign data
  useEffect(() => {
    if (campaign && isOpen) {
      setFormData({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        goal: campaign.goal.toString(),
        endDate: campaign.endDate,
      });
      setError(null);
      setSuccess(null);
    }
  }, [campaign, isOpen]);

  // Error and success handlers
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error("API Error:", error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      showError("Authentication failed. Please log in again.");
      return;
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      defaultMessage;
    showError(message);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      showError("Campaign title is required.");
      return false;
    }

    if (!formData.description.trim()) {
      showError("Campaign description is required.");
      return false;
    }

    const goalValue = parseFloat(formData.goal);
    if (isNaN(goalValue) || goalValue <= 0) {
      showError("Please enter a valid goal amount greater than 0.");
      return false;
    }

    if (!formData.endDate) {
      showError("Please select an end date.");
      return false;
    }

    const endDate = new Date(formData.endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only validate future date for new campaigns or if moving date forward
    if (campaign && campaign.raised > 0) {
      // For campaigns with donations, don't allow moving end date backwards
      const currentEndDate = new Date(campaign.endDate);
      if (endDate < currentEndDate) {
        showError(
          "Cannot move end date backwards for campaigns with donations."
        );
        return false;
      }
    } else if (endDate <= today) {
      showError("End date must be in the future.");
      return false;
    }

    // Validate goal against raised amount
    if (campaign && goalValue < campaign.raised) {
      showError(
        `Goal cannot be less than amount already raised (LKR ${campaign.raised.toLocaleString()}).`
      );
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaign) {
      showError("No campaign selected for editing.");
      return;
    }

    if (!user || user.role.toLowerCase() !== "admin") {
      showError("Access denied. Admin privileges required.");
      return;
    }


    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const goalValue = parseFloat(formData.goal);

      const requestPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: mapCategoryToBackend(formData.category),
        goal: goalValue,
        endDate: formData.endDate,
      };

      console.log("Updating campaign with payload:", requestPayload);

      const response = await axiosAdmin.put(
        `/campaign/${campaign.id}/update`,
        requestPayload
      );

      if (response.status === 200) {
        console.log("Campaign updated successfully:", response.data);

        // Transform the response back to frontend format
        const updatedCampaignData = response.data.data || response.data;

        const updatedCampaign: Campaign = {
          id: campaign.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          goal: goalValue,
          raised: campaign.raised, // Keep existing raised amount
          startDate: campaign.startDate, // Keep existing start date
          endDate: formData.endDate,
          isActive: campaign.isActive, // Keep existing status
          donorCount: campaign.donorCount, // Keep existing donor count
          progressPercentage:
            goalValue > 0 ? (campaign.raised / goalValue) * 100 : 0,
        };

        showSuccess("Campaign updated successfully!");
        onUpdate(updatedCampaign);

        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating campaign:", error);
      handleApiError(error, "Failed to update campaign. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!loading) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  // Handle form field changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Loading component with fallback
  const LoadingComponent: React.FC = LoadingSpinner ?? (() => (
  <div className="flex items-center justify-center">
    <Loader2 className="h-4 w-4 animate-spin" />
  </div>
));


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update campaign details for "{campaign?.title}".
          </DialogDescription>
        </DialogHeader>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campaign Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title">Campaign Title *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter campaign title"
              disabled={loading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your campaign"
              disabled={loading}
              rows={4}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category *</Label>
            <select
              id="edit-category"
              value={formData.category}
              onChange={(e) =>
                handleInputChange(
                  "category",
                  e.target.value as Campaign["category"]
                )
              }
              disabled={loading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* Funding Goal */}
          <div className="space-y-2">
            <Label htmlFor="edit-goal">Funding Goal (LKR) *</Label>
            <Input
              id="edit-goal"
              type="number"
              value={formData.goal}
              onChange={(e) => handleInputChange("goal", e.target.value)}
              placeholder="Enter target amount"
              min={campaign?.raised || 100}
              step="0.01"
              disabled={loading}
              required
            />
            {campaign && campaign.raised > 0 && (
              <p className="text-xs text-muted-foreground">
                Minimum: LKR {campaign.raised.toLocaleString()} (amount already
                raised)
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-endDate">End Date *</Label>
            <Input
              id="edit-endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              disabled={loading}
              required
            />
          </div>

          {/* Campaign Statistics (Read-only) */}
          {campaign && (
            <div className="space-y-2 p-3 bg-muted rounded-lg">
              <Label className="text-sm font-medium">Campaign Statistics</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Raised:</span>
                  <span className="ml-1 font-medium">
                    LKR {campaign.raised.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Donors:</span>
                  <span className="ml-1 font-medium">
                    {campaign.donorCount}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="ml-1 font-medium">
                    {campaign.goal > 0
                      ? Math.round((campaign.raised / campaign.goal) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-2 pt-4 border-t">
            <Button type="submit" disabled={loading || !!success}>
              {loading ? (
                <>
                  <LoadingComponent />
                  <span className="ml-2">Updating...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Updated!
                </>
              ) : (
                "Update Campaign"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default EditCampaignModal;

