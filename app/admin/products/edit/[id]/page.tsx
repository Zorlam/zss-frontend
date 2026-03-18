'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [color, setColor] = useState('');
  
  // New fields
  const [sizes, setSizes] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [careInstructions, setCareInstructions] = useState('');

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

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

    fetchCategories();
    fetchProduct();
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/products/categories');
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProduct = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/products/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        const product = data.product;
        setName(product.name || '');
        setDescription(product.description || '');
        setPrice(product.price?.toString() || '');
        setStock(product.stock?.toString() || '');
        setSku(product.sku || '');
        setImageUrl(product.image_url || '');
        setCategoryId(product.category?.id?.toString() || '');
        setIsActive(product.is_active ?? true);
        setSizes(product.sizes || []);
        setMaterial(product.material || '');
        setCareInstructions(product.care_instructions || '');
        setColor(product.color || '');
      } else {
        setError('Failed to fetch product');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setFetchingProduct(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Please login again');
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/products/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setImageUrl(data.image_url);
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image');
        console.error('Upload error:', data);
      }
    } catch (err) {
      console.error('Upload exception:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const toggleSize = (size: string) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price,
          stock: parseInt(stock),
          sku,
          image_url: imageUrl,
          category_id: categoryId ? parseInt(categoryId) : null,
          is_active: isActive,
          sizes: sizes.join(','),
          material,
          care_instructions: careInstructions,
          color: color || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Product updated successfully!');
        setTimeout(() => router.push('/admin/products'), 2000);
      } else {
        setError(data.error || 'Failed to update product');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to products
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Edit Product</h1>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      handleImageUpload(file);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                />
                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Or enter image URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {imageUrl && (
                <img 
                  src={imageUrl}
                  alt="Preview" 
                  className="mt-4 w-full max-w-xs rounded-lg"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Available Sizes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Sizes
              </label>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`px-6 py-3 border-2 rounded-lg font-medium transition-all ${
                      sizes.includes(size)
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {sizes.length > 0 ? sizes.join(', ') : 'None'}
              </p>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="e.g., 100% Cotton, Merino Wool"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Navy Blue, Black, White"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>

            {/* Care Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Care Instructions
              </label>
              <textarea
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                rows={4}
                placeholder="e.g., Machine wash cold, tumble dry low"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 text-gray-900 rounded focus:ring-2 focus:ring-gray-900"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Product is active
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition font-medium text-lg"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}