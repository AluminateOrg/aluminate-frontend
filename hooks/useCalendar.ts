"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { set } from "date-fns";
import axiosCommon from "@/axiosInstances/axiosCommon";
import axiosMember from "@/axiosInstances/axiosMember";
import { useAuth } from "./useAuth";

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
  status: "cancelled" | "published" | "draft";
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
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      // fetch general events
      const eventsPromise = axiosCommon.get("/event/get/all");

      // fetch member attendances (backend must provide this endpoint)
      const attendancesPromise =
        user?.id && orgId
          ? axiosCommon.get(`/event/attendance-status/${user.id}`)
          : Promise.resolve({ data: [] });

      const [eventsRes, attendRes] = await Promise.all([
        eventsPromise,
        attendancesPromise,
      ]);

      const eventsData = eventsRes.data?.data ?? eventsRes.data ?? [];
      const attendList = attendRes.data?.data ?? attendRes.data ?? [];

      // build a map of eventId -> status for quick lookup
      const attendMap = new Map<string, CalendarEvent["rsvpStatus"]>();
      Array.isArray(attendList) &&
        attendList.forEach((a: any) => {
          // adapt to your backend shape: a.eventId / a.status
          if (a?.eventId != null) {
            let status: CalendarEvent["rsvpStatus"];
            if (a?.attending === true) status = "yes";
            else status = "no";
            attendMap.set(String(a.eventId), status);
          }
        });

      const transformed: CalendarEvent[] = (
        Array.isArray(eventsData) ? eventsData : []
      ).map((e: any) => ({
        id: String(e.id),
        title: e.title,
        description: e.description,
        startDate: new Date(
          `${e.startDate}T${e.startTime ?? "00:00"}`
        ).toISOString(),
        endDate: new Date(
          `${e.endDate ?? e.startDate}T${e.endTime ?? "23:59"}`
        ).toISOString(),
        location: e.location,
        organizer: e.organizer ?? "Admin",
        rsvpStatus: attendMap.get(String(e.id)) ?? undefined,
        attendeeCount: e.currentParticipants ?? e.attendeeCount ?? 0,
        maxAttendees: e.maxParticipants ?? e.maxAttendees,
        type: (e.type.toLowerCase() ?? "meeting") as CalendarEvent["type"],
        status: (e.status.toLowerCase() ??
          "published") as CalendarEvent["status"],
      }));
      console.log(transformed);

      setEvents(transformed);
    } catch (error) {
      console.error("Failed to fetch events or attendances", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, groupId, user?.id]);

  const rsvpToEvent = async (
    eventId: string,
    status: "yes" | "no" | "maybe"
  ) => {
    try {
      if (status === "yes") {
        const response = await axiosMember.post(
          `/event/${eventId}/attend/${user!.id!}`
        );
        // Update local state with backend response
        const updatedEvent = response.data;
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  rsvpStatus: "yes",
                  attendeeCount: updatedEvent.currentParticipants,
                }
              : event
          )
        );
      } else if (status === "no") {
        const response = await axiosMember.put(
          `/event/${eventId}/unattend/${user?.id}`
        );
        const updatedParticipants =
          response.data?.data?.currentParticipants ??
          response.data?.currentParticipants ??
          null;

        setEvents((prev) =>
          prev.map((event) => {
            if (event.id !== eventId) return event;
            const wasYes = event.rsvpStatus === "yes";
            const newCount =
              updatedParticipants ??
              Math.max(0, event.attendeeCount - (wasYes ? 1 : 0));
            // set to "no" or undefined depending on how you want to represent it
            return {
              ...event,
              rsvpStatus: "no",
              attendeeCount: newCount,
            };
          })
        );
      }
      // Handle "maybe" if your backend supports it
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
