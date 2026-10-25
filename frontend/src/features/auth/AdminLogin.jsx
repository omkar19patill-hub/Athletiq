import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthShell, AuthError, authLabel, authIconInput, authIcon } from '../../components/AuthShell';

export const AdminLogin = () => {
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
      if (res.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges required for this portal.');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Admin authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      accent="sky"
      eyebrow="Venue partner portal"
      title="Partner sign in"
      subtitle="For venue owners and court operators"
      footer={
        <p>
          Need a venue partner account?{' '}
          <Link to="/register?role=ADMIN" className="font-semibold text-sky-300 hover:underline">Register venue</Link>
        </p>
      }
    >
      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className={authLabel}>Admin email</label>
          <div className="relative">
            <Mail className={authIcon} />
            <input
              id="admin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourvenue.com"
              className={authIconInput}
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className={authLabel}>Password</label>
          <div className="relative">
            <Lock className={authIcon} />
            <input
              id="admin-password"
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
          {submitting ? 'Verifying…' : 'Access admin console'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthShell>
  );
};
