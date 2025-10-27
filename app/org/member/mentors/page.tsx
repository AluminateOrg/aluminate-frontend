"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import {
  Search,
  Filter,
  Heart,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  Users,
  Clock,
  BookOpen,
  UserPlus,
  CheckCircle,
  Award,
} from "lucide-react";
import axios from "axios";
import axiosMember from "@/axiosInstances/axiosMember";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock as ClockIcon } from "lucide-react";

export interface Mentor {
  id: string;
  applicantName: string; // used in AvatarFallback, headings
  applicantEmail?: string; // used elsewhere in some mentor components
  avatar?: string;
  designation: string;
  company: string;
  skills: string[]; // used in the Expertise section
  rating: number;
  totalSessions: number;
  yearsExperience: number;
  location: string;
  bio: string;
  availability: "available" | "busy" | "unavailable";
  hourlyRate?: number;
  languages: string[];
}

interface MentorApplicationForm {
  motivation: string;
  skills: string[];
  availability: string;
  preferredMenteeLevel: "beginner" | "intermediate" | "advanced" | "any";
  maxMentees: number;
  bio: string;
  yearsExperience: number;
  hourlyRate: string;
  languages: string[];
  linkedinUrl: string;
  portfolioUrl: string;
}

export default function MentorsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "available" | "top-rated" | "my-mentors"
  >("all");
  const [loading, setLoading] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [orgMembers, setOrgMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [connectMentorId, setConnectMentorId] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookMentorId, setBookMentorId] = useState<string | null>(null);
  const [requestedDate, setRequestedDate] = useState<string>("");
  const [requestedTime, setRequestedTime] = useState<string>("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isMentor, setIsMentor] = useState<boolean>(false);

  // Mentor application form state
  const [applicationForm, setApplicationForm] = useState<MentorApplicationForm>(
    {
      motivation: "",
      skills: [],
      availability: "",
      preferredMenteeLevel: "any",
      maxMentees: 3,
      bio: "",
      yearsExperience: 0,
      hourlyRate: "",
      languages: ["English"],
      linkedinUrl: "",
      portfolioUrl: "",
    }
  );

  // const handleBookSession = 

  const memberId = user?.id || "";

  const fetchMentors = async () => {
    try {

      const response = await axiosMember.get(`/mentor/get-mentor-details/${memberId}`);
      console.log("response: ", response);
      if (response.status === 200) {
        setMentors(response.data);
      } else {
        toast.error("Failed to load mentors. Please try again later.");
        console.log("Failed to fetch mentors:", response.statusText);
      }

    } catch (error) {
      console.log("Error fetching mentors:", error);
      toast.error("Failed to load mentors. Please try again later.");
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



  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      const mentor = await checkForMentor();
      if (!mentor) {
        await fetchMentors();
      } else {
        // ensure grid is empty when user is a mentor
        setMentors([]);
      }
    })();
  }, [user?.id])

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase());

    switch (selectedFilter) {
      case "available":
        return matchesSearch && mentor.availability === "available";
      case "top-rated":
        return matchesSearch && mentor.rating >= 4.8;
      case "my-mentors":
        // Mock: assume first mentor is connected
        return matchesSearch && mentor.id === "1";
      default:
        return matchesSearch;
    }
  });

  const handleBookSession = async (mentorId: string) => {
    console.log("Booking session for mentor:", mentorId);
    setLoading(true);
    try {
      const { data } = await axiosMember.post('/mentor/request-session', {
        mentorId,
        userId: [memberId],
        createdBy: memberId
      })
      console.log("data from booking session: ", data);
    } catch (error) {
      toast.error("Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMentor = async (mentorId: string) => {
    try {
      const { data } = await axiosMember.get(`/mentor/connect/get-all-members/${memberId}`);
      console.log("data from connected members: ", data);
      setOrgMembers(data.data);
      setConnectMentorId(mentorId);
      setShowConnectModal(true);
    } catch (error) {
      toast.error("Failed to send connection request. Please try again.");
    }
  };

  console.log("orgMembers: ", orgMembers);

  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSubmitConnect = async () => {
    if (!connectMentorId || selectedMembers.length === 0) {
      toast.error("Please select at least one member to connect.");
      return;
    }
    try {
      const { data } = await axiosMember.post('/mentor/request-session', {
        userId: selectedMembers,
        mentorId: connectMentorId
      })
      toast.success("Session booking request sent! The mentor will contact you soon.");
      setShowConnectModal(false);
      setSelectedMembers([]);
      setConnectMentorId(null);
    } catch (error) {
      toast.error("Failed to send connection request. Please try again.");
    }
  }

  const handleApplicationInputChange = (
    field: keyof MentorApplicationForm,
    value: any
  ) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleExpertiseAdd = (skill: string) => {
    if (skill.trim() && !applicationForm.skills.includes(skill.trim())) {
      setApplicationForm((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const handleExpertiseRemove = (skill: string) => {
    setApplicationForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleLanguageAdd = (language: string) => {
    if (
      language.trim() &&
      !applicationForm.languages.includes(language.trim())
    ) {
      setApplicationForm((prev) => ({
        ...prev,
        languages: [...prev.languages, language.trim()],
      }));
    }
  };



  const handleLanguageRemove = (language: string) => {
    if (applicationForm.languages.length > 1) {
      setApplicationForm((prev) => ({
        ...prev,
        languages: prev.languages.filter((l) => l !== language),
      }));
    }
  };

  console.log("Application Form State:", applicationForm);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user") || "{}");



    const payLoad = {
      ...applicationForm,
      memberId
    };

    console.log("payLoad: ", payLoad);
    console.log("memberID>>>", user.id);

    // Validation
    if (!applicationForm.motivation.trim()) {
      toast.error("Please provide your motivation for becoming a mentor");
      return;
    }

    if (applicationForm.skills.length === 0) {
      toast.error("Please add at least one area of expertise");
      return;
    }

    if (!applicationForm.bio.trim()) {
      toast.error("Please provide a bio describing your background");
      return;
    }

    if (applicationForm.yearsExperience < 1) {
      toast.error("Please specify your years of experience");
      return;
    }

    setApplicationLoading(true);

    try {

      const response = await axiosMember.post('/mentor/apply', payLoad);

      console.log("response when submitting application: ", response);

      const data = response.data;
      if (!data) {
        toast.error("Failed to submit application. Please try again.");
        return;
      }

      console.log("data: ", data);

      // Reset form and close modal
      setApplicationForm({
        motivation: "",
        skills: [],
        availability: "",
        preferredMenteeLevel: "any",
        maxMentees: 3,
        bio: "",
        yearsExperience: 0,
        hourlyRate: "",
        languages: ["English"],
        linkedinUrl: "",
        portfolioUrl: "",
      });

      setShowApplicationModal(false);
      toast.success(
        "Mentor application submitted successfully! We will review your application and get back to you within 3-5 business days."
      );
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setApplicationLoading(false);
    }
  };

  const resetApplicationForm = () => {
    setApplicationForm({
      motivation: "",
      skills: [],
      availability: "",
      preferredMenteeLevel: "any",
      maxMentees: 3,
      bio: "",
      yearsExperience: 0,
      hourlyRate: "",
      languages: ["English"],
      linkedinUrl: "",
      portfolioUrl: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mentors</h1>
          <p className="text-muted-foreground mt-1">
            Connect with experienced professionals to accelerate your career
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {mentors.length} Mentors Available
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
                placeholder="Search mentors by name, skills, or company..."
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
                  <TabsTrigger value="available">Available</TabsTrigger>
                  <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
                  <TabsTrigger value="my-mentors">My Mentors</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {mentors.filter((m) => m.availability === "available").length}
            </div>
            <p className="text-sm text-muted-foreground">Available Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {mentors.filter((m) => m.rating >= 4.8).length}
            </div>
            <p className="text-sm text-muted-foreground">Top Rated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">1</div>
            <p className="text-sm text-muted-foreground">My Mentors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-sm text-muted-foreground">Sessions Booked</p>
          </CardContent>
        </Card>
      </div>

      {/* Mentors Grid */}
      {isMentor ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">You are a mentor now</h3>
            <p className="text-muted-foreground">
              You can manage your mentees and sessions from your dashboard.
            </p>
          </CardContent>
        </Card>
      ) : filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="card-hover">
              {/* ...existing card content... */}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== "all"
                ? "Try adjusting your search or filters to find mentors."
                : "No mentors are currently available. Check back later!"}
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

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Select Members to Connect</CardTitle>
              <CardDescription>
                Choose organization members to join the session with this mentor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto mb-4">
                {orgMembers.length > 0 ? (
                  orgMembers.map((member: any) => (
                    <div key={member.id} className="flex items-center space-x-3 py-2 border-b">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={() => handleMemberSelect(member.id)}
                      />
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground text-xs">{member.email}</span>
                    </div>
                  ))
                ) : (
                  <p>No members found.</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitConnect} disabled={selectedMembers.length === 0}>
                  Book Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Become a Mentor Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Become a Mentor</span>
          </CardTitle>
          <CardDescription>
            Share your expertise and help fellow alumni grow their careers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">
                Why Become a Mentor?
              </h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Heart className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Give Back to Community
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Help fellow alumni achieve their career goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Build Your Network</p>
                    <p className="text-xs text-muted-foreground">
                      Connect with talented professionals across industries
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BookOpen className="h-3 w-3" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Develop Leadership Skills
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enhance your coaching and leadership abilities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>2+ years of professional experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Alumni of this organization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Commitment to help others grow</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Available for regular mentoring sessions</span>
                </div>
              </div>

              <Button
                onClick={() => setShowApplicationModal(true)}
                className="w-full mt-4"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Apply to Become a Mentor
              </Button>Book a
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>How Mentorship Works</span>
          </CardTitle>
          <CardDescription>
            Get the most out of your mentorship experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                1
              </div>
              <h4 className="font-medium">Find Your Mentor</h4>
              <p className="text-sm text-muted-foreground">
                Browse mentors by expertise, experience, and availability
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                2
              </div>
              <h4 className="font-medium">Book a Session</h4>
              <p className="text-sm text-muted-foreground">
                Schedule 1-on-1 sessions or connect for ongoing mentorship
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto font-bold">
                3
              </div>
              <h4 className="font-medium">Grow Your Career</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized guidance and accelerate your professional
                growth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Apply to Become a Mentor</span>
                  </CardTitle>
                  <CardDescription>
                    Share your expertise and help fellow alumni grow their
                    careers
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowApplicationModal(false);
                    resetApplicationForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Personal Information</h3>
                  <div className="bg-accent/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">Book a
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user?.avatar || undefined} alt={user?.name || undefined} />
                        <AvatarFallback>
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.designation}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Background */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Professional Background
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsExperience">
                        Years of Experience *
                      </Label>
                      <Input
                        id="yearsExperience"
                        type="number"
                        min="1"
                        max="50"
                        value={applicationForm.yearsExperience}
                        onChange={(e) =>
                          handleApplicationInputChange(
                            "yearsExperience",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="5"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          id="hourlyRate"
                          type="number"
                          min="0"
                          step="5"
                          value={applicationForm.hourlyRate}
                          onChange={(e) =>
                            handleApplicationInputChange(
                              "hourlyRate",
                              e.target.value
                            )
                          }
                          placeholder="75"
                          className="pl-8"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty if you prefer to mentor for free
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      value={applicationForm.bio}
                      onChange={(e) =>
                        handleApplicationInputChange("bio", e.target.value)
                      }
                      placeholder="Tell us about your professional background, achievements, and what makes you a great mentor..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Areas of Expertise */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Areas of Expertise *</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill (e.g., React, Leadership, Product Management)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleExpertiseAdd(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          handleExpertiseAdd(input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {applicationForm.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {applicationForm.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleExpertiseRemove(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentoring Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Mentoring Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredMenteeLevel">
                        Preferred Mentee Level
                      </Label>
                      <select
                        id="preferredMenteeLevel"
                        value={applicationForm.preferredMenteeLevel}
                        onChange={(e) =>
                          handleApplicationInputChange(
                            "preferredMenteeLevel",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">
                          Intermediate (2-5 years)
                        </option>
                        <option value="advanced">Advanced (5+ years)</option>
                        <option value="any">Any Level</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxMentees">Maximum Mentees</Label>
                      <Input
                        id="maxMentees"
                        type="number"
                        min="1"
                        max="10"
                        value={applicationForm.maxMentees}
                        onChange={(e) =>
                          handleApplicationInputChange(
                            "maxMentees",
                            parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability *</Label>
                    <Textarea
                      id="availability"
                      value={applicationForm.availability}
                      onChange={(e) =>
                        handleApplicationInputChange(
                          "availability",
                          e.target.value
                        )
                      }
                      placeholder="Describe your availability (e.g., Weekends, Evenings PST, Flexible schedule)"
                      rows={2}
                      required
                    />
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Languages</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a language (e.g., Spanish, Mandarin)"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleLanguageAdd(e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          handleLanguageAdd(input.value);
                          input.value = "";
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {applicationForm.languages.map((language) => (
                        <Badge
                          key={language}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {language}
                          {applicationForm.languages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleLanguageRemove(language)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Professional Links (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={applicationForm.linkedinUrl}
                        onChange={(e) =>
                          handleApplicationInputChange(
                            "linkedinUrl",
                            e.target.value
                          )
                        }
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio/Website</Label>
                      <Input
                        id="portfolioUrl"
                        type="url"
                        value={applicationForm.portfolioUrl}
                        onChange={(e) =>
                          handleApplicationInputChange(
                            "portfolioUrl",
                            e.target.value
                          )
                        }
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Motivation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Motivation</h3>
                  <div className="space-y-2">
                    <Label htmlFor="motivation">
                      Why do you want to become a mentor? *
                    </Label>
                    <Textarea
                      id="motivation"
                      value={applicationForm.motivation}
                      onChange={(e) =>
                        handleApplicationInputChange(
                          "motivation",
                          e.target.value
                        )
                      }
                      placeholder="Share your motivation for becoming a mentor and how you plan to help mentees..."
                      rows={4}
                      required
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowApplicationModal(false);
                      resetApplicationForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetApplicationForm}
                  >
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={applicationLoading}>
                    {applicationLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
