'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface Mentor {
  id: string;
  name: string;
  avatar?: string;
  designation: string;
  company: string;
  expertise: string[];
  rating: number;
  totalSessions: number;
  yearsExperience: number;
  location: string;
  bio: string;
  availability: 'available' | 'busy' | 'unavailable';
  hourlyRate?: number;
  languages: string[];
}

export default function MentorsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available' | 'top-rated' | 'my-mentors'>('all');
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  const mentors: Mentor[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      designation: 'Senior Software Engineer',
      company: 'Google',
      expertise: ['React', 'Node.js', 'System Design', 'Career Growth'],
      rating: 4.9,
      totalSessions: 156,
      yearsExperience: 8,
      location: 'San Francisco, CA',
      bio: 'Passionate about helping junior developers grow their careers in tech. Specialized in full-stack development and system architecture.',
      availability: 'available',
      hourlyRate: 75,
      languages: ['English', 'Spanish'],
    },
    {
      id: '2',
      name: 'Michael Chen',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      designation: 'Product Manager',
      company: 'Microsoft',
      expertise: ['Product Strategy', 'User Research', 'Agile', 'Leadership'],
      rating: 4.8,
      totalSessions: 89,
      yearsExperience: 6,
      location: 'Seattle, WA',
      bio: 'Former engineer turned product manager. Love helping others transition into product roles and develop strategic thinking.',
      availability: 'available',
      hourlyRate: 85,
      languages: ['English', 'Mandarin'],
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      designation: 'Data Science Director',
      company: 'Netflix',
      expertise: ['Machine Learning', 'Python', 'Data Analytics', 'Team Management'],
      rating: 4.9,
      totalSessions: 203,
      yearsExperience: 10,
      location: 'Los Angeles, CA',
      bio: 'Leading data science teams for 5+ years. Passionate about democratizing AI and helping others break into data science.',
      availability: 'busy',
      hourlyRate: 95,
      languages: ['English', 'Spanish'],
    },
    {
      id: '4',
      name: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      designation: 'Startup Founder',
      company: 'TechStart Inc.',
      expertise: ['Entrepreneurship', 'Fundraising', 'Business Strategy', 'Networking'],
      rating: 4.7,
      totalSessions: 67,
      yearsExperience: 12,
      location: 'Austin, TX',
      bio: 'Serial entrepreneur with 2 successful exits. Mentoring aspiring founders and helping with business development.',
      availability: 'available',
      hourlyRate: 120,
      languages: ['English', 'Korean'],
    },
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case 'available':
        return matchesSearch && mentor.availability === 'available';
      case 'top-rated':
        return matchesSearch && mentor.rating >= 4.8;
      case 'my-mentors':
        // Mock: assume first mentor is connected
        return matchesSearch && mentor.id === '1';
      default:
        return matchesSearch;
    }
  });

  const handleBookSession = async (mentorId: string) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Session booking request sent! The mentor will contact you soon.');
    } catch (error) {
      toast.error('Failed to book session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectMentor = async (mentorId: string) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Connection request sent to mentor!');
    } catch (error) {
      toast.error('Failed to send connection request. Please try again.');
    }
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
              <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
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
            <div className="text-2xl font-bold text-primary">{mentors.filter(m => m.availability === 'available').length}</div>
            <p className="text-sm text-muted-foreground">Available Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mentors.filter(m => m.rating >= 4.8).length}</div>
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
      {filteredMentors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="card-hover">
              <CardHeader className="pb-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback className="text-lg">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground truncate">{mentor.name}</h3>
                      <Badge 
                        variant={mentor.availability === 'available' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {mentor.availability}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{mentor.designation}</p>
                    <p className="text-sm font-medium text-primary">{mentor.company}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1">{mentor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({mentor.totalSessions} sessions)
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Expertise</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.expertise.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mentor.expertise.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{mentor.yearsExperience}+ years</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{mentor.location}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mentor.bio}
                </p>

                {mentor.hourlyRate && (
                  <div className="text-center py-2 bg-accent rounded-lg">
                    <span className="text-lg font-bold text-primary">${mentor.hourlyRate}</span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleBookSession(mentor.id)}
                    disabled={loading || mentor.availability === 'unavailable'}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Book Session
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConnectMentor(mentor.id)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Mentors Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters to find mentors.'
                : 'No mentors are currently available. Check back later!'}
            </p>
            {(searchTerm || selectedFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* How It Works Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>How Mentorship Works</span>
          </CardTitle>
          <CardDescription>Get the most out of your mentorship experience</CardDescription>
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
                Get personalized guidance and accelerate your professional growth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}