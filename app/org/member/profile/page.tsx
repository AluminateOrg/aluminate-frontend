"use client";

import { useEffect, useMemo, useState } from "react";
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
    ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import axiosMember from "@/axiosInstances/axiosMember";
import axiosCommon from "@/axiosInstances/axiosCommon";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

type MemberDTO = {
    name?: string;
    nic?: string;
    phone?: string;
    email?: string;
    regNo?: string;
    address?: string;
    photoUrl?: string;
    degree?: string;
    company?: string;
    position?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    websiteUrl?: string;
    batch?: number;
    groupIds?: number[];
    active?: boolean;
    is_active?: boolean;
    _active?: boolean;
};

type ProfileState = {
    name: string;
    email: string;
    phone: string;
    address: string;
    designation: string; // maps to backend `position`
    company: string;
    degree: string;
    graduationYear: string;
    linkedin: string;
    github: string;
    website: string;
    photoUrl: string;
    regNo?: string;
    nic?: string;
    batch?: number | string;
};

export default function ProfilePage() {
    const { user } = useAuth(); // only for small bits like header initials
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [avatarEditing, setAvatarEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    const [form, setForm] = useState<ProfileState>({
        name: "",
        email: "",
        phone: "",
        address: "",
        designation: "",
        company: "",
        degree: "",
        graduationYear: "",
        linkedin: "",
        github: "",
        website: "",
        photoUrl: "",
        regNo: "",
        nic: "",
        batch: "",
    });

    // derive profile url safely
    const profileUrl = useMemo(() => {
        if (typeof window === "undefined") return "";
        return `${window.location.origin}/profile/${user?.id ?? "me"}`;
    }, [user?.id]);

    const initFromDto = (dto: MemberDTO) => {
        setForm({
            name: dto.name ?? "",
            email: dto.email ?? "",
            phone: dto.phone ?? "",
            address: dto.address ?? "",
            designation: dto.position ?? "",
            company: dto.company ?? "",
            degree: dto.degree ?? "",
            graduationYear:
                (dto.batch ? String(dto.batch) : "") || "", // show as text
            linkedin: dto.linkedinUrl ?? "",
            github: dto.githubUrl ?? "",
            website: dto.websiteUrl ?? "",
            photoUrl: dto.photoUrl ?? "",
            regNo: dto.regNo ?? "",
            nic: dto.nic ?? "",
            batch: dto.batch ?? "",
        });
    };

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // If your axiosMember baseURL is `/api/v1/member`, keep path as `/member/profile`
            // If baseURL is `/api/v1`, use `/member/member/profile` instead.
            const res = await axiosMember.get("/profile");
            const data = res.data?.data as MemberDTO | undefined;
            if (!data) throw new Error("Empty profile");
            initFromDto(data);
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.error || "Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const onChange = (key: keyof ProfileState, val: string) =>
        setForm((p) => ({ ...p, [key]: val }));

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                degree: form.degree,
                company: form.company,
                position: form.designation,
                linkedinUrl: form.linkedin,
                githubUrl: form.github,
                websiteUrl: form.website,
                batch: form.graduationYear ? Number(form.graduationYear) : undefined,
            };
            const res = await axiosMember.put("/member/profile", payload);
            const data = res.data?.data as MemberDTO | undefined;
            if (data) initFromDto(data);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarSave = async () => {
        if (!avatarUrl.trim()) {
            toast.error("Please provide an image URL");
            return;
        }
        try {
            await axiosMember.post("/member/profile/avatar-url", null, {
                params: { url: avatarUrl.trim() },
            });
            toast.success("Avatar updated!");
            setAvatarEditing(false);
            setAvatarUrl("");
            await fetchProfile();
        } catch (e: any) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Failed to update avatar");
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center">
                <LoadingSpinner size="lg" />
                <span className="ml-3">Loading profile…</span>
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
                        </div>
                    )}
                </div>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                        QR Code
                    </TabsTrigger>
                    <TabsTrigger value="privacy" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                        Privacy
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4 py-2">
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card>
                        <CardContent className="pt-4 sm:pt-6">
                            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                                        <AvatarImage src={form.photoUrl} alt={form.name || "Avatar"} />
                                        <AvatarFallback className="text-xl sm:text-2xl">
                                            {(form.name || user?.name || "U")
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Change via URL */}
                                    <div className="mt-3">
                                        {!avatarEditing ? (
                                            <Button size="sm" variant="outline" onClick={() => setAvatarEditing(true)}>
                                                <Camera className="h-4 w-4 mr-2" />
                                                Change Photo
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    placeholder="https://…"
                                                    value={avatarUrl}
                                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                                    className="w-56"
                                                />
                                                <Button size="sm" onClick={handleAvatarSave}>
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setAvatarEditing(false);
                                                        setAvatarUrl("");
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 text-center sm:text-left">
                                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{form.name}</h2>
                                    <p className="text-sm sm:text-base text-muted-foreground">{form.designation}</p>
                                    <p className="text-xs sm:text-sm text-muted-foreground">{form.company}</p>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mt-2">
                                        {form.graduationYear && (
                                            <Badge variant="secondary" className="text-xs">
                                                <GraduationCap className="h-3 w-3 mr-1" />
                                                Class of {form.graduationYear}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            Member since {user?.joinedAt ? format(new Date(user.joinedAt), "MMM yyyy") : "N/A"}
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
                            <CardDescription className="text-sm">
                                Your basic profile information visible to other members
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={form.name}
                                        onChange={(e) => onChange("name", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => onChange("email", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={form.phone}
                                        onChange={(e) => onChange("phone", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={form.address}
                                        onChange={(e) => onChange("address", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={
                                        // you can keep a local "bio" field if your backend adds one later
                                        `${form.degree ? `${form.degree}. ` : ""}${form.company ? `Works at ${form.company}.` : ""}`
                                    }
                                    disabled
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional */}
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg sm:text-xl">Professional Information</CardTitle>
                            <CardDescription className="text-sm">Your career and educational background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="designation">Current Position</Label>
                                    <Input
                                        id="designation"
                                        value={form.designation}
                                        onChange={(e) => onChange("designation", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        id="company"
                                        value={form.company}
                                        onChange={(e) => onChange("company", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="degree">Degree</Label>
                                    <Input
                                        id="degree"
                                        value={form.degree}
                                        onChange={(e) => onChange("degree", e.target.value)}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="graduationYear">Graduation Year</Label>
                                    <Input
                                        id="graduationYear"
                                        value={form.graduationYear}
                                        onChange={(e) => onChange("graduationYear", e.target.value)}
                                        disabled={!isEditing}
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
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <Input
                                        id="linkedin"
                                        value={form.linkedin}
                                        onChange={(e) => onChange("linkedin", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="github">GitHub</Label>
                                    <Input
                                        id="github"
                                        value={form.github}
                                        onChange={(e) => onChange("github", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Personal Website</Label>
                                    <Input
                                        id="website"
                                        value={form.website}
                                        onChange={(e) => onChange("website", e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* QR TAB */}
                <TabsContent value="qr" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <QrCode className="h-5 w-5" />
                                <span>My QR Code</span>
                            </CardTitle>
                            <CardDescription className="text-sm">Share your profile easily with this QR code</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <div className="flex justify-center">
                                <QRCode value={profileUrl} size={180} className="w-full max-w-[180px]" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs sm:text-sm text-muted-foreground">Scan this QR code to view my profile</p>
                                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                                    <Input value={profileUrl} readOnly className="text-center text-xs sm:text-sm" />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (profileUrl) {
                                                navigator.clipboard.writeText(profileUrl);
                                                toast.success("Profile URL copied!");
                                            }
                                        }}
                                        className="w-full sm:w-auto text-sm"
                                    >
                                        Copy
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRIVACY + NOTIFICATIONS TABS (static for now) */}
                <TabsContent value="privacy" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                                <Shield className="h-5 w-5" />
                                <span>Privacy Settings</span>
                            </CardTitle>
                            <CardDescription className="text-sm">Control who can see your information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-sm sm:text-base">Profile Visibility</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground">Who can view your profile</p>
                                </div>
                                <Badge variant="outline" className="text-xs">Organization Members</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
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
                        <CardContent className="text-center py-8">
                            <Bell className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold mb-2">Notification Management</h3>
                                <p className="text-muted-foreground mb-4">
                                    View and manage all your notifications in the dedicated section.
                                </p>
                                <Button asChild>
                                    <Link href="/org/member/notifications">
                                        Go to Notifications
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
