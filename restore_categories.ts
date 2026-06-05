import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categoriesToRestore = [
  { name: "Akıllı Saat", slug: "akilli-saat" },
  { name: "Aksesuarlar", slug: "phone-accessories" },
  { name: "Araç Şarj & FM Modülatör", slug: "arac-sarj-fm-modulator" },
  { name: "Araç Telefon Tutucu", slug: "arac-telefon-tutucu" },
  { name: "Bilgisayarlar", slug: "bilgisayarlar" },
  { name: "Bluetooth Kulaklık", slug: "bluetooth-kulaklik" },
  { name: "Çevirici", slug: "cevirici" },
  { name: "Depolama(SD) Ürünleri", slug: "depolamasd-urunleri" },
  { name: "Diğer Aksesuarlar", slug: "diger-aksesuarlar" },
  { name: "Ekran Koruyucu", slug: "ekran-koruyucu" },
  { name: "Hoparlör", slug: "hoparlor" },
  { name: "Kablo", slug: "kablo" },
  { name: "Kablolu Kulaklık", slug: "kablolu-kulaklik" },
  { name: "Kapak / Kılıf", slug: "kapak-kilif" },
  { name: "Lensler", slug: "lensler" },
  { name: "Şarj Aleti", slug: "sarj-aleti" },
  { name: "Taşınabilir Pil", slug: "tasinabilir-pil" },
  { name: "Telefonlar", slug: "telefonlar" },
];

async function main() {
  console.log("Kategoriler kurtarılıyor...");

  for (const cat of categoriesToRestore) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        active: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: `${cat.name} ürünleri`,
        image: "https://placehold.co/600x600/f5f5f4/a8a29e?text=" + encodeURIComponent(cat.name),
        active: true,
      },
    });
  }

  console.log("Tüm 18 kategori başarıyla eklendi/kurtarıldı!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
