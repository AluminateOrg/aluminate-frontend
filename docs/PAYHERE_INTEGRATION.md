# PayHere Integration Guide

This guide explains how to use the PayHere payment gateway integration in your Next.js application.

## Overview

The PayHere integration consists of several components:

1. **TypeScript Definitions** (`types/payhere.d.ts`) - Type definitions for PayHere SDK
2. **PayHere Context** (`contexts/PayHereContext.tsx`) - React context for managing PayHere state
3. **PayHere Hook** (`hooks/usePayHereSDK.ts`) - Custom hook for PayHere SDK
4. **Payment Component** (`components/payment/PaymentComponent.tsx`) - Ready-to-use payment component
5. **Root Layout Integration** (`app/layout.tsx`) - PayHere script loading

## Setup

### 1. PayHere Script Loading

The PayHere script is automatically loaded in your root layout (`app/layout.tsx`):

```tsx
<html lang="en" suppressHydrationWarning>
  <head>
    <script src="https://www.payhere.lk/lib/payhere.js" async />
  </head>
  <body className={inter.className}>
    <ThemeProvider>
      <AuthProvider>
        <OrgProvider>
          <PayHereProvider>
            {children}
            <Toaster />
          </PayHereProvider>
        </OrgProvider>
      </AuthProvider>
    </ThemeProvider>
  </body>
</html>
```

### 2. PayHere Provider

The `PayHereProvider` wraps your application and provides PayHere context to all child components.

## Usage

### Method 1: Using the PayHere Context (Recommended)

```tsx
import { usePayHere } from "@/contexts/PayHereContext";

function MyPaymentComponent() {
  const { isPayHereLoaded, payhere } = usePayHere();

  const handlePayment = () => {
    if (!isPayHereLoaded || !payhere) {
      alert("PayHere is not ready yet");
      return;
    }

    // Your payment logic here
  };

  return (
    <button onClick={handlePayment} disabled={!isPayHereLoaded}>
      {isPayHereLoaded ? "Pay Now" : "Loading PayHere..."}
    </button>
  );
}
```

### Method 2: Using the PayHere Hook

```tsx
import { usePayHereSDK } from "@/hooks/usePayHereSDK";

function MyPaymentComponent() {
  const { isLoaded, isLoading, error, payhere } = usePayHereSDK();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isLoaded) return <div>PayHere not available</div>;

  // Your component logic here
}
```

### Method 3: Using the Ready-Made Payment Component

For donations/fundraising, use the existing `PaymentComponent`:

```tsx
import PaymentComponent from "@/components/payment/PaymentComponent";

function DonationPage() {
  return (
    <PaymentComponent
      campaignId="campaign-123"
      memberId="member-456"
      amount="1000"
      isAnonymous={false}
      memberName="John Doe"
      memberEmail="john@example.com"
      campaignTitle="Emergency Relief Fund"
      onPaymentSuccess={(orderId, paymentData) => {
        console.log("Payment successful!", { orderId, paymentData });
      }}
      onPaymentCancel={() => {
        console.log("Payment cancelled");
      }}
      onPaymentError={(error) => {
        console.error("Payment failed:", error);
      }}
    />
  );
}
```

## PayHere Payment Object Structure

When creating a direct payment, use the `PayHerePaymentObject` type:

```tsx
import type { PayHerePaymentObject } from "@/types/payhere";

const payment: PayHerePaymentObject = {
  sandbox: true, // Set to false for production
  merchant_id: "YOUR_MERCHANT_ID",
  return_url: "http://sample.com/return",
  cancel_url: "http://sample.com/cancel",
  notify_url: "http://sample.com/notify",
  order_id: "ItemNo12345",
  items: "Product Description",
  amount: 1000.0,
  currency: "LKR",
  hash: "GENERATED_HASH_FROM_SERVER", // Must be generated server-side
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
  custom_1: "", // Optional custom field
  custom_2: "", // Optional custom field
};
```

## Payment Callbacks

Set up payment callbacks to handle different payment states:

```tsx
// Payment completed successfully
payhere.onCompleted = (orderId: string) => {
  console.log("Payment completed. OrderID:", orderId);
  // Handle success (e.g., redirect, update UI, send confirmation)
};

// Payment cancelled by user
payhere.onDismissed = () => {
  console.log("Payment dismissed");
  // Handle cancellation (e.g., show message, return to form)
};

// Payment failed with error
payhere.onError = (error: string) => {
  console.log("Payment error:", error);
  // Handle error (e.g., show error message, log error)
};

// Start the payment
payhere.startPayment(payment);
```

## Environment Configuration

### Development (Sandbox)

- Set `sandbox: true` in your payment object
- Use PayHere sandbox merchant ID
- Test with PayHere test cards

### Production

- Set `sandbox: false` in your payment object
- Use your live PayHere merchant ID
- Ensure your notify_url is properly configured for webhooks

## Security Notes

⚠️ **Important Security Considerations:**

1. **Hash Generation**: The payment hash MUST be generated on your server-side to ensure security. Never generate hashes on the client-side.

2. **Webhook Verification**: Always verify webhook notifications from PayHere on your server.

3. **Amount Validation**: Validate payment amounts on your server before processing.

4. **HTTPS Required**: Use HTTPS for all payment-related URLs in production.

## Troubleshooting

### PayHere Script Not Loading

- Check browser console for script loading errors
- Ensure internet connectivity
- Verify the PayHere script URL is accessible

### Payment Not Starting

- Verify `isPayHereLoaded` is `true` before initiating payment
- Check that all required payment object fields are provided
- Ensure the payment hash is correctly generated

### Type Errors

- Make sure to import types from `@/types/payhere`
- Verify all payment object properties match the `PayHerePaymentObject` interface

## Files Structure

```
├── app/
│   └── layout.tsx                    # PayHere script loading & provider setup
├── components/
│   └── payment/
│       └── PaymentComponent.tsx      # Ready-to-use payment component
├── contexts/
│   └── PayHereContext.tsx           # PayHere React context
├── hooks/
│   └── usePayHereSDK.ts            # Custom PayHere hook
├── types/
│   └── payhere.d.ts                # PayHere TypeScript definitions
└── examples/
    └── payhere-usage.tsx           # Usage examples
```

This integration provides a robust, type-safe way to handle PayHere payments in your Next.js application with proper loading states and error handling.
