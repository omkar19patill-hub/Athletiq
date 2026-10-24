import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, User, LogOut, LayoutDashboard, Heart, Calendar, Menu, X, Shield, ChevronDown } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* 1. Subtle, Clean Top Utility Bar */}
      <div className="bg-[#080C14] text-xs border-b border-white/[0.06] text-slate-400 py-1.5 px-4 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-medium">100+ Verified Floodlit Turfs & Courts</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-slate-400">Real-Time PIN Code Proximity Radar</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span className="hidden md:inline">Instant Stripe Checkout</span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <Link to="/venues" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Find Venues Nearby &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Neo-Brutalist Navbar */}
      <nav className="sticky top-0 z-40 bg-[#0B0F17] border-b-2 border-black shadow-[0px_4px_0px_#000000] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-[#00FF87] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black font-black group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                <Trophy className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white font-display uppercase">
                  ATHLET<span className="text-[#00FF87]">IQ</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 bg-[#00FF87] text-black border border-black shadow-[1px_1px_0px_#000] text-[9px] font-black uppercase rounded">
                  TURF PRO
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/venues"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/venues'
                    ? 'text-emerald-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Explore Arenas
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'ADMIN' ? (
                    <Link
                      to="/admin/dashboard"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" /> Admin Console
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/customer/bookings"
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                          location.pathname === '/customer/bookings' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Calendar className="w-4 h-4 text-emerald-400" /> My Bookings
                      </Link>
                      <Link
                        to="/customer/favourites"
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-rose-400 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-rose-400" /> Favorites
                      </Link>
                    </>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center gap-2.5 py-1 px-2.5 rounded-lg bg-slate-800/60 border border-white/10 hover:border-slate-700 hover:bg-slate-800 transition-all">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-medium text-slate-200 hidden lg:inline">
                        {user.firstName || 'Account'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform" />
                    </button>

                    <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-1.5 hidden group-hover:block transition-all backdrop-blur-xl">
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-[11px] text-slate-400">Signed in as</p>
                        <p className="text-xs font-semibold text-white truncate">{user.email}</p>
                      </div>

                      <Link
                        to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-blue-400" /> Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors font-medium mt-1 border-t border-slate-800/80"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/venues"
                    className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg"
                  >
                    Book Arena
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/60 border border-slate-700/60"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-5 space-y-2">
            <Link
              to="/venues"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-800"
            >
              Explore Arenas
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800"
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  My Bookings
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700"
                >
                  Sign In
                </Link>
                <Link
                  to="/venues"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center btn-primary py-2 text-sm"
                >
                  Book Arena
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};
