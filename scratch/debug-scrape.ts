export {};

async function main() {
  const url = "https://www.sunix.com.tr/kategori?sayfa=1";
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  const html = await response.text();
  const blocks = html.split('class="th-product-card"');
  console.log("Blocks found:", blocks.length);
  for (let i = 1; i < Math.min(blocks.length, 5); i++) {
    console.log(`--- Block ${i} ---`);
    console.log(blocks[i].substring(0, 500));
  }
}
main();
