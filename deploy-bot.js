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
  console.log('Sunucuya baglanildi. Dizin olusturuluyor...');
  
  conn.exec(`mkdir -p ${BOT_DIR} && mkdir -p ${BOT_DIR}/prisma`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('Dizin olusturuldu. Dosyalar yukleniyor...');
      
      conn.sftp((err, sftp) => {
        if (err) throw err;
        
        const filesToUpload = [
          { local: 'telegram-bot.ts', remote: `${BOT_DIR}/telegram-bot.ts` },
          { local: 'package.json', remote: `${BOT_DIR}/package.json` },
          { local: '.env', remote: `${BOT_DIR}/.env` },
          { local: 'prisma/schema.prisma', remote: `${BOT_DIR}/prisma/schema.prisma` }
        ];
        
        let uploaded = 0;
        filesToUpload.forEach(file => {
          sftp.fastPut(path.join(__dirname, file.local), file.remote, (err) => {
            if (err) {
              console.error(`Yukleme hatasi: ${file.local}`, err);
              conn.end();
            } else {
              uploaded++;
              console.log(`${file.local} yuklendi.`);
              if (uploaded === filesToUpload.length) {
                console.log('Tum dosyalar yuklendi. NPM paketleri kuruluyor (Bu biraz surebilir)...');
                
                // Run setup commands
                const setupCmd = `
                  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - &&
                  apt-get install -y nodejs &&
                  npm install -g pm2 &&
                  cd ${BOT_DIR} &&
                  npm install telegraf @prisma/client &&
                  npm install -D prisma tsx typescript &&
                  npx prisma generate &&
                  pm2 start npx --name "yildiz-bot" -- tsx telegram-bot.ts &&
                  pm2 save
                `;
                
                conn.exec(setupCmd, (err, stream) => {
                  if (err) throw err;
                  stream.on('close', (code, signal) => {
                    console.log('Kurulum tamamlandi! Bot 7/24 calisiyor.');
                    conn.end();
                  }).on('data', (data) => {
                    process.stdout.write(data);
                  }).stderr.on('data', (data) => {
                    process.stderr.write(data);
                  });
                });
              }
            }
          });
        });
      });
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.error('Baglanti hatasi:', err);
}).connect(config);
