/**
 * PayHere Integration Usage Example
 *
 * This file demonstrates how to use the PayHere integration in your components
 */

import { usePayHere } from "@/contexts/PayHereContext";
import { usePayHereSDK } from "@/hooks/usePayHereSDK";
import PaymentComponent from "@/components/payment/PaymentComponent";
import type { PayHerePaymentObject } from "@/types/payhere";

// Example 1: Using the PayHere Context
export function PayHereStatusComponent() {
  const { isPayHereLoaded, payhere } = usePayHere();

  return (
    <div>
      {isPayHereLoaded ? (
        <p>✅ PayHere is loaded and ready</p>
      ) : (
        <p>⏳ Loading PayHere SDK...</p>
      )}
    </div>
  );
}

// Example 2: Using the PayHere Hook (alternative approach)
export function PayHereHookExample() {
  const { isLoaded, isLoading, error, payhere } = usePayHereSDK();

  if (isLoading) {
    return <div>Loading PayHere SDK...</div>;
  }

  if (error) {
    return <div>Error loading PayHere: {error}</div>;
  }

  if (!isLoaded || !payhere) {
    return <div>PayHere SDK not available</div>;
  }

  const handleDirectPayment = () => {
    const payment: PayHerePaymentObject = {
      sandbox: true,
      merchant_id: "YOUR_MERCHANT_ID",
      return_url: "http://sample.com/return",
      cancel_url: "http://sample.com/cancel",
      notify_url: "http://sample.com/notify",
      order_id: "ItemNo12345",
      items: "Door bell wireless",
      amount: 1000.0,
      currency: "LKR",
      hash: "GENERATED_HASH_FROM_SERVER",
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      phone: "0771234567",
      address: "No.1, Galle Road",
      city: "Colombo",
      country: "Sri Lanka",
      delivery_address: "No. 46, Galle road, Kalutara South",
      delivery_city: "Kalutara",
      delivery_country: "Sri Lanka",
      custom_1: "",
      custom_2: "",
    };

    // Set up callbacks
    payhere.onCompleted = (orderId: string) => {
      console.log("Payment completed. OrderID:", orderId);
      // Handle success
    };

    payhere.onDismissed = () => {
      console.log("Payment dismissed");
      // Handle dismissal
    };

    payhere.onError = (error: string) => {
      console.log("Payment error:", error);
      // Handle error
    };

    // Start payment
    payhere.startPayment(payment);
  };

  return (
    <button onClick={handleDirectPayment}>Pay with PayHere (Direct)</button>
  );
}

// Example 3: Using the existing PaymentComponent (recommended for donations)
export function DonationExample() {
  const campaignId = "your-campaign-id";
  const memberId = "your-member-id";
  const amount = "1000";
  const memberName = "John Doe";
  const memberEmail = "john@example.com";
  const campaignTitle = "Emergency Relief Fund";

  const handlePaymentSuccess = (orderId: string, paymentData: any) => {
    console.log("Payment successful!", { orderId, paymentData });
    // Handle successful payment
    // Update UI, redirect, etc.
  };

  const handlePaymentCancel = () => {
    console.log("Payment cancelled");
    // Handle payment cancellation
  };

  const handlePaymentError = (error: any) => {
    console.error("Payment failed:", error);
    // Handle payment error
  };

  return (
    <PaymentComponent
      campaignId={campaignId}
      memberId={memberId}
      amount={amount}
      isAnonymous={false}
      memberName={memberName}
      memberEmail={memberEmail}
      campaignTitle={campaignTitle}
      onPaymentSuccess={handlePaymentSuccess}
      onPaymentCancel={handlePaymentCancel}
      onPaymentError={handlePaymentError}
    />
  );
}

// Example 4: Custom payment component with PayHere context
export function CustomPaymentButton() {
  const { isPayHereLoaded, payhere } = usePayHere();

  const initiatePayment = () => {
    if (!isPayHereLoaded || !payhere) {
      alert("PayHere is not ready yet. Please wait...");
      return;
    }

    // Your payment logic here
    console.log("Starting custom payment...");
  };

  return (
    <button
      onClick={initiatePayment}
      disabled={!isPayHereLoaded}
      className={`px-4 py-2 rounded ${
        isPayHereLoaded
          ? "bg-blue-500 hover:bg-blue-600 text-white"
          : "bg-gray-300 text-gray-500 cursor-not-allowed"
      }`}
    >
      {isPayHereLoaded ? "Pay Now" : "Loading PayHere..."}
    </button>
  );
}
