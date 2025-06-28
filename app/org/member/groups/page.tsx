'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOrg } from '@/hooks/useOrg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  MessageSquare, 
  UserPlus,
  Filter,
  Clock,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

export default function GroupsPage() {
  const { user } = useAuth();
  const { groups, loading } = useOrg();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'joined' | 'available'>('all');

  const handleJoinGroup = async (groupId: string) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Successfully joined the group!');
    } catch (error) {
      toast.error('Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      // TODO: Replace with actual API call
      toast.success('Successfully left the group.');
    } catch (error) {
      toast.error('Failed to leave group. Please try again.');
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (selectedFilter) {
      case 'joined':
        // TODO: Check if user is member of group
        return matchesSearch;
      case 'available':
        // TODO: Check if user can join group
        return matchesSearch && group.currentMembers < group.maxMembers;
      default:
        return matchesSearch;
    }
  });

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
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Connect with like-minded alumni in specialized groups
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <Users className="h-3 w-3 mr-1" />
            {groups.length} Groups Available
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
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex space-x-1">
                {[
                  { value: 'all', label: 'All Groups' },
                  { value: 'joined', label: 'My Groups' },
                  { value: 'available', label: 'Available' },
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={selectedFilter === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFilter(filter.value as any)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">5</div>
            <p className="text-sm text-muted-foreground">Groups Joined</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">12</div>
            <p className="text-sm text-muted-foreground">Total Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-sm text-muted-foreground">Groups Created</p>
          </CardContent>
        </Card>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onJoin={handleJoinGroup}
              onLeave={handleLeaveGroup}
              currentUserId={user?.id || ''}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Groups Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedFilter !== 'all' 
                ? 'Try adjusting your search or filters to find groups.'
                : 'No groups are currently available. Check back later!'}
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

      {/* Featured Groups Section */}
      {selectedFilter === 'all' && !searchTerm && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Popular Groups</span>
            </CardTitle>
            <CardDescription>Most active groups in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.slice(0, 2).map((group) => (
                <div key={group.id} className="flex items-center space-x-3 p-3 rounded-lg bg-background/50">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
                    {group.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{group.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {group.currentMembers} members • Very active
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Join
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface GroupCardProps {
  group: any;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
  currentUserId: string;
}

function GroupCard({ group, onJoin, onLeave, currentUserId }: GroupCardProps) {
  const [isJoined, setIsJoined] = useState(false); // TODO: Get from actual membership data
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (isJoined) {
        await onLeave(group.id);
        setIsJoined(false);
      } else {
        await onJoin(group.id);
        setIsJoined(true);
      }
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setLoading(false);
    }
  };

  const isFull = group.currentMembers >= group.maxMembers;
  const canJoin = !isJoined && !isFull;

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-medium">
              {group.name.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-lg">{group.name}</CardTitle>
              <CardDescription className="mt-1">
                {group.description || 'No description available'}
              </CardDescription>
            </div>
          </div>
          {isJoined && (
            <Badge variant="default">
              Joined
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {group.currentMembers} / {group.maxMembers} members
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Active</span>
          </div>
        </div>

        {/* Member Avatars Preview */}
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, group.currentMembers))].map((_, i) => (
              <Avatar key={i} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={`https://images.pexels.com/photos/${220453 + i}/pexels-photo-${220453 + i}.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&dpr=1`} />
                <AvatarFallback className="text-xs">M{i + 1}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {group.currentMembers > 3 && (
            <span className="text-xs text-muted-foreground">
              +{group.currentMembers - 3} more
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {isJoined ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAction}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Leave Group'}
              </Button>
              <Button size="sm" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={handleAction}
              disabled={loading || !canJoin}
              className="flex-1"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : isFull ? (
                'Group Full'
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Join Group
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}