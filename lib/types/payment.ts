export interface PayHerePaymentRequest {
  campaignId: number;
  memberId: number;
  amount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  isAnonymous: boolean;
  message?: string;
}

export interface PayHerePaymentResponse {
  orderId: string;
  hash: string;
  merchantId: string;
  amount: string;
  currency: string;
  itemDescription: string;
  sandbox: boolean;
}

export interface PayHereConfig {
  sandbox: boolean;
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: string;
  currency: string;
  hash: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

declare global {
  interface Window {
    payhere: {
      startPayment: (config: PayHereConfig) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}
