import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır.")
    .max(200)
    .regex(/^[^0-9]*$/, "İsim rakam içeremez."),

  customerEmail: z
    .string()
    .email("Geçerli bir e-posta girin."),

  customerPhone: z
    .string()
    .min(10, "Telefon numarası en az 10 haneli olmalıdır.")
    .max(30),

  shippingAddress: z
    .string()
    .min(5, "Adres çok kısa.")
    .max(500),

  shippingCity: z
    .string()
    .min(2, "Şehir adı en az 2 karakter olmalıdır.")
    .max(100),

  shippingDistrict: z
    .string()
    .min(2, "İlçe adı en az 2 karakter olmalıdır.")
    .max(100),

  shippingPostalCode: z
    .string()
    .max(20)
    .optional(),

  paymentMethod: z
    .enum([
      "CASH_ON_DELIVERY",
      "BANK_TRANSFER",
      "CREDIT_CARD",
    ])
    .optional()
    .default("CASH_ON_DELIVERY"),
});
