// File: components/members/AddSingleMember.tsx
"use client";

import { useState } from "react";
import { useOrg } from "@/hooks/useOrg";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

export default function AddSingleMember({ members, setMembers }: any) {
  const { groups } = useOrg();
  const [loading, setLoading] = useState(false);
  const [singleMemberForm, setSingleMemberForm] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    company: "",
    graduationYear: "",
    degree: "",
    location: "",
    selectedGroups: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
    setSingleMemberForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelection = (groupId: string) => {
    setSingleMemberForm((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter((id) => id !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!singleMemberForm.name || !singleMemberForm.email) {
        toast.error("Name and email are required");
        return;
      }

      if (singleMemberForm.selectedGroups.length === 0) {
        toast.error("Please select at least one group for the member");
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMember = {
        id: Date.now().toString(),
        ...singleMemberForm,
        groupIds: singleMemberForm.selectedGroups,
        status: "pending",
        joinedAt: new Date().toISOString(),
      };

      setMembers((prev: any) => [newMember, ...prev]);
      setSingleMemberForm({
        name: "",
        email: "",
        phone: "",
        designation: "",
        company: "",
        graduationYear: "",
        degree: "",
        location: "",
        selectedGroups: [],
      });

      toast.success(
        `Member added successfully! Invitation email sent. Added to ${singleMemberForm.selectedGroups.length} group(s).`
      );
    } catch (error) {
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Add New Member</span>
        </CardTitle>
        <CardDescription>
          Add a single member and assign them to groups. An invitation email will be sent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Full Name *" id="name" value={singleMemberForm.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            <InputField label="Email Address *" id="email" value={singleMemberForm.email} onChange={(e) => handleInputChange("email", e.target.value)} />
            <InputField label="Phone Number" id="phone" value={singleMemberForm.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
            <InputField label="Current Position" id="designation" value={singleMemberForm.designation} onChange={(e) => handleInputChange("designation", e.target.value)} />
            <InputField label="Company" id="company" value={singleMemberForm.company} onChange={(e) => handleInputChange("company", e.target.value)} />
            <InputField label="Graduation Year" id="graduationYear" value={singleMemberForm.graduationYear} onChange={(e) => handleInputChange("graduationYear", e.target.value)} />
            <InputField label="Degree" id="degree" value={singleMemberForm.degree} onChange={(e) => handleInputChange("degree", e.target.value)} />
            <InputField label="Location" id="location" value={singleMemberForm.location} onChange={(e) => handleInputChange("location", e.target.value)} />
          </div>

          {/* Group Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Assignment *</h3>
            <p className="text-sm text-muted-foreground">
              Select groups the member should join.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${singleMemberForm.selectedGroups.includes(group.id) ? "border-primary bg-primary/5" : "border-border hover:bg-accent"}`}
                  onClick={() => handleGroupSelection(group.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{group.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.description || "No description available"}
                      </p>
                    </div>
                    {singleMemberForm.selectedGroups.includes(group.id) && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setSingleMemberForm({
                  name: "",
                  email: "",
                  phone: "",
                  designation: "",
                  company: "",
                  graduationYear: "",
                  degree: "",
                  location: "",
                  selectedGroups: [],
                })
              }
            >
              Clear Form
            </Button>
            <Button type="submit" disabled={loading || groups.length === 0}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Adding Member...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Add Member
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InputField({ label, id, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} />
    </div>
  );
}
