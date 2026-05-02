import { prisma } from './src/lib/prisma.js'
import bcrypt from 'bcrypt'

async function createTestUsers() {
  try {
    console.log('🔐 Creating test users...')

    const hashedAdminPassword = await bcrypt.hash('Admin123!@#', 12)
    const hashedUserPassword = await bcrypt.hash('User123!@#', 12)

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@demo.local' },
      update: {
        role: 'ADMIN',
        passwordHash: hashedAdminPassword,
      },
      create: {
        username: 'admin_demo',
        email: 'admin@demo.local',
        passwordHash: hashedAdminPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Admin user created/updated:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Role: ${admin.role}`)

    // Create regular user
    const user = await prisma.user.upsert({
      where: { email: 'user@demo.local' },
      update: {
        passwordHash: hashedUserPassword,
      },
      create: {
        username: 'demo_user',
        email: 'user@demo.local',
        passwordHash: hashedUserPassword,
        role: 'USER',
      },
    })

    console.log('✅ Regular user created/updated:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Role: ${user.role}`)

    console.log('\n🎉 Test users ready for testing!')
  } catch (error) {
    console.error('❌ Error creating test users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUsers()
