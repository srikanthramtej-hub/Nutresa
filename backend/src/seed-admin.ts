import { PrismaClient } from '@prisma/client'
import * as bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email    = 'admin@nutresa.in'
  const password = 'admin123'
  const name     = 'Store Admin'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('✓ Admin already exists:', email)
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } })
    console.log('✓ Role confirmed as ADMIN')
    return
  }

  const hashedPassword = await bcryptjs.hash(password, 10)

  const admin = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: 'ADMIN' },
  })

  console.log('✓ Admin created!  Email:', admin.email, '  Role:', admin.role)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())