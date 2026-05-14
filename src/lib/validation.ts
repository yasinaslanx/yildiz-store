import { ZodError } from "zod";

/**
 * Zod hatalarından ilk hata mesajını ayıklar.
 */
export function getZodErrorMessage(error: ZodError) {
  return error.issues[0]?.message || "Geçersiz veri.";
}
