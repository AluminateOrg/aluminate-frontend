import { useState, useEffect } from "react";

interface UsePayHereSDKReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  payhere: typeof window.payhere | null;
}

export function usePayHereSDK(): UsePayHereSDKReturn {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPayHereLoad = (): void => {
      if (typeof window !== "undefined" && window.payhere) {
        setIsLoaded(true);
        setIsLoading(false);
        setError(null);
      } else {
        // Wait a bit more for the script to load
        setTimeout(checkPayHereLoad, 100);
      }
    };

    // Initial check
    checkPayHereLoad();

    // Set a timeout to stop checking after 10 seconds
    const timeout = setTimeout(() => {
      if (!isLoaded) {
        setError("PayHere SDK failed to load within 10 seconds");
        setIsLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [isLoaded]);

  return {
    isLoaded,
    isLoading,
    error,
    payhere: typeof window !== "undefined" ? window.payhere : null,
  };
}
