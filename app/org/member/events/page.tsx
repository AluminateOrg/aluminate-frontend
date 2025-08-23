"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCalendar } from "@/hooks/useCalendar";
import { EventCard } from "@/components/molecules/EventCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search, Filter, Clock, MapPin, Users } from "lucide-react";
import { format, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { toast } from "sonner";

export default function EventsPage() {
  const { user } = useAuth();
  const { events, loading, rsvpToEvent } = useCalendar(user?.id || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "upcoming" | "past" | "attending"
  >("all");

  const handleRSVP = async (
    eventId: string,
    status: "yes" | "no" | "maybe"
  ) => {
    try {
      await rsvpToEvent(eventId, status);
      toast.success(
        `RSVP updated to "${
          status === "yes"
            ? "Going"
            : status === "maybe"
            ? "Maybe"
            : "Not Going"
        }"`
      );
    } catch (error) {
      toast.error("Failed to update RSVP. Please try again.");
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const eventDate = new Date(event.startDate);

    switch (selectedFilter) {
      case "upcoming":
        return matchesSearch && isAfter(eventDate, now);
      case "past":
        return matchesSearch && isBefore(eventDate, now);
      case "attending":
        return matchesSearch && event.rsvpStatus === "yes";
      default:
        return matchesSearch;
    }
  });

  const upcomingEvents = events.filter((event) =>
    isAfter(new Date(event.startDate), new Date())
  );
  const pastEvents = events.filter((event) =>
    isBefore(new Date(event.startDate), new Date())
  );
  const attendingEvents = events.filter((event) => event.rsvpStatus === "yes");

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground mt-1">
            Discover and join events in your organization
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            {events.length} Total Events
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Tabs
                value={selectedFilter}
                onValueChange={(value) => setSelectedFilter(value as any)}
              >
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
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {upcomingEvents.length}
            </div>
            <p className="text-sm text-muted-foreground">Upcoming Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {attendingEvents.length}
            </div>
            <p className="text-sm text-muted-foreground">Events Attending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {pastEvents.length}
            </div>
            <p className="text-sm text-muted-foreground">Past Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onRSVP={handleRSVP}
              showRSVP={true}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filters to find events."
                : "No events are currently scheduled. Check back later!"}
            </p>
            {(searchTerm || selectedFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedFilter("all");
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Featured Upcoming Event */}
      {upcomingEvents.length > 0 && selectedFilter === "all" && !searchTerm && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Next Event</span>
            </CardTitle>
            <CardDescription>
              Don't miss out on the upcoming event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {upcomingEvents[0].title}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(
                        new Date(upcomingEvents[0].startDate),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(upcomingEvents[0].startDate), "h:mm a")}
                    </span>
                  </div>
                  {upcomingEvents[0].location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{upcomingEvents[0].location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <Button
                  variant={
                    upcomingEvents[0].rsvpStatus === "yes"
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleRSVP(upcomingEvents[0].id, "yes")}
                >
                  {upcomingEvents[0].rsvpStatus === "yes" ? "Going" : "RSVP"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
