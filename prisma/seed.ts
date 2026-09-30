import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const demoMaterials = [
  { name: '1.5 sq.mm Wire', category: 'Wire', unit: 'Roll', sellingPrice: 900 },
  { name: '2.5 sq.mm Wire', category: 'Wire', unit: 'Roll', sellingPrice: 1400 },
  { name: '4 sq.mm Wire', category: 'Wire', unit: 'Roll', sellingPrice: 2100 },
  { name: '6 sq.mm Wire', category: 'Wire', unit: 'Roll', sellingPrice: 3200 },
  { name: 'PVC Conduit 1 inch', category: 'Pipe', unit: 'Meter', sellingPrice: 45 },
  { name: 'Switch (Modular)', category: 'Switches', unit: 'Piece', sellingPrice: 85 },
  { name: 'Socket 6A', category: 'Switches', unit: 'Piece', sellingPrice: 120 },
  { name: 'Socket 16A', category: 'Switches', unit: 'Piece', sellingPrice: 160 },
  { name: '5A Plug Top', category: 'Accessories', unit: 'Piece', sellingPrice: 45 },
  { name: '15A Plug Top', category: 'Accessories', unit: 'Piece', sellingPrice: 75 },
  { name: 'LED Bulb 9W', category: 'Lighting', unit: 'Piece', sellingPrice: 110 },
  { name: 'LED Panel 12W', category: 'Lighting', unit: 'Piece', sellingPrice: 350 },
  { name: 'Ceiling Fan 1200mm', category: 'Fans', unit: 'Piece', sellingPrice: 1850 },
  { name: 'Fan Regulator', category: 'Accessories', unit: 'Piece', sellingPrice: 250 },
  { name: 'MCB 10A', category: 'Breakers', unit: 'Piece', sellingPrice: 160 },
  { name: 'MCB 32A', category: 'Breakers', unit: 'Piece', sellingPrice: 180 },
  { name: 'Distribution Board 8 Way', category: 'Breakers', unit: 'Piece', sellingPrice: 850 },
  { name: 'Junction Box', category: 'Accessories', unit: 'Piece', sellingPrice: 35 },
  { name: 'Electrical Tape', category: 'Consumables', unit: 'Roll', sellingPrice: 20 },
  { name: 'Cable Tie (100pk)', category: 'Consumables', unit: 'Packet', sellingPrice: 85 },
]

async function main() {
  console.log('Seeding demo materials...')
  
  for (const mat of demoMaterials) {
    await prisma.material.create({
      data: mat
    })
  }

  // Add demo customer for acceptance test
  await prisma.customer.create({
    data: {
      name: 'Ramesh Kumar',
      phone: '9876543210',
      address: '123 Main St, City',
      siteName: 'House Electrical Wiring',
    }
  })

  // Add default settings
  await prisma.settings.create({
    data: {
      id: '1',
      businessName: 'Peter Electricians',
      phone: '9876543210',
      address: 'Business address',
      invoicePrefix: 'PE-2026-',
      defaultTax: 18,
    }
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
