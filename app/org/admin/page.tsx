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
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Calendar,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Plus,
  Send,
  Settings,
  X,
  Mail,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { toast } from "sonner";
import axios from "axios";

interface AnnouncementForm {
  title: string;
  message: string;
  recipients: "all" | "groups" | "specific";
  selectedGroups: string[];
  priority: "low" | "normal" | "high";
  sendEmail: boolean;
  sendPush: boolean;
}

export default function AdminDashboard() {
  const { organization, groups, loading } = useOrg();
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Announcement form state
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>({
    title: "",
    message: "",
    recipients: "all",
    selectedGroups: [],
    priority: "normal",
    sendEmail: true,
    sendPush: false,
  });

  console.log("announcement form: ", announcementForm)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No Organization Found</h3>
          <p className="text-muted-foreground">
            Please contact support for assistance.
          </p>
        </div>
      </div>
    );
  }

  const memberUsagePercent =
    (organization.memberCount / organization.memberLimit) * 100;
  const isNearLimit = memberUsagePercent > 80;

  const handleAnnouncementInputChange = (
    field: keyof AnnouncementForm,
    value: any
  ) => {
    setAnnouncementForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelection = (groupId: string) => {
    setAnnouncementForm((prev) => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter((id) => id !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/group/get/all`)
  //       console.log("response from the backend: ", response.data);
  //       if (response.data){
          
  //       }
  //     } catch (error) {
        
  //     }
  //   }
  // })

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    if (
      announcementForm.recipients === "groups" &&
      announcementForm.selectedGroups.length === 0
    ) {
      toast.error("Please select at least one group");
      return;
    }

    setSendingAnnouncement(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/announcement/multicast-for-all-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(announcementForm)
      })

      console.log("response from API:", response);

      if (!response.ok) {
        toast.error("Failed to send announcement. Please try again.");
      }

      const data = await response.json();
      toast.success(`Announcement sent successfully to ${data.sendCount} members!`)


      // Reset form and close modal
      setAnnouncementForm({
        title: "",
        message: "",
        recipients: "all",
        selectedGroups: [],
        priority: "normal",
        sendEmail: true,
        sendPush: false,
      });
      setShowAnnouncementModal(false);
    } catch (error) {
      toast.error("Failed to send announcement. Please try again.");
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({
      title: "",
      message: "",
      recipients: "all",
      selectedGroups: [],
      priority: "normal",
      sendEmail: true,
      sendPush: false,
    });
  };

  // console.log("groups", groups

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your organization.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Badge
            variant={organization.tier === "premium" ? "default" : "secondary"}
          >
            {organization.tier.charAt(0).toUpperCase() +
              organization.tier.slice(1)}{" "}
            Plan
          </Badge>
        </div>
      </div>

      {/* Alert for near member limit */}
      {isNearLimit && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Approaching Member Limit
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You're using {organization.memberCount} of{" "}
                  {organization.memberLimit} members. Consider upgrading your
                  plan to add more members.
                </p>
              </div>
              <Button size="sm" className="ml-auto">
                Upgrade Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.memberCount}</div>
            <div className="space-y-2 mt-2">
              <Progress value={memberUsagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {organization.memberCount} of {organization.memberLimit} used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(groups) ? groups.filter((g) => g.currentMembers > 0).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {groups.length} total groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Next event: Tomorrow
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">LKR 2,400</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Member Activity</CardTitle>
            <CardDescription>
              Latest member interactions and engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Sheane Mario",
                  action: "joined Software Engineers group",
                  time: "2 hours ago",
                },
                {
                  name: "Pulasthi Abishek ",
                  action: "RSVP'd to Alumni Networking Event",
                  time: "4 hours ago",
                },
                {
                  name: "Hashir Ahamad",
                  action: "donated LKR 50 to Scholarship Fund",
                  time: "6 hours ago",
                },
                {
                  name: "Satheera Jayawardhana ",
                  action: "booked mentorship session",
                  time: "1 day ago",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.name}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/org/admin/members">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Members
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/org/admin/events">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowAnnouncementModal(true)}
              >
                <Send className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
              <Button variant="outline" className="justify-start">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/org/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Organization Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Send Announcement</span>
                  </CardTitle>
                  <CardDescription>
                    Send important updates and notifications to your
                    organization members
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAnnouncementModal(false);
                    resetAnnouncementForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendAnnouncement} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Announcement Title *</Label>
                    <Input
                      id="title"
                      value={announcementForm.title}
                      onChange={(e) =>
                        handleAnnouncementInputChange("title", e.target.value)
                      }
                      placeholder="Important Update: New Features Available"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={announcementForm.message}
                      onChange={(e) =>
                        handleAnnouncementInputChange("message", e.target.value)
                      }
                      placeholder="Write your announcement message here..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Recipients */}
                <div className="space-y-4">
                  <h4 className="font-medium">Recipients</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="all-members"
                        name="recipients"
                        value="all"
                        checked={announcementForm.recipients === "all"}
                        onChange={(e) =>
                          handleAnnouncementInputChange(
                            "recipients",
                            e.target.value
                          )
                        }
                        className="rounded"
                      />
                      <Label htmlFor="all-members">
                        All Members ({organization.memberCount} members)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="specific-groups"
                        name="recipients"
                        value="groups"
                        checked={announcementForm.recipients === "groups"}
                        onChange={(e) =>
                          handleAnnouncementInputChange(
                            "recipients",
                            e.target.value
                          )
                        }
                        className="rounded"
                      />
                      <Label htmlFor="specific-groups">Specific Groups</Label>
                    </div>
                  </div>

                  {/* Group Selection */}
                  {announcementForm.recipients === "groups" && (
                    <div className="space-y-3 ml-6">
                      <p className="text-sm text-muted-foreground">
                        Select which groups to send the announcement to:
                      </p>
                      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                        {Array.isArray(groups.data) && groups.data.map((group) => (
                          <div
                            key={group.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              id={`group-${group.id}`}
                              checked={announcementForm.selectedGroups.includes(
                                group.id
                              )}
                              onChange={() => handleGroupSelection(group.id)}
                              className="rounded"
                            />
                            <Label
                              htmlFor={`group-${group.id}`}
                              className="text-sm"
                            >
                              {group.name} ({group.currentMembers} members)
                            </Label>
                          </div>
                        ))}
                      </div>

                      {announcementForm.selectedGroups.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {announcementForm.selectedGroups.length}{" "}
                          group(s),{" "}
                          {announcementForm.selectedGroups.reduce(
                            (sum, groupId) => {
                              const group = groups.data.find(
                                (g) => g.id === groupId
                              );
                              return sum + (group?.currentMembers || 0);
                            },
                            0
                          )}{" "}
                          total members
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Priority and Delivery Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={announcementForm.priority}
                      onChange={(e) =>
                        handleAnnouncementInputChange(
                          "priority",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <Label>Delivery Options</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="send-email"
                          checked={announcementForm.sendEmail}
                          onChange={(e) =>
                            handleAnnouncementInputChange(
                              "sendEmail",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <Label htmlFor="send-email" className="text-sm">
                          <Mail className="h-4 w-4 inline mr-1" />
                          Send Email Notification
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="send-push"
                          checked={announcementForm.sendPush}
                          onChange={(e) =>
                            handleAnnouncementInputChange(
                              "sendPush",
                              e.target.checked
                            )
                          }
                          className="rounded"
                        />
                        <Label htmlFor="send-push" className="text-sm">
                          <MessageSquare className="h-4 w-4 inline mr-1" />
                          Send Push Notification
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAnnouncementModal(false);
                      resetAnnouncementForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetAnnouncementForm}
                  >
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={sendingAnnouncement}>
                    {sendingAnnouncement ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Announcement
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
