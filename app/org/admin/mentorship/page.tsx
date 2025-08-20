"use client";

import {
  PromiseLikeOfReactNode,
  ReactElement,
  JSXElementConstructor,
  Key,
  ReactNode,
  useEffect,
  useState,
} from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  UserCheck,
  UserX,
  Award,
  TrendingUp,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import axios from "axios";

interface MentorApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  currentPosition: string;
  company: string;
  yearsExperience: number;
  expertise: string[];
  bio: string;
  motivation: string;
  availability: string;
  preferredMenteeLevel: "beginner" | "intermediate" | "advanced" | "any";
  maxMentees: number;
  status: "pending" | "approved" | "rejected";
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  skills: string[];
  approved?: boolean;
}

interface Mentor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  designation: string;
  company: string;
  expertise: string[];
  rating: number;
  totalSessions: number;
  activeMentees: number;
  maxMentees: number;
  yearsExperience: number;
  joinedAt: string;
  applicantName?: string;
  status: "active" | "inactive" | "suspended";
  approved?: boolean;
  currentPosition?: string;
  applicantEmail?: string;
  skills?: string[];
  applicantId?: string;
}

interface MentorshipSession {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  topic?: string;
}

export default function AdminMentorshipPage() {
  const { user } = useAuth();
  const { organization } = useOrg();
  const [activeTab, setActiveTab] = useState("applications");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | MentorApplication["status"]
  >("all");
  const [selectedApplication, setSelectedApplication] =
    useState<MentorApplication | null>(null);

  // Mock data for mentor applications
  const [applications, setApplications] = useState<MentorApplication[]>([]);

  const fetchApplications = async () => {
    setLoading(true);
    console.log("fetch applications called");
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/user/mentor/get-all-unapproved`
      );
      setApplications(data);
      if (data.length === 0) {
        toast.info("No mentor applications found.");
      }
      console.log("Applications fetched successfully:", data);
    } catch (error) {
      console.log("error fetching applications:", error);
      toast.error("Failed to fetch mentor applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/user/mentor/get-all-approved`
      );
      const data = response.data;
      if (!data || data.length === 0) toast.error("No mentors found.");
      console.log("Mentors fetched successfully:", data);
      setMentors(data);
    } catch (error) {
      console.log("error fetching mentors:", error);
      toast.error("Failed to fetch mentors. Please try again.");
    }
  };

  useEffect(() => {
    fetchApplications();
    fetchMentors();
  }, []);

  useEffect(() => {
    const fetchData = setInterval(() => {
      fetchApplications();
      fetchMentors();
    }, 500000);
    return () => clearInterval(fetchData);
  }, []);

  const [mentors, setMentors] = useState<Mentor[]>([]);

  // Mock data for mentorship sessions
  const [sessions, setSessions] = useState<MentorshipSession[]>([
    {
      id: "session-1",
      mentorId: "mentor-1",
      mentorName: "Mario Silva",
      menteeId: "mentee-1",
      menteeName: "Kamal Perera",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 60,
      status: "scheduled",
      topic: "Career transition to data science",
    },
    {
      id: "session-2",
      mentorId: "mentor-1",
      mentorName: "Sheane Mario",
      menteeId: "mentee-2",
      menteeName: "Nimal Fernando",
      scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 45,
      status: "completed",
      topic: "Machine learning project review",
    },
  ]);

  const handleApplicationAction = async (
    applicationId: string,
    action: "approve" | "reject",
    notes?: string
  ) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/user/mentor/approve`,
        {
          applicationId,
          action,
        }
      );

      console.log("Application action response:", data);

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.id,
                reviewNotes: notes || `Application ${action}d by admin`,
              }
            : app
        )
      );

      // If approved, add to mentors list
      if (action === "approve") {
        const application = applications.find(
          (app) => app.id === applicationId
        );
        if (application) {
          const newMentor: Mentor = {
            id: `mentor-${Date.now()}`,
            name: application.applicantName,
            email: application.applicantEmail,
            avatar: application.applicantAvatar,
            designation: application.currentPosition,
            company: application.company,
            expertise: application.expertise,
            rating: 0,
            totalSessions: 0,
            activeMentees: 0,
            maxMentees: application.maxMentees,
            yearsExperience: application.yearsExperience,
            joinedAt: new Date().toISOString(),
            status: "active",
          };
          setMentors((prev) => [newMentor, ...prev]);
        }
      }

      toast.success(`Application ${action}d successfully!`);
      setSelectedApplication(null);
    } catch (error) {
      toast.error(`Failed to ${action} application. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorStatusChange = async (
    mentorId: string,
    newStatus: Mentor["status"]
  ) => {
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${process.env.NEXT_PUBLIC_API_PREFIX}/user/mentor/dis-approve`,
        {
          mentorId,
          newStatus,
        }
      );
      console.log("Mentor status change response:", data);
      if (data.success) {
        toast.success(`Mentor status updated to ${newStatus}`);
        return;
      } else {
        toast.error("Failed to update mentor status");
        return;
      }
      setMentors((prev) =>
        prev.map((mentor) =>
          mentor.id === mentorId ? { ...mentor, status: newStatus } : mentor
        )
      );
    } catch (error) {
      toast.error("Failed to update mentor status");
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter((app) => app.status === "pending")
      .length,
    activeMentors: mentors.filter((mentor) => mentor.status === "active")
      .length,
    totalSessions: sessions.length,
    completedSessions: sessions.filter(
      (session) => session.status === "completed"
    ).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Mentorship Management
          </h1>
          <p className="text-muted-foreground">
            Manage mentor applications and the mentorship program
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Heart className="h-3 w-3 mr-1" />
            {stats.activeMentors} Active Mentors
          </Badge>
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {stats.pendingApplications} Pending
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {stats.totalApplications}
            </div>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingApplications}
            </div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeMentors}
            </div>
            <p className="text-sm text-muted-foreground">Active Mentors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSessions}
            </div>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.completedSessions}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="mentors">Active Mentors</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-6">
          {/* Applications Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Mentor Applications</span>
              </CardTitle>
              <CardDescription>
                Review and manage mentor applications from members
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex space-x-1">
                    {[
                      { value: "all", label: "All" },
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={
                          statusFilter === filter.value ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setStatusFilter(filter.value as any)}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={application.applicantAvatar}
                            alt={application.applicantName}
                          />
                          <AvatarFallback>
                            {application.applicantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">
                              {application.applicantName}
                            </h4>
                            <Badge
                              variant={
                                application.status === "approved"
                                  ? "default"
                                  : application.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {application.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{application.applicantEmail}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-3 w-3" />
                              <span>
                                {application.currentPosition} at{" "}
                                {application.company}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="h-3 w-3" />
                              <span>
                                {application.yearsExperience} years experience
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>Max {application.maxMentees} mentees</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {application.skills
                              .slice(0, 3)
                              .map((skill: string) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            {application.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{application.skills.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Applied{" "}
                            {format(
                              new Date(application.appliedAt),
                              "MMM d, yyyy"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>

                        {application.approved === false && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleApplicationAction(
                                  application.id,
                                  "approve"
                                )
                              }
                              disabled={loading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleApplicationAction(
                                  application.id,
                                  "reject"
                                )
                              }
                              disabled={loading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Applications Found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filters."
                      : "No mentor applications have been submitted yet."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors" className="space-y-6">
          {/* Active Mentors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Active Mentors</span>
              </CardTitle>
              <CardDescription>
                Manage your organization&#39;s mentor network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={mentor.avatar} alt={mentor.name} />
                          {/* <AvatarFallback>
                            {mentor.applicantName[0]}
                          </AvatarFallback> */}
                          <AvatarFallback className="text-lg">
                            {(mentor.applicantName || "Unknown User")
                              .split(" ")
                              .map((n: any) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">
                              {mentor.applicantName}
                            </h4>
                            <Badge
                              variant={
                                mentor.approved === true
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {mentor.approved === true ? "Active" : "Inactive"}
                            </Badge>
                            {mentor.rating > 0 && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">
                                  {mentor.rating}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Briefcase className="h-3 w-3" />
                              <span>{mentor.currentPosition}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>
                                {mentor.activeMentees}/{mentor.maxMentees}{" "}
                                mentees
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{mentor.totalSessions} sessions</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{mentor.applicantEmail}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {mentor.skills?.map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Contact
                        </Button>

                        {mentor.approved === true ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleMentorStatusChange(
                                mentor.applicantId || "",
                                "inactive"
                              )
                            }
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleMentorStatusChange(
                                mentor.applicantId || "",
                                "active"
                              )
                            }
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {mentors.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Active Mentors
                  </h3>
                  <p className="text-muted-foreground">
                    Approve mentor applications to build your mentor network.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {/* Mentorship Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Mentorship Sessions</span>
              </CardTitle>
              <CardDescription>
                Overview of all mentorship sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">
                            {session.mentorName} → {session.menteeName}
                          </h4>
                          <Badge
                            variant={
                              session.status === "completed"
                                ? "default"
                                : session.status === "scheduled"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {session.status}
                          </Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(
                                new Date(session.scheduledAt),
                                "MMM d, yyyy"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{session.duration} minutes</span>
                          </div>
                          {session.topic && (
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{session.topic}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sessions.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Sessions Yet
                  </h3>
                  <p className="text-muted-foreground">
                    Mentorship sessions will appear here once mentors start
                    connecting with mentees.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Mentorship Analytics</span>
              </CardTitle>
              <CardDescription>
                Insights into your mentorship program performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Analytics Coming Soon
                </h3>
                <p className="text-muted-foreground">
                  Detailed mentorship analytics and reporting features will be
                  available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review Application</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedApplication(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Applicant Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedApplication.applicantAvatar}
                    alt={selectedApplication.applicantName}
                  />
                  <AvatarFallback className="text-lg">
                    {selectedApplication.applicantName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">
                    {selectedApplication.applicantName}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedApplication.currentPosition} at{" "}
                    {selectedApplication.company}
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>
                      {selectedApplication.yearsExperience} years experience
                    </span>
                    <span>Max {selectedApplication.maxMentees} mentees</span>
                    <span>
                      Prefers {selectedApplication.preferredMenteeLevel} level
                    </span>
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h4 className="font-medium mb-2">Areas of Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h4 className="font-medium mb-2">Professional Bio</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.bio}
                </p>
              </div>

              {/* Motivation */}
              <div>
                <h4 className="font-medium mb-2">Motivation for Mentoring</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.motivation}
                </p>
              </div>

              {/* Availability */}
              <div>
                <h4 className="font-medium mb-2">Availability</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedApplication.availability}
                </p>
              </div>

              {/* Actions */}
              {selectedApplication.status === "pending" && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() =>
                      handleApplicationAction(selectedApplication.id, "approve")
                    }
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Application
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleApplicationAction(selectedApplication.id, "reject")
                    }
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject Application
                  </Button>
                </div>
              )}

              {selectedApplication.status !== "pending" && (
                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {selectedApplication.status === "approved"
                        ? "Approved"
                        : "Rejected"}{" "}
                      on{" "}
                      {selectedApplication.reviewedAt &&
                        format(
                          new Date(selectedApplication.reviewedAt),
                          "MMM d, yyyy"
                        )}
                    </span>
                  </div>
                  {selectedApplication.reviewNotes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Notes:</strong> {selectedApplication.reviewNotes}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
