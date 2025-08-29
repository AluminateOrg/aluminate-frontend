// lib/services/paymentService.ts
import {
  PayHerePaymentRequest,
  PayHerePaymentResponse,
} from "@/lib/types/payment";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export class PaymentService {
  static async initializePayment(
    request: PayHerePaymentRequest
  ): Promise<PayHerePaymentResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/portal/payment/payhere/initialize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to initialize payment");
    }

    const data = await response.json();
    return data.data;
  }

  static async checkPaymentStatus(orderId: string): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/portal/payment/payhere/success/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check payment status");
    }

    return response.json();
  }
}

export default PaymentService;
