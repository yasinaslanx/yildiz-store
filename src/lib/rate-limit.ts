import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Redis konfigürasyonunun geçerli olup olmadığını kontrol et
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_URL !== "https://your-upstash-url.upstash.io" &&
  process.env.UPSTASH_REDIS_REST_TOKEN && 
  process.env.UPSTASH_REDIS_REST_TOKEN !== "your-upstash-token";

// Redis instance
const redis = isRedisConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Rate limit oluşturucu (Redis yoksa pas geçer)
function createRateLimit(limiter: any) {
  if (!redis) {
    return {
      limit: async () => ({ 
        success: true, 
        remaining: 999, 
        limit: 999, 
        reset: Date.now() + 60000 
      }),
    };
  }
  return new Ratelimit({
    redis,
    limiter,
    analytics: true,
  });
}

// Auth (Login) Rate Limit: 10 saniyede 5 istek
export const authRateLimit = createRateLimit(Ratelimit.slidingWindow(5, "10 s"));

// Şifre Sıfırlama Rate Limit: 1 dakikada 3 istek
export const forgotPasswordRateLimit = createRateLimit(Ratelimit.slidingWindow(3, "1 m"));

// Ödeme (Checkout) Rate Limit: 1 dakikada 10 istek
export const checkoutRateLimit = createRateLimit(Ratelimit.slidingWindow(10, "1 m"));

