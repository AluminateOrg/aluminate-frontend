"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import AddSingleMember from "./singlemember";
import BulkCsvUpload from "./bulkupload";
import ManageMembers from "./managemembers";
import { useEffect, useState } from "react";

export default function MembersPage() {
  const { user } = useAuth();
  const { organization, loading: orgLoading } = useOrg();
  const router = useRouter();
  const pathname = usePathname();

  const tabToPath = {
    "add-single": "/org/admin/members/singlemember",
    "bulk-upload": "/org/admin/members/bulkupload",
    "manage-members": "/org/admin/members/managemembers",
  };

  const [tab, setTab] = useState("add-single");

  useEffect(() => {
    const pathToTab = {
      "/org/admin/members/singlemember": "add-single",
      "/org/admin/members/bulkupload": "bulk-upload",
      "/org/admin/members/managemembers": "manage-members",
      "/org/admin/members": "add-single", // default
    };

    const selectedTab =
      pathToTab[pathname as keyof typeof pathToTab] || "add-single";
    setTab(selectedTab);
  }, [pathname]);

  const handleTabChange = (value: string) => {
    setTab(value); // Only update tab state, not URL
  };

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

  const [members, setMembers] = useState<Member[]>([
    // {
    //   id: "1",
    //   name: "John Doe",
    //   email: "john.doe@example.com",
    //   phone: "+1234567890",
    //   designation: "Software Engineer",
    //   company: "Tech Corp",
    //   graduationYear: "2019",
    //   degree: "Computer Science",
    //   location: "San Francisco, CA",
    //   avatar:
    //     "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1",
    //   status: "active" as const,
    //   joinedAt: new Date().toISOString(),
    //   groupIds: ["1", "2"],
    // },
    // {
    //   id: "2",
    //   name: "Jane Smith",
    //   email: "jane.smith@example.com",
    //   designation: "Product Manager",
    //   company: "Innovation Inc",
    //   graduationYear: "2020",
    //   degree: "Business Administration",
    //   location: "New York, NY",
    //   status: "pending" as const,
    //   joinedAt: new Date().toISOString(),
    //   groupIds: ["3"],
    // },
  ]);

  if (orgLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">
              Loading member management...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Member Management
          </h1>
          <p className="text-muted-foreground">
            Add and manage organization members
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {members.length} Total Members
          </Badge>
          <Badge variant="outline">
            {organization?.currentMemberCount || 0} /{" "}
            {organization?.maxMemberCount || 0} Used
          </Badge>
        </div>
      </div>

      {organization &&
        organization.currentMemberCount >=
          organization.maxMemberCount * 0.9 && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Approaching Member Limit
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You’re using {organization.currentMemberCount} of{" "}
                    {organization.maxMemberCount} members. Consider upgrading
                    your plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-single">Add Single Member</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk CSV Upload</TabsTrigger>
          <TabsTrigger value="manage-members">Manage Members</TabsTrigger>
        </TabsList>

        <TabsContent value="add-single">
          <AddSingleMember members={members} setMembers={setMembers} />
        </TabsContent>
        <TabsContent value="bulk-upload">
          <BulkCsvUpload />
        </TabsContent>
        <TabsContent value="manage-members">
          <ManageMembers members={members} setMembers={setMembers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
