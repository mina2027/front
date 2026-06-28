import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, Lock, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function SignIn() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const result = await signIn(identifier, password);
    setIsSubmitting(false);
    if (!result.success) {
      setError(result.message || 'Invalid login credentials');
      return;
    }
    navigate('/browse');
  };

  const inputWrap =
    'flex items-center gap-2 mt-1 w-full px-3 py-2.5 border border-luxury-border rounded-xl bg-white focus-within:ring-2 focus-within:ring-luxury-gold/40 focus-within:border-luxury-gold transition';

  return (
    <div className="min-h-screen bg-luxury-app flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-luxury border border-luxury-border">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-luxury-gold" />
          <h1 className="text-2xl font-bold text-luxury-navy">Sign In</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6">Log in using your email or username.</p>
        {error && <div className="mb-4 p-3 border border-red-200 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email or username</label>
            <div className={inputWrap}>
              <UserCircle className="w-4 h-4 text-luxury-gold" />
              <input
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                type="text"
                required
                className="flex-1 outline-none bg-transparent"
                placeholder="email@example.com or username"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className={inputWrap}>
              <Lock className="w-4 h-4 text-luxury-gold" />
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                required
                className="flex-1 outline-none bg-transparent"
              />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-luxury w-full">
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          New here?{' '}
          <Link to="/signup" className="text-luxury-gold font-semibold hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
