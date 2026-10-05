import { PaymentProviderId } from "@/types";
import { PaymentProvider } from "./types";
import { stripeProvider } from "./stripe";
import { sslcommerzProvider } from "./sslcommerz";

const providers: Record<PaymentProviderId, PaymentProvider> = {
  stripe: stripeProvider,
  sslcommerz: sslcommerzProvider,
};

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider {
  return providers[id];
}

export function listPaymentProviders(): PaymentProvider[] {
  return Object.values(providers);
}
