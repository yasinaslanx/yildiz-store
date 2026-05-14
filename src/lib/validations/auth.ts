import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir e-posta girin.")
    .max(255),

  password: z
    .string()
    .min(6, "Şifre en az 6 karakter olmalıdır.")
    .max(100),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır.")
    .max(100),

  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır.")
    .max(100),

  email: z
    .string()
    .email("Geçerli bir e-posta girin.")
    .max(255),

  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(100),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir e-posta girin."),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),

  password: z
    .string()
    .min(8, "Şifre en az 8 karakter olmalıdır.")
    .max(100),
});
