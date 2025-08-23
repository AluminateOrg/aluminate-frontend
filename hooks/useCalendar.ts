"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { set } from "date-fns";
import axiosCommon from "@/axiosInstances/axiosCommon";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  organizer: string;
  rsvpStatus?: "yes" | "no" | "maybe";
  attendeeCount: number;
  maxAttendees?: number;
  type:
    | "meeting"
    | "workshop"
    | "social"
    | "fundraising"
    | "networking"
    | "webinar";
}

export function useCalendar(orgId: string, groupId?: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/event/get/all`
      );
      console.log("Fetched events:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        const transformedEvents: CalendarEvent[] = response.data.data.map(
          (event: any) => ({
            id: event.id.toString(),
            title: event.title,
            description: event.description,
            // Combine date and time for frontend
            startDate: new Date(
              `${event.startDate}T${event.startTime}`
            ).toISOString(),
            endDate: new Date(
              `${event.endDate}T${event.endTime}`
            ).toISOString(),
            location: event.location,
            organizer: "Admin", // Default since backend doesn't provide this
            rsvpStatus: undefined, // Default - user hasn't RSVP'd yet
            attendeeCount: event.currentParticipants || 0,
            maxAttendees: event.maxParticipants,
            type: event.type.toLowerCase() as CalendarEvent["type"],
          })
        );

        console.log("Transformed events:", transformedEvents);
        setEvents(transformedEvents);
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, groupId]);

  const rsvpToEvent = async (
    eventId: string,
    status: "yes" | "no" | "maybe"
  ) => {
    try {
      // TODO: Replace with actual API call
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, rsvpStatus: status } : event
        )
      );
    } catch (error) {
      console.error("Failed to RSVP:", error);
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
