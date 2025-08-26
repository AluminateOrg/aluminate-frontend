"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axiosMember from "@/axiosInstances/axiosMember";
import { Calendar, Camera, GraduationCap, Save, User } from "lucide-react";

type MemberDTO = {
  name: string | null;
  nic: string | null;
  phone: string | null;
  email: string | null;
  regNo: string | null;
  address: string | null;
  avatarUrl: string | null;
  degree: string | null;
  company: string | null;
  position: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  batch: number | null;
  groupIds: number[];
  is_active: boolean;
};

export default function ProfilePage() {
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberDTO | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    address: "",
    degree: "",
    company: "",
    graduationYear: "",
    linkedin: "",
    github: "",
    website: "",
    bio: "",
    location: "",
  });

  const handleInputChange = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosMember.get("/profile");
      const data = res.data?.data as MemberDTO;

      setProfile(data);
      setFormData({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        designation: data.position ?? "",
        address: data.address ?? "",
        degree: data.degree ?? "",
        company: data.company ?? "",
        graduationYear: data.batch ? String(data.batch) : "",
        linkedin: data.linkedinUrl ?? "",
        github: data.githubUrl ?? "",
        website: data.websiteUrl ?? "",
        bio: "",
        location: "",
      });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) toast.error("Please sign in again.");
      else if (status === 403) toast.error("You don't have access to this resource.");
      else if (status === 404) toast.error("Profile not found.");
      else toast.error("Failed to load profile.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const putProfile = async () => {
    const payload = {
      name: formData.name || null,
      phone: formData.phone || null,
      address: formData.address || null,
      degree: formData.degree || null,
      company: formData.company || null,
      position: formData.designation || null,
      linkedinUrl: formData.linkedin || null,
      githubUrl: formData.github || null,
      websiteUrl: formData.website || null,
      batch: formData.graduationYear ? Number(formData.graduationYear) : null,
    };
    const res = await axiosMember.put("/profile", payload);
    return res.data?.data as MemberDTO;
  };

  const postAvatarUrl = async (url: string) => {
    const res = await axiosMember.post(`/profile/avatar-url`, null, { params: { url } });
    return res.data?.data as MemberDTO;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await putProfile();
      setProfile(updated);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 400) toast.error(msg || "Validation error");
      else toast.error("Failed to update profile.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <>
      {/* Page header (kept here so only Profile shows edit actions) */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile header card */}
      <Card className="mt-4 sm:mt-6">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={profile?.avatarUrl ?? undefined} alt={formData.name} />
                <AvatarFallback className="text-xl sm:text-2xl">
                  {formData.name ? formData.name.split(" ").map((n) => n[0]).join("") : "U"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  onClick={async () => {
                    const url = prompt("Paste image URL:");
                    if (!url) return;
                    try {
                      const updated = await postAvatarUrl(url);
                      setProfile(updated);
                      toast.success("Avatar updated!");
                    } catch (e: any) {
                      const msg = e?.response?.data?.message || "Failed to update avatar.";
                      toast.error(msg);
                    }
                  }}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{formData.name}</h2>
              <p className="text-sm sm:text-base text-muted-foreground">{formData.designation}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{formData.company}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Class of {formData.graduationYear || "—"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Member status: {profile?.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="mt-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
          <CardDescription className="text-sm">Your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <Input id="email" type="email" value={formData.email} disabled className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm">Address</Label>
              <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm">Bio</Label>
            <Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditing} rows={3} placeholder="Tell us about yourself..." className="text-sm resize-none" />
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card className="mt-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
          <CardDescription className="text-sm">Your career and educational background</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="designation" className="text-sm">Current Position</Label>
              <Input id="designation" value={formData.designation} onChange={(e) => handleInputChange("designation", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm">Company</Label>
              <Input id="company" value={formData.company} onChange={(e) => handleInputChange("company", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree" className="text-sm">Degree</Label>
              <Input id="degree" value={formData.degree} onChange={(e) => handleInputChange("degree", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear" className="text-sm">Graduation Year</Label>
              <Input id="graduationYear" value={formData.graduationYear} onChange={(e) => handleInputChange("graduationYear", e.target.value)} disabled={!isEditing} className="text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="mt-4">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Social Links</CardTitle>
          <CardDescription className="text-sm">Connect your professional profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
              <Input id="linkedin" value={formData.linkedin} onChange={(e) => handleInputChange("linkedin", e.target.value)} disabled={!isEditing} placeholder="https://linkedin.com/in/username" className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github" className="text-sm">GitHub</Label>
              <Input id="github" value={formData.github} onChange={(e) => handleInputChange("github", e.target.value)} disabled={!isEditing} placeholder="https://github.com/username" className="text-sm" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm">Personal Website</Label>
              <Input id="website" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} disabled={!isEditing} placeholder="https://yourwebsite.com" className="text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
