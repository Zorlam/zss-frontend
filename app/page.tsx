'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
}

export default function Home() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-redirect to products after 3 seconds
    const timer = setTimeout(() => {
      router.push('/products');
    }, 3000);

    // Fetch AI recommendations if user is logged in
    const fetchRecommendations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://127.0.0.1:5000/api/recommendations/ai', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Logo - fade in first */}
        <h1 
          className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-wider"
          style={{ 
            fontFamily: 'var(--font-playfair)',
            animation: 'fadeInUp 1s ease-out forwards'
          }}
        >
          Z'<span className="italic">ss</span>
        </h1>
        
        {/* Subtitle - fade in second */}
        <p 
          className="text-xl md:text-2xl text-gray-600 mb-4"
          style={{ 
            animation: 'fadeInUp 1s ease-out 0.3s forwards',
            opacity: 0
          }}
        >
          Curated Fashion That Matches Your Style
        </p>
        
        {/* Description - fade in third */}
        <p 
          className="text-gray-600 max-w-2xl mx-auto"
          style={{ 
            animation: 'fadeInUp 1s ease-out 0.6s forwards',
            opacity: 0
          }}
        >
          Redirecting to collection...
        </p>

        {/* AI Recommendations Preview - fade in fourth */}
        {!loading && recommendations.length > 0 && (
          <div
            style={{ 
              animation: 'fadeInUp 1s ease-out 0.9s forwards',
              opacity: 0
            }}
            className="mt-8"
          >
            <p className="text-sm text-gray-500 mb-4">✨ Curated just for you by AI</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}