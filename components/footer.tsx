import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
              Z'<span className="italic">ss</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Experience fashion reimagined with AI-powered recommendations
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} Z'ss. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}