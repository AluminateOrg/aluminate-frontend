"use client";
import axiosAdmin from '@/axiosInstances/axiosAdmin';
import axiosCommon from '@/axiosInstances/axiosCommon';
import { useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { toast } from "sonner";


type PaymentContextType = {

    payByPayhere: (mode: string,fee: number, items: string, cus1: string, cus2: string, firstName: string, lastName: string, email: string, returnUrl: string, cancelUrl: string) => void;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID;
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX;
    const apiUrl = `${backend}/${apiPrefix}`;
    const router = useRouter();
    

    const payByPayhere = async (
        mode: string | "DONATION" | "MEMBERSHIP" | "MENTORSHIP",
        fee: number, // amount
        items: string = "", // name of the item being purchased
        cus1: string = "", // any
        cus2: string = "", // insert the email of the person who's paying
        firstName: string = "",
        lastName: string = "",
        email: string = "", // email of the person who's paying (same as cus2)
        returnUrl: string = "",
        cancelUrl: string = ""
    ) => {

        setIsProcessing(true);

        try {
            if (!merchantId) {
                toast.error("Merchant ID is not configured. Please contact support.");
                setIsProcessing(false);
                return;
            }

            // 1. Get hash and transaction ID from backend
            const amount = fee;
            const response = await axiosCommon.post('/payment/generate-hash', {
                amount,
                currency: "LKR",
                mode
            });

            if (response.status !== 200 || !response.data.success) {
                toast.error("Failed to initiate payment. Please try again.");
                setIsProcessing(false);
                return;
            }

            const { hash, transaction_id } = response.data.data || {};

            if (!hash || !transaction_id) {
                toast.error("Invalid payment response. Please try again.");
                setIsProcessing(false);
                return;
            }

            console.log("notify Url:", `${apiUrl}/public/payment/notify/${mode}`);
            console.log("return Url:", returnUrl);
            // 2. Construct payment object
            const payment = {
                sandbox: true, // Use false in production
                merchant_id: merchantId.toString(),
                return_url: returnUrl,
                cancel_url: cancelUrl,
                notify_url: `${apiUrl}/public/payment/notify/${mode}`, // publicly accessible server endpoint
                order_id: transaction_id.toString(),
                items: items,
                amount: amount.toFixed(2).toString(),
                currency: "LKR",
                hash: hash.toString(),
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: "",       // optional
                address: "",     // optional
                city: "",        // optional
                country: "Sri Lanka",
                custom_1: cus1,  
                custom_2: cus2
            };

            // 3. Attach event listeners before calling `startPayment`
            const payhere = (window as any).payhere || {};

            // Avoid duplicated event listeners
            payhere.onCompleted = function (orderId: string) {
                console.log("Payment completed. Order ID:", orderId);
                toast.success("Payment completed successfully!");
                // Redirect or refresh status
                router.replace(returnUrl);
                router.refresh();
            };

            payhere.onDismissed = function () {
                console.log("Payment dismissed");
                toast.error("Payment was cancelled.");
            };

            payhere.onError = function (error: any) {
                console.error("PayHere Error:", error);
                toast.error("Payment error occurred. Please try again.");
                router.replace(cancelUrl);
                router.refresh();
            };

            // 4. Start PayHere Payment
            const isLoaded = (window as any).payhereScriptLoaded;

            if (!isLoaded) {
                const script = document.createElement("script");
                script.src = "https://www.payhere.lk/lib/payhere.js";
                script.onload = () => {
                    (window as any).payhereScriptLoaded = true;
                    (window as any).payhere.startPayment(payment);
                };
                document.body.appendChild(script);
            } else {
                payhere.startPayment(payment);
            }

        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Failed to initiate payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <PaymentContext.Provider
            value={{
                payByPayhere
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
};

export const usePaymentContext = () => {
    const context = useContext(PaymentContext);
    if (!context) {
        throw new Error('usePaymentContext must be used within a PaymentProvider');
    }
    return context;
};