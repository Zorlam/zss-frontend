'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { api } from '@/lib/api';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category?: any;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Get API URL dynamically
const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5000';
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('search') || '';
  const aiSearchQuery = searchParams.get('ai_search') || '';
  const pageFromUrl = parseInt(searchParams.get('page') || '1');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  
  // Track if products have been shuffled this session
  const hasShuffled = useRef(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync current page with URL
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

 useEffect(() => {
  fetchCategories();
  
  // Only fetch user-specific data if logged in
  const token = localStorage.getItem('token');
  if (token) {
    fetchWishlist();
    fetchAIRecommendations();
  }
  
  if (aiSearchQuery) {
    fetchAISearchResults(aiSearchQuery);
  } else {
    fetchProducts();
  }
}, [searchQuery, aiSearchQuery, currentPage, isMobile]);

  const updateUrlWithPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

 const fetchWishlist = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const data = await api.getWishlist(token);
    const ids = new Set<number>(data.wishlist_items?.map((item: any) => item.product.id) || []);
    setWishlistIds(ids);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
  }
};

  const toggleWishlist = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      if (wishlistIds.has(productId)) {
        await api.removeFromWishlist(token, productId);
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      } else {
        await api.addToWishlist(token, productId);
        setWishlistIds(prev => new Set(prev).add(productId));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/products/categories`);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

 const fetchAIRecommendations = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  // Check if user has changed or just logged in
  const currentUser = localStorage.getItem('user');
  const lastRecommendedUser = sessionStorage.getItem('lastRecommendedUser');
  
  if (currentUser) {
    const userData = JSON.parse(currentUser);
    const userId = userData.id || userData.user_id;
    
    // Show recommendations if:
    // 1. Different user logged in, OR
    // 2. Same user but hasn't seen recommendations this session
    if (lastRecommendedUser !== String(userId)) {
      // New user or different user - reset and show
      sessionStorage.removeItem('aiModalShown');
    } else {
      // Same user - check if already shown this session
      const modalShown = sessionStorage.getItem('aiModalShown');
      if (modalShown) return;
    }
  }

  setLoadingAI(true);
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/recommendations/ai`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      setLoadingAI(false);
      return;
    }
    
    const data = await res.json();
    
    if (data.recommendations && data.recommendations.length > 0) {
      setAiRecommendations(data.recommendations);
      setTimeout(() => setShowAIModal(true), 500);
      
      // Mark as shown for this user in this session
      sessionStorage.setItem('aiModalShown', 'true');
      
      // Track which user saw recommendations
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        const userId = userData.id || userData.user_id;
        sessionStorage.setItem('lastRecommendedUser', String(userId));
      }
    }
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
  } finally {
    setLoadingAI(false);
  }
};

  const fetchAISearchResults = async (query: string) => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/search/ai?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(1);
    } catch (error) {
      console.error('Error fetching AI search results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (categoryId?: number | null) => {
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const perPage = isMobile ? 12 : 18;
      let url = `${apiUrl}/api/products/`;
      const params = new URLSearchParams();
      
      params.append('page', currentPage.toString());
      params.append('per_page', perPage.toString());
      
      if (categoryId !== undefined && categoryId !== null) {
        params.append('category_id', categoryId.toString());
      } else if (selectedCategory !== null) {
        params.append('category_id', selectedCategory.toString());
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      url += `?${params.toString()}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Only shuffle on first load, not on pagination or returning from product detail
      let productsToDisplay = data.products || [];
      if (!hasShuffled.current) {
        productsToDisplay = [...productsToDisplay].sort(() => Math.random() - 0.5);
        hasShuffled.current = true;
      }
      
      setProducts(productsToDisplay);
      
      if (data.pagination) {
        setTotalPages(data.pagination.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    updateUrlWithPage(1);
    // Reset shuffle when changing category
    hasShuffled.current = false;
    fetchProducts(categoryId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlWithPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowMore = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      updateUrlWithPage(nextPage);
      setTimeout(() => {
        window.scrollTo({ 
          top: document.documentElement.scrollHeight, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Collection</h1>
          {aiSearchQuery && (
            <div className="mt-4">
              {products.length > 0 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  <Sparkles size={16} />
                  Search Results for: "{aiSearchQuery}"
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Showing results for: <span className="font-semibold">"{aiSearchQuery}"</span>
                </p>
              )}
            </div>
          )}
          {searchQuery && !aiSearchQuery && (
            <p className="mt-4 text-sm text-gray-600">
              Showing results for: <span className="font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* AI Recommendations Modal */}
        {aiRecommendations.length > 0 && (
          <>
            <div 
              className={`fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity duration-500 ${
                showAIModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              onClick={() => setShowAIModal(false)}
            />
            
            <div 
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
                showAIModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div 
                className="relative bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowAIModal(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all hover:rotate-90 duration-300"
                >
                  ✕
                </button>
                
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                       Curated Just for You
                    </h2>
                    <p className="text-gray-600">Recommendations based on your recent activity</p>
                    <div className="inline-block mt-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      Products you might like, {typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).username : 'Guest'}
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    
                    <div 
                      className="flex gap-6 overflow-x-auto scroll-smooth px-8 py-6"
                      style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-x',
                      }}
                    >
                      {aiRecommendations.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="flex-shrink-0 w-56 md:w-64"
                          onClick={() => setShowAIModal(false)}
                        >
                          <div className="relative bg-gray-50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                              <img
                                src={product.image_url || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                              />
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-gray-900">${formatPrice(product.price)}</span>
                                <span className="text-sm text-purple-600 font-medium">
                                  View →
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center mt-6">
                    <button
                      onClick={() => setShowAIModal(false)}
                      className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-700 transition font-medium"
                    >
                      Browse All Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Category Filter */}
        {categories.length > 0 && !aiSearchQuery && (
          <>
            <div className="flex justify-center mb-12">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="px-8 py-4 bg-white border-2 border-gray-200 rounded-full hover:border-gray-900 transition-all duration-300 font-medium text-gray-900 flex items-center gap-3 hover:scale-105 shadow-sm hover:shadow-lg"
              >
                <span>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Products'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <>
              <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-md z-40 transition-opacity duration-500 ${
                  showCategoryModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setShowCategoryModal(false)}
              />
              
              <div 
                className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${
                  showCategoryModal ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div 
                  className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowCategoryModal(false)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all hover:rotate-90 duration-300"
                  >
                    ✕
                  </button>
                  
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Browse Categories
                      </h2>
                      <p className="text-gray-600">Select a category to filter products</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto px-2">
                      <button
                        onClick={() => {
                          handleCategoryFilter(null);
                          setShowCategoryModal(false);
                        }}
                        className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                          selectedCategory === null
                            ? 'bg-gray-900 text-white shadow-lg'
                            : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-4xl mb-3">🛍</div>
                        <div className="font-bold text-lg">All Products</div>
                      </button>
                      
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            handleCategoryFilter(category.id);
                            setShowCategoryModal(false);
                          }}
                          className={`p-6 rounded-2xl text-center transition-all duration-300 hover:scale-105 ${
                            selectedCategory === category.id
                              ? 'bg-gray-900 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-4xl mb-3">
                            {category.name.toLowerCase().includes('shirt') ? '🛍' : 
                             category.name.toLowerCase().includes('dress') ? '🛍' :
                             category.name.toLowerCase().includes('pant') || category.name.toLowerCase().includes('jean') ? '🛍' :
                             category.name.toLowerCase().includes('shoe') ? '🛍' :
                             category.name.toLowerCase().includes('bag') ? '🛍' :
                             category.name.toLowerCase().includes('hat') ? '🛍' :
                             category.name.toLowerCase().includes('jacket') ? '🛍' :
                             '🛍'}
                          </div>
                          <div className="font-bold text-lg">{category.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          </>
        )}
        
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 mb-6">
              {aiSearchQuery ? `No products found for AI search: "${aiSearchQuery}"` :
               searchQuery ? `No products found for "${searchQuery}"` : 
               'No products available yet.'}
            </p>
            <Link 
              href="/products"
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              View All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
              {products.map((product) => (
                <Link 
                  key={product.id}
                  href={`/products/${product.id}?returnPage=${currentPage}`}
                  className="group relative"
                >
                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, e)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
                  >
                    <Heart
                      size={20}
                      className={wishlistIds.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                    />
                  </button>

                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img 
                        src={product.image_url || '/placeholder.png'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      {product.category && (
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                          {product.category.name}
                        </p>
                      )}
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition">
                        {product.name}
                      </h2>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">
                          ${formatPrice(product.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {!aiSearchQuery && currentPage < totalPages && (
              <div className="text-center mt-12">
                <button
                  onClick={handleShowMore}
                  disabled={loading}
                  className="px-12 py-4 border-b-2 border-gray-900 text-gray-900 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                >
                  {loading ? 'LOADING...' : 'SHOW MORE'}
                </button>
              </div>
            )}

            {!aiSearchQuery && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 flex items-center justify-center rounded transition ${
                      currentPage === page
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}