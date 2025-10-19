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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Settings,
  Building,
  Users,
  Bell,
  Shield,
  CreditCard,
  Save,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrg();
  const [loading, setLoading] = useState(false);

  // Organization settings state
  const [orgSettings, setOrgSettings] = useState({
    name: organization?.organizationName || "Tech Alumni Network",
    description:
      organization?.description ||
      "Connecting technology professionals and fostering innovation",
    website: "https://techalumni.org",
    contactEmail: "admin@techalumni.org",
    phone: "+1 (555) 123-4567",
    address: "123 Tech Street, Silicon Valley, CA 94000",
    logo: organization?.logo || "",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    memberJoinNotifications: true,
    eventReminders: true,
    donationAlerts: true,
    systemUpdates: false,
    weeklyReports: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    publicDirectory: true,
    allowMemberSearch: true,
    showMemberCount: true,
    allowGuestEvents: false,
    requireApproval: true,
  });

  const handleOrgSettingsChange = (field: string, value: string) => {
    setOrgSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleSaveSettings = async (section: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`${section} settings saved successfully!`);
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this organization? This action cannot be undone."
      )
    ) {
      try {
        // TODO: Replace with actual API call
        toast.error("Organization deletion is not implemented yet.");
      } catch (error) {
        toast.error("Failed to delete organization.");
      }
    }
  };

  if (orgLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>Organization Settings</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's configuration and preferences
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Building className="h-3 w-3 mr-1" />
            {organization?.tier
              ? organization.tier.charAt(0).toUpperCase() +
                organization.tier.slice(1)
              : "Unknown"}{" "}
            Plan
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6 mt-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Organization Information</span>
              </CardTitle>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={orgSettings.logo} alt="Organization Logo" />
                  <AvatarFallback className="text-lg">
                    {orgSettings.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 200x200px, PNG or JPG
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgSettings.name}
                    onChange={(e) =>
                      handleOrgSettingsChange("name", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={orgSettings.website}
                    onChange={(e) =>
                      handleOrgSettingsChange("website", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={orgSettings.contactEmail}
                    onChange={(e) =>
                      handleOrgSettingsChange("contactEmail", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={orgSettings.phone}
                    onChange={(e) =>
                      handleOrgSettingsChange("phone", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={orgSettings.description}
                  onChange={(e) =>
                    handleOrgSettingsChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={orgSettings.address}
                  onChange={(e) =>
                    handleOrgSettingsChange("address", e.target.value)
                  }
                  rows={2}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => handleSaveSettings("Organization")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6 mt-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("emailNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>New Member Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new members join
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.memberJoinNotifications}
                    onCheckedChange={() =>
                      handleNotificationToggle("memberJoinNotifications")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Reminders for upcoming events
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.eventReminders}
                    onCheckedChange={() =>
                      handleNotificationToggle("eventReminders")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Donation Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new donations
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.donationAlerts}
                    onCheckedChange={() =>
                      handleNotificationToggle("donationAlerts")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Important system announcements
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.systemUpdates}
                    onCheckedChange={() =>
                      handleNotificationToggle("systemUpdates")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly activity summaries
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.weeklyReports}
                    onCheckedChange={() =>
                      handleNotificationToggle("weeklyReports")
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => handleSaveSettings("Notification")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6 mt-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
              <CardDescription>
                Control your organization's privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Public Directory</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow your organization to be found in public searches
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.publicDirectory}
                    onCheckedChange={() =>
                      handlePrivacyToggle("publicDirectory")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Member Search</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow members to search for other members
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.allowMemberSearch}
                    onCheckedChange={() =>
                      handlePrivacyToggle("allowMemberSearch")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Member Count</Label>
                    <p className="text-sm text-muted-foreground">
                      Display total member count publicly
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.showMemberCount}
                    onCheckedChange={() =>
                      handlePrivacyToggle("showMemberCount")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Guest Event Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow non-members to view and attend events
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.allowGuestEvents}
                    onCheckedChange={() =>
                      handlePrivacyToggle("allowGuestEvents")
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Admin Approval</Label>
                    <p className="text-sm text-muted-foreground">
                      New members need admin approval to join
                    </p>
                  </div>
                  <Switch
                    checked={privacySettings.requireApproval}
                    onCheckedChange={() =>
                      handlePrivacyToggle("requireApproval")
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => handleSaveSettings("Privacy")}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 mt-6">
          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Billing & Subscription</span>
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Plan */}
              <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {organization?.tier
                        ? organization.tier.charAt(0).toUpperCase() +
                          organization.tier.slice(1)
                        : "Unknown"}{" "}
                      Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {organization?.currentMemberCount} /{" "}
                      {organization?.maxMemberCount} members used
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">$99</div>
                    <div className="text-sm text-muted-foreground">
                      per month
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Current Plan Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Up to {organization?.maxMemberCount} members
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Unlimited events</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Advanced analytics</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority support</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Billing Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Next billing date:
                      </span>
                      <span>January 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Payment method:
                      </span>
                      <span>•••• •••• •••• 4242</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Billing email:
                      </span>
                      <span>billing@techalumni.org</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Download Invoices
                </Button>
                <Button>Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span>Danger Zone</span>
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-destructive">
                      Delete Organization
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this organization and all its data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteOrganization}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
