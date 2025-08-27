"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface PayHereContextType {
  isPayHereLoaded: boolean;
  payhere: typeof window.payhere | null;
  error: string | null;
}

const PayHereContext = createContext<PayHereContextType>({
  isPayHereLoaded: false,
  payhere: null,
  error: null,
});

interface PayHereProviderProps {
  children: ReactNode;
}

export function PayHereProvider({
  children,
}: PayHereProviderProps): JSX.Element {
  const [isPayHereLoaded, setIsPayHereLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let checkCount = 0;
    const maxChecks = 100; // 10 seconds with 100ms intervals

    const checkPayHereLoad = (): void => {
      checkCount++;

      if (typeof window !== "undefined" && window.payhere) {
        setIsPayHereLoaded(true);
        setError(null);
        console.log("✅ PayHere SDK loaded successfully");
        return;
      }

      if (checkCount >= maxChecks) {
        const errorMsg =
          "PayHere SDK failed to load within 10 seconds. Please refresh the page.";
        setError(errorMsg);
        console.error("❌ " + errorMsg);
        return;
      }

      // Continue checking
      setTimeout(checkPayHereLoad, 100);
    };

    // Start checking after a small delay to allow script loading
    setTimeout(checkPayHereLoad, 100);

    // Cleanup function
    return () => {
      checkCount = maxChecks; // Stop checking if component unmounts
    };
  }, []);

  return (
    <PayHereContext.Provider
      value={{
        isPayHereLoaded,
        payhere: typeof window !== "undefined" ? window.payhere : null,
        error,
      }}
    >
      {children}
    </PayHereContext.Provider>
  );
}

export const usePayHere = (): PayHereContextType => {
  const context = useContext(PayHereContext);
  if (!context) {
    throw new Error("usePayHere must be used within a PayHereProvider");
  }
  return context;
};
