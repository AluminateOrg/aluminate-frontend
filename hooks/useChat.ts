"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  timestamp: string;
  type?: "text" | "image" | "file";
}

export function useChat(
  orgId: string,
  groupId?: string,
  currentUserName?: string
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const subRef = useRef<any>(null);
  const nextCursorRef = useRef<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "";

  const API_ROOT = `${API_BASE}/${API_PREFIX}`; // e.g. http://localhost:8098/api/v1/portal

  // helper to read a non-HttpOnly cookie by name
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined" || !document.cookie) return null;
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const found = cookies.find((c) => c.startsWith(`${name}=`));
    if (!found) return null;
    const value = found.split("=").slice(1).join("=");
    return decodeURIComponent(value || "");
  };

  // Fallback: request server to return the JWT by reading the HttpOnly cookie.
  // Backend should expose GET {API_ROOT}/auth/jwt and return { token: "<jwt>" }.
  const getServerToken = async (): Promise<string | null> => {
    try {
      const csrf = getCookie("csrf-token") || "";
      const sessionId = getCookie("sessionId") || "";
      const tokenUrl = `${API_ROOT}/auth/jwt`;
      const res = await fetch(tokenUrl, {
        method: "GET",
        credentials: "include", // ensure HttpOnly cookie is sent
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
      return null;
    }
  };

  // small helper to perform fetch requests and return parsed JSON,
  // throws when !res.ok with parsed error if possible
  const apiFetch = async (
    method: "GET" | "POST",
    path: string,
    options?: { params?: Record<string, any>; body?: any }
  ) => {
    const jwt = await getServerToken();

    console.log("jwt:", jwt);
    const url = new URL(`${API_ROOT}${path}`);

    if (options?.params) {
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null)
          url.searchParams.append(k, String(v));
      });
    }

    console.log("options:", options);
    const res = await fetch(url.toString(), {
      method,
      credentials: "include",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    let data: any = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch (err) {
      data = text;
    }

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : res.statusText);
      const error: any = new Error(
        `${res.status} ${res.statusText}: ${errMsg}`
      );
      error.status = res.status;
      error.body = data;
      throw error;
    }

    return data;
  };

  const buildMessagesFromResponse = (items: any[]): ChatMessage[] =>
    items
      .map((it) => ({
        id: it.id,
        content: it.content,
        senderId: it.senderId,
        senderName: it.senderName || it.senderId,
        senderAvatar: it.senderAvatar,
        timestamp: it.createdAt || it.timestamp || new Date().toISOString(),
        type: "text" as const,
      }))
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

  const fetchMessages = useCallback(
    async (limit = 50, cursor?: string, appendOlder = false) => {
      if (!orgId || !groupId) return { items: [], nextCursor: null };
      setLoading(true);
      try {
        const path =
          groupId === "UNIVERSAL"
            ? `/orgs/${orgId}/chats/universal/messages`
            : `/orgs/${orgId}/groups/${groupId}/messages`;

        // replaced axiosCommon.get with apiFetch GET
        const data = await apiFetch("GET", path, {
          params: { limit, cursor },
        });
        // const data = await apiFetch("GET", path);

        const items = Array.isArray(data?.items)
          ? data.items
          : data?.data?.items ?? [];
        const nextCursor = data?.nextCursor ?? null;
        nextCursorRef.current = nextCursor;

        const built = buildMessagesFromResponse(items);

        setMessages((prev) => {
          if (!cursor && !appendOlder) {
            // initial load or refresh: replace
            return built;
          }
          if (appendOlder) {
            // loading older: prepend older messages (built is newest-first->we sorted oldest-first)
            // ensure no duplicates
            const ids = new Set(prev.map((m) => m.id));
            const deduped = built.filter((m) => !ids.has(m.id));
            return [...deduped, ...prev];
          } else {
            // appending newer messages (should not happen from paging)
            const ids = new Set(prev.map((m) => m.id));
            const deduped = built.filter((m) => !ids.has(m.id));
            return [...prev, ...deduped];
          }
        });

        return { items: built, nextCursor };
      } catch (error: any) {
        console.error("Failed to fetch messages:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [orgId, groupId]
  );

  const loadMore = useCallback(
    async (limit = 50) => {
      // Load older messages using nextCursorRef (server returns cursor of older messages)
      if (!nextCursorRef.current) return;
      await fetchMessages(limit, nextCursorRef.current, true);
    },
    [fetchMessages]
  );

  const setupWebsocket = useCallback(() => {
    if (!orgId || !groupId) return;
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || ""; // e.g. wss://host:8098

    const ensureJwtAndConnect = async () => {
      const jwt = (await getServerToken()) || "";
      if (!wsBase || !jwt) {
        console.error("WebSocket connection failed: missing base URL or JWT");
        return;
      }

      // Clean up existing client if any
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {
          /* ignore */
        }
        clientRef.current = null;
        subRef.current = null;
      }

      const brokerURL = `${wsBase}/ws`;

      const client = new Client({
        brokerURL,
        connectHeaders: {
          Authorization: `Bearer ${jwt}`,
        },
        reconnectDelay: 2000,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 20000,
        onConnect: () => {
          setConnected(true);
          try {
            const topic = `/topic/org.${orgId}.group.${groupId}`;
            subRef.current = client.subscribe(topic, (frame: IMessage) => {
              try {
                const obj = JSON.parse(frame.body);
                // preserve server-provided senderName (may be undefined) — do not force fallback here
                const msg: ChatMessage = {
                  id: obj.id,
                  content: obj.content,
                  senderId: obj.senderId,
                  senderName: obj.senderName ?? undefined,
                  timestamp: obj.createdAt || new Date().toISOString(),
                  type: "text",
                };
                setMessages((prev) => {
                  if (prev.find((m) => m.id === msg.id)) return prev;
                  return [...prev, msg];
                });
              } catch (e) {
                console.error("Invalid WS message payload", e);
              }
            });
          } catch (e) {
            console.error("WS subscribe failed", e);
          }
        },
        onStompError: (frame) => {
          console.error(
            "Broker error",
            frame?.headers?.message || "",
            frame.body
          );
        },
        onWebSocketClose: () => {
          setConnected(false);
        },
        onDisconnect: () => {
          setConnected(false);
        },
        debug: (str) => {
          // console.debug('[STOMP]', str);
        },
      });

      client.activate();
      clientRef.current = client;
    };

    // start async connection flow (don't block render)
    ensureJwtAndConnect();
    return;
  }, [orgId, groupId, getServerToken]);

  const teardownWebsocket = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (e) {
        /* ignore */
      }
      clientRef.current = null;
      subRef.current = null;
      setConnected(false);
    }
  }, []);

  // Replace the broken sendMessage / refresh / effects / return area with this corrected implementation
  const sendMessage = useCallback(
    async (content: string, type: "text" | "image" | "file" = "text") => {
      if (!orgId || !groupId) throw new Error("Missing orgId or groupId");
      if (!content || !content.trim()) return;
      setSending(true);

      try {
        // Try WS first
        if (clientRef.current && connected) {
          try {
            const jwt = "";
            const dest = `/app/org/${orgId}/group/${groupId}/send`;

            clientRef.current.publish({
              destination: dest,
              body: JSON.stringify({ content }),
              headers: {
                "content-type": "application/json",
                ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
              },
            });

            // optimistic UI: use currentUserName if available, otherwise "You"
            const optimistic: ChatMessage = {
              id: `tmp-${Date.now()}`,
              content,
              senderId: "me",
              senderName: currentUserName ?? "You",
              timestamp: new Date().toISOString(),
              type,
            };
            setMessages((prev) => [...prev, optimistic]);
            return optimistic;
          } catch (wsErr) {
            console.warn("WS send failed, falling back to REST", wsErr);
          }
        }

        // REST fallback
        const path =
          groupId === "UNIVERSAL"
            ? `/orgs/${orgId}/groups/UNIVERSAL/messages`
            : `/orgs/${orgId}/groups/${groupId}/messages`;

        const data = await apiFetch("POST", path, { body: { content } });
        const resData = data ?? data?.data ?? {};

        const msg: ChatMessage = {
          id: resData.id,
          content: resData.content,
          senderId: resData.senderId,
          senderName: resData.senderName || resData.senderId,
          timestamp: resData.createdAt || new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (m) => !m.id?.toString().startsWith("tmp-")
          );
          if (withoutOptimistic.find((m) => m.id === msg.id))
            return withoutOptimistic;
          return [...withoutOptimistic, msg];
        });

        return msg;
      } catch (error: any) {
        if (error?.status === 429) {
          throw new Error(
            "429 Too Many Requests: You are sending messages too quickly."
          );
        }
        if (error?.status === 403) {
          throw new Error(
            "403 Forbidden: You are not allowed to send messages in this chat."
          );
        }
        console.error("Failed to send message:", error);
        throw error;
      } finally {
        setSending(false);
      }
    },
    [orgId, groupId, connected, currentUserName]
  );

  const refreshMessages = useCallback(async () => {
    await fetchMessages(50);
  }, [fetchMessages]);

  // initialize / react to orgId/groupId changes
  useEffect(() => {
    setMessages([]);
    nextCursorRef.current = null;
    if (!orgId || !groupId) {
      teardownWebsocket();
      setLoading(false);
      return;
    }

    // load initial page, then setup WS
    let mounted = true;
    (async () => {
      try {
        await fetchMessages(50);
      } catch (e) {
        /* ignore */
      } finally {
        if (mounted) setupWebsocket();
      }
    })();

    return () => {
      mounted = false;
      teardownWebsocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, groupId]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      teardownWebsocket();
    };
  }, [teardownWebsocket]);

  return {
    messages,
    loading,
    sending,
    connected,
    sendMessage,
    refreshMessages,
    loadMore,
  };
}
