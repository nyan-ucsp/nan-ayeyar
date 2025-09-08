import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCompanyPaymentAccounts() {
  console.log('🌱 Seeding company payment accounts...');

  try {
    // Check if accounts already exist
    const existingAccounts = await prisma.companyPaymentAccount.count();
    if (existingAccounts > 0) {
      console.log('Company payment accounts already exist, skipping...');
      return;
    }

    // Sample company payment accounts
    const companyAccounts = [
      {
        name: 'AYA Bank - Main Account',
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '1234567890',
          accountName: 'Nan Ayeyar Trading Co. Ltd.',
          branch: 'Yangon Main Branch',
          swiftCode: 'AYABMMYY',
          notes: 'Main business account for rice trading'
        },
        enabled: true
      },
      {
        name: 'AYA Bank - Secondary Account',
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '0987654321',
          accountName: 'Nan Ayeyar Trading Co. Ltd.',
          branch: 'Mandalay Branch',
          swiftCode: 'AYABMMYY',
          notes: 'Secondary account for regional operations'
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
          notes: 'KBZ Bank main account'
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
          notes: 'AYA Pay mobile payment account'
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
          notes: 'KBZ Pay mobile payment account'
        },
        enabled: true
      },
      {
        name: 'AYA Bank - Disabled Account',
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '5555555555',
          accountName: 'Nan Ayeyar Trading Co. Ltd.',
          branch: 'Test Branch',
          swiftCode: 'AYABMMYY',
          notes: 'This account is disabled for testing'
        },
        enabled: false
      }
    ];

    // Create company payment accounts
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

async function seedCustomerPaymentMethods() {
  console.log('🌱 Seeding customer payment methods...');

  try {
    // Get a sample customer (assuming one exists from user seeding)
    const customer = await prisma.user.findFirst({
      where: { role: 'customer' }
    });

    if (!customer) {
      console.log('No customer found, skipping payment method seeding...');
      return;
    }

    // Check if customer already has payment methods
    const existingMethods = await prisma.paymentMethod.count({
      where: { userId: customer.id }
    });

    if (existingMethods > 0) {
      console.log('Customer already has payment methods, skipping...');
      return;
    }

    // Sample customer payment methods
    const paymentMethods = [
      {
        userId: customer.id,
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '9876543210',
          accountName: customer.name
        }
      },
      {
        userId: customer.id,
        type: 'AYA_PAY' as const,
        details: {
          phone: '09123456789',
          name: customer.name
        }
      }
    ];

    // Create customer payment methods
    for (const method of paymentMethods) {
      await prisma.paymentMethod.create({
        data: method
      });
      console.log(`✅ Created payment method: ${method.type} for ${customer.name}`);
    }

    console.log(`🎉 Successfully seeded ${paymentMethods.length} customer payment methods!`);

  } catch (error) {
    console.error('❌ Error seeding customer payment methods:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCompanyPaymentAccounts();
    await seedCustomerPaymentMethods();
    
    console.log('🎉 Payment system seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  main();
}

export { seedCompanyPaymentAccounts, seedCustomerPaymentMethods };
