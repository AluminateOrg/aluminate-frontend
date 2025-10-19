'use client';

import { useState } from 'react';
import { useOrg } from '@/hooks/useOrg';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CreditCard,
  Users,
  Calendar,
  TrendingUp,
  Check,
  X,
  Crown,
  Zap,
  Building,
  Upload,
  MapPin,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  memberLimit: number;
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface PaymentMethodForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
}

interface BillingAddressForm {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export default function SubscriptionsPage() {
  const { organization, updateSubscription, loading: orgLoading } = useOrg();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Payment method form state
  const [paymentForm, setPaymentForm] = useState<PaymentMethodForm>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });

  // Billing address form state
  const [billingForm, setBillingForm] = useState<BillingAddressForm>({
    companyName: 'Tech Alumni Network',
    contactName: 'John Doe',
    email: 'billing@techalumni.org',
    phone: '+1 (555) 123-4567',
    addressLine1: '123 Innovation Drive',
    addressLine2: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    country: 'United States'
  });

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 29990,
      interval: "monthly",
      memberLimit: 100,
      features: [
        'Up to 100 members',
        'Basic group management',
        'Event creation',
        'Email support',
        'Basic analytics'
      ],
      current: organization?.tier === 'basic'
    },
    {
      id: "premium",
      name: "Premium",
      price: 79900,
      interval: "monthly",
      memberLimit: 500,
      features: [
        'Up to 500 members',
        'Advanced group management',
        'Unlimited events',
        'Mentorship platform',
        'Fundraising campaigns',
        'Priority support',
        'Advanced analytics',
        'Custom branding'
      ],
      popular: true,
      current: organization?.tier === 'premium'
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 199000,
      interval: "monthly",
      memberLimit: 1000,
      features: [
        'Up to 1000 members',
        'Everything in Premium',
        'API access',
        'Single sign-on (SSO)',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        '24/7 phone support'
      ],
      current: organization?.tier === 'enterprise'
    }
  ];

  if (orgLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleUpgrade = async (planId: string) => {
    setLoading(true);
    try {
      await updateSubscription(planId as any);
      toast.success(`Successfully upgraded to ${planId} plan!`);
    } catch (error) {
      toast.error('Failed to update subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!paymentForm.cardNumber || !paymentForm.expiryMonth || !paymentForm.expiryYear ||
        !paymentForm.cvv || !paymentForm.cardholderName) {
        toast.error('Please fill in all payment method fields');
        return;
      }

      // TODO: Replace with actual API call to payment processor
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Reset form and close modal
      setPaymentForm({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        cardholderName: ''
      });
      setShowPaymentModal(false);

      toast.success('Payment method updated successfully!');
    } catch (error) {
      toast.error('Failed to update payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBillingAddressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!billingForm.companyName || !billingForm.contactName || !billingForm.email ||
        !billingForm.addressLine1 || !billingForm.city || !billingForm.state ||
        !billingForm.zipCode || !billingForm.country) {
        toast.error('Please fill in all required billing address fields');
        return;
      }

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowBillingModal(false);
      toast.success('Billing address updated successfully!');
    } catch (error) {
      toast.error('Failed to update billing address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentInputChange = (field: keyof PaymentMethodForm, value: string) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleBillingInputChange = (field: keyof BillingAddressForm, value: string) => {
    setBillingForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const currentPlan = plans.find(plan => plan.current);
  const memberUsagePercent = organization
    ? (organization.currentMemberCount / organization.maxMemberCount) * 100
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your organization's subscription plan and billing</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          {currentPlan && (
            <Badge variant="default" className="flex items-center space-x-1">
              <Crown className="h-3 w-3" />
              <span>{currentPlan.name} Plan</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Current Plan Overview */}
      {organization && currentPlan && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Current Plan</span>
            </CardTitle>
            <CardDescription>Your active subscription details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  LKR {currentPlan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{currentPlan.interval}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Member Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    {organization.currentMemberCount} of {organization.maxMemberCount} members
                    <span>{Math.round(memberUsagePercent)}%</span>
                  </div>
                  <Progress value={memberUsagePercent} className="h-2" />
                </div>
                {memberUsagePercent > 80 && (
                  <p className="text-sm text-orange-600">
                    Consider upgrading to add more members
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{organization.currentMemberCount} Members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>12 Events</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span>85% Active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${plan.current ? 'bg-accent' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {plan.id === 'basic' && <Building className="h-8 w-8 text-muted-foreground" />}
                  {plan.id === 'premium' && <Zap className="h-8 w-8 text-primary" />}
                  {plan.id === 'enterprise' && <Crown className="h-8 w-8 text-yellow-500" />}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  LKR {plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{plan.interval}
                  </span>
                </div>
                <CardDescription>
                  Up to {plan.memberLimit} members
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  {plan.current ? (
                    <Button disabled className="w-full">
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loading}
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        'Upgrade to ' + plan.name
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Manage your payment method and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Payment Method</h4>
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPaymentModal(true)}
              >
                Update Payment Method
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Billing Address</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Tech Alumni Network</p>
                <p>123 Innovation Drive</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBillingModal(true)}
              >
                Update Billing Address
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Your billing history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: "2024-01-01",
                amount: 79000,
                status: "paid",
                plan: "Premium",
              },
              {
                date: "2023-12-01",
                amount: 79000,
                status: "paid",
                plan: "Premium",
              },
              {
                date: "2023-11-01",
                amount: 79000,
                status: "paid",
                plan: "Premium",
              },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">{invoice.plan} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status}
                  </Badge>
                  <span className="font-medium">LKR {invoice.amount}</span>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Update Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Update Payment Method</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPaymentModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Update your credit card information for billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentMethodUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name *</Label>
                  <Input
                    id="cardholderName"
                    value={paymentForm.cardholderName}
                    onChange={(e) => handlePaymentInputChange('cardholderName', e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={paymentForm.cardNumber}
                    onChange={(e) => handlePaymentInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="expiryMonth">Month *</Label>
                    <select
                      id="expiryMonth"
                      value={paymentForm.expiryMonth}
                      onChange={(e) => handlePaymentInputChange('expiryMonth', e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="">MM</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiryYear">Year *</Label>
                    <select
                      id="expiryYear"
                      value={paymentForm.expiryYear}
                      onChange={(e) => handlePaymentInputChange('expiryYear', e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="">YYYY</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      value={paymentForm.cvv}
                      onChange={(e) => handlePaymentInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Update Payment Method
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing Address Update Modal */}
      {showBillingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Update Billing Address</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBillingModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                Update your billing address information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBillingAddressUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={billingForm.companyName}
                      onChange={(e) => handleBillingInputChange('companyName', e.target.value)}
                      placeholder="Tech Alumni Network"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={billingForm.contactName}
                      onChange={(e) => handleBillingInputChange('contactName', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingForm.email}
                      onChange={(e) => handleBillingInputChange('email', e.target.value)}
                      placeholder="billing@techalumni.org"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={billingForm.phone}
                      onChange={(e) => handleBillingInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={billingForm.addressLine1}
                    onChange={(e) => handleBillingInputChange('addressLine1', e.target.value)}
                    placeholder="123 Innovation Drive"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={billingForm.addressLine2}
                    onChange={(e) => handleBillingInputChange('addressLine2', e.target.value)}
                    placeholder="Suite 100"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={billingForm.city}
                      onChange={(e) => handleBillingInputChange('city', e.target.value)}
                      placeholder="San Francisco"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={billingForm.state}
                      onChange={(e) => handleBillingInputChange('state', e.target.value)}
                      placeholder="CA"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={billingForm.zipCode}
                      onChange={(e) => handleBillingInputChange('zipCode', e.target.value)}
                      placeholder="94105"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <select
                      id="country"
                      value={billingForm.country}
                      onChange={(e) => handleBillingInputChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      required
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowBillingModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Update Billing Address
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