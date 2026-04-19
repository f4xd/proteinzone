// filepath: frontend/src/app/cart/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Your <span className="text-[#00ff88]">Cart</span>
          </h1>
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-[#a3a3a3] text-xl mb-4">Your cart is empty</p>
            <p className="text-[#a3a3a3] mb-8">Add some products to get started</p>
            <Link href="/products" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Your <span className="text-[#00ff88]">Cart</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item._id} 
                className="card p-4 flex gap-4"
              >
                {/* Image */}
                <div className="relative w-24 h-24 bg-[#141414] rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{item.name}</h3>
                  <p className="text-[#00ff88] font-bold mt-1">
                    {item.price.toLocaleString()} DZD
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 bg-[#1a1a1a] border border-[#262626] rounded text-white hover:border-[#00ff88] transition-colors"
                    >
                      -
                    </button>
                    <span className="text-white font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 bg-[#1a1a1a] border border-[#262626] rounded text-white hover:border-[#00ff88] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="self-start p-2 text-[#a3a3a3] hover:text-[#ef4444] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                  <span>{totalPrice.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-[#a3a3a3]">
                  <span>Shipping</span>
                  <span className="text-[#22c55e]">Free</span>
                </div>
                <div className="border-t border-[#262626] pt-3 flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#00ff88]">{totalPrice.toLocaleString()} DZD</span>
                </div>
              </div>

              <Link 
                href="/checkout" 
                className="block w-full btn-primary text-center text-lg"
              >
                Proceed to Checkout
              </Link>

              <Link 
                href="/products" 
                className="block w-full text-center text-[#a3a3a3] hover:text-[#00ff88] mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}