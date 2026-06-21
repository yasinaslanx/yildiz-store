const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const config = {
  host: '45.143.11.222',
  port: 22,
  username: 'root',
  password: 'Zxcasdqwe.123'
};

const BOT_DIR = '/root/yildiz-bot';

conn.on('ready', () => {
  console.log('Sunucuya baglanildi. Guncelleniyor...');
  
  conn.sftp((err, sftp) => {
    if (err) throw err;
    
    sftp.fastPut(path.join(__dirname, 'telegram-bot.ts'), `${BOT_DIR}/telegram-bot.ts`, (err) => {
      if (err) throw err;
      
      console.log('Bot dosyasi guncellendi. Paketler yuklenip PM2 yeniden baslatiliyor...');
      conn.exec(`cd ${BOT_DIR} && npm install pg @prisma/adapter-pg && pm2 restart yildiz-bot`, (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('Guncelleme tamamlandi!');
          conn.end();
        }).on('data', (data) => {
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          process.stderr.write(data);
        });
      });
    });
  });
}).on('error', (err) => {
  console.error('Baglanti hatasi:', err);
}).connect(config);
