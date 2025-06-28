'use client';

import { CalendarEvent } from '@/hooks/useCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: CalendarEvent;
  onRSVP?: (eventId: string, status: 'yes' | 'no' | 'maybe') => void;
  showRSVP?: boolean;
}

export function EventCard({ event, onRSVP, showRSVP = true }: EventCardProps) {
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{event.description}</p>
          </div>
          <Badge variant={event.rsvpStatus === 'yes' ? 'default' : 'outline'}>
            {event.type}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(eventDate, 'MMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(eventDate, 'h:mm a')} - {format(eventEndDate, 'h:mm a')}
            </span>
          </div>
          
          {event.location && (
            <>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            </>
          )}
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {event.attendeeCount} attending
              {event.maxAttendees && ` / ${event.maxAttendees} max`}
            </span>
          </div>
        </div>

        {showRSVP && onRSVP && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant={event.rsvpStatus === 'yes' ? 'default' : 'outline'}
              onClick={() => onRSVP(event.id, 'yes')}
              className="flex-1"
            >
              Going
            </Button>
            <Button
              size="sm"
              variant={event.rsvpStatus === 'maybe' ? 'default' : 'outline'}
              onClick={() => onRSVP(event.id, 'maybe')}
              className="flex-1"
            >
              Maybe
            </Button>
            <Button
              size="sm"
              variant={event.rsvpStatus === 'no' ? 'default' : 'outline'}
              onClick={() => onRSVP(event.id, 'no')}
              className="flex-1"
            >
              Can't Go
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}