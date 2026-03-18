const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  register: async (username: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    return res.json();
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_BASE_URL}/products/`);
    return res.json();
  },

  getProduct: async (id: number, token?: string) => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { headers });
    return res.json();
  },

  // Cart
  getCart: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  addToCart: async (token: string, productId: number, quantity: number) => {
    const res = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return res.json();
  },

  updateCartItem: async (token: string, itemId: number, quantity: number) => {
    const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  removeFromCart: async (token: string, itemId: number) => {
    const res = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  clearCart: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // Orders
  createOrder: async (token: string, shippingAddress?: string, notes?: string) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ shipping_address: shippingAddress, notes }),
    });
    return res.json();
  },

  getOrders: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  getOrder: async (token: string, orderId: number) => {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  // Wishlist
  getWishlist: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  addToWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId }),
    });
    return res.json();
  },

  removeFromWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },

  checkWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return res.json();
  },
};