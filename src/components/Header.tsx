// filepath: frontend/src/components/Header.tsx
'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { totalItems } = useCart();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#262626]">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#00ff88] tracking-tight">
            FITZONE
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-[#00ff88]' : 'text-white hover:text-[#00ff88]'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className={`font-medium transition-colors ${
                isActive('/products') ? 'text-[#00ff88]' : 'text-white hover:text-[#00ff88]'
              }`}
            >
              Products
            </Link>
            <Link 
              href="/cart" 
              className={`font-medium transition-colors relative ${
                isActive('/cart') ? 'text-[#00ff88]' : 'text-white hover:text-[#00ff88]'
              }`}
            >
              Cart
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-4 bg-[#00ff88] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile Cart Icon */}
          <Link 
            href="/cart" 
            className="md:hidden relative p-2 text-white hover:text-[#00ff88] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#00ff88] text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}