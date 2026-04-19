// filepath: frontend/src/app/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [productId, setProductId] = useState<string>('');
  const { addItem } = useCart();

  useEffect(() => {
    async function unwrapParams() {
      const { id } = await params;
      setProductId(id);
    }
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;
    
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryLabel = {
    'protein': 'Protein',
    'creatine': 'Creatine',
    'fat-burners': 'Fat Burners',
    'vitamins': 'Vitamins',
  };

  if (loading) {
    return (
      <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
        <div className="container">
          <div className="text-center py-12">
            <p className="text-[#a3a3a3]">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
        <div className="container">
          <div className="text-center py-12">
            <p className="text-[#a3a3a3] text-lg">Product not found</p>
            <Link href="/products" className="text-[#00ff88] mt-4 inline-block">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
      <div className="container">
        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-[#a3a3a3] hover:text-[#00ff88] transition-colors mb-8"
        >
          ← Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <div className="relative h-64 md:h-96 bg-[#141414] rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            {/* Category Badge */}
            <span className="inline-block self-start px-3 py-1 bg-[#1a1a1a] border border-[#262626] rounded-full text-sm text-[#00ff88] mb-4">
              {categoryLabel[product.category as keyof typeof categoryLabel] || product.category}
            </span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <p className="text-3xl md:text-4xl font-bold text-[#00ff88] mb-6">
              {product.price.toLocaleString()} DZD
            </p>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
              <p className="text-[#a3a3a3] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <p className="text-[#22c55e]">✓ In Stock ({product.stock} available)</p>
              ) : (
                <p className="text-[#ef4444]">✗ Out of Stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-xl hover:border-[#00ff88] transition-colors"
                >
                  -
                </button>
                <span className="text-white text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 bg-[#1a1a1a] border border-[#262626] rounded-lg text-white text-xl hover:border-[#00ff88] transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                added
                  ? 'bg-[#22c55e] text-black'
                  : 'btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {added ? '✓ Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
