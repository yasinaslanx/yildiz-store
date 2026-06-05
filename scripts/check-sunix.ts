import axios from "axios";
import * as cheerio from "cheerio";

async function checkPagination() {
  const r1 = await axios.get("https://sunix.com.tr/kategori/kablo");
  const $1 = cheerio.load(r1.data);
  const p1 = $1('.th-product-card__name').first().text();

  const r2 = await axios.get("https://sunix.com.tr/kategori/kablo?page=2");
  const $2 = cheerio.load(r2.data);
  const p2 = $2('.th-product-card__name').first().text();

  const r3 = await axios.get("https://sunix.com.tr/kategori/kablo?sayfa=2");
  const $3 = cheerio.load(r3.data);
  const p3 = $3('.th-product-card__name').first().text();

  console.log("Page 1 first product:", p1);
  console.log("Page 2 first product (page=2):", p2);
  console.log("Page 2 first product (sayfa=2):", p3);
}

checkPagination();
