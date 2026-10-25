import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { AuthShell, AuthError, authLabel, authInput, authIconInput, authIcon } from '../../components/AuthShell';

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

  const isPartner = selectedRole === 'ADMIN';

  return (
    <AuthShell
      accent={isPartner ? 'sky' : 'emerald'}
      eyebrow={isPartner ? 'Venue partner' : 'New player'}
      title={isPartner ? 'Register your venue' : 'Create your account'}
      subtitle={isPartner ? 'List your arena and accept online slot bookings' : 'Book sports turfs and courts online'}
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-300 hover:underline">Sign in</Link>
        </p>
      }
    >
      {/* Account type */}
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="radiogroup" aria-label="Account type">
        <button
          type="button"
          role="radio"
          aria-checked={!isPartner}
          onClick={() => setSelectedRole('CUSTOMER')}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            !isPartner ? 'bg-[#00FF87] text-[#04140B] shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Customer / Player
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={isPartner}
          onClick={() => setSelectedRole('ADMIN')}
          className={`rounded-lg py-2 text-xs font-semibold transition-all ${
            isPartner ? 'bg-sky-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Venue Partner
        </button>
      </div>

      {error && <AuthError>{error}</AuthError>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="reg-first" className={authLabel}>First name</label>
            <input id="reg-first" type="text" name="firstName" required autoComplete="given-name" value={formData.firstName} onChange={handleChange} placeholder="Rahul" className={authInput} />
          </div>
          <div>
            <label htmlFor="reg-last" className={authLabel}>Last name</label>
            <input id="reg-last" type="text" name="lastName" required autoComplete="family-name" value={formData.lastName} onChange={handleChange} placeholder="Sharma" className={authInput} />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className={authLabel}>Email address</label>
          <div className="relative">
            <Mail className={authIcon} />
            <input id="reg-email" type="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" className={authIconInput} />
          </div>
        </div>

        <div>
          <label htmlFor="reg-phone" className={authLabel}>Phone number</label>
          <div className="relative">
            <Phone className={authIcon} />
            <input id="reg-phone" type="tel" name="phone" required autoComplete="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" className={authIconInput} />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className={authLabel}>Password</label>
          <div className="relative">
            <Lock className={authIcon} />
            <input id="reg-password" type="password" name="password" required autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={authIconInput} />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full py-3">
          {submitting ? 'Creating account…' : isPartner ? 'Register partner account' : 'Create account'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </AuthShell>
  );
};
