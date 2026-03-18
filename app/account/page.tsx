'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, Calendar, Mail } from 'lucide-react';

interface UserData {
  id: number;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.username}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-gray-200 pt-8">
              <div className="flex items-start gap-4">
                <Mail size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <User size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Username</p>
                  <p className="text-gray-900">{user.username}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Calendar size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Member Since</p>
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <MapPin size={20} className="text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Account Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
              
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <Package size={20} className="text-gray-600" />
                  <span className="text-gray-900">Order History</span>
                </Link>

                <Link
                  href="/cart"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">🛒</span>
                  <span className="text-gray-900">Shopping Cart</span>
                </Link>

                <Link
                  href="/products"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <span className="text-xl">👔</span>
                  <span className="text-gray-900">Browse Products</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition border-t border-gray-200 mt-3 pt-3"
                  >
                    <span className="text-xl">⚙️</span>
                    <span className="text-purple-900 font-medium">Admin Panel</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-2">Welcome Back!</h3>
              <p className="text-gray-300 text-sm">
                Thanks for being part of Z'ss. Enjoy your shopping experience!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}