"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PaymentCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const orderIdParam = searchParams.get("order_id");
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
    toast.info("Payment was cancelled");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-2xl text-orange-800 dark:text-orange-400">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your payment was cancelled. No charges have been made to your
              account.
            </p>
            {orderId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono font-medium">{orderId}</p>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Why was my payment cancelled?</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>You clicked the cancel button</li>
              <li>You closed the payment window</li>
              <li>Payment session timed out</li>
              <li>Technical issue occurred</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/donations">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              If you're experiencing technical difficulties, please contact our
              support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
