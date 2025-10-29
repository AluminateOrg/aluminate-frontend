"use client";

import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useCalendar } from "@/hooks/useCalendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  MessageSquare,
  Heart,
  DollarSign,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { format, set } from "date-fns";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { usePaymentContext } from "@/contexts/paymentContext";
import React, { useEffect, useState } from "react";
import axiosMember from "@/axiosInstances/axiosMember";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function MemberDashboard() {
  const { user } = useAuth();
  const { payByPayhere } = usePaymentContext();
  const { organization, groups, loading: orgLoading } = useOrg();
  const { events, loading: eventsLoading } = useCalendar(user?.id || "");
  const [sessions, setSessions] = useState<any[]>([]);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [form, setForm] = useState({ programUrl: "", date: "", time: "" });
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [isMentor, setIsMentor] = useState<boolean>(false);

  const handleAcceptClick = (sessions: any) => {
    setSelectedSession(sessions);
    setAcceptModalOpen(true);
    setForm({ programUrl: "", date: "", time: "" });
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  console.log("form data", form);
  console.log("selected session", selectedSession);

  const handleAcceptSubmit = async () => {
    setAcceptLoading(true);
    try {
      const { data } = await axiosMember.post(`/mentor/accept-session/${selectedSession.id}`, {
        programUrl: form.programUrl,
        date: form.date,
        time: form.time
      })
      console.log("response after accepting session", data);
      toast.success(data.message);
      setAcceptModalOpen(false);
      fetchSessions();
    } catch (error) {
      toast.error("Error accepting session. Please try again.");
    } finally {
      setAcceptLoading(false);
    }
  }

  const checkForMentor = async (): Promise<boolean> => {
    try {
      const { data } = await axiosMember.get(`/mentor/is-mentor/${user?.id}`);
      const mentorFlag = Boolean(data?.data);
      setIsMentor(mentorFlag);
      return mentorFlag;
    } catch (error) {
      // fallback to user's current flag if available
      const fallback = Boolean(user?.isMentor);
      setIsMentor(fallback);
      return fallback;
    }
  }

  const fetchSessions = async (mentorOverride?: boolean) => {
    try {
      const mentorFlag = mentorOverride ?? isMentor ?? Boolean(user?.isMentor);
      if (mentorFlag) {
        const { data } = await axiosMember.get(`/mentor/get-all-sessions/${user?.id}`);
        setSessions(data);
        console.log("fetched mentor sessions", data);
      } else {
        const { data } = await axiosMember.get(`/mentor/get-all-sessions-by-user/${user?.id}`);
        console.log("fetched mentee sessions", data);
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions: ", error);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const init = async () => {
      const mentor = await checkForMentor();
      await fetchSessions(mentor);

      interval = setInterval(() => {
        fetchSessions(mentor);
      }, 10000);
    };

    init();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id])

  const loading = eventsLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log("groups", groups);

  const upcomingEvents = events.slice(0, 3);
  const recentGroups = Array.isArray(groups) && groups.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user?.avatar ?? undefined}
              alt={user?.name ?? undefined}
            />
            <AvatarFallback className="text-lg">
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || "User"}!
            </h1>

            <p className="text-muted-foreground">
              {user?.designation} at {organization?.organizationName}
            </p>
            {user?.joinedAt && (
              <Badge variant="secondary" className="mt-1">
                Member since {format(new Date(user.joinedAt), "MMM yyyy")}
              </Badge>
            )}
            {isMentor && (
              <Badge variant="outline" className="mt-1 ml-2 text-green-700 border-green-700">
                Mentor
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Groups Joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Events Attended</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Mentors Connected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">LKR 150</div>
            <p className="text-sm text-muted-foreground">Total Donated</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events you might be interested in
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/org/member/events">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center min-w-[48px]">
                      <div className="text-xs font-medium">
                        {format(new Date(event.startDate), "MMM")}
                      </div>
                      <div className="text-lg font-bold">
                        {format(new Date(event.startDate), "d")}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {event.title}
                      </h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(event.startDate), "h:mm a")}
                        {event.location && (
                          <>
                            <MapPin className="h-3 w-3 ml-2 mr-1" />
                            {event.location}
                          </>
                        )}
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Groups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Groups</CardTitle>
              <CardDescription>Groups you're part of</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/org/member/groups">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <div className="space-y-3">
                {Array.isArray(recentGroups) &&
                  recentGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                          {group.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">
                            {group.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {group.currentMembers} members
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mentor Sessions Section */}
      {isMentor && (
        <Card>
          <CardHeader>
            <CardTitle>Hired Sessions</CardTitle>
            <CardDescription>Review and accept your session requests</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{session.menteeName}</h4>
                        <p className="text-sm text-muted-foreground">{session.menteeEmail}</p>
                      </div>
                      <Badge variant={session.status === "PENDING" ? "outline" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span> {session.sessionDuration}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Requested:</span> {format(new Date(session.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                    {session.programUrl && (
                      <div className="text-sm">
                        <span className="font-medium">Program URL:</span> <a href={session.programUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{session.programUrl}</a>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      {session.status === "PENDING" && (
                        <Button size="sm" onClick={() => handleAcceptClick(session)}>
                          Accept & Set Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!isMentor && (
        <Card>
          <CardHeader>
            <CardTitle>My Booked Sessions</CardTitle>
            <CardDescription>Sessions you have requested with mentors</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-muted-foreground">No sessions found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{session.mentorName}</h4>
                        <p className="text-sm text-muted-foreground">{session.sessionDuration}</p>
                      </div>
                      <Badge variant={session.status === "PENDING" ? "outline" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Requested:</span> {format(new Date(session.createdAt), "MMM d, yyyy h:mm a")}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Date:</span> {session.date ? format(new Date(session.date), "MMM d, yyyy") : "-"}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Time:</span> {session.time || "-"}
                    </div>
                    {/* Show programUrl only if scheduled and paid */}
                    {session.status === "SCHEDULED" && (
                      <div className="mt-2">
                        {!session.paid && session.createdBy == user?.id ? (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Program URL:</span> <span className="italic">Pay mentor fee to reveal</span>
                            <Button
                              className="ml-2"
                              size="sm"
                              onClick={() => payByPayhere("MENTORSHIP", parseFloat(session?.hourly_rate),"Mentor Program Payment",session?.menteeName,session?.menteeEmail,session?.mentorName, `${session?.id}`,session?.menteeEmail, `${window.location.origin}/org/member`, `${window.location.origin}/org/member`)}
                            >
                              Pay Now
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-medium">Program URL:</span>{" "}
                            <a
                              href={session.programUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline"
                            >
                              {session.programUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accept Session Modal */}
      <Dialog open={acceptModalOpen} onOpenChange={setAcceptModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="programUrl">Program URL</Label>
              <Input
                id="programUrl"
                name="programUrl"
                placeholder="Google Meet/Zoom link"
                value={form.programUrl}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptSubmit} disabled={acceptLoading}>
              {acceptLoading ? "Accepting..." : "Accept Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link href="/org/member/groups">
                <Users className="h-6 w-6 mb-2" />
                Join Groups
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link href="/org/member/events">
                <Calendar className="h-6 w-6 mb-2" />
                Browse Events
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link href="/org/member/mentors">
                <Heart className="h-6 w-6 mb-2" />
                Find Mentors
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col" asChild>
              <Link href="/org/member/donations">
                <DollarSign className="h-6 w-6 mb-2" />
                Make Donation
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

  );

}
