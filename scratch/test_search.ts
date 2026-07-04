function normalizeSearch(text: string) {
  return text.toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i') // Fix dotted i lowercase glitch in some engines
    .replace(/ı/g, 'i') // Map dotless ı to i for easier search
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c');
}

const productName = "SUNİX FN-08 FAN";
const searchQuery = "sunix fn";

const normName = normalizeSearch(productName);
const normQuery = normalizeSearch(searchQuery);

const terms = normQuery.split(/\s+/);
const matches = terms.every(term => normName.includes(term));

console.log("normName:", normName);
console.log("normQuery:", normQuery);
console.log("matches:", matches);
