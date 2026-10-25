import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthShell, AuthError, authLabel, authIconInput, authIcon } from '../../components/AuthShell';

export const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to ATHLETIQ"
      subtitle="Manage your bookings and match passes"
      footer={
        <div className="space-y-1.5">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-300 hover:underline">Create account</Link>
          </p>
          <p>
            Venue partner?{' '}
            <Link to="/admin/login" className="font-semibold text-slate-200 hover:text-white hover:underline">Partner login &rarr;</Link>
          </p>
        </div>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className={authLabel}>Email address</label>
          <div className="relative">
            <Mail className={authIcon} />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={authIconInput}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={authLabel}>Password</label>
          <div className="relative">
            <Lock className={authIcon} />
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={authIconInput}
            />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full py-3">
          {submitting ? 'Signing in…' : 'Sign in'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthShell>
  );
};
