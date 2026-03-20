'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup state
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!loginPassword.trim()) {
      setError('Please enter your password');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const data = await api.login(loginEmail, loginPassword);
      
      console.log('Response:', data);

      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/products');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('429')) {
        setError('Too many login attempts. Please wait a minute and try again.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupUsername.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!signupEmail.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!signupPassword.trim()) {
      setError('Please enter a password');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const data = await api.register(signupUsername, signupEmail, signupPassword);

      if (data.access_token) {
        setIsSignUp(false);
        setError('');
        setLoginEmail(signupEmail);
        alert('Account created successfully! Please login.');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Tab Navigation */}
        <div className="flex justify-center gap-12 mb-8">
          <button
            onClick={() => {
              setIsSignUp(false);
              setError('');
            }}
            className={`text-lg font-semibold pb-2 transition-all ${
              !isSignUp 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Log in
          </button>
          
          <button
            onClick={() => {
              setIsSignUp(true);
              setError('');
            }}
            className={`text-lg font-semibold pb-2 transition-all ${
              isSignUp 
                ? 'text-gray-900 border-b-2 border-gray-900' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Flip Card Container */}
        <div className="relative h-[420px] perspective-1000">
          <div 
            className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
              isSignUp ? 'rotate-y-180' : ''
            }`}
          >
            {/* Login Card (Front) */}
            <div className={`absolute inset-0 backface-hidden ${isSignUp ? 'pointer-events-none' : ''}`}>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Welcome Back
                </h2>

                {error && !isSignUp && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <div className="border-[1.5px] border-gray-200 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition">
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Password
                    </label>
                    <div className="border-[1.5px] border-gray-200 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition">
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 h-12 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Logging in...' : 'Log in'}
                  </button>
                </form>
              </div>
            </div>

            {/* Signup Card (Back) */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 ${!isSignUp ? 'pointer-events-none' : ''}`}>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create Account
                </h2>

                {error && isSignUp && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignup} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Username
                    </label>
                    <div className="border-[1.5px] border-gray-200 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition">
                      <input
                        type="text"
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email
                    </label>
                    <div className="border-[1.5px] border-gray-200 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition">
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Password
                    </label>
                    <div className="border-[1.5px] border-gray-200 rounded-lg h-12 flex items-center px-3 focus-within:border-blue-500 transition">
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Create a password (min 6 characters)"
                        className="flex-1 border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 h-12 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating account...' : 'Sign up'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Transform Styles */}
        <style jsx>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
        `}</style>
      </div>
    </div>
  );
}