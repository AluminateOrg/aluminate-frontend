"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, Notification } from "@/hooks/useNotifications";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Search,
  Filter,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Users,
  Heart,
  DollarSign,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  MoreHorizontal,
  Settings,
  Archive,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "unread" | "read" | Notification["type"]
  >("all");
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    []
  );
  const [actionLoading, setActionLoading] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    switch (selectedFilter) {
      case "unread":
        return matchesSearch && !notification.read;
      case "read":
        return matchesSearch && notification.read;
      case "all":
        return matchesSearch;
      default:
        return matchesSearch && notification.type === selectedFilter;
    }
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all notifications? This action cannot be undone."
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      await clearAllNotifications();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: "read" | "delete") => {
    if (selectedNotifications.length === 0) {
      toast.error("Please select notifications first");
      return;
    }

    setActionLoading(true);
    try {
      if (action === "read") {
        await Promise.all(selectedNotifications.map((id) => markAsRead(id)));
        toast.success(
          `${selectedNotifications.length} notifications marked as read`
        );
      } else {
        await Promise.all(
          selectedNotifications.map((id) => deleteNotification(id))
        );
        toast.success(`${selectedNotifications.length} notifications deleted`);
      }
      setSelectedNotifications([]);
    } catch (error) {
      toast.error(`Failed to ${action} notifications`);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map((n) => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "group":
        return <Users className="h-4 w-4" />;
      case "mentorship":
        return <Heart className="h-4 w-4" />;
      case "donation":
        return <DollarSign className="h-4 w-4" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "error":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "event":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200";
      case "group":
        return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200";
      case "mentorship":
        return "text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-200";
      case "donation":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "success":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
      case "error":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Bell className="h-8 w-8" />
            <span>Notifications</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest activities and announcements
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          <Badge variant="outline">{notifications.length} total</Badge>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs
                value={selectedFilter}
                onValueChange={(value) => setSelectedFilter(value as any)}
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    Unread
                  </TabsTrigger>
                  <TabsTrigger value="event" className="text-xs">
                    Events
                  </TabsTrigger>
                  <TabsTrigger value="group" className="text-xs">
                    Groups
                  </TabsTrigger>
                  <TabsTrigger value="mentorship" className="text-xs">
                    Mentors
                  </TabsTrigger>
                  <TabsTrigger value="donation" className="text-xs">
                    Donations
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              {selectedNotifications.length > 0 ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("read")}
                    disabled={actionLoading}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark Read
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction("delete")}
                    disabled={actionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSelection}>
                    Clear
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectAllVisible}
                  disabled={filteredNotifications.length === 0}
                >
                  Select All
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark All Read
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearAll}
                disabled={actionLoading || notifications.length === 0}
              >
                <Archive className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn(
              "transition-all duration-200 hover:shadow-md",
              !notification.read && "border-l-4 border-l-primary bg-primary/5",
              selectedNotifications.includes(notification.id) &&
                "ring-2 ring-primary/20"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() =>
                      toggleNotificationSelection(notification.id)
                    }
                    className="rounded border-gray-300"
                  />
                </div>

                {/* Notification Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0",
                    getNotificationColor(notification.type)
                  )}
                >
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4
                          className={cn(
                            "font-medium text-foreground",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>
                          {formatDistanceToNow(
                            new Date(notification.timestamp),
                            { addSuffix: true }
                          )}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-4">
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                          onClick={() =>
                            !notification.read &&
                            handleMarkAsRead(notification.id)
                          }
                        >
                          <Link href={notification.actionUrl}>
                            <ExternalLink className="h-4 w-4 mr-1" />
                            {notification.actionText || "View"}
                          </Link>
                        </Button>
                      )}

                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteNotification(notification.id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm || selectedFilter !== "all"
                ? "No Matching Notifications"
                : "No Notifications"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filters to find notifications."
                : "You're all caught up! New notifications will appear here."}
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

      {/* Notification Settings */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Notification Preferences</span>
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Customize your notification settings to control what updates you
                receive and how you're notified.
              </p>
            </div>
            <Button variant="outline" className="mt-4 sm:mt-0" asChild>
              <Link href="/org/member/profile">
                <Settings className="h-4 w-4 mr-2" />
                Manage Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
