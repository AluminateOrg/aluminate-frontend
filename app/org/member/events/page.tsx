// pages/events/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCalendar } from '@/hooks/useCalendar';
import { EventCard } from '@/components/molecules/EventCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar, Search, Filter, Clock, MapPin
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

export default function EventsPage() {
  const { user } = useAuth();
  const { events, loading, rsvpToEvent } = useCalendar(user?.orgId || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'past' | 'attending'>('all');

  const handleRSVP = async (eventId: string, status: 'yes' | 'no' | 'maybe') => {
    try {
      await rsvpToEvent(eventId, status);
    } catch (error) {
      toast.error('Failed to update RSVP. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const eventDate = new Date(event.startDate);

    switch (selectedFilter) {
      case 'upcoming': return matchesSearch && isAfter(eventDate, now);
      case 'past': return matchesSearch && isBefore(eventDate, now);
      case 'attending': return matchesSearch && event.rsvpStatus === 'yes';
      default: return matchesSearch;
    }
  });

  const upcomingEvents = events.filter(e => isAfter(new Date(e.startDate), new Date()));
  const pastEvents = events.filter(e => isBefore(new Date(e.startDate), new Date()));
  const attendingEvents = events.filter(e => e.rsvpStatus === 'yes');

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and join events in your organization</p>
        </div>
        <Badge variant="outline">
          <Calendar className="h-3 w-3 mr-1" />
          {events.length} Total Events
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs value={selectedFilter} onValueChange={v => setSelectedFilter(v as any)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="attending">Attending</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{upcomingEvents.length}</div><p>Upcoming Events</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{attendingEvents.length}</div><p>Events Attending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><div className="text-2xl font-bold">{pastEvents.length}</div><p>Past Events</p></CardContent></Card>
      </div>

      {/* Events List */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onRSVP={handleRSVP} showRSVP={true} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Events Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No events are currently scheduled.'}
            </p>
            {(searchTerm || selectedFilter !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedFilter('all');
              }} className="mt-4">Clear Filters</Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Next Event */}
      {upcomingEvents.length > 0 && selectedFilter === 'all' && !searchTerm && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>Next Event</span>
            </CardTitle>
            <CardDescription>Don't miss out on the upcoming event</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{upcomingEvents[0].title}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(upcomingEvents[0].startDate), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(upcomingEvents[0].startDate), 'h:mm a')}</span>
                  </div>
                  {upcomingEvents[0].location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{upcomingEvents[0].location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <Button
                  variant={upcomingEvents[0].rsvpStatus === 'yes' ? 'default' : 'outline'}
                  onClick={() => handleRSVP(upcomingEvents[0].id, 'yes')}
                >
                  {upcomingEvents[0].rsvpStatus === 'yes' ? 'Going' : 'RSVP'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
