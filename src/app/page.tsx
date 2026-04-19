// filepath: frontend/src/app/page.tsx
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.slice(0, 6);
}

const categories = [
  { name: 'Protein', slug: 'protein', icon: '💪' },
  { name: 'Creatine', slug: 'creatine', icon: '⚡' },
  { name: 'Fat Burners', slug: 'fat-burners', icon: '🔥' },
  { name: 'Vitamins', slug: 'vitamins', icon: '💊' },
];

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/70 via-[#0a0a0a]/50 to-[#0a0a0a]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
            Build Your <span className="text-[#00ff88]">Dream Body</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#a3a3a3] mb-8 max-w-2xl mx-auto">
            Premium supplements in Algeria. Fuel your fitness journey with top-quality products.
          </p>
          <Link 
            href="/products" 
            className="inline-block btn-primary text-lg px-8 py-4"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Shop by <span className="text-[#00ff88]">Category</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="card p-6 text-center group cursor-pointer"
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#00ff88] transition-colors">
                  {cat.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-[#141414]">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Featured <span className="text-[#00ff88]">Products</span>
            </h2>
            <Link 
              href="/products" 
              className="text-[#00ff88] hover:text-[#22c55e] font-medium transition-colors"
            >
              View All →
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#a3a3a3] text-lg">Loading products...</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#0a0a0a]">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to <span className="text-[#00ff88]">Transform</span>?
          </h2>
          <p className="text-[#a3a3a3] text-lg mb-8 max-w-xl mx-auto">
            Browse our collection of premium supplements and start reaching your fitness goals today.
          </p>
          <Link 
            href="/products" 
            className="inline-block btn-primary text-lg px-8 py-4"
          >
            Explore Products
          </Link>
        </div>
      </section>
    </div>
  );
}
