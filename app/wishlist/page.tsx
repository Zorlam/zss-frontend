'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock: number;
    category?: any;
  };
  added_at: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchWishlist();
  }, [router]);

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const data = await api.getWishlist(token);
      setWishlistItems(data.wishlist_items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.removeFromWishlist(token, productId);
      await fetchWishlist();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.addToCart(token, productId, 1);
      // Trigger cart update event for navbar
      window.dispatchEvent(new Event('cartUpdated'));
      // Optional: show success message
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love to view later!</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart size={32} className="text-red-500 fill-red-500" />
          <h1 className="text-4xl font-bold text-gray-900">My Wishlist</h1>
          <span className="text-gray-600">({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <Link href={`/products/${item.product.id}`} className="block">
                <div className="aspect-square overflow-hidden bg-gray-100 relative">
                  <img
                    src={item.product.image_url || '/placeholder.png'}
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(item.product.id);
                    }}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </Link>

              <div className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  {item.product.category && (
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {item.product.category.name}
                    </p>
                  )}
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-gray-700 transition line-clamp-2">
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.product.description}
                  </p>
                </Link>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    ${formatPrice(item.product.price)}
                  </span>
                  <span className={`text-sm ${item.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.product.stock > 0 ? 'In stock' : 'Out of stock'}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item.product.id)}
                  disabled={item.product.stock === 0}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} />
                  {item.product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}