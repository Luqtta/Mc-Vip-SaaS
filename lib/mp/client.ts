import { MercadoPagoConfig, Payment } from "mercadopago";

export function mpClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("MP_ACCESS_TOKEN missing");

  return new MercadoPagoConfig({ accessToken });
}

export function mpPaymentClient() {
  const config = mpClient();
  return new Payment(config);
}
