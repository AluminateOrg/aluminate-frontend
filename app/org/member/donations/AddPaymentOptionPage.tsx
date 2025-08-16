"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

export default function AddPaymentOptionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    cardHolderName: "",
    cardType: "" as "VISA" | "MASTERCARD" | "AMEX" | "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    isDefault: false,
  });
  const [loading, setLoading] = useState(false);
  const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "/api";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.cardHolderName ||
      !formData.cardType ||
      !formData.cardNumber ||
      !formData.expiryMonth ||
      !formData.expiryYear
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic card number validation (16 digits)
    if (!formData.cardNumber.match(/^\d{16}$/)) {
      toast.error("Card number must be 16 digits");
      return;
    }

    // Extract last four digits
    const lastFourDigits = formData.cardNumber.slice(-4);

    setLoading(true);
    try {
      await axios.post(
        `${apiPrefix}/payment-option/create`,
        {
          cardHolderName: formData.cardHolderName,
          cardType: formData.cardType,
          expiryMonth: parseInt(formData.expiryMonth),
          expiryYear: parseInt(formData.expiryYear),
          lastFourDigits,
          paymentToken: `token_${formData.cardNumber}`, // Mock token; replace with actual payment gateway token
          isDefault: formData.isDefault,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      toast.success("Payment option added successfully");
      router.push("/donations");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Failed to add payment option. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add Payment Method</CardTitle>
          <CardDescription>
            Enter your card details to make donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardHolderName">Cardholder Name</Label>
              <Input
                id="cardHolderName"
                value={formData.cardHolderName}
                onChange={(e) =>
                  setFormData({ ...formData, cardHolderName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardType">Card Type</Label>
              <Select
                value={formData.cardType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    cardType: value as "VISA" | "MASTERCARD" | "AMEX",
                  })
                }
              >
                <SelectTrigger id="cardType">
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISA">Visa</SelectItem>
                  <SelectItem value="MASTERCARD">Mastercard</SelectItem>
                  <SelectItem value="AMEX">American Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                onChange={(e) =>
                  setFormData({ ...formData, cardNumber: e.target.value })
                }
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryMonth">Expiry Month</Label>
                <Input
                  id="expiryMonth"
                  type="number"
                  value={formData.expiryMonth}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryMonth: e.target.value })
                  }
                  placeholder="MM"
                  min="1"
                  max="12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryYear">Expiry Year</Label>
                <Input
                  id="expiryYear"
                  type="number"
                  value={formData.expiryYear}
                  onChange={(e) =>
                    setFormData({ ...formData, expiryYear: e.target.value })
                  }
                  placeholder="YYYY"
                  min={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isDefault: checked as boolean })
                }
              />
              <Label htmlFor="isDefault">Set as default payment method</Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Add Payment Method"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
