"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/molecules/ChatMessage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { cn } from "@/lib/utils";

export default function AdminChatPage() {
  const { user } = useAuth();
  const { organization } = useOrg();
  const orgId = organization?.id ?? "";
  const groupId = "UNIVERSAL";

  const [newMessage, setNewMessage] = useState("");

  // connect to universal chat as admin; pass current user name for optimistic UI
  const { messages, loading, sending, sendMessage } = useChat(
    orgId,
    groupId,
    user?.name ?? undefined
  );

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto h-[600px] flex flex-col">
        <CardHeader className="flex items-center justify-between border-b">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5" />
            <CardTitle>Organization Chat (Universal)</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">Admin view</div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages area */}
          <div className="flex-1">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <LoadingSpinner size="lg" />
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex w-full",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "inline-block max-w-[70%] break-words",
                            isOwn ? "text-right" : "text-left"
                          )}
                        >
                          <ChatMessage message={message} isOwn={isOwn} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSend} className="flex space-x-2">
              <Input
                placeholder="Send message to Organization (UNIVERSAL)..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={sending || !newMessage.trim()}
                size="sm"
              >
                {sending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
