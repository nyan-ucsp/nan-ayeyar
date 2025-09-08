import React from 'react';
import { Hero } from '../components/sections/Hero';
import { ProductGrid } from '../components/sections/ProductGrid';
import { OrderStatusTimeline } from '../components/ui/OrderStatusTimeline';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ui/ProductCard';

// Example data
const sampleProducts = [
  {
    id: '1',
    name: 'Premium Basmati Rice',
    price: 4500,
    imageUrl: '/storage/seed-images/basmati-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '2',
    name: 'Jasmine Rice - Fragrant',
    price: 3800,
    imageUrl: '/storage/seed-images/jasmine-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '3',
    name: 'Myanmar Premium Rice',
    price: 3200,
    imageUrl: '/storage/seed-images/myanmar-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '4',
    name: 'Brown Rice - Organic',
    price: 5500,
    imageUrl: '/storage/seed-images/brown-rice-1.jpg',
    outOfStock: true,
  },
  {
    id: '5',
    name: 'Sticky Rice - Glutinous',
    price: 4200,
    imageUrl: '/storage/seed-images/sticky-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '6',
    name: 'Red Rice - Antioxidant Rich',
    price: 4800,
    imageUrl: '/storage/seed-images/red-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '7',
    name: 'Wild Rice - Exotic Blend',
    price: 6500,
    imageUrl: '/storage/seed-images/wild-rice-1.jpg',
    outOfStock: false,
  },
  {
    id: '8',
    name: 'Black Rice - Forbidden Rice',
    price: 7200,
    imageUrl: '/storage/seed-images/black-rice-1.jpg',
    outOfStock: false,
  },
];

const ExamplesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section Example */}
      <Hero
        title="Premium Rice Collection"
        subtitle="Discover the finest selection of rice varieties from around the world, carefully sourced and delivered to your doorstep."
        ctaText="Shop Now"
        ctaHref="/products"
        backgroundImage="/storage/seed-images/basmati-rice-1.jpg"
      />

      {/* Button Examples */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Button Variants
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="primary" size="md">
              Primary Button
            </Button>
            <Button variant="secondary" size="md">
              Secondary Button
            </Button>
            <Button variant="outline" size="md">
              Outline Button
            </Button>
            <Button variant="ghost" size="md">
              Ghost Button
            </Button>
            <Button variant="primary" size="sm">
              Small Button
            </Button>
            <Button variant="primary" size="lg">
              Large Button
            </Button>
            <Button variant="primary" loading>
              Loading Button
            </Button>
          </div>
        </div>
      </section>

      {/* Product Grid Example */}
      <ProductGrid
        products={sampleProducts}
        title="Featured Products"
        subtitle="Handpicked selection of our finest rice varieties"
      />

      {/* Order Status Timeline Examples */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Order Status Timeline
          </h2>
          
          <div className="space-y-12">
            {/* Pending Order */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Status: Pending
              </h3>
              <OrderStatusTimeline currentStatus="PENDING" />
            </div>

            {/* Processing Order */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Status: Processing
              </h3>
              <OrderStatusTimeline currentStatus="PROCESSING" />
            </div>

            {/* Shipped Order */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Status: Shipped
              </h3>
              <OrderStatusTimeline currentStatus="SHIPPED" />
            </div>

            {/* Delivered Order */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Status: Delivered
              </h3>
              <OrderStatusTimeline currentStatus="DELIVERED" />
            </div>

            {/* Canceled Order */}
            <div className="bg-neutral-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Order Status: Canceled
              </h3>
              <OrderStatusTimeline currentStatus="CANCELED" />
            </div>
          </div>
        </div>
      </section>

      {/* Individual Product Card Examples */}
      <section className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Product Card Examples
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Available Product */}
            <ProductCard
              id="1"
              name="Premium Basmati Rice - Long Grain Aromatic"
              price={4500}
              imageUrl="/storage/seed-images/basmati-rice-1.jpg"
              outOfStock={false}
            />
            
            {/* Out of Stock Product */}
            <ProductCard
              id="2"
              name="Brown Rice - Organic"
              price={5500}
              imageUrl="/storage/seed-images/brown-rice-1.jpg"
              outOfStock={true}
            />
            
            {/* Long Name Product */}
            <ProductCard
              id="3"
              name="Wild Rice - Exotic Blend with Unique Texture and Nutty Flavor"
              price={6500}
              imageUrl="/storage/seed-images/wild-rice-1.jpg"
              outOfStock={false}
            />
          </div>
        </div>
      </section>

      {/* Responsive Grid Examples */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">
            Responsive Grid Layout
          </h2>
          
          <div className="space-y-8">
            {/* Mobile: 2 columns */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Mobile Layout (2 columns)
              </h3>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                {sampleProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>

            {/* Tablet: 3 columns */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Tablet Layout (3 columns)
              </h3>
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                {sampleProducts.slice(0, 6).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>

            {/* Desktop: 4 columns */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Desktop Layout (4 columns)
              </h3>
              <div className="grid grid-cols-4 gap-6 max-w-4xl mx-auto">
                {sampleProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExamplesPage;
