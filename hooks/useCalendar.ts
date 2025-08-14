"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  rsvpStatus?: "yes" | "no" | "maybe";
  attendeeCount: number;
  maxAttendees?: number;
  type: "meeting" | "workshop" | "social" | "fundraising" | "networking" | "webinar";
}

export const useCalendar = (orgId: string) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/event/get/all`
      );

      if (response.data && Array.isArray(response.data.data)) {
        const transformedEvents: CalendarEvent[] = response.data.data.map((event: any) => ({
          id: String(event.id),
          title: event.title,
          description: event.description,
          startDate: new Date(`${event.startDate}T${event.startTime}`).toISOString(),
          endDate: new Date(`${event.endDate}T${event.endTime}`).toISOString(),
          location: event.location,
          organizer: "Admin",
          rsvpStatus: undefined,
          attendeeCount: event.currentParticipants || 0,
          maxAttendees: event.maxParticipants,
          type: String(event.type).toLowerCase() as CalendarEvent["type"],
        }));

        setEvents(transformedEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []); // <-- important

  useEffect(() => {
    if (!orgId) return;
    fetchEvents();
  }, [orgId, fetchEvents]); // single effect is enough

  const rsvpToEvent = async (eventId: string, status: "yes" | "no" | "maybe") => {
    try {
      // TODO: replace with real API call
      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? { ...event, rsvpStatus: status } : event))
      );
    } catch (error) {
      console.error("Failed to RSVP:", error);
      throw error;
    }
  };

  return {
    events,
    loading,
    rsvpToEvent,
    refreshEvents: fetchEvents,
  };
};
