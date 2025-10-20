"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, RotateCcw } from "lucide-react";

// ✅ Inner component using useSearchParams
function PaymentCancelInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <p className="text-muted-foreground">
            Your payment was cancelled and no charges were made.
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
              No worries! You can try again at any time to support the causes
              you care about.
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
                onClick={() => router.back()}
                className="flex-1"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Export wrapped with Suspense (required for useSearchParams)
export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <PaymentCancelInner />
    </Suspense>
  );
}
