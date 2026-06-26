import * as xlsx from 'xlsx';

const workbook = xlsx.readFile('public/urunlerTablosu.xls');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

console.log('Total rows:', data.length);
console.log('First 2 rows:', data.slice(0, 2));

const watches = data.filter((row: any) => {
  const values = Object.values(row).join(' ').toLowerCase();
  return values.includes('saat') || values.includes('watch') || values.includes('akıllı');
});

console.log('Watches found:', watches.length);
console.log('First 5 watches:', watches.slice(0, 5));
