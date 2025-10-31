"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Crown } from "lucide-react";
import { toast } from "sonner";
import { GroupCard } from "./group-card";
import { get } from "node:http";
import axiosMember from "@/axiosInstances/axiosMember";

interface GroupMembershipStatus {
  groupId: string;
  status: "not_member" | "approved" | "rejected" | "pending";
}

export default function GroupsPage() {
  const { user } = useAuth();
  const { groups, loading } = useOrg();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "joined" | "available"
  >("all");
  const [membershipStatuses, setMembershipStatuses] = useState<
    GroupMembershipStatus[]
  >([]);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  const fetchMembershipStatuses = useCallback(async () => {
    if (!user?.id || !groups.length) return;

    try {
      const response = await axiosMember.get(
        `member/${user.id}/groups/membership-status`
      );
      const data = response.data;

      const statuses: GroupMembershipStatus[] = data.data.map((group: any) => ({
        groupId: group.groupId,
        status: group.status as GroupMembershipStatus["status"],
      }));

      setMembershipStatuses(statuses);
    } catch (error) {
      console.error("Failed to fetch membership statuses:", error);
      toast.error("Failed to load group memberships. Please try again.");
    }
  }, [user?.id, groups]);

  useEffect(() => {
    fetchMembershipStatuses();
  }, [fetchMembershipStatuses]);

  const handleJoinGroup = async (groupId: string) => {
    if (!user?.id) {
      toast.error("Please log in to join groups");
      return;
    }

    setJoinLoading(groupId);

    try {
      const response = await axiosMember.post("/group/join", {
        memberId: parseInt(user.id),
        groupId: parseInt(groupId),
      });

      if (response.status !== 200) {
        const errorData = response.data;

        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.message?.includes("already in this group")) {
            toast.error("You are already a member of this group");
          } else if (errorData.message?.includes("maximum capacity")) {
            toast.error("Group has reached maximum capacity");
          } else {
            toast.error(errorData.message || "Failed to join group");
          }
        } else if (response.status === 404) {
          toast.error("Group not found");
        } else {
          toast.error("Failed to join group. Please try again.");
        }
        return;
      }

      const responseData = await response.data;
      const group = groups.find((g) => g.id === groupId);

      // Update membership status based on group approval requirements
      const newStatus = group?.requiredApproval ? "pending" : "approved";

      setMembershipStatuses((prev) =>
        prev.map((status) =>
          status.groupId === groupId ? { ...status, status: newStatus } : status
        )
      );

      if (group?.requiredApproval) {
        toast.success("Join request submitted! Waiting for admin approval.");
      } else {
        toast.success("Successfully joined the group!");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      toast.error("Failed to join group. Please try again.");
    } finally {
      setJoinLoading(null);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user?.id) return;

    try {
      const response = await axiosMember.delete(
        `/group/${groupId}/leave/${user.id}`
      );
      if (response.status !== 200) {
        toast.error("Failed to leave group. Please try again.");
        return;
      }

      setMembershipStatuses((prev) =>
        prev.map((status) =>
          status.groupId === groupId
            ? { ...status, status: "not_member" }
            : status
        )
      );

      toast.success("Successfully left the group.");
    } catch (error) {
      toast.error("Failed to leave group. Please try again.");
    }
  };

  const getMembershipStatus = (
    groupId: string
  ): GroupMembershipStatus["status"] => {
    return membershipStatusMap.get(groupId) || "not_member";
  };

  const membershipStatusMap = useMemo(() => {
    const map = new Map<string, GroupMembershipStatus["status"]>();
    membershipStatuses.forEach((status) => {
      map.set(status.groupId, status.status);
    });
    return map;
  }, [membershipStatuses]);

  const filteredGroups = groups.filter((group) => {
    if (!group.active) return false;

    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const membershipStatus = getMembershipStatus(group.id);

    switch (selectedFilter) {
      case "joined":
        return (
          matchesSearch &&
          (membershipStatus === "approved" || membershipStatus === "pending")
        );
      case "available":
        return (
          matchesSearch &&
          membershipStatus === "not_member" &&
          group.currentMembers < group.maxMembers
        );
      default:
        return matchesSearch;
    }
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Connect with like-minded alumni in specialized groups
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {groups.filter((g) => g.active).length} Groups Available
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                {[
                  { value: "all", label: "All Groups" },
                  { value: "joined", label: "My Groups" },
                  { value: "available", label: "Available" },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={
                      selectedFilter === filter.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value as any)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {membershipStatuses.filter((s) => s.status === "approved").length}
            </div>
            <p className="text-sm text-muted-foreground">Groups Joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {groups.filter((g) => g.active).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {membershipStatuses.filter((s) => s.status === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoinGroup}
              onLeave={handleLeaveGroup}
              currentUserId={user?.id || ""}
              membershipStatus={getMembershipStatus(group.id)}
              isJoinLoading={joinLoading === group.id}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Groups Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filters to find groups."
                : "No groups are currently available. Check back later!"}
            </p>
            {(searchTerm || selectedFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Groups Section */}
      {selectedFilter === "all" && !searchTerm && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Popular Groups</span>
            </CardTitle>
            <CardDescription>
              Most active groups in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.slice(0, 2).map((group) => (
                <div
                  key={group.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-background/50"
                >
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      {group.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {group.currentMembers} members • Very active
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
