'use client';

import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { useCalendar } from '@/hooks/useCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Calendar,
    MessageSquare,
    Heart,
    DollarSign,
    ArrowRight,
    Clock,
    MapPin
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export default function MemberDashboard() {
    const { user } = useAuth();
    const { organization, groups, loading: orgLoading } = useOrg();
    const { events, loading: eventsLoading } = useCalendar(user?.orgId || '');

    const loading = orgLoading || eventsLoading;

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

    const upcomingEvents = events.slice(0, 3);
    const recentGroups = groups.slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="text-lg">
                            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Welcome back, {user?.name || 'User'}!
                        </h1>
                        <p className="text-muted-foreground">
                            {user?.designation} at {organization?.name}
                        </p>
                        {user?.joinedAt && (
                            <Badge variant="secondary" className="mt-1">
                                Member since {format(new Date(user.joinedAt), 'MMM yyyy')}
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
                        <div className="text-2xl font-bold">$150</div>
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
                            <CardDescription>Events you might be interested in</CardDescription>
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
                                    <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
                                        <div className="bg-primary text-primary-foreground rounded-lg p-2 text-center min-w-[48px]">
                                            <div className="text-xs font-medium">
                                                {format(new Date(event.startDate), 'MMM')}
                                            </div>
                                            <div className="text-lg font-bold">
                                                {format(new Date(event.startDate), 'd')}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-foreground">{event.title}</h4>
                                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {format(new Date(event.startDate), 'h:mm a')}
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
                        {orgLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <LoadingSpinner size="md" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentGroups.map((group) => (
                                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                                                {group.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-foreground">{group.name}</h4>
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