// filepath: frontend/src/components/ProductCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="card">
      <div className="relative h-48 bg-[#141414]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{product.name}</h3>
        <p className="text-[#00ff88] font-bold text-lg mt-1">
          {product.price.toLocaleString()} DZD
        </p>
        <Link 
          href={`/products/${product._id}`}
          className="block mt-3 text-center btn-secondary text-sm py-2"
        >
          View
        </Link>
      </div>
    </div>
  );
}