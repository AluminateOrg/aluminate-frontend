"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/components/molecules/ChatMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Users,
  MessageSquare,
  ArrowLeft,
  Search,
  Hash,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { cn } from "@/lib/utils";

type ChatType = "organization" | "group";

interface ChatRoom {
  id: string;
  name: string;
  type: ChatType;
  memberCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function MemberChatPage() {
  const { user } = useAuth();
  const { groups, organization } = useOrg(); // <-- use organization
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pass organization id, selected room id and current user's display name
  const { messages, loading, sending, sendMessage } = useChat(
    organization?.id || "",
    selectedRoom?.id ?? undefined,
    user?.name ?? undefined
  );

  // Create chat rooms list
  const organizationRoom: ChatRoom = {
    id: "UNIVERSAL", // <-- backend expects UNIVERSAL for org-wide chat
    name: "Organization Chat",
    type: "organization",
    memberCount: organization?.currentMemberCount ?? 0,
    lastMessage: "Welcome to the organization chat!",
    lastMessageTime: "2 hours ago",
    unreadCount: 3,
  };

  const groupRooms: ChatRoom[] = Array.isArray(groups)
    ? groups.map((group) => ({
        id: group.id,
        name: group.name,
        type: "group" as ChatType,
        memberCount: group.currentMembers,
        lastMessage: "Latest group discussion...",
        lastMessageTime: "1 hour ago",
        unreadCount: Math.floor(Math.random() * 5),
      }))
    : [];

  const allRooms = [organizationRoom, ...groupRooms];

  const filteredRooms = allRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="text-muted-foreground">
          Connect with your organization and groups
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Room Selection Sidebar */}
        <div
          className={cn(
            "lg:col-span-1",
            selectedRoom ? "hidden lg:block" : "block"
          )}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Conversations</span>
              </CardTitle>
              <CardDescription>
                Select a chat room to start messaging
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Search */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Room List */}
              <ScrollArea className="flex-1">
                <div className="space-y-1 px-3 pb-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => handleRoomSelect(room)}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent",
                        selectedRoom?.id === room.id && "bg-accent"
                      )}
                    >
                      <div className="relative">
                        {room.type === "organization" ? (
                          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center font-medium">
                            <Hash className="h-5 w-5" />
                          </div>
                        )}
                        {room.unreadCount && room.unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                          >
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">
                            {room.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {room.lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground truncate">
                            {room.lastMessage}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{room.memberCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div
          className={cn(
            "lg:col-span-2",
            !selectedRoom ? "hidden lg:block" : "block"
          )}
        >
          {selectedRoom ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToRooms}
                    className="lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center space-x-3">
                    {selectedRoom.type === "organization" ? (
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center font-medium">
                        <Hash className="h-5 w-5" />
                      </div>
                    )}

                    <div>
                      <CardTitle className="text-lg">
                        {selectedRoom.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedRoom.memberCount} members
                        {selectedRoom.type === "organization"
                          ? " • Organization-wide chat"
                          : " • Group chat"}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ChatContent
                  messages={messages}
                  loading={loading}
                  currentUserId={user?.id || ""}
                />

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${selectedRoom.name}...`}
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
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Select a Conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a chat room from the sidebar to start messaging
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChatContentProps {
  messages: any[];
  loading: boolean;
  currentUserId: string;
}

function ChatContent({ messages, loading, currentUserId }: ChatContentProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No messages yet</p>
          <p className="text-xs text-muted-foreground">
            Be the first to start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 px-6">
      <div className="space-y-4 py-4">
        {messages.map((message) => {
          const isOwn = message.senderId == currentUserId;
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
                  // ensure the message container shrinks to content so justify-end works
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
  );
}
