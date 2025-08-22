"use client";

import { useEffect, useState } from "react";
import { PayHereConfig } from "@/lib/types/payment";

export const usePayHere = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if PayHere is already loaded
    if (window.payhere) {
      setIsLoaded(true);
      return;
    }

    // Load PayHere script
    const script = document.createElement("script");
    script.src = "https://www.payhere.lk/lib/payhere.js";
    script.async = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load PayHere script");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const startPayment = (
    config: PayHereConfig,
    onCompleted?: (orderId: string) => void,
    onDismissed?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!isLoaded || !window.payhere) {
      console.error("PayHere is not loaded yet");
      return;
    }

    setIsLoading(true);

    // Set up event handlers
    window.payhere.onCompleted = (orderId: string) => {
      setIsLoading(false);
      console.log("Payment completed. OrderID:", orderId);
      onCompleted?.(orderId);
    };

    window.payhere.onDismissed = () => {
      setIsLoading(false);
      console.log("Payment dismissed");
      onDismissed?.();
    };

    window.payhere.onError = (error: string) => {
      setIsLoading(false);
      console.error("Payment error:", error);
      onError?.(error);
    };

    // Start payment
    window.payhere.startPayment(config);
  };

  return {
    isLoaded,
    isLoading,
    startPayment,
  };
};
