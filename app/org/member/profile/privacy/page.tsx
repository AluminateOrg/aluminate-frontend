"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

export default function ProfilePrivacyPage() {
  return (
    <Card className="mt-4 sm:mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Shield className="h-5 w-5" />
          <span>Privacy Settings</span>
        </CardTitle>
        <CardDescription className="text-sm">Control who can see your info</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Badge variant="outline" className="text-xs">Organization Members</Badge>
      </CardContent>
    </Card>
  );
}
