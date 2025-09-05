"use client";

import { ChatMessage as ChatMessageType } from "@/hooks/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn?: boolean;
}

export function ChatMessage({ message, isOwn = false }: ChatMessageProps) {
  // compute display name: prefer senderName, fallback to senderId
  const rawName = message.senderName ?? message.senderId ?? "";
  // numeric-only name detection (e.g. "1", "2") -> treat as Admin
  const isNumericName = /^[0-9]+$/.test(String(rawName).trim());
  const displayName = isOwn
    ? "You"
    : isNumericName
    ? "Admin"
    : rawName || "Unknown";

  // Avatar initials from displayName (take up to 2 initials)
  const initials =
    displayName
      .split(" ")
      .map((n) => n[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  return (
    <div
      className={cn("flex gap-3 mb-4", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.senderAvatar} alt={displayName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col space-y-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), "HH:mm")}
          </span>
        </div>

        <div
          className={cn(
            "chat-message inline-block max-w-[100%] break-words px-3 py-2 rounded-lg",
            isOwn
              ? "bg-primary text-primary-foreground self-end"
              : "bg-border text-foreground"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
