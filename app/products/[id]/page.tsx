'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Minus, Plus, Package, Shirt, Check, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  category: any;
  sizes?: string[];
  material?: string;
  care_instructions?: string;
  color?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPage = searchParams.get('returnPage') || '1';
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [inWishlist, setInWishlist] = useState(false);

  const fetchRelatedProducts = async (categoryId: number, currentProductId: number) => {
    try {
      const apiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? `http://${window.location.hostname}:5000`
        : 'http://127.0.0.1:5000';
      
      const res = await fetch(`${apiUrl}/api/products/?category_id=${categoryId}&per_page=8`);
      const data = await res.json();
      
      const filtered = (data.products || [])
        .filter((p: Product) => p.id !== currentProductId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 4);
      
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const fetchCartQuantity = async () => {
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
      
      const cartItem = (data.cart_items || []).find((item: any) => item.product.id === Number(params.id));
      if (cartItem) {
        setCartQuantity(cartItem.quantity);
      }
    } catch (error) {
      console.error('Error fetching cart quantity:', error);
    }
  };

  const checkWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const data = await api.checkWishlist(token, Number(params.id));
      setInWishlist(data.in_wishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      if (inWishlist) {
        await api.removeFromWishlist(token, product!.id);
        setInWishlist(false);
      } else {
        await api.addToWishlist(token, product!.id);
        setInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(Number(params.id));
        setProduct(data.product);
        
        if (data.product?.category?.id) {
          fetchRelatedProducts(data.product.category.id, data.product.id);
        }
        
        fetchCartQuantity();
        checkWishlist();
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setMessage('Please select a size');
      return;
    }

    setAdding(true);
    setMessage('');

    try {
      await api.addToCart(token, product!.id, quantity);
      setCartQuantity(cartQuantity + quantity);
      setMessage('Added to cart successfully!');
      
      window.dispatchEvent(new Event('cartUpdated'));
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link 
            href="/products"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href={`/products?page=${returnPage}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg relative">
            {/* Wishlist Heart Button */}
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            >
              <Heart
                size={24}
                className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>

            <div className="aspect-square">
              <img 
                src={product.image_url || '/placeholder.png'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.category && (
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                {product.category.name}
              </p>
            )}
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            
            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            <div className="text-4xl font-bold text-gray-900">
              ${formatPrice(product.price)}
            </div>

            {/* Color Display */}
            {product.color && (
              <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                <span className="font-medium">Color:</span>
                <span className="text-gray-900 font-semibold">{product.color}</span>
              </div>
            )}

            {product.material && (
              <div className="flex items-center gap-2 text-gray-700">
                <Shirt size={20} />
                <span className="font-medium">Material:</span>
                <span>{product.material}</span>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Size
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Package size={20} className={product.stock > 0 ? 'text-green-600' : 'text-red-600'} />
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Minus size={20} />
                </button>
                <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition font-medium text-lg flex items-center justify-center gap-2"
            >
              {cartQuantity > 0 ? (
                <>
                  <Check size={20} />
                  {cartQuantity} in Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {adding ? 'Adding...' : 'Add to Cart'}
                </>
              )}
            </button>

            {message && (
              <p className={`text-center p-3 rounded-lg ${
                message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </p>
            )}

            <Link
              href="/cart"
              className="block w-full text-center py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              View Cart
            </Link>

            {product.care_instructions && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Care Instructions</h3>
                <p className="text-gray-600 whitespace-pre-line">{product.care_instructions}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-12 mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}?returnPage=${returnPage}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      <img
                        src={relatedProduct.image_url || '/placeholder.png'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-gray-700 transition line-clamp-1">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900">${formatPrice(relatedProduct.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}