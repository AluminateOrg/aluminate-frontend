// hooks/useCalendar.ts
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  status: string;
  rsvpStatus?: 'yes' | 'no' | 'maybe';
  currentAttendees: number;
  maxAttendees: number;
  price?: number;
  registrationDeadline?: string;
}

export const useCalendar = (orgId: string) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await axios.get(`${backendUrl}/api/v1/portal/event/get/all`);

      const rawEvents = res.data.data;

      const transformed = rawEvents.map((event: any): Event => ({
        id: event.id.toString(),
        title: event.title,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        type: event.type.toLowerCase(),
        status: event.status.toLowerCase(),
        rsvpStatus: event.rsvpStatus,
        currentAttendees: event.currentParticipants || 0,
        maxAttendees: event.maxParticipants || 0,
        price: event.price || undefined,
        registrationDeadline: event.registrationDeadline || undefined,
      }));

      setEvents(transformed);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId) fetchEvents();
  }, [orgId]);

  const rsvpToEvent = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    try {
      await axios.post(`/api/event/${eventId}/rsvp`, { status });
      toast.success('RSVP updated successfully');
      fetchEvents(); // Refresh after RSVP
    } catch (err) {
      console.error('RSVP failed', err);
      toast.error('Could not update RSVP');
    }
  };

  return { events, loading, rsvpToEvent };
};
