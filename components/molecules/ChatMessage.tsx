'use client';

import { ChatMessage as ChatMessageType } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn?: boolean;
}

export function ChatMessage({ message, isOwn = false }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3 mb-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.senderAvatar} alt={message.senderName} />
        <AvatarFallback className="text-xs">
          {message.senderName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn("flex flex-col space-y-1", isOwn ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {isOwn ? 'You' : message.senderName}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>
        </div>
        
        <div className={cn(
          "chat-message max-w-sm",
          isOwn ? "own" : "other"
        )}>
          {message.content}
        </div>
      </div>
    </div>
  );
}