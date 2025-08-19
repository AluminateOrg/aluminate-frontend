'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  Eye,
  Send,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Share,
  Settings,
} from "lucide-react";
import { format, addDays, addHours } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { DeleteConfirmationModal } from "./delete-confirmation";
import axiosAdmin from "@/axiosInstances/axiosAdmin";

interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  type:
    | "meeting"
    | "workshop"
    | "social"
    | "fundraising"
    | "networking"
    | "webinar";
  maxAttendees: number;
  registrationDeadline?: string;
  isPublic: boolean;
  requiresApproval: boolean;
  status: "draft" | "published" | "cancelled" | "completed";
  currentAttendees: number;
  createdAt: string;
  price?: number;
}

interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  type: Event['type'];
  maxAttendees: string;
  currentAttendees?: string;
  registrationDeadline: string;
  isPublic: boolean;
  requiresApproval: boolean;
  price: string;
}

export default function AdminEventsPage() {
  const { user } = useAuth();
  const { organization } = useOrg();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Event['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Event['type']>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Event form state
  const [eventForm, setEventForm] = useState<EventFormData>({
    title: '',
    description: '',
    startDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    startTime: '10:00',
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    endTime: '12:00',
    location: '',
    type: 'meeting',
    maxAttendees: '',
    registrationDeadline: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    isPublic: true,
    requiresApproval: false,
    price: "",
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: "",
    eventTitle: "",
    isDeleting: false,
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosAdmin.get("/event/get/all");

      if (response.status != 200) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.data;

      // Transform the backend response to match your Event interface
      const transformedEvents: Event[] =
        data.data?.map((event: any) => ({
          id: event.id.toString(),
          title: event.title,
          description: event.description,
          startDate: new Date(
            `${event.startDate}T${event.startTime}`
          ).toISOString(),
          endDate: new Date(`${event.endDate}T${event.endTime}`).toISOString(),
          location: event.location,
          type: event.type.toLowerCase() as Event["type"],
          maxAttendees: event.maxParticipants || 0,
          currentAttendees: event.currentParticipants || 0,
          registrationDeadline: event.registrationDeadline
            ? new Date(event.registrationDeadline).toISOString()
            : undefined,
          // isPublic: event.public,
          requiresApproval: event.requiresApproval,
          status: (event.status?.toLowerCase() as Event["status"]) || "draft",
          // createdAt: event.createdAt || new Date().toISOString(),
          price: event.price || undefined,
        })) || [];

      console.log(transformedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setEventForm({
      title: "",
      description: "",
      startDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      startTime: "10:00",
      endDate: format(addDays(new Date(), 7), "yyyy-MM-dd"),
      endTime: "12:00",
      location: "",
      type: "meeting",
      maxAttendees: "",
      registrationDeadline: format(addDays(new Date(), 5), "yyyy-MM-dd"),
      isPublic: true,
      requiresApproval: false,
      price: "",
    });
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!eventForm.title || !eventForm.description || !eventForm.location) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }

      // Combine date and time
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
      const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime}`);

      if (endDateTime <= startDateTime) {
        toast.error("End date/time must be after start date/time");
        setLoading(false);
        return;
      }

      // Prepare the API request payload to match your backend
      const requestPayload = {
        title: eventForm.title,
        description: eventForm.description,
        type: eventForm.type.toUpperCase(), // Convert to uppercase for backend
        location: eventForm.location,
        startDate: eventForm.startDate, // Send as separate date
        startTime: eventForm.startTime + ":00", // Add seconds for backend format
        endDate: eventForm.endDate,
        endTime: eventForm.endTime + ":00", // Add seconds for backend format
        maxParticipants: eventForm.maxAttendees
          ? parseInt(eventForm.maxAttendees)
          : null,
        registrationDeadline: eventForm.registrationDeadline || null,
        price: eventForm.price ? parseFloat(eventForm.price) : null,
        public: eventForm.isPublic,
        requiresApproval: eventForm.requiresApproval,
      };

      try {
        const response = await axiosAdmin.post("/event/create", requestPayload);

        if (response.status != 200) {
          throw new Error("Failed to create event");
        }

        await fetchEvents();

        if (response.status != 200) {
          const errorData = await response.data.catch(() => ({}));
          throw new Error("Failed to create event");
        }

        await response.data;

        await fetchEvents();

        setShowCreateForm(false);
        resetForm();
        toast.success("Event created successfully!");
      } catch (error) {
        console.error("Error creating event:", error);
        toast.error("Failed to create event. Please try again.");
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("error: ", error);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string | boolean) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const publishEvent = async (eventId: string) => {
    try {
      setLoading(true);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, status: "published" as const }
            : event
        )
      );

      const response = await axiosAdmin.put(`/event/${eventId}/publish`);

      if (response.status != 200) {
        const errorData = await response.data.catch(() => ({}));
        throw new Error(errorData.message || "Failed to publish event");
      }

      const responseData = await response.data;

      // Update the event with the response data, handling case conversion
      if (responseData.data) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  // Transform the backend response to match frontend interface
                  id: responseData.data.id.toString(),
                  title: responseData.data.title,
                  description: responseData.data.description,
                  startDate: new Date(
                    `${responseData.data.startDate}T${responseData.data.startTime}`
                  ).toISOString(),
                  endDate: new Date(
                    `${responseData.data.endDate}T${responseData.data.endTime}`
                  ).toISOString(),
                  location: responseData.data.location,
                  type: responseData.data.type.toLowerCase() as Event["type"], // Convert to lowercase
                  maxAttendees: responseData.data.maxParticipants || 0,
                  currentAttendees: responseData.data.currentParticipants || 0,
                  registrationDeadline: responseData.data.registrationDeadline
                    ? new Date(
                        responseData.data.registrationDeadline + "T23:59:59"
                      ).toISOString()
                    : undefined,
                  status:
                    responseData.data.status.toLowerCase() as Event["status"], // Convert to lowercase
                  price: responseData.data.price || undefined,
                  // Keep existing frontend-only fields
                  isPublic: event.isPublic,
                  requiresApproval: event.requiresApproval,
                  createdAt: event.createdAt,
                }
              : event
          )
        );
      }

      toast.success("Event published successfully!");
    } catch (error) {
      console.error("Error publishing event:", error);

      // Revert optimistic update on error
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status: "draft" as const } : event
        )
      );

      toast.error(
        error instanceof Error ? error.message : "Failed to publish event"
      );
    } finally {
      setLoading(false);
    }
  };

  const cancelEvent = async (eventId: string) => {
    try {
      setLoading(true);

      // Update local state optimistically
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, status: "cancelled" as const }
            : event
        )
      );

      const response = await axiosAdmin.put(`/event/${eventId}/cancel`);

      if (response.status != 200) {
        const errorData = await response.data.catch(() => ({}));
        throw new Error(errorData.message || "Failed to cancel event");
      }

      const responseData = await response.data;

      // Update the event with the response data, handling case conversion
      if (responseData.data) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  // Transform the backend response to match frontend interface
                  id: responseData.data.id.toString(),
                  title: responseData.data.title,
                  description: responseData.data.description,
                  startDate: new Date(
                    `${responseData.data.startDate}T${responseData.data.startTime}`
                  ).toISOString(),
                  endDate: new Date(
                    `${responseData.data.endDate}T${responseData.data.endTime}`
                  ).toISOString(),
                  location: responseData.data.location,
                  type: responseData.data.type.toLowerCase() as Event["type"], // Convert to lowercase
                  maxAttendees: responseData.data.maxParticipants || 0,
                  currentAttendees: responseData.data.currentParticipants || 0,
                  registrationDeadline: responseData.data.registrationDeadline
                    ? new Date(
                        responseData.data.registrationDeadline + "T23:59:59"
                      ).toISOString()
                    : undefined,
                  status:
                    responseData.data.status.toLowerCase() as Event["status"], // Convert to lowercase
                  price: responseData.data.price || undefined,
                  // Keep existing frontend-only fields
                  isPublic: event.isPublic,
                  requiresApproval: event.requiresApproval,
                  createdAt: event.createdAt,
                }
              : event
          )
        );
      }

      toast.success("Event cancelled successfully");
    } catch (error) {
      console.error("Error cancelling event:", error);

      // Revert optimistic update on error
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, status: "published" as const }
            : event
        )
      );

      toast.error(
        error instanceof Error ? error.message : "Failed to cancel event"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update the delete button click handler
  const handleDeleteClick = (eventId: string, eventTitle: string) => {
    setDeleteModal({
      isOpen: true,
      eventId,
      eventTitle,
      isDeleting: false,
    });
  };

  // Updated delete function
  const deleteEvent = async () => {
    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      // Remove from local state optimistically
      const eventToDelete = deleteModal.eventId;
      setEvents((prev) => prev.filter((event) => event.id !== eventToDelete));

      // Make API call to delete the event
      const response = await axiosAdmin.delete(
        `/event/${eventToDelete}/delete`
      );

      if (response.status != 200) {
        const errorData = await response.data.catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete event");
      }

      const responseData = await response.data;

      toast.success("Event deleted successfully");
      setDeleteModal({
        isOpen: false,
        eventId: "",
        eventTitle: "",
        isDeleting: false,
      });
    } catch (error) {
      console.error("Error deleting event:", error);

      // Revert optimistic update on error
      await fetchEvents();

      toast.error(
        error instanceof Error ? error.message : "Failed to delete event"
      );
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        eventId: "",
        eventTitle: "",
        isDeleting: false,
      });
    }
  };

  // const duplicateEvent = async (event: Event) => {
  //   try {
  //     const duplicatedEvent: Event = {
  //       ...event,
  //       id: Date.now().toString(),
  //       title: `${event.title} (Copy)`,
  //       status: "draft",
  //       startDate: addDays(new Date(event.startDate), 7).toISOString(),
  //       endDate: addDays(new Date(event.endDate), 7).toISOString(),
  //       createdAt: new Date().toISOString(),
  //       currentAttendees: 0,
  //     };

  //     setEvents((prev) => [duplicatedEvent, ...prev]);
  //     toast.success("Event duplicated successfully!");
  //   } catch (error) {
  //     toast.error("Failed to duplicate event");
  //   }
  // };

  const exportAttendees = async (eventId: string) => {
    try {
      // TODO: Replace with actual API call
      const csvContent = `Name,Email,Status,Registration Date
John Doe,john@example.com,Confirmed,2024-01-15
Jane Smith,jane@example.com,Confirmed,2024-01-16`;
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${eventId}-attendees.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Attendee list exported successfully!');
    } catch (error) {
      toast.error('Failed to export attendee list');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const eventStats = {
    total: events.length,
    published: events.filter((e) => e.status === "published").length,
    draft: events.filter((e) => e.status === "draft").length,
    totalAttendees: events.reduce((sum, e) => sum + e.currentAttendees, 0),
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'networking': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'workshop': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'social': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      case 'fundraising': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'webinar': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Event Management</h1>
          <p className="text-muted-foreground">Create and manage organization events</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Calendar className="h-3 w-3 mr-1" />
            {eventStats.total} Total Events
          </Badge>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{eventStats.total}</div>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{eventStats.published}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{eventStats.draft}</div>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{eventStats.totalAttendees}</div>
            <p className="text-sm text-muted-foreground">Total Attendees</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Event Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Create Event Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create New Event</span>
                </CardTitle>
                <CardDescription>
                  Fill in the details to create a new event for your organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="title">Event Title *</Label>
                        <Input
                          id="title"
                          value={eventForm.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Annual Alumni Networking Event"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={eventForm.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe your event..."
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="type">Event Type</Label>
                        <select
                          id="type"
                          value={eventForm.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        >
                          <option value="meeting">Meeting</option>
                          <option value="workshop">Workshop</option>
                          <option value="social">Social</option>
                          <option value="fundraising">Fundraising</option>
                          <option value="networking">Networking</option>
                          <option value="webinar">Webinar</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={eventForm.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="Conference Center or Online"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date and Time */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Date & Time</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={eventForm.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={eventForm.startTime}
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={eventForm.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={eventForm.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Registration Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Registration Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxAttendees">Max Attendees</Label>
                        <Input
                          id="maxAttendees"
                          type="number"
                          value={eventForm.maxAttendees}
                          onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                          placeholder="Leave empty for unlimited"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                        <Input
                          id="registrationDeadline"
                          type="date"
                          value={eventForm.registrationDeadline}
                          onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (Optional)</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={eventForm.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="0.00"
                            className="flex-1"
                          />
                          {/* <select
                            value={eventForm.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                          </select> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Additional Settings</h3>
                    <div className="space-y-4">
                      {/* <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          value={eventForm.tags}
                          onChange={(e) => handleInputChange('tags', e.target.value)}
                          placeholder="networking, professional, annual"
                        />
                      </div> */}

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isPublic"
                            checked={eventForm.isPublic}
                            onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="isPublic">Public Event</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="requiresApproval"
                            checked={eventForm.requiresApproval}
                            onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="requiresApproval">Requires Approval</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      Clear Form
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Event
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>All Events</span>
              </CardTitle>
              <CardDescription>
                Manage all your organization events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="all">All Types</option>
                    <option value="meeting">Meeting</option>
                    <option value="workshop">Workshop</option>
                    <option value="social">Social</option>
                    <option value="fundraising">Fundraising</option>
                    <option value="networking">Networking</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
              </div>

              {/* Events Grid */}
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-6 hover:bg-accent transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{event.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1">{event.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                            <Badge className={getTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(event.startDate), 'h:mm a')} - 
                              {format(new Date(event.endDate), 'h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{event.currentAttendees} registered</span>
                              {event.maxAttendees && (
                                <span className="text-muted-foreground">/ {event.maxAttendees} max</span>
                              )}
                            </div>
                            {event.price && (
                              <div className="text-primary font-medium">
                                LKR {event.price}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {event.status === 'draft' && (
                              <Button
                                size="sm"
                                onClick={() => publishEvent(event.id)}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            )}
                            
                            {event.status === 'published' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => exportAttendees(event.id)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => cancelEvent(event.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            )}

                            {/* <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => duplicateEvent(event)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button> */}

                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteClick(event.id, event.title)
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {event.currentAttendees > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Registration Progress</span>
                              <span>
                                {event.currentAttendees}
                                {event.maxAttendees &&
                                  ` / ${event.maxAttendees}`}
                              </span>
                            </div>
                            <Progress
                              value={
                                event.maxAttendees
                                  ? (event.currentAttendees /
                                      event.maxAttendees) *
                                    100
                                  : 0
                              }
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'Create your first event to get started.'}
                  </p>
                  {!showCreateForm && (
                    <Button 
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Analytics</CardTitle>
              <CardDescription>
                Insights and metrics for your events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed event analytics and reporting features will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteEvent}
        eventName={deleteModal.eventTitle} // Change prop name from groupName to eventName
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
}