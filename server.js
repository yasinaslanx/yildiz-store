const path = require('path');
const dir = path.join(__dirname);

process.env.NODE_ENV = 'production';

// Next.js'in başlatma scriptini çağırarak sunucuyu başlatıyoruz.
// cPanel Passenger, uygulamayı başlatırken bu dosyayı okuyacak.
const cli = require('next/dist/cli/next-start');

cli.nextStart({
  port: process.env.PORT || 3000,
  dir,
});
