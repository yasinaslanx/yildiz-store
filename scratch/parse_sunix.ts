import * as fs from 'fs';
import * as cheerio from 'cheerio';

const htmlPath = 'C:\\Users\\Monster\\ÇALIŞMALARIM\\yildizstore\\yildiz-store\\public\\images\\MySunix - Bayi Portalı.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const $ = cheerio.load(html);

// We need to figure out what classes are used for products
// Let's try to find elements with class containing 'product', 'item', 'card'
const candidates = $('div[class*="product"], div[class*="item"], div[class*="pos-grid"], div.urun-kutu');
console.log(`Found candidates: ${candidates.length}`);

// If there are too many, let's just find images and their parent texts
const first10Images = $('img').slice(0, 10).toArray();
first10Images.forEach((img, i) => {
  const src = $(img).attr('src');
  const parentText = $(img).parent().text().replace(/\s+/g, ' ').trim().substring(0, 100);
  console.log(`[${i}] src: ${src} | context: ${parentText}`);
});

// Maybe they have data attributes?
const itemsWithData = $('[data-kod], [data-sku], [data-name], [data-urun-adi]').slice(0, 5).toArray();
itemsWithData.forEach((el, i) => {
  console.log(`Data element [${i}]:`, el.attribs);
});
