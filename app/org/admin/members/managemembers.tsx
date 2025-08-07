"use client";

import { useEffect, useState } from "react";
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
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import axios from "axios";

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  nic?: string;
  regNo?: string;
  address?: string;
  batch?: number;
  isActive: boolean;
  groupIds: number[];
}

export default function ManageMembers() {
  const { groups } = useOrg();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX;
        const res = await fetch(`${backendUrl}/${apiPrefix}/member/get/all`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch members");

        setMembers(data.data);
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const getMemberGroups = (groupIds: string[]) => {
    return Array.isArray(groups) && groups.filter((group) => groupIds.includes(group.id));
  };

  //function to get all members 
  const getAllMembers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/member/get/all`);
      // console.log("response from the backend", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        const mappedMembers = response.data.data.map((member: any) => ({
          id: member.id || member.nic, // fallback if id is missing
          name: member.name,
          email: member.email || "",
          phone: member.phone || "",
          designation: member.position || "",
          company: member.company || "",
          graduationYear: member.batch?.toString() || "",
          degree: member.degree || "",
          location: member.address || "",
          avatar: member.photoUrl || "", // adjust if you have image URLs
          status: "active", // default status if missing
          joinedAt: member.createdAt || new Date().toISOString(),
          groupIds: member.groupIds || [],
        }));

        setMembers(mappedMembers);
      } else {
        toast.error("Invalid data received");
      }

    } catch (error) {
      console.error("Error fetching members:", error);
      toast.error("Failed to fetch members");
    }
  }


  useEffect(() => {
    const fetchData = setInterval(() => {
      getAllMembers();
    }, 5000)
    return () => clearInterval(fetchData);
  }, [])

  const deleteMember = async (memberId: number) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX;

      await axios.patch(`${backendUrl}/${apiPrefix}/member/${memberId}/deactivate`);

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, isActive: false } : m))
      );

      toast.success("Member deactivated successfully");
    } catch (err: any) {
      toast.error("Failed to deactivate member");
      console.error(err);
    }
  };

  const resendInvitation = (memberId: string) => {
    toast.success("Invitation email sent successfully");
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && member.isActive) ||
      (statusFilter === "inactive" && !member.isActive);

    return matchesSearch && matchesStatus;
  });


  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
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
          View, edit, and manage all organization members and their group assignments
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Filters */}
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
            {["all", "active", "inactive"].map((status) => (
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

        {/* Member List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => {
            const memberGroups = getMemberGroups(member.groupIds);
            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/default-avatar.png" alt={member.name} />
                    <AvatarFallback>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge variant={member.isActive ? "default" : "outline"}>
                        {member.isActive ? "active" : "inactive"}
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
                    </div>
                    {memberGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memberGroups.map((group) => (
                          <Badge key={group.id} variant="outline" className="text-xs">
                            {group.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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
