"use client";

import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  type: "text" | "image" | "file";
}

export function useChat(orgId: string, groupId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Simulate fetching messages
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockMessages: ChatMessage[] = [
        {
          id: "1",
          content: "Welcome to the group chat! 👋",
          senderId: "admin-1",
          senderName: "Admin User",
          senderAvatar:
            "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: "text",
        },
        {
          id: "2",
          content: "Thanks for setting this up!",
          senderId: "member-1",
          senderName: "Shane Mario",
          senderAvatar:
            "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: "text",
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, groupId]);

  const sendMessage = async (
    content: string,
    type: "text" | "image" | "file" = "text"
  ) => {
    setSending(true);
    try {
      // TODO: Replace with actual API call
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        senderId: "current-user",
        senderName: "You",
        timestamp: new Date().toISOString(),
        type,
      };

      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    sending,
    sendMessage,
    refreshMessages: fetchMessages,
  };
}
