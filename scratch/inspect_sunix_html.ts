import * as fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = 'C:\\Users\\Monster\\ÇALIŞMALARIM\\yildizstore\\yildiz-store\\public\\images\\MySunix - Bayi Portalı.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

const productImages = $('img[src*="urun"], img[src*="resim"]').slice(0, 3).toArray();

productImages.forEach((img, i) => {
  const $img = $(img);
  console.log(`[Product ${i}]`);
  console.log(`  HTML of Parent's Parent: \n${$img.parent().parent().html()}`);
});
