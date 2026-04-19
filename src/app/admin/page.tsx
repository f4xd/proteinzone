// filepath: frontend/src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface Order {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  items: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'protein',
    stock: '50'
  });

  const router = useRouter();
  const adminKey = 'fitzone-admin-secret';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders', { headers: { 'x-admin-key': adminKey } })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminKey
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          description: newProduct.description,
          image: newProduct.image || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400',
          category: newProduct.category,
          stock: parseInt(newProduct.stock)
        })
      });

      if (res.ok) {
        setShowAddProduct(false);
        setNewProduct({ name: '', price: '', description: '', image: '', category: 'protein', stock: '50' });
        fetchData();
      } else {
        setError('Failed to add product');
      }
    } catch (err) {
      setError('Failed to add product');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!confirm('Delete this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey }
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete product');
    }
  }

  async function handleUpdateStatus(orderId: number, status: string) {
    // For now, we'll just show the order - status update would need additional API
    alert(`Order #${orderId} status: ${status}`);
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-[#00ff88]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Admin <span className="text-[#00ff88]">Dashboard</span>
          </h1>
          <Link href="/" className="text-[#00ff88] hover:text-[#22c55e]">
            ← Back to Store
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-[#00ff88] text-black'
                : 'bg-[#1a1a1a] text-white border border-[#262626]'
            }`}
          >
            Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#00ff88] text-black'
                : 'bg-[#1a1a1a] text-white border border-[#262626]'
            }`}
          >
            Orders ({orders.length})
          </button>
        </div>

        {error && (
          <div className="bg-[#ef4444]/10 border border-[#ef4444] text-[#ef4444] px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="btn-primary"
              >
                {showAddProduct ? 'Cancel' : '+ Add Product'}
              </button>
            </div>

            {showAddProduct && (
              <form onSubmit={handleAddProduct} className="card p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Add New Product</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price (DZD)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    className="input"
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="input"
                  >
                    <option value="protein">Protein</option>
                    <option value="creatine">Creatine</option>
                    <option value="fat-burners">Fat Burners</option>
                    <option value="vitamins">Vitamins</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="input"
                  />
                  <textarea
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="input md:col-span-2"
                    rows={3}
                  />
                </div>
                <button type="submit" className="btn-primary mt-4" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </form>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="card p-4">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-[#00ff88] font-bold">{product.price.toLocaleString()} DZD</p>
                  <p className="text-[#a3a3a3] text-sm">Category: {product.category}</p>
                  <p className="text-[#a3a3a3] text-sm">Stock: {product.stock}</p>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="mt-3 text-[#ef4444] text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-[#a3a3a3] text-center py-8">No orders yet</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Order #{order.id}</h3>
                      <p className="text-[#a3a3a3] text-sm">{order.createdAt}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[#a3a3a3]">Customer: <span className="text-white">{order.fullName}</span></p>
                      <p className="text-[#a3a3a3]">Phone: <span className="text-white">{order.phone}</span></p>
                      <p className="text-[#a3a3a3]">Address: <span className="text-white">{order.address}</span></p>
                    </div>
                    <div>
                      <p className="text-[#a3a3a3]">Total: <span className="text-[#00ff88] font-bold">{order.totalPrice.toLocaleString()} DZD</span></p>
                      <p className="text-[#a3a3a3]">Items: <span className="text-white">{order.items}</span></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}