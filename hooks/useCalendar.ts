'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  rsvpStatus?: 'yes' | 'no' | 'maybe';
  attendeeCount: number;
  maxAttendees?: number;
  type: 'meeting' | 'workshop' | 'social' | 'fundraising';
}

export function useCalendar(orgId: string, groupId?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Alumni Networking Event',
          description: 'Annual networking event for all alumni',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
          location: 'Conference Center',
          organizer: 'Admin Team',
          attendeeCount: 45,
          maxAttendees: 100,
          type: 'social',
        },
        {
          id: '2',
          title: 'Tech Workshop: AI Trends',
          description: 'Workshop on latest AI and ML trends',
          startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          location: 'Online',
          organizer: 'Tech Committee',
          attendeeCount: 23,
          maxAttendees: 50,
          type: 'workshop',
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  }, [orgId, groupId]);

  const rsvpToEvent = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    try {
      // TODO: Replace with actual API call
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, rsvpStatus: status }
            : event
        )
      );
    } catch (error) {
      console.error('Failed to RSVP:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    rsvpToEvent,
    refreshEvents: fetchEvents,
  };
}