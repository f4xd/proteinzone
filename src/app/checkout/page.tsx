// filepath: frontend/src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (items.length === 0 && !success) {
    return (
      <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
        <div className="container">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-[#a3a3a3] text-xl mb-4">Your cart is empty</p>
            <Link href="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
        <div className="container">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white mb-4">Order Placed!</h1>
            <p className="text-[#a3a3a3] mb-8">
              Thank you for your order. We will contact you soon for delivery confirmation.
            </p>
            <Link href="/" className="btn-primary inline-block">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderData = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        items: items.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        totalPrice: totalPrice,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
          items: items.map(item => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to place order');
      }

      clearCart();
      setSuccess(true);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-16 bg-[#0a0a0a] min-h-screen">
      <div className="container">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div>
            <form onSubmit={handleSubmit} className="card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
              
              {error && (
                <div className="bg-[#ef4444]/10 border border-[#ef4444] text-[#ef4444] px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-white font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="05X XXX XX XX"
                  />
                  <p className="text-[#a3a3a3] text-sm mt-1">Algerian phone format</p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Delivery Address *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input resize-none"
                    placeholder="Enter your full address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-lg mt-6 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>

              <p className="text-[#a3a3a3] text-sm text-center mt-4">
                💵 Cash on Delivery
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative w-16 h-16 bg-[#141414] rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{item.name}</h3>
                      <p className="text-[#a3a3a3] text-sm">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-white font-medium">
                      {(item.price * item.quantity).toLocaleString()} DZD
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#262626] pt-4">
                <div className="flex justify-between text-[#a3a3a3] mb-2">
                  <span>Subtotal</span>
                  <span>{totalPrice.toLocaleString()} DZD</span>
                </div>
                <div className="flex justify-between text-[#a3a3a3] mb-4">
                  <span>Shipping</span>
                  <span className="text-[#22c55e]">Free</span>
                </div>
                <div className="flex justify-between text-white text-xl font-bold">
                  <span>Total</span>
                  <span className="text-[#00ff88]">{totalPrice.toLocaleString()} DZD</span>
                </div>
              </div>
            </div>

            <Link 
              href="/cart" 
              className="inline-flex items-center text-[#a3a3a3] hover:text-[#00ff88] mt-4 transition-colors"
            >
              ← Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}