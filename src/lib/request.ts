/**
 * İstek yapan kullanıcının IP adresini döner.
 */
export function getRequestIp(request: Request) {
  // Proxy arkasındaysa (Vercel vb.) x-forwarded-for başlığını kontrol et
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Localhost veya doğrudan erişim
  return "127.0.0.1";
}
