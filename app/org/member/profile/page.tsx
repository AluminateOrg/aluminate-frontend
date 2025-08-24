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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCode } from "@/components/atoms/QRCode";
import {
    User, Calendar, GraduationCap, Save, Camera, QrCode, Shield, Bell, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import axiosMember from "@/axiosInstances/axiosMember";

type MemberDTO = {
    name: string | null;
    nic: string | null;
    phone: string | null;
    email: string | null;
    regNo: string | null;
    address: string | null;
    avatarUrl: string | null;      // UPDATED: backend field
    degree: string | null;
    company: string | null;
    position: string | null;       // backend field
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

    // UI form state (map designation <-> position, and address)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        designation: "",   // maps to backend position
        address: "",
        degree: "",
        company: "",
        graduationYear: "",
        linkedin: "",
        github: "",
        website: "",
        bio: "",          // not persisted (unless you add in backend)
        location: "",     // not persisted (unless you add in backend)
    });

    const origin = useMemo(
        () => (typeof window !== "undefined" ? window.location.origin : ""),
        []
    );
    const profileUrl = `${origin}/profile/${user?.id ?? ""}`;

    const handleInputChange = (field: string, value: string) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    // ---- API calls (match ProfileController) ----
    const fetchProfile = async () => {
        try {
            setLoading(true);
            // UPDATED: must hit /profile via axiosMember (role-aware base URL)
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

    //   const patchProfile = async (partial?: Partial<typeof formData>) => {
    //     const src = partial ?? formData;
    //     const payload = {
    //       name: src.name || null,
    //       phone: src.phone || null,
    //       address: src.address || null,
    //       degree: src.degree || null,
    //       company: src.company || null,
    //       position: src.designation || null,
    //       linkedinUrl: src.linkedin || null,
    //       githubUrl: src.github || null,
    //       websiteUrl: src.website || null,
    //       batch: src.graduationYear ? Number(src.graduationYear) : null,
    //     };
    //     const res = await axiosMember.patch("/profile", payload);
    //     return res.data?.data as MemberDTO;
    //   };

    const postAvatarUrl = async (url: string) => {
        // Matches POST /profile/avatar-url?url=...
        const res = await axiosMember.post(`/profile/avatar-url`, null, {
            params: { url },
        });
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

    // Optional: PATCH minimal changes instead of full PUT
    // const handleSaveChanges = async () => {
    //     setSaving(true);
    //     try {
    //         // quick diff vs. current profile to avoid sending unchanged fields
    //         const base = profile;
    //         const changed: Partial<typeof formData> = {};
    //         if (base) {
    //             const before = {
    //                 name: base.name ?? "",
    //                 email: base.email ?? "",
    //                 phone: base.phone ?? "",
    //                 designation: base.position ?? "",
    //                 address: base.address ?? "",
    //                 degree: base.degree ?? "",
    //                 company: base.company ?? "",
    //                 graduationYear: base.batch ? String(base.batch) : "",
    //                 linkedin: base.linkedinUrl ?? "",
    //                 github: base.githubUrl ?? "",
    //                 website: base.websiteUrl ?? "",
    //                 bio: "",
    //                 location: "",
    //             };
    //             for (const k of Object.keys(formData) as (keyof typeof formData)[]) {
    //                 if (before[k] !== formData[k]) (changed as any)[k] = formData[k];
    //             }
    //         }
    //         //   const updated = await patchProfile(Object.keys(changed).length ? changed : undefined);
    //         setProfile(updated);
    //         setIsEditing(false);
    //         toast.success("Profile updated successfully!");
    //     } catch (err: any) {
    //         const msg = err?.response?.data?.message;
    //         if (err?.response?.status === 400) toast.error(msg || "Validation error");
    //         else toast.error("Failed to update profile.");
    //         console.error(err);
    //     } finally {
    //         setSaving(false);
    //     }
    // };

    // ---- UI ----
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-6 py-8">
                <p className="text-muted-foreground">Loading profile…</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
            {/* Header */}
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
                            {/* <Button variant="secondary" onClick={handleSaveChanges} disabled={saving} className="flex-1 sm:flex-none">
                {saving ? "Saving..." : "Save Changes (PATCH)"}
              </Button> */}
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Profile</TabsTrigger>
                    <TabsTrigger value="qr" className="text-xs sm:text-sm px-2 sm:px-4 py-2">QR Code</TabsTrigger>
                    <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Privacy</TabsTrigger>
                    <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4 py-2">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    {/* Profile Header */}
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                        {/* UPDATED: use avatarUrl */}
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
                                                    setProfile(updated); // reflect server
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

                    {/* Personal Information */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Personal Information</CardTitle>
                            <CardDescription className="text-sm">Your basic profile information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm">Email Address</Label>
                                    <Input id="email" type="email" value={formData.email} disabled className="text-sm" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange("phone", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-sm">Address</Label>
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange("address", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio" className="text-sm">Bio</Label>
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
                            <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
                            <CardDescription className="text-sm">Your career and educational background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="designation" className="text-sm">Current Position</Label>
                                    <Input
                                        id="designation"
                                        value={formData.designation}
                                        onChange={(e) => handleInputChange("designation", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company" className="text-sm">Company</Label>
                                    <Input
                                        id="company"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange("company", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="degree" className="text-sm">Degree</Label>
                                    <Input
                                        id="degree"
                                        value={formData.degree}
                                        onChange={(e) => handleInputChange("degree", e.target.value)}
                                        disabled={!isEditing}
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="graduationYear" className="text-sm">Graduation Year</Label>
                                    <Input
                                        id="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={(e) => handleInputChange("graduationYear", e.target.value)}
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
                            <CardDescription className="text-sm">Connect your professional profiles</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        value={formData.linkedin}
                                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://linkedin.com/in/username"
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="github" className="text-sm">GitHub</Label>
                                    <Input
                                        id="github"
                                        value={formData.github}
                                        onChange={(e) => handleInputChange("github", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://github.com/username"
                                        className="text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website" className="text-sm">Personal Website</Label>
                                    <Input
                                        id="website"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange("website", e.target.value)}
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
                                <QrCode className="h-5 w-5" /><span>My QR Code</span>
                            </CardTitle>
                            <CardDescription className="text-sm">Share your profile with this QR code</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div className="flex justify-center">
                                <QRCode value={profileUrl} size={180} className="w-full max-w-[180px]" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs sm:text-sm text-muted-foreground">Scan to view my profile</p>
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <Input value={profileUrl} readOnly className="text-center text-xs sm:text-sm" />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(profileUrl);
                                            toast.success("Profile URL copied!");
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

                <TabsContent value="privacy" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <Shield className="h-5 w-5" /><span>Privacy Settings</span>
                            </CardTitle>
                            <CardDescription className="text-sm">Control who can see your info</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Badge variant="outline" className="text-xs">Organization Members</Badge>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <Bell className="h-5 w-5" /><span>Notification Preferences</span>
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Manage your notification settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center py-8 space-y-4">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Notification Management</h3>
                                    <p className="text-muted-foreground mb-4">
                                        View and manage all your notifications in the dedicated section.
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
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
