async function main() {
  const url = "https://www.sunix.com.tr/kategori?sayfa=1";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await response.text();
  
  // Let's use a simpler regex first or match all th-product-card elements
  const regex = /<a\s+[^>]*href="([^"]*)"[^>]*class="[^"]*th-product-card[^"]*"[\s\S]*?<\/a>/gi;
  const matches = [...html.matchAll(regex)];
  console.log("Matches found:", matches.length);
  
  for (let i = 0; i < Math.min(matches.length, 5); i++) {
    const cardHtml = matches[i][0];
    const detailUrl = matches[i][1];
    
    const idMatch = detailUrl.match(/id=(\d+)/);
    const id = idMatch ? idMatch[1] : '';
    
    const srcMatch = cardHtml.match(/data-src="([^"]+)"/);
    const imageUrl = srcMatch ? srcMatch[1] : '';
    
    const catMatch = cardHtml.match(/class="th-product-card__cat">([^<]+)<\/div>/i);
    const category = catMatch ? catMatch[1].trim() : '';
    
    const nameMatch = cardHtml.match(/class="th-product-card__name">([^<]+)<\/div>/i);
    const name = nameMatch ? nameMatch[1].trim() : '';
    
    console.log({ id, name, category, imageUrl, detailUrl });
  }
}
main();
