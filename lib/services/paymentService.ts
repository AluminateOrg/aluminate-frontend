// lib/services/paymentService.ts
import {
  PayHerePaymentRequest,
  PayHerePaymentResponse,
} from "@/lib/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class PaymentService {
  /**
   * Initialize payment with backend
   */
  static async initializePayment(
    request: PayHerePaymentRequest
  ): Promise<PayHerePaymentResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Handle different response structures
      if (data.data) {
        return data.data;
      } else if (data.success && data.orderId) {
        return {
          orderId: data.orderId,
          hash: data.hash,
          merchantId: data.merchantId,
          amount: data.amount,
          currency: data.currency || "LKR",
          itemDescription: data.itemDescription,
          sandbox: data.sandbox || true,
        };
      } else {
        throw new Error("Invalid response format from payment service");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      throw error;
    }
  }

  /**
   * Check payment status
   */
  static async checkPaymentStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/success/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to check payment status: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Payment status check error:", error);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(orderId: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/details/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to get payment details: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error("Payment details error:", error);
      throw error;
    }
  }

  /**
   * Health check for payment service
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/portal/user/payment/payhere/health`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      return response.ok;
    } catch (error) {
      console.error("Payment service health check failed:", error);
      return false;
    }
  }
}

export default PaymentService;
