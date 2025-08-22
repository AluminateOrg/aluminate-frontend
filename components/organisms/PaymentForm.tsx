"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { usePayHere } from "@/hooks/usePayHere";
import { PaymentService } from "@/lib/services/paymentService";
import { PayHerePaymentRequest, PayHereConfig } from "@/lib/types/payment";
import { toast } from "sonner";
import { CreditCard, Lock } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  endDate: string;
  category: string;
  donorCount: number;
  isActive: boolean;
}

interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface PaymentFormProps {
  campaign: Campaign;
  member: Member;
  onSuccess?: (orderId: string) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  campaign,
  member,
  onSuccess,
  onCancel,
  onError,
}) => {
  const { isLoaded, isLoading, startPayment } = usePayHere();
  const [formData, setFormData] = useState({
    amount: "",
    firstName: member.name.split(" ")[0] || "",
    lastName: member.name.split(" ").slice(1).join(" ") || "",
    email: member.email,
    phone: member.phone || "",
    address: "",
    city: "",
    country: "Sri Lanka",
    isAnonymous: false,
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid donation amount");
      return false;
    }

    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    return true;
  };

  const handleDonate = async () => {
    if (!validateForm()) return;

    if (!isLoaded) {
      toast.error("Payment system is not ready. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Initialize payment with backend
      const paymentRequest: PayHerePaymentRequest = {
        campaignId: parseInt(campaign.id),
        memberId: member.id,
        amount: parseFloat(formData.amount),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
        isAnonymous: formData.isAnonymous,
        message: formData.message.trim(),
      };

      const paymentResponse = await PaymentService.initializePayment(
        paymentRequest
      );

      // Configure PayHere
      const payHereConfig: PayHereConfig = {
        sandbox: paymentResponse.sandbox,
        merchant_id: paymentResponse.merchantId,
        return_url: `${window.location.origin}/org/member/donations/success?orderId=${paymentResponse.orderId}`,
        cancel_url: `${window.location.origin}/org/member/donations/cancel?orderId=${paymentResponse.orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/portal/payment/payhere/notify`,
        order_id: paymentResponse.orderId,
        items: paymentResponse.itemDescription,
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        hash: paymentResponse.hash,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        country: formData.country.trim(),
      };

      // Start PayHere payment
      startPayment(
        payHereConfig,
        (orderId) => {
          toast.success("Payment completed successfully!");
          onSuccess?.(orderId);
        },
        () => {
          toast.info("Payment was cancelled");
          onCancel?.();
        },
        (error) => {
          toast.error(`Payment failed: ${error}`);
          onError?.(error);
        }
      );
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const suggestedAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Make a Donation</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Support: {campaign.title}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campaign Info */}
        <div className="bg-muted/20 p-4 rounded-lg">
          <h4 className="font-medium mb-2">{campaign.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">
            {campaign.description}
          </p>
          <div className="flex justify-between text-sm">
            <span>Raised: LKR {campaign.raised.toLocaleString()}</span>
            <span>Goal: LKR {campaign.goal.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount Selection */}
        <div className="space-y-4">
          <Label htmlFor="amount">Donation Amount (LKR) *</Label>
          <div className="space-y-3">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Enter custom amount"
            />
            <div className="grid grid-cols-5 gap-2">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInputChange("amount", amount.toString())}
                  className={
                    formData.amount === amount.toString()
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h4 className="font-medium">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+94771234567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Colombo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Sri Lanka"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Street address"
            />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Message (Optional)</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="Add a personal message with your donation..."
            rows={3}
          />
        </div>

        {/* Anonymous Option */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={formData.isAnonymous}
            onCheckedChange={(checked) =>
              handleInputChange("isAnonymous", checked)
            }
          />
          <Label htmlFor="anonymous" className="text-sm">
            Make this donation anonymous
          </Label>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 text-green-800 dark:text-green-200">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            Your payment is processed securely through PayHere. We do not store
            your payment information.
          </p>
        </div>

        {/* Payment Button */}
        <Button
          onClick={handleDonate}
          disabled={loading || isLoading || !isLoaded}
          className="w-full"
          size="lg"
        >
          {loading || isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Donate LKR {formData.amount || "0"}
            </>
          )}
        </Button>

        {!isLoaded && (
          <p className="text-center text-sm text-muted-foreground">
            Loading payment system...
          </p>
        )}
      </CardContent>
    </Card>
  );
};
