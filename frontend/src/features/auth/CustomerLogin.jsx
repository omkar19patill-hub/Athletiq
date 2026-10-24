import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

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
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        
        <div className="max-w-md w-full bg-[#0F172A] rounded-xl p-8 shadow-[6px_6px_0px_#000000] border-2 border-black relative z-10">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-[#00FF87] border-2 border-black shadow-[3px_3px_0px_#000] text-black flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="text-2xl font-black font-display uppercase tracking-tight text-white">Sign In to Athletiq</h2>
            <p className="text-xs text-slate-400 mt-1 font-medium">Manage your turf bookings, slot locks, and match passes</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-lg bg-rose-500/10 border-2 border-rose-500/40 text-rose-400 text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#000]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border-2 border-black rounded-lg text-sm text-white placeholder:text-slate-500 shadow-[2px_2px_0px_#000] focus:outline-none focus:shadow-[2px_2px_0px_#00FF87] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0F17] border-2 border-black rounded-lg text-sm text-white placeholder:text-slate-500 shadow-[2px_2px_0px_#000] focus:outline-none focus:shadow-[2px_2px_0px_#00FF87] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 btn-primary text-sm font-black rounded-lg mt-4 disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t-2 border-black/40">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5 flex items-center justify-center gap-1.5">
              Quick Demo Sign In
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  setEmail('customer@athletiq.com');
                  setPassword('Customer@12345');
                  setError('');
                  setSubmitting(true);
                  try {
                    const res = await login('customer@athletiq.com', 'Customer@12345');
                    navigate(res.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard');
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-semibold text-emerald-400">Demo Customer</div>
                <div className="text-[10px] text-slate-400 truncate">customer@athletiq.com</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setEmail('admin@athletiq.com');
                  setPassword('Admin@12345');
                  setError('');
                  setSubmitting(true);
                  try {
                    const res = await login('admin@athletiq.com', 'Admin@12345');
                    navigate(res.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard');
                  } catch (err) {
                    setError(err.message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 rounded-xl text-left transition-all"
              >
                <div className="text-xs font-semibold text-sky-400">Demo Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@athletiq.com</div>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col items-center gap-1.5 text-xs text-slate-400">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-emerald-400 hover:underline">
                Create Account
              </Link>
            </div>
            <div>
              Venue Partner?{' '}
              <Link to="/admin/login" className="font-semibold text-slate-300 hover:text-white hover:underline">
                Partner Login &rarr;
              </Link>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
