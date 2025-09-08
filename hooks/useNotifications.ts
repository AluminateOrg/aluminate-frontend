"use client";

import { useState, useEffect, useCallback } from "react";
import axiosMember from "@/axiosInstances/axiosMember";
import axiosGlobal from "@/axiosInstances/axiosGlobal";
import { useAuth } from "@/hooks/useAuth";

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

/** Backend row */
type InAppNotification = {
  id: number;
  memberId: string;
  tenantId: string;
  type: string;          // e.g. EVENT_PUBLISHED
  payloadJson: string;   // JSON string
  readFlag: boolean;
  createdAt: string;     // ISO
};

const API_BASE = "/notifications";

/** Map API `type` to UI category */
function mapUiType(apiType: string): Notification["type"] {
  switch (apiType) {
    case "EVENT_PUBLISHED":
    case "EVENT_REMINDER":
      return "event";
    case "GROUP_ADDED":
    case "GROUP_MESSAGE":
    case "GROUP_JOIN_APPROVED":
      return "group";
    case "DONATION_RECEIVED":
      return "donation";
    case "MENTORSHIP_CONFIRMED":
      return "mentorship";
    case "PROFILE_UPDATE_REQUIRED":
      return "info";
    default:
      return "info";
  }
}

/** Title/message/cta per notification kind */
function buildCopy(apiType: string, p: Record<string, any>) {
  switch (apiType) {
    case "EVENT_PUBLISHED":
      return {
        title: p.eventName ?? "New Event",
        message: `Join us for ${p.eventName ?? "an event"}${p.start ? ` — starts ${p.start}` : ""}.`,
        actionText: "View Event",
        actionUrl: p.ctaUrl,
        metadata: { eventId: p.eventId },
      };
    case "EVENT_REMINDER":
      return {
        title: "Event Reminder",
        message: `${p.eventName ?? "An event"} starts soon${p.start ? `: ${p.start}` : ""}.`,
        actionText: "Join Event",
        actionUrl: p.ctaUrl,
        metadata: { eventId: p.eventId },
      };
    case "GROUP_ADDED":
      return {
        title: `Welcome to ${p.groupName ?? "the group"}`,
        message: "You’ve been added to the group. Say hello!",
        actionText: "View Group",
        actionUrl: p.ctaUrl,
        metadata: { groupId: p.groupId },
      };
    case "GROUP_MESSAGE":
      return {
        title: `New message in ${p.groupName ?? "group"}`,
        message: p.preview ?? "A new discussion was posted.",
        actionText: "View Chat",
        actionUrl: p.ctaUrl,
        metadata: { groupId: p.groupId },
      };
    case "GROUP_JOIN_APPROVED":
      return {
        title: "Group request approved",
        message: `You're now a member of ${p.groupName ?? "the group"}.`,
        actionText: "Open Group",
        actionUrl: p.ctaUrl,
        metadata: { groupId: p.groupId },
      };
    case "DONATION_RECEIVED":
      return {
        title: "Donation Received",
        message: `Thank you for your ${p.currency ?? ""}${p.amount ?? ""} donation.`,
        actionText: "View Donations",
        actionUrl: p.ctaUrl,
        metadata: { campaignId: p.campaignId, amount: Number(p.amount) || undefined },
      };
    case "MENTORSHIP_CONFIRMED":
      return {
        title: "Mentorship Session Confirmed",
        message: `Your session${p.whenIso ? ` at ${p.whenIso}` : ""}${p.mentorName ? ` with ${p.mentorName}` : ""} is confirmed.`,
        actionText: "View Details",
        actionUrl: p.ctaUrl,
        metadata: { mentorId: p.mentorId },
      };
    case "PROFILE_UPDATE_REQUIRED":
      return {
        title: "Profile Update Required",
        message: p.reason ?? "Please update your professional information.",
        actionText: "Update Profile",
        actionUrl: p.ctaUrl ?? "/org/member/profile",
      };
    default:
      return {
        title: "Notification",
        message: p.message ?? "You have a new notification.",
        actionText: p.ctaUrl ? "View" : undefined,
        actionUrl: p.ctaUrl,
      };
  }
}

/** Convert backend row -> UI card */
function mapRow(row: InAppNotification): Notification {
  let payload: Record<string, any> = {};
  try {
    payload = row.payloadJson ? JSON.parse(row.payloadJson) : {};
  } catch {
    payload = {};
  }
  const copy = buildCopy(row.type, payload);
  return {
    id: String(row.id),
    type: mapUiType(row.type),
    title: copy.title,
    message: copy.message,
    actionText: copy.actionText,
    actionUrl: copy.actionUrl,
    metadata: copy.metadata,
    timestamp: row.createdAt,
    read: !!row.readFlag,
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const memberId = user?.id ? String(user.id) : undefined;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      // list
      const listRes = await axiosMember.get(`${API_BASE}/${memberId}`);
      const rows: InAppNotification[] = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data?.data ?? [];
      const mapped = rows.map(mapRow);
      setNotifications(mapped);

      // unread count
      const unreadRes = await axiosMember.get(`${API_BASE}/${memberId}/unread-count`);
      const raw = unreadRes.data?.data ?? unreadRes.data;
      setUnreadCount(Number(raw) || 0);
    } catch (err) {
      // keep UI usable even if API hiccups
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // actions
  const markAsRead = useCallback(
    async (notificationId: string) => {
      await axiosMember.post(`${API_BASE}/${notificationId}/read`).catch(() => { });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    },
    []
  );

  const markAllAsRead = useCallback(async () => {
    // no bulk endpoint yet → call one by one
    const toRead = notifications.filter((n) => !n.read).map((n) => n.id);
    await Promise.all(toRead.map((id) => axiosMember.post(`${API_BASE}/${id}/read`).catch(() => { })));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    // if you add DELETE later, this will just work
    await axiosMember.delete?.(`${API_BASE}/${notificationId}`).catch(() => { });
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(async () => {
    if (!memberId) return;
    await axiosMember.delete?.(`${API_BASE}/${memberId}`).catch(() => { });
    setNotifications([]);
    setUnreadCount(0);
  }, [memberId]);

  // computed
  const recentNotifications = notifications.slice(0, 5);

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
