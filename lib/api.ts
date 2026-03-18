const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:5000/api`;
    }
  }
  return 'http://127.0.0.1:5000/api';
})();

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

  getProduct: async (id: number) => {
    const token = localStorage.getItem('token');
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers,
    });
    return res.json();
  },

  // Cart
  getCart: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  addToCart: async (token: string, productId: number, quantity: number) => {
    const res = await fetch(`${API_BASE_URL}/cart/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    return res.json();
  },

  removeFromCart: async (token: string, cartItemId: number) => {
    const res = await fetch(`${API_BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  // Orders
  getOrders: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  createOrder: async (token: string, shippingAddress: string) => {
    const res = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ shipping_address: shippingAddress }),
    });
    return res.json();
  },

  // Wishlist
  getWishlist: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  addToWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  removeFromWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },

  checkWishlist: async (token: string, productId: number) => {
    const res = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.json();
  },
};