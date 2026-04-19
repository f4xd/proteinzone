// filepath: frontend/src/app/products/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const categories = [
  { name: 'All', slug: 'all' },
  { name: 'Protein', slug: 'protein' },
  { name: 'Creatine', slug: 'creatine' },
  { name: 'Fat Burners', slug: 'fat-burners' },
  { name: 'Vitamins', slug: 'vitamins' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
          setFilteredProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const filterProducts = useCallback(() => {
    let filtered = products;

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredProducts(filtered);
  }, [products, category, search]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  return (
    <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
      <div className="container">
        {/* Page Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          All <span className="text-[#00ff88]">Products</span>
        </h1>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search supplements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-12"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                category === cat.slug
                  ? 'bg-[#00ff88] text-black'
                  : 'bg-[#1a1a1a] text-white border border-[#262626] hover:border-[#00ff88]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#a3a3a3]">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#a3a3a3] text-lg">No products found</p>
            <p className="text-[#a3a3a3] mt-2">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}