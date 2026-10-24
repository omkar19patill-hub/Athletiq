import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const CustomerRegister = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
  const [selectedRole, setSelectedRole] = useState(defaultRole);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await register({ ...formData, role: selectedRole });
      if (res.role === 'ADMIN' || selectedRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              selectedRole === 'ADMIN' 
                ? 'bg-sky-500/10 border border-sky-500/20 text-sky-400' 
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              {selectedRole === 'ADMIN' ? <Shield className="w-6 h-6 stroke-[2]" /> : <User className="w-6 h-6 stroke-[2]" />}
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              {selectedRole === 'ADMIN' ? 'Venue Partner Registration' : 'Create Customer Account'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {selectedRole === 'ADMIN' ? 'List your arena and accept online slot bookings' : 'Book courts and sports turfs across 15+ cities'}
            </p>
          </div>

          {/* Account Type Toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-800/80 rounded-xl mb-5 border border-slate-700/80">
            <button
              type="button"
              onClick={() => setSelectedRole('CUSTOMER')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Customer / Player
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('ADMIN')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Venue Partner
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 btn-primary text-sm font-semibold rounded-xl mt-4 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : selectedRole === 'ADMIN' ? 'Register Partner Account' : 'Create Account'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
