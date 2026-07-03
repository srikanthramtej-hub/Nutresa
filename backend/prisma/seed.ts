import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@nutrinest.in' },
    update: {},
    create: { name: 'Store Admin', email: 'admin@nutrinest.in', password: hash, role: 'ADMIN' },
  })

  const products = [
    {
      name: 'Premium Cashews', category: 'Nuts', basePrice: 120, stock: 120, isNew: true,
      description: 'Plump, buttery cashews from Goa and Karnataka. Rich in magnesium and healthy fats.',
      origin: 'Goa & Karnataka, India', shelfLife: '6 months',
      tags: JSON.stringify(['Protein', 'Heart Healthy', 'Vegan']),
      weights: [{ label: '100g', grams: 100, price: 120 }, { label: '250g', grams: 250, price: 280 }, { label: '500g', grams: 500, price: 540 }, { label: '1 kg', grams: 1000, price: 999 }],
    },
    {
      name: 'Medjool Dates', category: 'Dried Fruits', basePrice: 70, stock: 85, isNew: false,
      description: "Sun-ripened Medjool dates from Morocco. Naturally sweet, high in iron and fiber.",
      origin: "Morocco's Draa Valley", shelfLife: '12 months',
      tags: JSON.stringify(['Iron', 'Fiber', 'Natural Sugar']),
      weights: [{ label: '100g', grams: 100, price: 70 }, { label: '250g', grams: 250, price: 160 }, { label: '500g', grams: 500, price: 300 }, { label: '1 kg', grams: 1000, price: 560 }],
    },
    {
      name: 'California Almonds', category: 'Nuts', basePrice: 90, stock: 200, isNew: true,
      description: "Crisp almonds from California's Central Valley. Packed with Vitamin E and biotin.",
      origin: 'California, USA', shelfLife: '9 months',
      tags: JSON.stringify(['Vitamin E', 'Brain Health', 'Keto']),
      weights: [{ label: '100g', grams: 100, price: 90 }, { label: '250g', grams: 250, price: 210 }, { label: '500g', grams: 500, price: 400 }, { label: '1 kg', grams: 1000, price: 750 }],
    },
    {
      name: 'Turkish Figs', category: 'Dried Fruits', basePrice: 120, stock: 0, isNew: false,
      description: "Soft honey-sweet figs from Turkey's Aegean coast. Rich in calcium and antioxidants.",
      origin: "Turkey's Aegean Coast", shelfLife: '8 months',
      tags: JSON.stringify(['Calcium', 'Fiber', 'Antioxidants']),
      weights: [{ label: '100g', grams: 100, price: 120 }, { label: '250g', grams: 250, price: 280 }, { label: '500g', grams: 500, price: 530 }, { label: '1 kg', grams: 1000, price: 999 }],
    },
    {
      name: 'Pistachios', category: 'Nuts', basePrice: 160, stock: 60, isNew: false,
      description: "Premium pistachios from Iran's Kerman province. Most nutrient-dense nut per calorie.",
      origin: "Iran's Kerman Province", shelfLife: '6 months',
      tags: JSON.stringify(['Antioxidants', 'Protein', 'Keto']),
      weights: [{ label: '100g', grams: 100, price: 160 }, { label: '250g', grams: 250, price: 375 }, { label: '500g', grams: 500, price: 720 }, { label: '1 kg', grams: 1000, price: 1350 }],
    },
    {
      name: 'Dried Apricots', category: 'Dried Fruits', basePrice: 100, stock: 150, isNew: false,
      description: 'Sun-dried apricots packed with Vitamin A and iron. No added sugar or sulfites.',
      origin: 'Turkey & Afghanistan', shelfLife: '10 months',
      tags: JSON.stringify(['Vitamin A', 'Iron', 'Natural']),
      weights: [{ label: '100g', grams: 100, price: 100 }, { label: '250g', grams: 250, price: 230 }, { label: '500g', grams: 500, price: 440 }, { label: '1 kg', grams: 1000, price: 820 }],
    },
    {
      name: 'Macadamia Nuts', category: 'Nuts', basePrice: 400, stock: 45, isNew: false,
      description: "Rich creamy macadamia nuts from Hawaii. Loaded with healthy fats and thiamine.",
      origin: 'Hawaii, USA', shelfLife: '6 months',
      tags: JSON.stringify(['Keto', 'Heart Healthy', 'Premium']),
      weights: [{ label: '100g', grams: 100, price: 400 }, { label: '250g', grams: 250, price: 950 }, { label: '500g', grams: 500, price: 1800 }, { label: '1 kg', grams: 1000, price: 3400 }],
    },
    {
      name: 'Golden Raisins', category: 'Dried Fruits', basePrice: 40, stock: 300, isNew: true,
      description: 'Plump golden raisins from Nashik vineyards. Naturally sweet, no preservatives.',
      origin: 'Nashik, Maharashtra', shelfLife: '12 months',
      tags: JSON.stringify(['Iron', 'Potassium', 'Vegan']),
      weights: [{ label: '100g', grams: 100, price: 40 }, { label: '250g', grams: 250, price: 90 }, { label: '500g', grams: 500, price: 170 }, { label: '1 kg', grams: 1000, price: 320 }],
    },
  ]

  for (const p of products) {
    const { weights, ...data } = p
    const existing = await prisma.product.findFirst({ where: { name: data.name } })
    if (!existing) {
      const product = await prisma.product.create({ data })
      for (const w of weights) {
        await prisma.weightOption.create({ data: { ...w, productId: product.id } })
      }
      console.log(`  ✓ ${data.name}`)
    }
  }
  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())
