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
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import axiosAdmin from "@/axiosInstances/axiosAdmin";
import type { Member } from "@/types/member";


export default function ManageMembers({
  members,
  setMembers,
}: {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}) {



  const LIMIT = 3;
  const [offset, setOffset] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0)

  const currentPage = Math.floor(offset / LIMIT) + 1;
  const totalPages = Math.ceil(totalRecords / LIMIT);

  const { groups } = useOrg();
  const [searchTerm, setSearchTerm] = useState("");
  const [queryStatus, setQueryStatus] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [activeSearch, setActiveSearch] = useState("");

  const getMemberGroups = (groupIds?: number[] | null) => {
  if (!Array.isArray(groups) || !Array.isArray(groupIds) || groupIds.length === 0) return [];

  return groups.filter(
    (group) => group && group.id && groupIds.includes(Number(group.id))
  );
};


  const getAllMembers = useCallback(async () => {
    try {
        const params: any = {
                limit: LIMIT,
                offset: offset,
              };


        if (activeSearch.trim()) params.search = activeSearch;
        if (queryStatus !== "all") params.status = queryStatus;

      const response = await axiosAdmin.get(`/member/search`, { params });

            console.log(" FULL SERVER RESPONSE:", response);
            console.log(" DATA PAYLOAD:", response.data);

      const responseData = response.data.data;



      if (responseData && Array.isArray(responseData.data)) {
        const mappedMembers: Member[] = responseData.data.map((member: any) => ({
          id: (member.id || member.nic || "").toString(),
          name: member.name || "Unknown",
          email: member.email || "",
          phone: member.phone || "",
          designation: member.position || "",
          company: member.company || "",
          batch: member.batch,
          degree: member.degree || "",
          avatar: member.photoUrl || "",
          is_active: member.is_active,
          joinedAt: member.createdAt || new Date().toISOString(),
          groupIds: Array.isArray(member.groupIds) ? member.groupIds : [],
        }));
        setMembers(mappedMembers);
        setTotalRecords(responseData.total || 0);
      } else {
          setMembers([]);
          setTotalRecords(0);
        toast.error("Invalid data received");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch members");
    }
  }, [offset, activeSearch, queryStatus, setMembers]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getAllMembers();
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [getAllMembers]);

  const deleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    toast.success("Member removed successfully");
  };

  const resendInvitation = (memberId: string) => {
    toast.success("Invitation email sent successfully");
  };

//I remove this because I want the server to do the work

//   const filteredMembers = members.filter((member) => {
//     if (!member) return false;
//     const matchesSearch =
//       member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (member.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
//     const matchesStatus = statusFilter === "all" || member.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

  const getInitials = (name?: string) => {
    if (!name) return "UN";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  const handleFilterChange = (status: "all" | "active" | "pending" | "inactive") => {
      setStatusFilter(status);
  };

  const handleSearchClick = () => {
      console.log(" Search Button Clicked!");
      setActiveSearch(searchTerm);
      setQueryStatus(statusFilter);
      setOffset(0);
    };

  const handleNextPage = () => {
      if (offset + LIMIT < totalRecords) {
        setOffset((prev) => prev + LIMIT);
      }
    };

  const handlePrevPage = () => {
      setOffset((prev) => Math.max(0, prev - LIMIT));
    };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-muted-foreground mt-2">Loading members...</p>
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
              onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
              className="pl-10"
            />
          </div>

          <Button onClick={handleSearchClick}  variant="secondary">
                Search
          </Button>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {["all", "active", "inactive"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange(status as "all" | "active" | "pending" | "inactive")}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-4">
          {members.map((member) => {
            if (!member.id) return null;
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
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge
                        variant={member.is_active ? "default" : "outline"}
                      >
                        {member.is_active ? "Active" : "Inactive"}
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
                    {member.designation && (
                      <p className="text-sm text-muted-foreground">{member.designation}</p>
                    )}
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
                  {!member.is_active && (
                    <Button size="sm" variant="outline" onClick={() => resendInvitation(member.id)}>
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
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-gray-700">

            <span className="text-sm font-medium mx-4">
                Page {currentPage} of {totalPages === 0 ? 1 : totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={offset === 0 || loading}
            >
             Previous
            </Button>

            <Button
             variant="outline"
             size="sm"
             onClick={handleNextPage}
             disabled={offset + LIMIT >= totalRecords || loading}
            >
             Next
            </Button>
        </div>

        {members.length === 0 && (
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
