"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axiosMember from "@/axiosInstances/axiosMember"; // Assuming this points to your organization backend
import { useAuth } from "@/hooks/useAuth";
import { Client, IMessage } from "@stomp/stompjs";
import { toast } from "sonner"; // For showing pop-ups

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

// Backend row - This MUST match the object sent by your backend
type InAppNotification = {
  id: number;
  memberId: string;
  tenantId: string;
  type: string; // e.g. EVENT_PUBLISHED
  payloadJson: string; // JSON string
  readFlag: boolean;
  createdAt: string; // ISO
};
// --- End Notification Types ---

const API_BASE = "/notifications"; // API path on your organization backend

// --- Mapping Functions (Keep your existing definitions) ---
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
    // ... include ALL your other cases from the original file ...
    case "PROFILE_UPDATE_REQUIRED":
      return {
        title: "Profile Update Required",
        message: p.reason ?? "Please update your professional information.",
        actionText: "Update Profile",
        actionUrl: p.ctaUrl ?? "/org/member/profile", // Adjust this path if needed
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
// --- End Mapping Functions ---


// --- Auth Helper Functions (Copied from useChat) ---
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8098"; 
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "api/v1/portal";
const API_ROOT = `${API_BASE_URL}${API_PREFIX}`;

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined" || !document.cookie) return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  if (!found) return null;
  const value = found.split("=").slice(1).join("=");
  return decodeURIComponent(value || "");
};

// IMPORTANT: Ensure your Organization backend has a GET endpoint at /auth/jwt
// that returns the user's JWT token in the format { "token": "..." }
const getServerToken = async (): Promise<string | null> => {
  try {
    const csrf = getCookie("csrf-token") || "";
    const sessionId = getCookie("sessionId") || "";
    const tokenUrl = `${API_ROOT}/auth/jwt`;
    const res = await fetch(tokenUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(csrf ? { "X-Csrf-Token": csrf } : {}),
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    if (!body) return null;
    return body.token;
  } catch (err) {
    console.error("Failed to get server token for WebSocket:", err);
    return null;
  }
};
// --- End Auth Helper Functions ---


export function useNotifications() {
  const { user } = useAuth();
  const memberId = user?.id ? String(user.id) : undefined;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // --- WebSocket State ---
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  // ---

  // Fetch initial list of notifications
  const fetchNotifications = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    try {
      const listRes = await axiosMember.get(`${API_BASE}/${memberId}`);
      const rows: InAppNotification[] = Array.isArray(listRes.data)
        ? listRes.data
        : listRes.data?.data ?? [];
      const mapped = rows.map(mapRow);
      setNotifications(mapped);

      const unreadRes = await axiosMember.get(`${API_BASE}/${memberId}/unread-count`);
      const raw = unreadRes.data?.data ?? unreadRes.data;
      setUnreadCount(Number(raw) || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  // --- WebSocket Connection Logic ---
  const teardownWebsocket = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (e) { /* ignore */ }
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    // 1. Fetch initial data
    fetchNotifications();

    // 2. Setup WebSocket if user is logged in
    if (!memberId) {
      return teardownWebsocket; // Ensure cleanup if memberId becomes null
    }

    // Use the WebSocket base URL from env, default to organization backend
    const wsBase = process.env.NEXT_PUBLIC_ORG_WS_URL || API_BASE_URL.replace(/^http/, 'ws');
    // Use the same endpoint path as your chat config
    const brokerURL = `${wsBase}/ws`; // Assuming /ws is the STOMP endpoint

    const ensureJwtAndConnect = async () => {
      const jwt = (await getServerToken()) || "";
      if (!wsBase || !jwt) {
        console.error("Notification WebSocket failed: missing base URL or JWT");
        return;
      }

      if (clientRef.current) { // Clean up previous connection if exists
         teardownWebsocket();
      }

      console.log(`Connecting Notification WebSocket to ${brokerURL}`);
      const client = new Client({
        brokerURL,
        connectHeaders: {
          Authorization: `Bearer ${jwt}`,
        },
        reconnectDelay: 5000, // Reconnect every 5 seconds if disconnected
        heartbeatIncoming: 4000, // Expect pings from server
        heartbeatOutgoing: 4000, // Ping server
        
        onConnect: () => {
          setConnected(true);
          console.log("Real-time notifications connected!");

          // *** Subscribe to the private notification topic ***
          client.subscribe(
            `/user/${memberId}/topic/notifications`,
            (frame: IMessage) => {
              console.log("Received new notification via WebSocket:", frame.body);
              try {
                // Backend sends the InAppNotification object directly
                const rawNotification: InAppNotification = JSON.parse(frame.body);

                // Reuse your mapping logic
                const newNotification: Notification = mapRow(rawNotification);

                // Show a pop-up
                toast.info(newNotification.title || "New Notification", {
                  description: newNotification.message,
                  // Add action button if actionUrl exists
                  action: newNotification.actionUrl ? {
                    label: newNotification.actionText || "View",
                    onClick: () => window.location.href = newNotification.actionUrl!
                  } : undefined,
                });

                // Update state in real-time
                setNotifications((prev) => [newNotification, ...prev]);
                // Only increment if it's actually unread (backend should set readFlag=false)
                if (!newNotification.read) {
                    setUnreadCount((prev) => prev + 1);
                }

              } catch (e) {
                console.error("Invalid notification payload received via WebSocket", e);
              }
            }
          );
        },
        onStompError: (frame) => {
            console.error(
              "Broker reported STOMP error: " + frame.headers["message"],
              "Additional details: " + frame.body
            );
          setConnected(false); // Consider disconnected on error
        },
        onWebSocketError: (event) => {
            console.error("WebSocket error observed:", event);
            setConnected(false); // Consider disconnected on error
        },
        onWebSocketClose: () => {
            console.log("Notification WebSocket closed.");
            setConnected(false);
        },
        onDisconnect: () => {
            console.log("Notification WebSocket disconnected.");
            setConnected(false);
        },
        // Optional: Add debug logging if needed
        // debug: (str) => { console.log('[STOMP DEBUG]', str); },
      });

      client.activate();
      clientRef.current = client;
    };

    ensureJwtAndConnect();

    // Cleanup function: disconnect when hook unmounts or dependencies change
    return () => {
      teardownWebsocket();
    };
    // Ensure dependencies cover everything needed for connection
  }, [fetchNotifications, memberId, teardownWebsocket]);
  // --- End WebSocket Connection Logic ---


  // --- Action Functions (Keep your existing definitions) ---
  const markAsRead = useCallback(
    async (notificationId: string) => {
      // Optimistically update UI first
      const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      if (wasUnread) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      // Send request to backend
      await axiosMember.post(`${API_BASE}/${notificationId}/read`).catch((err) => {
          console.error("Failed to mark notification as read:", err);
          // Optional: Revert optimistic update on error
          // fetchNotifications(); // Or revert state manually
          toast.error("Failed to mark as read");
      });
    },
    [notifications] // Add notifications dependency for finding wasUnread
  );

  const markAllAsRead = useCallback(async () => {
    const toReadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (toReadIds.length === 0) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Send requests to backend (consider a bulk endpoint later if possible)
    try {
        await Promise.all(toReadIds.map((id) => axiosMember.post(`${API_BASE}/${id}/read`).catch(() => {})));
    } catch(err) {
        console.error("Failed to mark all notifications as read:", err);
        // Optional: Revert optimistic update on error
        // fetchNotifications();
        toast.error("Failed to mark all as read");
    }
  }, [notifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    // Optional: Adjust unread count if the deleted one was unread
    // const deleted = notifications.find(n => n.id === notificationId);
    // if (deleted && !deleted.read) { setUnreadCount(c => Math.max(0, c - 1)); }

    // Send request to backend (assuming DELETE endpoint exists)
    await axiosMember.delete?.(`${API_BASE}/${notificationId}`).catch((err) => {
        console.error("Failed to delete notification:", err);
        // Optional: Revert optimistic update
        // fetchNotifications();
        toast.error("Failed to delete notification");
    });
  }, [/* Add notifications dependency if adjusting unread count */]);

  const clearAllNotifications = useCallback(async () => {
    if (!memberId) return;
    // Optimistic UI update
    setNotifications([]);
    setUnreadCount(0);

    // Send request to backend (assuming DELETE endpoint exists)
    await axiosMember.delete?.(`${API_BASE}/${memberId}`).catch((err) => {
        console.error("Failed to clear all notifications:", err);
        // Optional: Revert optimistic update
        // fetchNotifications();
        toast.error("Failed to clear notifications");
    });
  }, [memberId]);
  // --- End Action Functions ---

  // Computed value (keep existing)
  const recentNotifications = notifications.slice(0, 5);

  return {
    notifications,
    recentNotifications,
    unreadCount,
    loading,
    connected, // Expose connection status
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications: fetchNotifications, // Keep the refresh function
  };
}