import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, "En az 1 puan verebilirsiniz.")
    .max(5, "En fazla 5 puan verebilirsiniz."),
    
  title: z
    .string()
    .max(120, "Başlık en fazla 120 karakter olabilir.")
    .optional()
    .or(z.literal("")),
    
  comment: z
    .string()
    .min(1, "Yorum zorunludur.")
    .min(10, "Yorum en az 10 karakter olmalıdır.")
    .max(2000, "Yorum en fazla 2000 karakter olabilir."),
});

export const adminReviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  adminReply: z.string().max(2000).optional().nullable(),
  comment: z.string().min(10).max(2000).optional(),
  title: z.string().max(120).optional().nullable(),
  rating: z.number().min(1).max(5).optional(),
});
