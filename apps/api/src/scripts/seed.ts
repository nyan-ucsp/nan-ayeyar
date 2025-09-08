import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedProducts } from './seedProducts';
import { seedDemoCustomer, seedCustomerPaymentMethods } from './seedCustomers';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Seed in order of dependencies
    await seedAdminUser();
    await seedCompanyPaymentAccounts();
    await seedProducts();
    await seedDemoCustomer();
    await seedCustomerPaymentMethods();

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedAdminUser() {
  console.log('👤 Seeding admin user...');

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nanayeyar.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists, skipping...');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('AdminPass123!', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@nanayeyar.com',
        passwordHash: hashedPassword,
        name: 'System Administrator',
        address: 'Yangon, Myanmar',
        locale: 'en',
        role: 'admin',
        isEmailVerified: true
      }
    });

    console.log(`✅ Created admin user: ${admin.email}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function seedCompanyPaymentAccounts() {
  console.log('🏦 Seeding company payment accounts...');

  try {
    // Check if accounts already exist
    const existingAccounts = await prisma.companyPaymentAccount.count();
    if (existingAccounts > 0) {
      console.log('Company payment accounts already exist, skipping...');
      return;
    }

    const companyAccounts = [
      {
        name: 'AYA Bank - Main Account',
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '1234567890',
          accountName: 'Nan Ayeyar Trading Co. Ltd.',
          branch: 'Yangon Main Branch',
          swiftCode: 'AYABMMYY',
          notes: 'Main business account for rice trading operations'
        },
        enabled: true
      },
      {
        name: 'KBZ Bank - Main Account',
        type: 'KBZ_BANK' as const,
        details: {
          accountNo: '1122334455',
          accountName: 'Nan Ayeyar Trading Co. Ltd.',
          branch: 'Yangon Central Branch',
          swiftCode: 'KBZBMMYY',
          notes: 'KBZ Bank main account for customer payments'
        },
        enabled: true
      },
      {
        name: 'AYA Pay - Mobile Payment',
        type: 'AYA_PAY' as const,
        details: {
          accountNo: '09123456789',
          accountName: 'Nan Ayeyar Trading',
          phone: '09123456789',
          notes: 'AYA Pay mobile payment account for quick transactions'
        },
        enabled: true
      },
      {
        name: 'KBZ Pay - Mobile Payment',
        type: 'KBZ_PAY' as const,
        details: {
          accountNo: '09987654321',
          accountName: 'Nan Ayeyar Trading',
          phone: '09987654321',
          notes: 'KBZ Pay mobile payment account for customer convenience'
        },
        enabled: true
      }
    ];

    for (const account of companyAccounts) {
      await prisma.companyPaymentAccount.create({
        data: account
      });
      console.log(`✅ Created company account: ${account.name}`);
    }

    console.log(`🎉 Successfully seeded ${companyAccounts.length} company payment accounts!`);
  } catch (error) {
    console.error('❌ Error seeding company payment accounts:', error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

export { main as seed };