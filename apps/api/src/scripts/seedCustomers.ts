import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedDemoCustomer() {
  console.log('👤 Seeding demo customer...');

  try {
    // Check if demo customer already exists
    const existingCustomer = await prisma.user.findUnique({
      where: { email: 'demo@nanayeyar.com' }
    });

    if (existingCustomer) {
      console.log('Demo customer already exists, skipping...');
      return existingCustomer;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('DemoPass123!', 12);

    // Create demo customer
    const customer = await prisma.user.create({
      data: {
        email: 'demo@nanayeyar.com',
        passwordHash: hashedPassword,
        name: 'Demo Customer',
        address: '123 Main Street, Yangon, Myanmar',
        locale: 'en',
        role: 'customer',
        isEmailVerified: true
      }
    });

    console.log(`✅ Created demo customer: ${customer.email}`);
    return customer;
  } catch (error) {
    console.error('❌ Error creating demo customer:', error);
    throw error;
  }
}

export async function seedCustomerPaymentMethods() {
  console.log('💳 Seeding customer payment methods...');

  try {
    // Get demo customer
    const customer = await prisma.user.findUnique({
      where: { email: 'demo@nanayeyar.com' }
    });

    if (!customer) {
      console.log('Demo customer not found, skipping payment method seeding...');
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

    const paymentMethods = [
      {
        userId: customer.id,
        type: 'AYA_BANK' as const,
        details: {
          accountNo: '9876543210',
          accountName: 'Demo Customer'
        }
      },
      {
        userId: customer.id,
        type: 'AYA_PAY' as const,
        details: {
          phone: '09123456789',
          name: 'Demo Customer'
        }
      }
    ];

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
