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
import { CreditCard, Lock, AlertCircle } from "lucide-react";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    } else if (parseFloat(formData.amount) < 10) {
      newErrors.amount = "Minimum donation amount is LKR 10";
    } else if (parseFloat(formData.amount) > 1000000) {
      newErrors.amount = "Maximum donation amount is LKR 1,000,000";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+94|0)?[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Please enter a valid Sri Lankan phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDonate = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

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

      console.log("Sending payment request:", paymentRequest);

      const paymentResponse = await PaymentService.initializePayment(
        paymentRequest
      );

      console.log("Received payment response:", paymentResponse);

      // Configure PayHere
      const payHereConfig: PayHereConfig = {
        sandbox: paymentResponse.sandbox,
        merchant_id: paymentResponse.merchantId,
        return_url: `${window.location.origin}/org/member/donations/success?orderId=${paymentResponse.orderId}`,
        cancel_url: `${window.location.origin}/org/member/donations/cancel?orderId=${paymentResponse.orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/portal/user/payment/payhere/notify`,
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

      console.log("Starting PayHere payment with config:", payHereConfig);

      // Start PayHere payment
      startPayment(
        payHereConfig,
        (orderId) => {
          console.log("Payment completed successfully:", orderId);
          toast.success("Payment completed successfully!");
          onSuccess?.(orderId);
        },
        () => {
          console.log("Payment was cancelled");
          toast.info("Payment was cancelled");
          onCancel?.();
        },
        (error) => {
          console.error("Payment failed:", error);
          toast.error(`Payment failed: ${error}`);
          onError?.(error);
        }
      );
    } catch (error) {
      console.error("Payment initialization error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to initialize payment";
      toast.error(errorMessage);
      onError?.(errorMessage);
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
            <div className="space-y-2">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="10"
                max="1000000"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                placeholder="Enter custom amount"
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </p>
              )}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {suggestedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  type="button"
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
                className={errors.firstName ? "border-red-500" : ""}
                required
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? "border-red-500" : ""}
                required
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="john@example.com"
                className={errors.email ? "border-red-500" : ""}
                required
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+94771234567"
                className={errors.phone ? "border-red-500" : ""}
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.phone}
                </p>
              )}
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

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              Please fix the errors above before proceeding.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
