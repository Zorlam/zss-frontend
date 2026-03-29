# Z'ss - E-Commerce Platform (Frontend)

A modern, responsive e-commerce frontend built with Next.js 14, featuring real-time shopping cart, AI-powered recommendations, and seamless user experience.

🌐 **Live Demo:** https://zss-frontend.onrender.com  
🔗 **Backend API:** https://z-ss-backend-1.onrender.com/api  
💻 **Backend Repo:** https://github.com/Zorlam/z-ss-backend

---

## Features

### User Experience
- 🛍️ **Product Browsing** - Grid layout with infinite scroll and pagination
- 🔍 **Smart Search** - Real-time search with autocomplete suggestions
- 🎯 **Product Filters** - Filter by category, price, availability
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Fast Performance** - Server-side rendering with Next.js 14

### Shopping Features
- 🛒 **Real-time Cart** - Add, update, remove items with instant updates
- ❤️ **Wishlist** - Save favorite products for later
- 💳 **Checkout Flow** - Streamlined order placement
- 📦 **Order History** - Track past purchases
- 🤖 **AI Recommendations** - Personalized product suggestions modal

### User Interface
- 🎨 **Clean Design** - Modern, minimalist aesthetic
- 🌓 **Accessible** - WCAG compliant components
- ✨ **Smooth Animations** - Polished interactions and transitions
- 🖼️ **Image Optimization** - Next.js Image component for fast loading

### Admin Features
- 📊 **Admin Dashboard** - Manage products, orders, and inventory
- ➕ **Product Management** - Create, edit, delete products with image upload
- 📈 **Order Management** - View and process customer orders
- 👥 **User Controls** - Admin-only access controls

---

## Tech Stack

**Framework:** Next.js 14 (App Router)  
**Language:** TypeScript  
**Styling:** Tailwind CSS  
**State Management:** React Hooks (useState, useEffect)  
**Authentication:** JWT tokens (localStorage)  
**Icons:** Lucide React  
**Fonts:** Geist Sans, Playfair Display  
**Deployment:** Render  

---

## Project Structure
zss-frontend/
├── app/
│   ├── layout.tsx              # Root layout with navbar/footer
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Product listing with filters
│   │   └── [id]/page.tsx       # Product detail page
│   ├── cart/
│   │   └── page.tsx            # Shopping cart
│   ├── orders/
│   │   └── page.tsx            # Order history
│   ├── login/
│   │   └── page.tsx            # Login/signup page
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── products/           # Product management
│   │   └── categories/         # Category management
│   └── globals.css             # Global styles
├── components/
│   ├── navbar.tsx              # Navigation with search
│   ├── sidebar.tsx             # Mobile menu
│   └── footer.tsx              # Footer component
├── lib/
│   ├── api.ts                  # API client functions
│   └── utils.ts                # Utility functions (formatPrice, etc.)
└── public/                     # Static assets

---

## Key Features Implementation

### AI Recommendations Modal
- Appears after user browses products (tracked via browsing history)
- Shows personalized product suggestions
- Session-based display (once per login)
- Smooth animations with horizontal scroll

### Smart Search
- Real-time autocomplete suggestions
- Fullscreen search overlay on mobile
- Category-aware results
- Debounced API calls for performance

### Shopping Cart
- Real-time quantity updates
- Persistent across sessions (backend sync)
- Stock validation
- Visual feedback for all actions

### Admin Dashboard
- Protected routes (admin-only access)
- Product CRUD operations
- Image upload with preview
- Order management interface

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend API running (see backend repo)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Zorlam/zss-frontend.git
cd zss-frontend

2. Install Dependanies
npm install

3. Set Enviroment Variables
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000/api

For production: NEXT_PUBLIC_API_URl=http://z-ss-backend-1.onredner.com/api

4. Run Development Server
npm run dev
open http:/localhost:3000

5. Build for production
npm run build
npm start

API Integration
All API calls are centralized in lib/api.ts
// Example usage
import { api } from '@/lib/api';

// Get products
const products = await api.getProducts();

// Add to cart
const token = localStorage.getItem('token');
await api.addToCart(token, productId, quantity);

// Get recommendations
const recommendations = await fetch(`${API_URL}/recommendations/ai`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

Environment Variables
Required
	∙	NEXT_PUBLIC_API_URL - Backend API base URL
Optional
	∙	None (all configuration is in code)

Deployment
Deployed on Render with:
	∙	Automatic builds from master branch
	∙	Environment variables set in dashboard
	∙	Static site generation where applicable
	∙	Server-side rendering for dynamic pages
Build Command: npm run buildStart Command: npm start

Performance Optimizations
	∙	 Image Optimization - Next.js Image component
	∙	 Code Splitting - Automatic route-based splitting
	∙	 Lazy Loading - Components loaded on demand
	∙	 Debounced Search - Reduced API calls
	∙	 Font Optimization - Google Fonts with next/font
	∙	 CSS-in-JS - Tailwind for minimal CSS bundle

Browser Support
	∙	Chrome (latest)
	∙	Firefox (latest)
	∙	Safari (latest)
	∙	Edge (latest)
	∙	Mobile browsers (iOS Safari, Chrome Mobile)

Security
	∙	 XSS Protection - React’s built-in sanitization
	∙	 HTTPS Only - Enforced in production
	∙	 JWT Storage - Secure token handling
	∙	 Input Validation - Client-side validation
	∙	 CORS - Configured backend CORS policy

Contributing
This is a portfolio project. Feel free to fork and adapt for your own use.

License
MIT license-free to use for personal commercial projects.

Author: Daniel Z. Jackson.
