// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import { toast } from "sonner";
// import type { PayHerePaymentObject } from "@/types/payhere";

// // Type definitions
// interface PaymentData {
//   orderId: string;
//   merchantId: string;
//   amount: string;
//   currency: string;
//   hash: string;
// }

// interface PaymentComponentProps {
//   campaignId: string;
//   memberId?: string;
//   amount: string;
//   isAnonymous: boolean;
//   memberName?: string;
//   memberEmail?: string;
//   campaignTitle: string;
//   onPaymentSuccess?: (orderId: string, paymentData: PaymentData) => void;
//   onPaymentCancel?: () => void;
//   onPaymentError?: (error: any) => void;
// }

// interface DonationCreateResponse {
//   data: {
//     id: string;
//   };
// }

// interface PaymentGenerateHashResponse {
//   data: PaymentData;
// }

// const PaymentComponent: React.FC<PaymentComponentProps> = ({
//   campaignId,
//   memberId,
//   amount,
//   isAnonymous,
//   memberName,
//   memberEmail,
//   campaignTitle,
//   onPaymentSuccess,
//   onPaymentCancel,
//   onPaymentError,
// }) => {
//   const [loading, setLoading] = useState<boolean>(false);

//   // Validate if payment can be initiated
//   const isPaymentValid = useCallback((): boolean => {
//     const numericAmount = parseFloat(amount);
//     return !!(
//       amount &&
//       !isNaN(numericAmount) &&
//       numericAmount > 0 &&
//       campaignId &&
//       memberId &&
//       isPayHereLoaded
//     );
//   }, [amount, campaignId, memberId, isPayHereLoaded]);

//   const setupPayHereCallbacks = useCallback(
//     (donationId: string, paymentData: PaymentData): void => {
//       if (!payhere) {
//         console.error("PayHere SDK not loaded");
//         return;
//       }

//       // PayHere payment completion callback
//       payhere.onCompleted = function (orderId: string) {
//         console.log("Payment completed. OrderID:" + orderId);
//         toast.success("Payment completed successfully!");
//         if (onPaymentSuccess) {
//           onPaymentSuccess(orderId, paymentData);
//         }
//         setLoading(false);
//       };

//       // PayHere payment dismissal callback
//       payhere.onDismissed = function () {
//         console.log("Payment dismissed");
//         toast.info("Payment was cancelled");
//         if (onPaymentCancel) onPaymentCancel();
//         setLoading(false);
//       };

//       // PayHere payment error callback
//       payhere.onError = function (error: string) {
//         console.log("Payment error:" + error);
//         toast.error("Payment failed: " + error);
//         if (onPaymentError) onPaymentError(error);
//         setLoading(false);
//       };
//     },
//     [payhere, onPaymentSuccess, onPaymentCancel, onPaymentError]
//   );

//   const initiatePayment = async (): Promise<void> => {
//     if (!isPaymentValid()) {
//       toast.error("Please enter a valid amount");
//       return;
//     }

//     if (!payhere || !isPayHereLoaded) {
//       toast.error(
//         "PayHere payment gateway not available. Please refresh and try again."
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       const backend_url = process.env.NEXT_PUBLIC_BACKEND_URL;
//       const api_prefix = process.env.NEXT_PUBLIC_API_PREFIX;

//       if (!backend_url || !api_prefix) {
//         throw new Error("Backend configuration missing");
//       }

//       const endpoint = `${backend_url}/${api_prefix}`;
//       console.log("Using backend endpoint:", endpoint);

//       // Step 1: Create donation record
//       console.log("Creating donation record...");
//       const donationResponse = await axios.post<DonationCreateResponse>(
//         `${endpoint}/donation/create`,
//         {
//           campaignId: campaignId,
//           amount: parseFloat(amount),
//           isAnonymous: isAnonymous,
//           paymentMethod: "PAYHERE",
//         },
//         {
//           params: { memberId: memberId },
//         }
//       );

//       const donationId = donationResponse.data.data.id;
//       console.log("Donation created with ID:", donationId);

//       // Step 2: Generate payment hash
//       console.log("Generating payment hash...");
//       const hashResponse = await axios.post<PaymentGenerateHashResponse>(
//         `${endpoint}/donation/payment/generate-hash`,
//         {
//           amount: parseFloat(amount),
//           campaignId: campaignId,
//           memberId: memberId,
//           isAnonymous: isAnonymous,
//         }
//       );

//       const paymentData = hashResponse.data.data;
//       console.log("Payment hash generated:", paymentData);

//       // Step 3: Update donation with payment order ID
//       console.log("Updating donation with payment order ID...");
//       await axios.put(`${endpoint}/donation/${donationId}/payment-order`, {
//         paymentOrderId: paymentData.orderId,
//       });

//       // Step 4: Setup PayHere callbacks
//       setupPayHereCallbacks(donationId, paymentData);

//       // Step 5: Configure PayHere payment object
//       const payment: PayHerePaymentObject = {
//         sandbox: true, // Set to false for production
//         merchant_id: paymentData.merchantId,
//         return_url: `${window.location.origin}/donations/success`,
//         cancel_url: `${window.location.origin}/donations/cancel`,
//         notify_url: `${backend_url}/${api_prefix}/donation/payment/notify`,
//         order_id: paymentData.orderId,
//         items: `Donation to ${campaignTitle}`,
//         amount: paymentData.amount,
//         currency: paymentData.currency || "LKR",
//         hash: paymentData.hash,
//         first_name: memberName?.split(" ")[0] || "Anonymous",
//         last_name: memberName?.split(" ").slice(1).join(" ") || "Donor",
//         email: memberEmail || "anonymous@donor.com",
//         phone: "",
//         address: "",
//         city: "",
//         country: "Sri Lanka",
//         delivery_address: "",
//         delivery_city: "",
//         delivery_country: "",
//         custom_1: donationId.toString(),
//         custom_2: campaignId.toString(),
//       };


//       // Start PayHere payment
//       payhere.startPayment(payment);
//     } catch (error: any) {
//       console.error("Error initiating payment:", error);
//       const errorMessage =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Unknown error occurred";
//       toast.error("Failed to initiate payment: " + errorMessage);
//       if (onPaymentError) onPaymentError(error);
//       setLoading(false);
//     }
//   };

//   // Get button text based on state
//   const getButtonText = (): string => {
//     if (!isPayHereLoaded) return "Loading PayHere...";
//     if (loading) return "Processing...";
//     if (!amount || parseFloat(amount) <= 0) return "Enter Amount";
//     return `Donate LKR ${parseFloat(amount).toLocaleString()}`;
//   };

//   // Check if button should be disabled
//   const isButtonDisabled = (): boolean => {
//     return (
//       !isPaymentValid() ||
//       loading ||
//       !isPayHereLoaded ||
//       !amount ||
//       parseFloat(amount) <= 0
//     );
//   };

//   return (
//     <button
//       onClick={initiatePayment}
//       disabled={isButtonDisabled()}
//       className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors"
//       type="button"
//     >
//       {getButtonText()}
//     </button>
//   );
// };

// export default PaymentComponent;
