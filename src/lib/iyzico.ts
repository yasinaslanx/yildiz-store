import Iyzipay from "iyzipay";

export const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY!,
  secretKey: process.env.IYZIPAY_SECRET_KEY!,
  uri: process.env.IYZIPAY_URI ?? "https://sandbox-api.iyzipay.com",
});

export { Iyzipay };
