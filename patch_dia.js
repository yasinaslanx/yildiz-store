const fs = require('fs');

let code = fs.readFileSync('src/app/api/admin/warehouse/dia-import/route.ts', 'utf-8');

// Replace the parsing block
const oldParsingBlock = `      let buyPrice = row[5] ? parseFloat(row[5]) : 0;
      let branchPrice = row[6] ? parseFloat(row[6]) : 0;
      let wholesalePrice = row[7] ? parseFloat(row[7]) : 0;
      let price = row[8] ? parseFloat(row[8]) : 0;

      // TǬm fiyatlar alY fiyatna (buyPrice) sabitle (Yeni istenen mantk)
      const basePrice = buyPrice > 0 ? buyPrice : (price > 0 ? price : 0);

      const finalBuyPrice = basePrice * exchangeRate;
      const finalPrice = basePrice * exchangeRate;`;

const newParsingBlock = `      let buyPrice = row[5] ? parseFloat(row[5]) * exchangeRate : 0;
      let branchPrice = row[6] ? parseFloat(row[6]) * exchangeRate : 0;
      let wholesalePrice = row[7] ? parseFloat(row[7]) * exchangeRate : 0;
      let retailPrice = row[8] ? parseFloat(row[8]) * exchangeRate : 0;`;

code = code.replace(oldParsingBlock, newParsingBlock);

// Replace existing update
const oldUpdateBlock = `        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            stock: stock,
            buyPrice: finalBuyPrice
          }
        });`;

const newUpdateBlock = `        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            stock: stock,
            buyPrice: buyPrice,
            branchPrice: branchPrice,
            wholesalePrice: wholesalePrice,
            retailPrice: retailPrice
          }
        });`;

code = code.replace(oldUpdateBlock, newUpdateBlock);

// Replace create
const oldCreateBlock = `        const newVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: sku,
            color: "Standart",
            price: finalPrice,
            wholesalePrice: finalPrice,
            branchPrice: finalPrice,
            buyPrice: finalBuyPrice,
            stock: stock
          }
        });`;

const newCreateBlock = `        const newVariant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            sku: sku,
            color: "Standart",
            stock: stock,
            buyPrice: buyPrice,
            branchPrice: branchPrice,
            wholesalePrice: wholesalePrice,
            retailPrice: retailPrice,
            price: buyPrice, // Yeni ürünlerde site müşteri fiyatı alış fiyatından başlar
            dealerPrice: buyPrice // Yeni ürünlerde site bayi fiyatı alış fiyatından başlar
          }
        });`;

code = code.replace(oldCreateBlock, newCreateBlock);

fs.writeFileSync('src/app/api/admin/warehouse/dia-import/route.ts', code);
console.log('done dia');
