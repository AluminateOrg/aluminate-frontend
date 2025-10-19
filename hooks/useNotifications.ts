"use client";

import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "event"
    | "group"
    | "donation"
    | "mentorship";
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: {
    eventId?: string;
    groupId?: string;
    campaignId?: string;
    mentorId?: string;
    amount?: number;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock notifications data
  const mockNotifications: Notification[] = [
    {
      id: "1",
      title: "New Event: Alumni Networking",
      message:
        "Join us for our biggest networking event of the year! RSVP now to secure your spot.",
      type: "event",
      read: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      actionUrl: "/org/member/events",
      actionText: "View Event",
      metadata: { eventId: "1" },
    },
    {
      id: "2",
      title: "Welcome to Software Engineers Group",
      message:
        "You have been added to the Software Engineers group. Start connecting with fellow developers!",
      type: "group",
      read: false,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      actionUrl: "/org/member/groups",
      actionText: "View Group",
      metadata: { groupId: "group-1" },
    },
    {
      id: "3",
      title: "Donation Received",
      message:
        "Thank you for your $100 donation to the Student Scholarship Fund. Your contribution makes a difference!",
      type: "donation",
      read: true,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      actionUrl: "/org/member/donations",
      actionText: "View Donations",
      metadata: { campaignId: "1", amount: 100 },
    },
    {
      id: "4",
      title: "Mentorship Session Confirmed",
      message:
        "Your mentorship session with Sheane Mario has been confirmed for tomorrow at 2:00 PM.",
      type: "mentorship",
      read: false,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      actionUrl: "/org/member/mentors",
      actionText: "View Details",
      metadata: { mentorId: "1" },
    },
    {
      id: "5",
      title: "Profile Update Required",
      message:
        "Please update your professional information to help other members connect with you.",
      type: "info",
      read: true,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      actionUrl: "/org/member/profile",
      actionText: "Update Profile",
    },
    {
      id: "6",
      title: "New Message in Data Scientists Group",
      message:
        "Michael Chen posted a new discussion about machine learning trends. Join the conversation!",
      type: "group",
      read: true,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      actionUrl: "/org/member/chat",
      actionText: "View Chat",
      metadata: { groupId: "group-2" },
    },
    {
      id: "7",
      title: "Event Reminder",
      message:
        "Tech Workshop: AI Trends starts in 2 hours. Don't forget to join us!",
      type: "event",
      read: false,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      actionUrl: "/org/member/events",
      actionText: "Join Event",
      metadata: { eventId: "2" },
    },
    {
      id: "8",
      title: "System Maintenance",
      message:
        "The platform will undergo scheduled maintenance tonight from 2:00 AM to 4:00 AM EST.",
      type: "warning",
      read: true,
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      id: "9",
      title: "Fundraising Goal Reached!",
      message:
        "Amazing news! The Student Scholarship Fund has reached its $50,000 goal thanks to your support.",
      type: "success",
      read: true,
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
      actionUrl: "/org/member/donations",
      actionText: "View Campaign",
    },
    {
      id: "10",
      title: "Welcome to Alumni Portal!",
      message:
        "Welcome to our alumni community! Complete your profile and start connecting with fellow alumni.",
      type: "info",
      read: true,
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      actionUrl: "/org/member/profile",
      actionText: "Complete Profile",
    },
  ];

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Computed values
  const unreadCount = notifications.filter((n) => !n.read).length;
  const recentNotifications = notifications.slice(0, 5); // For header dropdown

  return {
    notifications,
    recentNotifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications: fetchNotifications,
  };
}
