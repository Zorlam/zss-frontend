'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Package } from 'lucide-react';
import { formatPrice } from '@/lib/utils';


export default function CheckoutPage() {
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const data = await api.createOrder(token, shippingAddress, notes);
      
      if (data.order) {
        // Order successful
        router.push('/products');
        // Show success (you could create a success page later)
        setTimeout(() => {
          alert('Order placed successfully! 🎉');
        }, 100);
      } else {
        setError(data.error || 'Failed to create order');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/cart" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to cart
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleCheckout} className="space-y-8">
            {/* Shipping Information */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Package size={24} className="text-gray-900" />
                <h2 className="text-2xl font-bold text-gray-900">Shipping Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                    placeholder="123 Main Street&#10;Apartment 4B&#10;New York, NY 10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Information (Placeholder) */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={24} className="text-gray-900" />
                <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-600 text-center">
                  This is a demo project, payment processing will be added later.
                  <br />
                  <span className="text-sm">For now, orders are placed without payment.</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-8 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition font-medium text-lg"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              <Link
                href="/cart"
                className="block w-full text-center bg-white border-2 border-gray-200 text-gray-900 py-4 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Return to Cart
              </Link>
            </div>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
             Your information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}