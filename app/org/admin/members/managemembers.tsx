// File: components/members/ManageMembers.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrg } from "@/hooks/useOrg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  Phone,
  Briefcase,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  company?: string;
  graduationYear?: string;
  degree?: string;
  location?: string;
  avatar?: string;
  status: "active" | "pending" | "inactive";
  joinedAt: string;
  groupIds: string[];
}

export default function ManageMembers({
  members,
  setMembers,
}: {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}) {
  const { organization, groups } = useOrg();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "pending" | "inactive"
  >("all");

  const getMemberGroups = (groupIds?: string[] | null) => {
    // Ensure both groups and groupIds are valid arrays
    if (
      !Array.isArray(groups) ||
      !Array.isArray(groupIds) ||
      groupIds.length === 0
    ) {
      return [];
    }

    try {
      return groups.filter((group) => {
        // Additional safety check for group.id
        return group && group.id && groupIds.includes(group.id);
      });
    } catch (error) {
      console.error("Error filtering member groups:", error);
      return [];
    }
  };

  // Enhanced getAllMembers function
  const getAllMembers = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/member/get/all`
      );

      if (response.data && Array.isArray(response.data.data)) {
        const mappedMembers = response.data.data.map((member: any) => ({
          id: (member.id || member.nic || "").toString(),
          name: member.name || "Unknown",
          email: member.email || "",
          phone: member.phone || "",
          designation: member.position || "",
          company: member.company || "",
          graduationYear: member.batch?.toString() || "",
          degree: member.degree || "",
          location: member.address || "",
          avatar: member.photoUrl || "",
          status: (member.status || "active") as
            | "active"
            | "pending"
            | "inactive",
          joinedAt: member.createdAt || new Date().toISOString(),
          groupIds: Array.isArray(member.groupIds) ? member.groupIds : [],
        }));

        setMembers(mappedMembers);
      } else {
        console.warn("Invalid response structure:", response.data);
        toast.error("Invalid data received");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    }
  }, [setMembers]);

  // Add loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllMembers();
      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, 30000); // Reduce frequency to 30 seconds
    return () => clearInterval(interval);
  }, [getAllMembers]);

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Member removed successfully");
  };

  const resendInvitation = (memberId: string) => {
    toast.success("Invitation email sent successfully");
  };

  // Enhanced filteredMembers with safety checks
  const filteredMembers = members.filter((member) => {
    if (!member) return false;

    const memberName = member.name || "";
    const memberEmail = member.email || "";
    const memberCompany = member.company || "";

    const matchesSearch =
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function for safe name initials
  const getInitials = (name?: string): string => {
    if (!name || typeof name !== "string") return "UN";

    try {
      return name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    } catch (error) {
      return "UN";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Manage Members</span>
        </CardTitle>
        <CardDescription>
          View, edit, and manage all organization members and their group
          assignments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {["all", "active", "pending", "inactive"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status as any)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member) => {
            if (!member || !member.id) return null; // Skip invalid members

            const memberGroups = getMemberGroups(member.groupIds);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">
                        {member.name || "Unknown"}
                      </h4>
                      <Badge
                        variant={
                          member.status === "active"
                            ? "default"
                            : member.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {member.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.company && (
                        <div className="flex items-center space-x-1">
                          <Briefcase className="h-3 w-3" />
                          <span>{member.company}</span>
                        </div>
                      )}
                    </div>
                    {member.designation && (
                      <p className="text-sm text-muted-foreground">
                        {member.designation}
                      </p>
                    )}
                    {memberGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memberGroups.map((group) => (
                          <Badge
                            key={group.id}
                            variant="outline"
                            className="text-xs"
                          >
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {member.status === "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resendInvitation(member.id)}
                    >
                      <Mail className="h-4 w-4 mr-1" /> Resend
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Members Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Start by adding your first member."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
