"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  AlertCircle,
  Users,
  UserPlus,
  MessageSquare,
} from "lucide-react";

interface GroupMembershipStatus {
  groupId: string;
  status: "not_member" | "approved" | "rejected" | "pending";
}

interface GroupCardProps {
  group: any;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  currentUserId: string;
  membershipStatus: GroupMembershipStatus["status"];
  isJoinLoading: boolean;
}

export function GroupCard({
  group,
  onJoin,
  onLeave,
  currentUserId,
  membershipStatus,
  isJoinLoading,
}: GroupCardProps) {
  const [isJoined, setIsJoined] = useState(false); // TODO: Get from actual membership data
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (membershipStatus === "approved" || membershipStatus === "pending") {
      await onLeave(group.id);
    } else {
      await onJoin(group.id);
    }
  };

  const isFull = group.currentMembers >= group.maxMembers;
  const canJoin = membershipStatus === "not_member" && !isFull;

  const getStatusBadge = () => {
    switch (membershipStatus) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Joined
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-500 text-white">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    if (membershipStatus === "approved") {
      return (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAction}
            disabled={isJoinLoading}
            className="flex-1"
          >
            {isJoinLoading ? <LoadingSpinner size="sm" /> : "Leave Group"}
          </Button>
          <Button size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            Chat
          </Button>
        </>
      );
    } else if (membershipStatus === "pending") {
      return (
        <Button
          size="sm"
          variant="outline"
          onClick={handleAction}
          disabled={isJoinLoading}
          className="flex-1"
        >
          {isJoinLoading ? <LoadingSpinner size="sm" /> : "Cancel Request"}
        </Button>
      );
    } else {
      return (
        <Button
          size="sm"
          onClick={handleAction}
          disabled={isJoinLoading || !canJoin}
          className="flex-1"
        >
          {isJoinLoading ? (
            <LoadingSpinner size="sm" />
          ) : isFull ? (
            "Group Full"
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-1" />
              {group.requiredApproval ? "Request to Join" : "Join Group"}
            </>
          )}
        </Button>
      );
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
              {group.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <CardDescription className="mt-1">
                {group.description || "No description available"}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {group.currentMembers} / {group.maxMembers} members
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {group.requiredApproval ? (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-orange-600">Approval Required</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Open Join</span>
              </>
            )}
          </div>
        </div>

        {/* Member Avatars Preview */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, group.currentMembers))].map((_, i) => (
              <Avatar key={i} className="w-8 h-8 border-2 border-background">
                <AvatarImage
                  src={`https://images.pexels.com/photos/${
                    220453 + i
                  }/pexels-photo-${
                    220453 + i
                  }.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1`}
                />
                <AvatarFallback className="text-xs">M{i + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {group.currentMembers > 3 && (
            <span className="text-xs text-muted-foreground">
              +{group.currentMembers - 3} more
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">{getActionButton()}</div>
      </CardContent>
    </Card>
  );
}
