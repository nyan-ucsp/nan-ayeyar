# Database Seeding Scripts

This directory contains TypeScript scripts for seeding the Nan Ayeyar database with initial data.

## 📋 **Overview**

The seeding process creates:
- **Admin User**: System administrator account
- **Company Payment Accounts**: Bank and mobile payment accounts for customer transfers
- **Rice Products**: 10 different rice varieties with metadata
- **Demo Customer**: Test customer account with payment methods
- **Seed Images**: Directory structure for product images

## 🚀 **Quick Start**

### **1. Create Seed Images Directory**
```bash
# Create the seed images directory structure
npx tsx src/scripts/createSeedImages.ts
```

### **2. Run Database Seeding**
```bash
# Run the complete seeding process
npm run db:seed

# Or run directly with tsx
npx tsx src/scripts/seed.ts
```

### **3. Verify Seeding**
```bash
# Check if data was created successfully
npx prisma studio
```

## 📁 **File Structure**

```
src/scripts/
├── seed.ts                    # Main seeding script
├── seedProducts.ts           # Product data and seeding logic
├── seedCustomers.ts          # Customer and payment method seeding
├── createSeedImages.ts       # Creates seed images directory
└── README.md                 # This file
```

## 🔧 **Scripts Overview**

### **Main Seed Script (`seed.ts`)**
- Orchestrates the entire seeding process
- Creates admin user and company payment accounts
- Imports and runs product and customer seeding
- Handles errors and cleanup

### **Product Seeding (`seedProducts.ts`)**
- Creates 10 different rice products
- Includes bilingual names (English/Myanmar)
- Sets up metadata fields (variety, weight, grade, etc.)
- References seed images for product photos

### **Customer Seeding (`seedCustomers.ts`)**
- Creates demo customer account
- Sets up customer payment methods
- Includes both bank and mobile payment options

### **Image Directory Creation (`createSeedImages.ts`)**
- Creates `/storage/seed-images/` directory
- Generates placeholder files for all product images
- Creates README with replacement instructions

## 📊 **Seeded Data**

### **Admin User**
- **Email**: `admin@nanayeyar.com`
- **Password**: `AdminPass123!`
- **Role**: Admin
- **Status**: Email verified

### **Company Payment Accounts**
- **AYA Bank - Main Account**: 1234567890
- **KBZ Bank - Main Account**: 1122334455
- **AYA Pay - Mobile Payment**: 09123456789
- **KBZ Pay - Mobile Payment**: 09987654321

### **Demo Customer**
- **Email**: `demo@nanayeyar.com`
- **Password**: `DemoPass123!`
- **Role**: Customer
- **Payment Methods**: AYA Bank + AYA Pay

### **Rice Products (10 varieties)**
1. **Premium Basmati Rice** - 5kg, Premium grade, India
2. **Jasmine Rice - Fragrant** - 5kg, Premium grade, Thailand
3. **Myanmar Premium Rice** - 10kg, Grade A, Myanmar
4. **Brown Rice - Organic** - 3kg, Organic grade, Myanmar
5. **Sticky Rice - Glutinous** - 5kg, Premium grade, Myanmar
6. **Red Rice - Antioxidant Rich** - 2kg, Premium grade, Myanmar
7. **Wild Rice - Exotic Blend** - 1kg, Gourmet grade, Mixed
8. **Black Rice - Forbidden Rice** - 1kg, Premium grade, Myanmar
9. **Arborio Rice - Risotto** - 2kg, Premium grade, Italy
10. **Sushi Rice - Short Grain** - 3kg, Sushi grade, Japan

## 🖼️ **Product Images**

### **Image Structure**
Each product has 2 images:
- Main product image (e.g., `basmati-rice-1.jpg`)
- Secondary product image (e.g., `basmati-rice-2.jpg`)

### **Image Paths**
All images are stored under `/storage/seed-images/` and referenced as:
```typescript
images: [
  '/storage/seed-images/basmati-rice-1.jpg',
  '/storage/seed-images/basmati-rice-2.jpg'
]
```

### **Replacing Placeholder Images**
1. Navigate to `/storage/seed-images/`
2. Replace placeholder files with actual product images
3. Maintain the same filename structure
4. Recommended specs: 800x600px+, JPG/PNG/WebP, <500KB

## 🔄 **Running Seeding**

### **Complete Seeding Process**
```bash
# 1. Create seed images directory
npx tsx src/scripts/createSeedImages.ts

# 2. Run database migrations (if needed)
npm run db:migrate

# 3. Run seeding
npm run db:seed
```

### **Individual Scripts**
```bash
# Create seed images only
npx tsx src/scripts/createSeedImages.ts

# Run main seeding
npx tsx src/scripts/seed.ts

# Run product seeding only
npx tsx src/scripts/seedProducts.ts

# Run customer seeding only
npx tsx src/scripts/seedCustomers.ts
```

## 🛠️ **Package.json Scripts**

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:seed": "tsx src/scripts/seed.ts",
    "db:seed:images": "tsx src/scripts/createSeedImages.ts",
    "db:seed:products": "tsx src/scripts/seedProducts.ts",
    "db:seed:customers": "tsx src/scripts/seedCustomers.ts"
  }
}
```

## 🔍 **Verification**

### **Check Admin User**
```bash
# Login to admin panel
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nanayeyar.com","password":"AdminPass123!"}'
```

### **Check Products**
```bash
# Get products list
curl http://localhost:3001/api/products
```

### **Check Company Accounts**
```bash
# Get company payment accounts
curl http://localhost:3001/api/company-accounts
```

### **Check Demo Customer**
```bash
# Login as demo customer
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nanayeyar.com","password":"DemoPass123!"}'
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Database Connection Error**
   ```bash
   # Check DATABASE_URL in .env
   # Ensure PostgreSQL is running
   npm run db:migrate
   ```

2. **Image Files Not Found**
   ```bash
   # Create seed images directory
   npx tsx src/scripts/createSeedImages.ts
   ```

3. **Seeding Fails**
   ```bash
   # Check for existing data
   npx prisma studio
   
   # Clear database if needed
   npm run db:reset
   npm run db:seed
   ```

4. **Permission Errors**
   ```bash
   # Ensure storage directory exists
   mkdir -p storage/seed-images
   chmod 755 storage/seed-images
   ```

### **Reset Database**
```bash
# Reset database and reseed
npm run db:reset
npm run db:seed
```

## 📝 **Customization**

### **Adding More Products**
1. Edit `src/scripts/seedProducts.ts`
2. Add new product objects to the `riceProducts` array
3. Create corresponding image files in `/storage/seed-images/`
4. Run seeding again

### **Adding More Payment Accounts**
1. Edit `src/scripts/seed.ts`
2. Add new account objects to the `companyAccounts` array
3. Run seeding again

### **Adding More Customers**
1. Edit `src/scripts/seedCustomers.ts`
2. Add new customer creation logic
3. Run seeding again

## 🔒 **Security Notes**

- **Passwords**: All passwords are properly hashed using bcrypt
- **Email Verification**: Admin and demo users are pre-verified
- **Data Validation**: All seeded data follows the same validation rules as the API
- **Production**: Never run seeding scripts in production without proper review

## 📚 **Related Documentation**

- [Prisma Schema](../prisma/schema.prisma)
- [API Controllers](../controllers/README.md)
- [Database Migrations](../prisma/migrations/)
- [Environment Configuration](../../../env.example)

This seeding system provides a complete foundation for the Nan Ayeyar e-commerce platform with realistic data for development and testing.
