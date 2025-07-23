"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCode } from "@/components/atoms/QRCode";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Save,
  Camera,
  QrCode,
  Shield,
  Bell,
  Lock,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    designation: user?.designation || "",
    bio: "Passionate software engineer with 5+ years of experience in full-stack development. Alumni of Computer Science program, class of 2019.",
    location: "Colombo 07, Sri Lanka",
    company: "Tech Innovations Inc.",
    graduationYear: "2019",
    degree: "Bachelor of Science in Computer Science",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    website: "https://johndoe.dev",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const profileUrl = `${window.location.origin}/profile/${user?.id}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto"
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger
            value="profile"
            className="text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="qr"
            className="text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            QR Code
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs sm:text-sm px-2 sm:px-4 py-2"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-xl sm:text-2xl">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                    {user?.name}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {formData.designation}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {formData.company}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Class of {formData.graduationYear}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Member since{" "}
                      {user?.joinedAt
                        ? format(new Date(user.joinedAt), "MMM yyyy")
                        : "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm">
                Your basic profile information visible to other members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">
                Professional Information
              </CardTitle>
              <CardDescription className="text-sm">
                Your career and educational background
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="designation" className="text-sm">
                    Current Position
                  </Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) =>
                      handleInputChange("company", e.target.value)
                    }
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree" className="text-sm">
                    Degree
                  </Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) =>
                      handleInputChange("degree", e.target.value)
                    }
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="text-sm">
                    Graduation Year
                  </Label>
                  <Input
                    id="graduationYear"
                    value={formData.graduationYear}
                    onChange={(e) =>
                      handleInputChange("graduationYear", e.target.value)
                    }
                    disabled={!isEditing}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Social Links</CardTitle>
              <CardDescription className="text-sm">
                Connect your professional social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-sm">
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) =>
                      handleInputChange("linkedin", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="https://linkedin.com/in/username"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github" className="text-sm">
                    GitHub
                  </Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) =>
                      handleInputChange("github", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="https://github.com/username"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm">
                    Personal Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <QrCode className="h-5 w-5" />
                <span>My QR Code</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Share your profile easily with this QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="flex justify-center">
                <QRCode
                  value={profileUrl}
                  size={180}
                  className="w-full max-w-[180px]"
                />
              </div>
              <div className="space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Scan this QR code to view my profile
                </p>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    value={profileUrl}
                    readOnly
                    className="text-center text-xs sm:text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(profileUrl);
                      toast.success("Profile URL copied to clipboard!");
                    }}
                    className="w-full sm:w-auto text-sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="privacy"
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Shield className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm sm:text-base">
                      Profile Visibility
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Who can view your profile information
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs self-start sm:self-center"
                  >
                    Organization Members
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm sm:text-base">
                      Contact Information
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Who can see your email and phone number
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs self-start sm:self-center"
                  >
                    Group Members Only
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm sm:text-base">
                      Activity Status
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Show when you're online or active
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs self-start sm:self-center"
                  >
                    Enabled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="notifications"
          className="space-y-4 sm:space-y-6 mt-4 sm:mt-6"
        >
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Manage your notification settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Redirect to dedicated notifications page */}
              <div className="text-center py-8 space-y-4">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Notification Management
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage all your notifications in the dedicated
                    notifications section.
                  </p>
                  <Button asChild>
                    <Link href="/org/member/notifications">
                      <Bell className="h-4 w-4 mr-2" />
                      Go to Notifications
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Quick notification preferences */}
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Quick Settings</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">
                        Email Notifications
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receive important updates via email
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="text-xs self-start sm:self-center"
                    >
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">
                        Push Notifications
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Get instant notifications in your browser
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs self-start sm:self-center"
                    >
                      Disabled
                    </Badge>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm sm:text-base">
                        Event Reminders
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Reminders for upcoming events you're attending
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="text-xs self-start sm:self-center"
                    >
                      Enabled
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
