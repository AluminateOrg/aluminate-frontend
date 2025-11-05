"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, Users } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import AddSingleMember from "./singlemember";
import BulkCsvUpload from "./bulkupload";
import ManageMembers from "./managemembers";
import { useOrg } from "@/hooks/useOrg";

type TabValue = "add-single" | "bulk-upload" | "manage-members";

  interface Member {
  id: string; // normalized as string
  name: string;
  email: string;
  phone?: string;
  nic?: string;
  regNo?: string;
  address?: string;
  batch?: number;
  designation?: string;
  company?: string;
  degree?: string;
  avatar?: string;
  status: "active" | "pending" | "inactive";
  joinedAt?: string;
  groupIds: number[];
}

export default function MembersPage() {
  const { organization, loading: orgLoading } = useOrg();
  const pathname = usePathname();

  const [tab, setTab] = useState<TabValue>("add-single");
  const [members, setMembers] = useState<Member[]>([]);

  // Sync tab with URL
  useEffect(() => {
    const pathToTab: Record<string, TabValue> = {
      "/org/admin/members/singlemember": "add-single",
      "/org/admin/members/bulkupload": "bulk-upload",
      "/org/admin/members/managemembers": "manage-members",
      "/org/admin/members": "add-single",
    };
    setTab(pathToTab[pathname] || "add-single");
  }, [pathname]);

  if (orgLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner /> {/* Ensure your LoadingSpinner accepts no props or type it properly */}
          <p className="text-muted-foreground">
            Loading member management...
          </p>
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

      {/* {organization &&
        organization.currentMemberCount >=
          (organization.maxMemberCount * 0.9) && (
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
        )} */}

      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)} className="w-full">
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
  