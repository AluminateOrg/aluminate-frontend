"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";
import { PaymentService } from "@/lib/services/paymentService";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {        
    const checkPaymentStatus = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const data = await PaymentService.checkPaymentStatus(orderId);
        setPaymentData(data);
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p>Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Thank you for your generous donation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderId && (
            <div className="bg-muted/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Transaction Details</h4>
              <p className="text-sm text-muted-foreground">
                Order ID: {orderId}
              </p>
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your donation has been processed successfully. You will receive a
              confirmation email shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push("/org/member/donations")}
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Donations
              </Button>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
