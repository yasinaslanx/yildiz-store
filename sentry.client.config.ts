import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Hata yakalama oranı (%100 prod'da düşürülebilir)
  tracesSampleRate: 1.0,

  // Debug modu (development'ta true olabilir)
  debug: false,
});
