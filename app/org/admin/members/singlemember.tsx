// File: components/members/AddSingleMember.tsx
"use client";

import { useEffect, useState } from "react";

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

import { UserPlus, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import axiosAdmin from "@/axiosInstances/axiosAdmin";

interface Group {
  id: string;
  name: string;
  description?: string;
  maxMembers?: number;
  currentMembers?: number;
  // Add other group properties as needed
}

export default function AddSingleMember({ members, setMembers }: any) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [singleMemberForm, setSingleMemberForm] = useState({
    name: "",
    nic: "",
    phone: "",
    email: "",
    regNo: "",
    address: "",
    batch: 0,
    selectedGroups: [] as string[],
  });

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axiosAdmin.get(`/group/get/all`);
        const data = res.data;
        if (res.status === 200) {
          setGroups(data.data);
        } else {
          throw new Error(data.message || "Failed to load groups.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    fetchGroups();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
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

      const response = await axiosAdmin.post(`/member/create`, {
        ...singleMemberForm,
        password: singleMemberForm.nic,
        groupIds: singleMemberForm.selectedGroups,
      });

      const result = response.data;

      if (response.status !== 200) {
        throw new Error(result.message || "Failed to add member.");
      }

      const newMember = result.data;

      setMembers((prev: any) => [newMember, ...prev]);
      setSingleMemberForm({
        name: "",

        nic: "",
        phone: "",
        email: "",
        regNo: "",
        address: "",
        batch: 0,
        selectedGroups: [],
      });

      toast.success("Member added successfully!");
    } catch (error: any) {
      toast.error(error.message);
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
          Add a single member and assign them to groups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Full Name *", "name"],
              ["NIC", "nic"],
              ["Phone Number", "phone"],
              ["Email Address *", "email"],
              ["Registration No.", "regNo"],
              ["Address", "address"],
              ["Batch", "batch"],
            ].map(([label, id]) => (
              <InputField
                key={id}
                label={label as string}
                id={id as string}
                value={singleMemberForm[id as keyof typeof singleMemberForm]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange(
                    id,
                    id === "batch" ? Number(e.target.value) : e.target.value
                  )
                }
              />
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Group Assignment *</h3>
            <p className="text-sm text-muted-foreground">
              Select groups the member should join.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    singleMemberForm.selectedGroups.includes(group.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  }`}
                  onClick={() => handleGroupSelection(group.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">
                        {group.name}
                      </h4>
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

                  nic: "",
                  phone: "",
                  email: "",
                  regNo: "",
                  address: "",
                  batch: 0,
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
