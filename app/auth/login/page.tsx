'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">FounderOps</h1>
          <p className="text-gray-400 mt-2">AI Assistant for Solo Founders</p>
        </div>
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
              <p className="text-gray-400 text-sm">We sent a magic link to <strong className="text-white">{email}</strong>. Click the link to sign in.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-semibold text-xl mb-6">Sign in</h2>
              <form onSubmit={handleMagicLink}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@startup.com"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 text-sm border border-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Magic Link'}
                </button>
              </form>
              <p className="text-gray-500 text-xs mt-4 text-center">No password needed. We&apos;ll email you a sign-in link.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
