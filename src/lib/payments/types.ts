export interface CheckoutParams {
  transactionId: string; // our internal transaction id, used as the provider's reference
  amount: number; // final amount, after discount, in the provider's currency unit
  currency: string;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  ok: true;
  redirectUrl: string;
}

export interface CheckoutError {
  ok: false;
  error: string;
}

export interface PaymentProvider {
  id: "stripe" | "sslcommerz";
  label: string;
  currency: "USD" | "BDT";
  configured(): boolean;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult | CheckoutError>;
}
