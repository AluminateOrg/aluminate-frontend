'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  DollarSign, 
  Target, 
  Users, 
  Calendar,
  TrendingUp,
  Gift,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  endDate: string;
  category: 'scholarship' | 'infrastructure' | 'emergency' | 'general';
  donorCount: number;
  isActive: boolean;
}

interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  isAnonymous: boolean;
}

export default function DonationsPage() {
  const { user } = useAuth();
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API calls
  const campaigns: Campaign[] = [
    {
      id: '1',
      title: 'Student Scholarship Fund',
      description: 'Supporting deserving students with financial assistance for their education',
      goal: 50000,
      raised: 32500,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'scholarship',
      donorCount: 145,
      isActive: true,
    },
    {
      id: '2',
      title: 'Campus Infrastructure Upgrade',
      description: 'Modernizing campus facilities and technology infrastructure',
      goal: 100000,
      raised: 67800,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'infrastructure',
      donorCount: 89,
      isActive: true,
    },
    {
      id: '3',
      title: 'Emergency Relief Fund',
      description: 'Providing immediate assistance to alumni and students in crisis',
      goal: 25000,
      raised: 18200,
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'emergency',
      donorCount: 67,
      isActive: true,
    },
  ];

  const myDonations: Donation[] = [
    {
      id: '1',
      campaignId: '1',
      campaignTitle: 'Student Scholarship Fund',
      amount: 100,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: false,
    },
    {
      id: '2',
      campaignId: '2',
      campaignTitle: 'Campus Infrastructure Upgrade',
      amount: 50,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      isAnonymous: true,
    },
  ];

  const totalDonated = myDonations.reduce((sum, donation) => sum + donation.amount, 0);

  const handleDonate = async (campaignId: string, amount: number) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Thank you for your $${amount} donation!`);
      setDonationAmount('');
      setSelectedCampaign('');
    } catch (error) {
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: Campaign['category']) => {
    switch (category) {
      case 'scholarship':
        return <Award className="h-4 w-4" />;
      case 'infrastructure':
        return <Target className="h-4 w-4" />;
      case 'emergency':
        return <Heart className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: Campaign['category']) => {
    switch (category) {
      case 'scholarship':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'infrastructure':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Donations</h1>
          <p className="text-muted-foreground mt-1">
            Support causes that matter to our community
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Badge variant="outline">
            <DollarSign className="h-3 w-3 mr-1" />
            ${totalDonated} Total Donated
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">${totalDonated}</div>
            <p className="text-sm text-muted-foreground">Your Total Donations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{myDonations.length}</div>
            <p className="text-sm text-muted-foreground">Campaigns Supported</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{campaigns.length}</div>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaigns">Active Campaigns</TabsTrigger>
          <TabsTrigger value="history">My Donations</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Active Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const progressPercentage = (campaign.raised / campaign.goal) * 100;
              const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={campaign.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <CardDescription>{campaign.description}</CardDescription>
                      </div>
                      <Badge className={getCategoryColor(campaign.category)}>
                        {getCategoryIcon(campaign.category)}
                        <span className="ml-1 capitalize">{campaign.category}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round(progressPercentage)}% funded</span>
                        <span>{daysLeft} days left</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{campaign.donorCount} donors</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Ends {format(new Date(campaign.endDate), 'MMM d')}</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount ($)"
                          value={selectedCampaign === campaign.id ? donationAmount : ''}
                          onChange={(e) => {
                            setSelectedCampaign(campaign.id);
                            setDonationAmount(e.target.value);
                          }}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleDonate(campaign.id, Number(donationAmount))}
                          disabled={loading || !donationAmount || Number(donationAmount) <= 0}
                          className="px-6"
                        >
                          {loading && selectedCampaign === campaign.id ? 'Processing...' : 'Donate'}
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        {[25, 50, 100, 250].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCampaign(campaign.id);
                              setDonationAmount(amount.toString());
                            }}
                            className="flex-1"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Your Donation History</CardTitle>
              <CardDescription>Track your contributions to various campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {myDonations.length > 0 ? (
                <div className="space-y-4">
                  {myDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="space-y-1">
                        <h4 className="font-medium">{donation.campaignTitle}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(donation.date), 'MMM d, yyyy')}
                          {donation.isAnonymous && ' • Anonymous donation'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          ${donation.amount}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Thank you!
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Donations Yet</h3>
                  <p className="text-muted-foreground">
                    Start supporting causes that matter to you and your community.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact Summary */}
          {myDonations.length > 0 && (
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Your Impact</span>
                </CardTitle>
                <CardDescription>See how your contributions are making a difference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">${totalDonated}</div>
                    <p className="text-sm text-muted-foreground">Total Contributed</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{myDonations.length}</div>
                    <p className="text-sm text-muted-foreground">Campaigns Supported</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((totalDonated / campaigns.reduce((sum, c) => sum + c.goal, 0)) * 100 * 100) / 100}%
                    </div>
                    <p className="text-sm text-muted-foreground">Of Total Goals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}