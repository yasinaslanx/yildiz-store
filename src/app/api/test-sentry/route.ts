import { NextResponse } from "next/server";

/**
 * Sentry entegrasyonunu test etmek için kasıtlı bir hata fırlatır.
 */
export async function GET() {
  console.log("Sentry test rotası tetiklendi...");
  throw new Error("YıldızStore: Sentry test hatası!");
}
