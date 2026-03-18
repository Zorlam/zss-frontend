'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, User, LogOut, Home, Search, Menu, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NavbarProps {
  onMenuClick: () => void;
}

interface SearchSuggestion {
  id: number;
  name: string;
  image_url: string;
  price: number;
  category: string | null;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      const userData = JSON.parse(user);
      setUsername(userData.username || 'User');
      fetchCartCount();
    } else {
      setIsLoggedIn(false);
      setUsername('');
      setCartCount(0);
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? `http://${window.location.hostname}:5000`
        : 'http://127.0.0.1:5000';

      const res = await fetch(`${apiUrl}/api/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const totalItems = (data.cart_items || []).reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? `http://${window.location.hostname}:5000`
        : 'http://127.0.0.1:5000';

      const res = await fetch(`${apiUrl}/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [pathname]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleRegularSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAISearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileSearchOpen(false);
      setSearchQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: number) => {
    router.push(`/products/${productId}`);
    setMobileSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Hamburger */}
            <div className="flex items-center gap-4">
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu size={24} />
              </button>

              <Link href="/" className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-gray-900 tracking-wider" style={{ fontFamily: 'var(--font-playfair)' }}>
                  Z'<span className="italic">ss</span>
                </span>
              </Link>
            </div>

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition"
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-gray-900 transition"
              >
                Products
              </Link>
              {isLoggedIn && (
                <Link 
                  href="/orders" 
                  className="text-gray-700 hover:text-gray-900 transition"
                >
                  Orders
                </Link>
              )}
            </div>

            {/* Right side - Search, Cart & Auth */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Search size={24} />
              </button>

              {isLoggedIn && (
                <Link 
                  href="/cart"
                  className="relative flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition"
                >
                  <ShoppingCart size={20} />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/account"
                    className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 transition"
                  >
                    <User size={18} />
                    <span className="hidden sm:inline">{username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 transition"
                  >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Fullscreen Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 flex items-start justify-center pt-20 animate-in fade-in">
          <div 
            className="absolute inset-0" 
            onClick={() => {
              setMobileSearchOpen(false);
              setSearchQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
            }}
          />
          
          {/* Search Content */}
          <div className="relative w-full max-w-2xl px-6">
            <form 
              onSubmit={handleRegularSearch}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full px-6 py-4 text-2xl border-b-2 border-gray-300 focus:border-gray-900 outline-none bg-transparent transition"
              />
              <Search size={32} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </form>

            {/* Auto-Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-4 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Suggestions</p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion.id)}
                        className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition group"
                      >
                        <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={suggestion.image_url || '/placeholder.png'}
                            alt={suggestion.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-gray-900 group-hover:text-gray-700 transition">
                            {suggestion.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {suggestion.category && (
                              <span className="text-xs uppercase">{suggestion.category}</span>
                            )}
                            <span className="font-bold text-gray-900">${suggestion.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600">
                          →
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Results Message */}
            {showSuggestions && suggestions.length === 0 && !loadingSuggestions && searchQuery.length >= 2 && (
              <div className="mt-4 bg-gray-50 rounded-2xl p-6 text-center">
                <p className="text-gray-600">No suggestions found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-2">Try searching anyway to see all results</p>
              </div>
            )}
            
            {/* Search Button */}
            <div className="mt-6">
              <button
                onClick={handleRegularSearch}
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Search All Products
              </button>
            </div>

            <button
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="mt-8 text-gray-600 hover:text-gray-900 transition text-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}