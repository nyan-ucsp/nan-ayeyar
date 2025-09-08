import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedProducts() {
  console.log('🌾 Seeding rice products...');

  try {
    // Check if products already exist
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
      console.log('Products already exist, skipping...');
      return;
    }

    const riceProducts = [
      {
        sku: 'RICE-001',
        name_en: 'Premium Basmati Rice',
        name_my: 'ပရီမီယံ ဘက်စမတီ ဆန်',
        description_en: 'High-quality Basmati rice with long grains and aromatic fragrance. Perfect for biryani and pilaf dishes.',
        description_my: 'ရှည်လျားသော အနံ့အရသာရှိသော အရည်အသွေးမြင့် ဘက်စမတီ ဆန်။ ဘီရာနီနှင့် ပီလာဖ် ဟင်းလျာများအတွက် အကောင်းဆုံး။',
        images: [
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop&crop=center'
        ],
        price: 45000, // 45,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Basmati',
          weightKg: 5,
          grade: 'Premium',
          harvestDate: '2024-01-15',
          origin: 'India',
          packageType: 'Plastic Bag'
        }
      },
      {
        sku: 'RICE-002',
        name_en: 'Jasmine Rice - Fragrant',
        name_my: 'ဂျက်စမင်း ဆန် - အနံ့အရသာ',
        description_en: 'Premium Jasmine rice with natural fragrance and soft texture. Ideal for Asian cuisine.',
        description_my: 'သဘာဝ အနံ့အရသာနှင့် နူးညံ့သော ပရီမီယံ ဂျက်စမင်း ဆန်။ အာရှ ဟင်းလျာများအတွက် အကောင်းဆုံး။',
        images: [
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&h=600&fit=crop&crop=center'
        ],
        price: 38000, // 38,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Jasmine',
          weightKg: 5,
          grade: 'Premium',
          harvestDate: '2024-02-10',
          origin: 'Thailand',
          packageType: 'Plastic Bag'
        }
      },
      {
        sku: 'RICE-003',
        name_en: 'Myanmar Premium Rice',
        name_my: 'မြန်မာ ပရီမီယံ ဆန်',
        description_en: 'Locally grown premium rice from Myanmar. Fresh harvest with excellent quality and taste.',
        description_my: 'မြန်မာနိုင်ငံမှ စိုက်ပျိုးသော ပရီမီယံ ဆန်။ လတ်ဆတ်သော ရိတ်သိမ်းမှုနှင့် ကောင်းမွန်သော အရည်အသွေး။',
        images: [
          'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop&crop=center'
        ],
        price: 32000, // 32,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Local Premium',
          weightKg: 10,
          grade: 'A',
          harvestDate: '2024-01-20',
          origin: 'Myanmar',
          packageType: 'Jute Bag'
        }
      },
      {
        sku: 'RICE-004',
        name_en: 'Brown Rice - Organic',
        name_my: 'အညိုရောင် ဆန် - အော်ဂဲနစ်',
        description_en: 'Organic brown rice rich in fiber and nutrients. Healthy choice for conscious consumers.',
        description_my: 'အမျှင်ဓာတ်နှင့် အာဟာရဓာတ်ကြွယ်ဝသော အော်ဂဲနစ် အညိုရောင် ဆန်။ ကျန်းမာရေးကို ဂရုစိုက်သော စားသုံးသူများအတွက် ရွေးချယ်မှု။',
        images: [
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center'
        ],
        price: 55000, // 55,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Brown Rice',
          weightKg: 3,
          grade: 'Organic',
          harvestDate: '2024-01-25',
          origin: 'Myanmar',
          packageType: 'Eco-friendly Bag'
        }
      },
      {
        sku: 'RICE-005',
        name_en: 'Sticky Rice - Glutinous',
        name_my: 'ကပ်စေးသော ဆန် - ဂလူတီနပ်စ်',
        description_en: 'Premium sticky rice perfect for traditional Myanmar desserts and special dishes.',
        description_my: 'ရိုးရာ မြန်မာ ချိုချဉ်များနှင့် အထူး ဟင်းလျာများအတွက် အကောင်းဆုံး ပရီမီယံ ကပ်စေးသော ဆန်။',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center'
        ],
        price: 42000, // 42,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Glutinous',
          weightKg: 5,
          grade: 'Premium',
          harvestDate: '2024-02-05',
          origin: 'Myanmar',
          packageType: 'Plastic Bag'
        }
      },
      {
        sku: 'RICE-006',
        name_en: 'Red Rice - Antioxidant Rich',
        name_my: 'အနီရောင် ဆန် - အန်တီအောက်ဆီဒင့် ကြွယ်ဝ',
        description_en: 'Nutrient-rich red rice with natural antioxidants. Great for health-conscious individuals.',
        description_my: 'သဘာဝ အန်တီအောက်ဆီဒင့်များ ပါဝင်သော အာဟာရကြွယ်ဝသော အနီရောင် ဆန်။ ကျန်းမာရေးကို ဂရုစိုက်သော လူများအတွက် ကောင်းမွန်သော ရွေးချယ်မှု။',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&crop=center'
        ],
        price: 48000, // 48,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Red Rice',
          weightKg: 2,
          grade: 'Premium',
          harvestDate: '2024-01-30',
          origin: 'Myanmar',
          packageType: 'Eco-friendly Bag'
        }
      },
      {
        sku: 'RICE-007',
        name_en: 'Wild Rice - Exotic Blend',
        name_my: 'တောရိုင်း ဆန် - ထူးခြားသော ရောစပ်',
        description_en: 'Exotic wild rice blend with unique texture and nutty flavor. Perfect for gourmet dishes.',
        description_my: 'ထူးခြားသော ဖွဲ့စည်းမှုနှင့် အခွံမာသော အရသာရှိသော တောရိုင်း ဆန် ရောစပ်။ ဂေါ်မတ် ဟင်းလျာများအတွက် အကောင်းဆုံး။',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop&crop=center'
        ],
        price: 65000, // 65,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Wild Rice Blend',
          weightKg: 1,
          grade: 'Gourmet',
          harvestDate: '2024-02-01',
          origin: 'Mixed',
          packageType: 'Premium Box'
        }
      },
      {
        sku: 'RICE-008',
        name_en: 'Black Rice - Forbidden Rice',
        name_my: 'အနက်ရောင် ဆန် - တားမြစ်ထားသော ဆန်',
        description_en: 'Premium black rice known as "forbidden rice" with high nutritional value and unique color.',
        description_my: 'မြင့်မားသော အာဟာရတန်ဖိုးနှင့် ထူးခြားသော အရောင်ရှိသော "တားမြစ်ထားသော ဆန်" ဟု လူသိများသော ပရီမီယံ အနက်ရောင် ဆန်။',
        images: [
          'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center'
        ],
        price: 72000, // 72,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Black Rice',
          weightKg: 1,
          grade: 'Premium',
          harvestDate: '2024-01-28',
          origin: 'Myanmar',
          packageType: 'Premium Box'
        }
      },
      {
        sku: 'RICE-009',
        name_en: 'Arborio Rice - Risotto',
        name_my: 'အာဘိုရီယို ဆန် - ရီဆိုတို',
        description_en: 'Italian Arborio rice perfect for creamy risotto dishes. High starch content for perfect texture.',
        description_my: 'ခရင်မီသော ရီဆိုတို ဟင်းလျာများအတွက် အကောင်းဆုံး အီတလီ အာဘိုရီယို ဆန်။ ပြီးပြည့်စုံသော ဖွဲ့စည်းမှုအတွက် မြင့်မားသော ကစီဓာတ် ပါဝင်မှု။',
        images: [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center'
        ],
        price: 58000, // 58,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Arborio',
          weightKg: 2,
          grade: 'Premium',
          harvestDate: '2024-02-08',
          origin: 'Italy',
          packageType: 'Plastic Bag'
        }
      },
      {
        sku: 'RICE-010',
        name_en: 'Sushi Rice - Short Grain',
        name_my: 'ဆူရှီ ဆန် - တိုတောင်းသော အနှံ',
        description_en: 'Premium short-grain rice specifically selected for sushi making. Perfect stickiness and texture.',
        description_my: 'ဆူရှီ ပြုလုပ်ရန်အတွက် အထူးရွေးချယ်ထားသော ပရီမီယံ တိုတောင်းသော အနှံ ဆန်။ ပြီးပြည့်စုံသော ကပ်စေးမှုနှင့် ဖွဲ့စည်းမှု။',
        images: [
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center',
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop&crop=center'
        ],
        price: 52000, // 52,000 MMK
        disabled: false,
        outOfStock: false,
        allowSellWithoutStock: true,
        metadata: {
          variety: 'Short Grain',
          weightKg: 3,
          grade: 'Sushi Grade',
          harvestDate: '2024-02-12',
          origin: 'Japan',
          packageType: 'Plastic Bag'
        }
      }
    ];

    for (const product of riceProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Created product: ${product.name_en}`);
    }

    console.log(`🎉 Successfully seeded ${riceProducts.length} rice products!`);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}
