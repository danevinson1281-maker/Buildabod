'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminEmail', email);

      router.push('/admin/pending-plans');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link href="/" className="text-3xl font-bold text-yellow-500 hover:text-yellow-400 transition">
            BuildABod
          </Link>
          <h1 className="text-3xl font-bold text-white mt-8 mb-2">Admin Login</h1>
          <p className="text-gray-400">Access the client management dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-900/50 border border-yellow-700/30 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dane@buildabod.co"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-yellow-400 transition text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
