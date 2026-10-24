import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { User, Lock, CheckCircle2, AlertCircle, Shield, KeyRound } from 'lucide-react';

export const Profile = () => {
  const { user, setUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    setMsg('');
    setError('');

    try {
      const res = await userService.updateProfile(profileData);
      if (res.success) {
        setUser({ ...user, ...res.data });
        setMsg('Profile credentials updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSubmittingPassword(true);
    setMsg('');
    setError('');

    try {
      await userService.changePassword(passwordData);
      setMsg('Access key password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 relative z-10">
        
        {/* Header HUD */}
        <div className="glass-panel border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <User className="w-3.5 h-3.5" /> ATHLETE PROFILE & BIOMETRICS
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight uppercase">
              Account Security & Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Manage your matchday personal telemetry, notification contact, and gate pass authentication
            </p>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-volt" /> {msg}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-semibold flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Profile Details Form */}
          <div className="glass-panel border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <User className="w-4 h-4 text-volt" />
              <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">
                Personal Credentials
              </h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Registered Email (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-slate-500 cursor-not-allowed font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-volt font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-volt font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-volt font-sans text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProfile}
                className="w-full py-3.5 bg-gradient-to-r from-volt to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-volt hover:scale-105 transition-all disabled:opacity-50 font-sans"
              >
                {submittingProfile ? 'Saving Changes...' : 'Update Athlete Info'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <KeyRound className="w-4 h-4 text-cyan" />
              <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">
                Security & Passcode
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Current Passcode</label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">New Passcode</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="•••••••• (Min 8 chars)"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan font-sans text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Shield className="w-3.5 h-3.5 text-cyan" /> Gate Pass Encryption
                </div>
                <p>Passcodes protect your digital match tickets and quick-recharge venue wallet.</p>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full py-3.5 glass-card hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-white/15 transition-all disabled:opacity-50 font-sans"
              >
                {submittingPassword ? 'Updating Password...' : 'Change Passcode'}
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

