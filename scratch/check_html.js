const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('public/MySunixBayiPortalı.html', 'utf8');
const $ = cheerio.load(html);
const count = $('.frm-pos-kart').length;
console.log('Product count in MySunixBayiPortalı.html:', count);
