import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

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
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-16 px-4 relative z-10">
        
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-800 relative z-10">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <h2 className="text-2xl font-bold font-display text-white">Venue Partner Portal</h2>
            <p className="text-xs text-slate-400 mt-1">Authorized venue owners and court operators</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@athletiq.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 btn-primary text-sm font-semibold rounded-xl mt-4 disabled:opacity-50"
            >
              {submitting ? 'Verifying Credentials...' : 'Access Admin Console'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={async () => {
                setEmail('admin@athletiq.com');
                setPassword('Admin@12345');
                setError('');
                setSubmitting(true);
                try {
                  const res = await login('admin@athletiq.com', 'Admin@12345');
                  navigate('/admin/dashboard');
                } catch (err) {
                  setError(err.message);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="w-full p-2.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/50 rounded-xl text-center text-xs font-semibold text-sky-400 transition-all flex items-center justify-center gap-1.5"
            >
              1-Click Demo Admin Login
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Need a venue partner account?{' '}
            <Link to="/register?role=ADMIN" className="font-semibold text-emerald-400 hover:underline">
              Register Venue
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
