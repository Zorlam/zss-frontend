'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Plus, FolderOpen } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your Z'ss store</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/products/create"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-xl mb-4 group-hover:scale-110 transition">
              <Plus size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Product</h2>
            <p className="text-gray-600">Add new products to your collection</p>
          </Link>

          <Link
            href="/admin/products"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-gray-700 rounded-xl mb-4 group-hover:scale-110 transition">
              <Package size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Products</h2>
            <p className="text-gray-600">View and edit existing products</p>
          </Link>

          <Link
            href="/admin/categories"
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4 group-hover:scale-110 transition">
              <FolderOpen size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Categories</h2>
            <p className="text-gray-600">Create and organize product categories</p>
          </Link>
        </div>
      </div>
    </div>
  );
}