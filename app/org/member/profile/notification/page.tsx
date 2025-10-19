"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ExternalLink } from "lucide-react";

export default function ProfileNotificationsPage() {
  return (
    <Card className="mt-4 sm:mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Bell className="h-5 w-5" />
          <span>Notification Preferences</span>
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
  );
}
