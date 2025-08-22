import {
  PayHerePaymentRequest,
  PayHerePaymentResponse,
} from "@/lib/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class PaymentService {
  /**
   * Initialize PayHere payment with the backend
   */
  static async initializePayment(
    request: PayHerePaymentRequest
  ): Promise<PayHerePaymentResponse> {
    try {
      console.log("Initializing payment with request:", request);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      console.log("Payment initialization response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Payment initialization failed:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || "Failed to initialize payment");
        } catch (parseError) {
          throw new Error(
            `Failed to initialize payment: ${response.status} ${response.statusText}`
          );
        }
      }

      const data = await response.json();
      console.log("Payment initialization successful:", data);

      // The response should be in ApiResponse format: { message, data }
      if (data.data) {
        return data.data;
      } else {
        // Fallback if the response structure is different
        return data;
      }
    } catch (error) {
      console.error("Error in initializePayment:", error);
      throw error;
    }
  }

  /**
   * Check payment status by order ID
   */
  static async checkPaymentStatus(orderId: string): Promise<any> {
    try {
      console.log("Checking payment status for order:", orderId);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/status/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to check payment status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Payment status check result:", data);

      return data.data || data;
    } catch (error) {
      console.error("Error checking payment status:", error);
      throw error;
    }
  }

  /**
   * Handle payment success callback
   */
  static async handlePaymentSuccess(orderId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/success?order_id=${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to handle payment success");
      }

      return response.json();
    } catch (error) {
      console.error("Error handling payment success:", error);
      throw error;
    }
  }

  /**
   * Handle payment cancellation callback
   */
  static async handlePaymentCancel(orderId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/cancel?order_id=${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to handle payment cancellation");
      }

      return response.json();
    } catch (error) {
      console.error("Error handling payment cancellation:", error);
      throw error;
    }
  }
}
