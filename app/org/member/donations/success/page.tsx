"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Heart, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Get order ID from URL parameters
    const orderIdParam = searchParams.get("order_id");
    if (orderIdParam) {
      setOrderId(orderIdParam);
      toast.success("Payment completed successfully!");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-800 dark:text-green-400">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Thank you for your generous donation! Your contribution will make
              a real difference in our community.
            </p>
            {orderId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{orderId}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 text-primary">
            <Heart className="w-5 h-5" />
            <span className="text-sm">Your kindness is appreciated</span>
            <Heart className="w-5 h-5" />
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/donations">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Donations
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>You will receive a confirmation email shortly.</p>
            <p>For any queries, please contact our support team.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
