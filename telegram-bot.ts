import "dotenv/config";
import { Telegraf } from 'telegraf';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const token = process.env.TELEGRAM_BOT_TOKEN;
const ownerChatId = process.env.TELEGRAM_CHAT_ID;
const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID; // Yeni grup ID'si

if (!token || !ownerChatId) {
  console.error("HATA: TELEGRAM_BOT_TOKEN veya TELEGRAM_CHAT_ID bulunamadı.");
  process.exit(1);
}

const bot = new Telegraf(token);

// /id komutu (herkes kullanabilir, ID'yi öğrenmek için)
bot.command('id', (ctx) => {
  ctx.reply(`Bu sohbetin ID'si: \`${ctx.chat.id}\``, { parse_mode: 'Markdown' });
});

// Sadece sistem sahibine VEYA onaylı bayi grubuna izin ver
bot.use(async (ctx, next) => {
  const chatId = ctx.chat?.id.toString();
  const userId = ctx.from?.id.toString();
  
  if (userId === ownerChatId) {
    return next(); // Patron her şeyi yapabilir
  }
  
  if (groupChatId && chatId === groupChatId) {
    return next(); // Onaylı grup içindeki komutlar çalışabilir
  }
  
  return ctx.reply("⛔ Yetkisiz erişim. Bu bot sadece yetkili kanallarda kullanılabilir.");
});

// /start komutu
bot.start((ctx) => {
  const welcomeMessage = `
👋 *Sunix Store Yönetim Botuna Hoş Geldiniz!*

Ben 7/24 mağazanızı izleyen dijital asistanınızım. Aşağıdaki komutları kullanarak benden anlık bilgi alabilirsiniz:

📦 /stok - Kritik stoktaki ürünleri listeler
💵 /dolar - Güncel Dolar/TL kurunu canlı çeker
📋 /siparisler - Bugünkü son sipariş özetini verir

_Ayrıca bayilerden yeni sipariş geldiğinde size otomatik olarak buradan bildirim göndereceğim!_

🖋️ _Hazırlayan: Yasin Aslan_
  `;
  ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// /dolar komutu
bot.command('dolar', async (ctx) => {
  try {
    await ctx.reply("⏳ Güncel kur bilgisi çekiliyor...");
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const tryRate = data.rates.TRY;
    
    ctx.reply(`💵 *GÜNCEL USD/TL KURU*\n\n1 USD = *${tryRate} TL*\n\n_Kaynak: ExchangeRate-API (Global Piyasa)_\n\n🖋️ _Hazırlayan: Yasin Aslan_`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.reply("❌ Kur bilgisi çekilirken bir hata oluştu.");
  }
});

// /stok komutu
bot.command('stok', async (ctx) => {
  if (ctx.chat.id.toString() !== ownerChatId) {
    return ctx.reply("⛔ Bu komut gizlidir ve sadece patrona özel sohbetten çalışır.");
  }
  try {
    await ctx.reply("⏳ Kritik stoktaki ürünler taranıyor...");
    
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lt: 5 } },
      include: { product: true },
      orderBy: { stock: 'asc' },
      take: 20 
    });
    
    if (lowStockVariants.length === 0) {
      return ctx.reply("✅ Harika! Stok seviyesi 5'in altında olan hiçbir ürün yok.");
    }
    
    let message = `⚠️ *KRİTİK STOK UYARISI* (Stoğu 5'in Altında Olanlar)\n\n`;
    lowStockVariants.forEach((v, index) => {
      message += `${index + 1}. *${v.product.name}* (${v.color || 'Standart'})\n   SKU: \`${v.sku}\` | 📦 Kalan: *${v.stock}*\n\n`;
    });
    
    if (lowStockVariants.length === 20) {
      message += `_...ve diğerleri (Devamı için Depo Paneline girin)_\n\n`;
    }
    
    message += `🖋️ _Hazırlayan: Yasin Aslan_`;
    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(error);
    ctx.reply("❌ Stok bilgisi çekilirken bir hata oluştu.");
  }
});

// /siparisler komutu
bot.command('siparisler', async (ctx) => {
  if (ctx.chat.id.toString() !== ownerChatId) {
    return ctx.reply("⛔ Bu komut gizlidir ve sadece patrona özel sohbetten çalışır.");
  }
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: today } },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    
    if (orders.length === 0) {
      return ctx.reply("Bugün henüz hiç sipariş gelmedi.");
    }
    
    let message = `📦 *BUGÜNKÜ SİPARİŞLER (${orders.length} Adet)*\n\n`;
    orders.forEach((o, index) => {
      const time = o.createdAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      const role = o.user.role === 'DEALER' ? '🏢 BAYİ' : '👤 PERAKENDE';
      message += `*${time}* | ${role}\n   Müşteri: ${o.user?.firstName || 'Bilinmiyor'} ${o.user?.lastName || ''}\n   Tutar: *${Number(o.totalAmount).toLocaleString()} ₺*\n   Durum: ${o.status}\n\n`;
    });
    
    message += `🖋️ _Hazırlayan: Yasin Aslan_`;
    ctx.reply(message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error(error);
    ctx.reply("❌ Sipariş bilgisi çekilirken bir hata oluştu.");
  }
});

// /fiyat komutu (Bayiler için fiyat sorgulama)
bot.command('fiyat', async (ctx) => {
  try {
    const args = ctx.message.text.split(' ').slice(1).join(' ');
    if (!args || args.length < 3) {
      return ctx.reply("Lütfen aradığınız ürünün adını veya SKU kodunu yazın.\nÖrnek: `/fiyat kulaklık`", { parse_mode: 'Markdown' });
    }

    const products = await prisma.productVariant.findMany({
      where: {
        OR: [
          { sku: { contains: args, mode: 'insensitive' } },
          { product: { name: { contains: args, mode: 'insensitive' } } }
        ]
      },
      include: { product: true },
      take: 5
    });

    if (products.length === 0) {
      return ctx.reply(`❌ "${args}" ile eşleşen ürün bulunamadı.`);
    }

    let message = `🔍 *Arama Sonuçları (${args})*\n\n`;
    products.forEach(v => {
      message += `📦 *${v.product.name}* (${v.color || 'Standart'})\n`;
      message += `   SKU: \`${v.sku}\`\n`;
      message += `   Fiyat: *${Number(v.price).toLocaleString()} ₺*\n`;
      message += `   Stok: ${v.stock > 0 ? `✅ (${v.stock} adet)` : '❌ Tükendi'}\n\n`;
    });
    
    message += `🖋️ _Hazırlayan: Yasin Aslan_`;
    ctx.reply(message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error(error);
    ctx.reply("❌ Fiyat sorgulanırken hata oluştu.");
  }
});

// Otomatik Günlük Stok Kontrolü (Her sabah saat 09:00'da kontrol eder)
setInterval(async () => {
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() === 0 && now.getSeconds() === 0) {
    try {
      const outOfStock = await prisma.productVariant.count({ where: { stock: 0 } });
      const lowStock = await prisma.productVariant.count({ where: { stock: { gt: 0, lt: 5 } } });
      
      if (outOfStock > 0 || lowStock > 0) {
        let msg = `🌅 *Günaydın Patron!*\n\nBugünkü sabah stok raporun:\n\n`;
        msg += `🚨 *Tükenen Ürünler:* ${outOfStock} adet\n`;
        msg += `⚠️ *Stoğu Azalanlar (<5):* ${lowStock} adet\n\n`;
        msg += `_Detayları görmek için /stok yazabilir veya panele girebilirsin._\n\n🖋️ _Hazırlayan: Yasin Aslan_`;
        
        bot.telegram.sendMessage(ownerChatId, msg, { parse_mode: 'Markdown' });
      }
    } catch (e) {
      console.error("Günlük kontrol hatası:", e);
    }
  }
}, 1000); // Saniyede bir kontrol et

bot.launch().then(async () => {
  console.log("🚀 Telegram Botu başarıyla başlatıldı ve 7/24 dinliyor...");
  
  try {
    // 1. Herkes için varsayılan komutlar (Gruplar vs.)
    await bot.telegram.setMyCommands([
      { command: 'dolar', description: 'Güncel USD/TL Kuru' },
      { command: 'fiyat', description: 'Ürün stok ve fiyat sorgulama' }
    ]);

    // 2. Sadece Patron için özel komutlar (Özel DM menüsü)
    await bot.telegram.setMyCommands([
      { command: 'start', description: 'Ana menüyü aç' },
      { command: 'dolar', description: 'Güncel USD/TL Kuru' },
      { command: 'fiyat', description: 'Ürün stok ve fiyat sorgulama' },
      { command: 'stok', description: 'Kritik stok uyarısı' },
      { command: 'siparisler', description: 'Günlük sipariş raporu' }
    ], { scope: { type: 'chat', chat_id: Number(ownerChatId) } });
    
    console.log("✅ Telegram Menü komutları yetkilere göre ayarlandı.");
  } catch (err) {
    console.error("Menü komutları ayarlanamadı:", err);
  }

  bot.telegram.sendMessage(ownerChatId, "🤖 *Sunix Store Bot Başlatıldı!*\n\nSistem devrede, komutları kullanabilirsiniz.\n(Örn: /start, /dolar, /stok, /siparisler)\n\n🖋️ _Hazırlayan: Yasin Aslan_", { parse_mode: 'Markdown' });
}).catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
