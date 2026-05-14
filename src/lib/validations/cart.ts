import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z
    .string()
    .min(1),

  quantity: z
    .number()
    .int()
    .positive()
    .max(20)
    .optional()
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive()
    .max(20),
});
