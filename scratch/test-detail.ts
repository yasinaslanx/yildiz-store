async function main() {
  const url = "https://www.sunix.com.tr/urun/usb-20-flash-bellek";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await response.text();
  
  // Try to find product code
  const skuMatch = html.match(/Ürün Kodu:\s*<b>([^<]+)<\/b>/i) || 
                   html.match(/prod-code[^>]*>[\s\S]*?<b>([^<]+)<\/b>/i);
  const sku = skuMatch ? skuMatch[1].trim() : '';
  
  // Try to find description or models
  const modelsMatch = html.match(/<div class="prod-models__group">([\s\S]*?)<\/div>/i) || 
                      html.match(/<div class="prod-models">([\s\S]*?)<\/div>/i);
  
  console.log("SKU found:", sku);
  console.log("Models found:", !!modelsMatch);
}
main();
