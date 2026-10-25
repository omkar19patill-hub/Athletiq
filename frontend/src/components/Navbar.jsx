import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutDashboard, Heart, Calendar, Menu, X, Shield, ChevronDown } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const navItem = (active) =>
  `relative text-sm font-medium transition-colors after:absolute after:-bottom-[21px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:transition-colors ${
    active ? 'text-white after:bg-[#00FF87]' : 'text-slate-400 hover:text-white after:bg-transparent'
  }`;

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
    <nav className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0B0F17]/85 backdrop-blur-xl" aria-label="Main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-3" aria-label="ATHLETIQ home">
            <BrandLogo variant="mark" alt="" className="h-9 rounded-lg ring-1 ring-white/10 transition-transform duration-200 group-hover:scale-[1.03]" />
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              ATHLETI<span className="text-[#00FF87]">Q</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/venues" className={navItem(location.pathname === '/venues')}>
              Explore Arenas
            </Link>

            {user ? (
              <div className="flex items-center gap-5">
                {user.role === 'ADMIN' ? (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
                  >
                    <Shield className="w-3.5 h-3.5" /> Admin Console
                  </Link>
                ) : (
                  <>
                    <Link to="/customer/bookings" className={`${navItem(location.pathname === '/customer/bookings')} flex items-center gap-1.5`}>
                      <Calendar className="w-4 h-4" /> My Bookings
                    </Link>
                    <Link to="/customer/favourites" className={`${navItem(location.pathname === '/customer/favourites')} flex items-center gap-1.5`}>
                      <Heart className="w-4 h-4" /> Favorites
                    </Link>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.07]"
                    aria-haspopup="menu"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00FF87] to-emerald-600 text-xs font-bold text-[#04140B]">
                      {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                    </span>
                    <span className="hidden lg:inline text-xs font-medium text-slate-200">
                      {user.firstName || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                  </button>

                  <div className="invisible absolute right-0 top-full w-60 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100" role="menu">
                    <div className="glass-panel p-1.5">
                      <div className="mb-1 border-b border-white/[0.07] px-3 py-2.5">
                        <p className="text-[11px] text-slate-500">Signed in as</p>
                        <p className="truncate text-xs font-semibold text-white">{user.email}</p>
                      </div>
                      <Link
                        to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        role="menuitem"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 text-sky-400" /> Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-white/[0.07] px-3 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
                        role="menuitem"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white">
                  Sign In
                </Link>
                <Link to="/venues" className="btn-primary px-4 py-2">
                  Book Arena
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-slate-300 hover:text-white"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-white/[0.07] bg-[#0B0F17]/95 px-4 pt-3 pb-5 space-y-1 backdrop-blur-xl">
          <Link
            to="/venues"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2.5 text-sm font-medium text-white hover:bg-white/[0.06]"
          >
            Explore Arenas
          </Link>
          {user ? (
            <>
              <Link
                to={user.role === 'ADMIN' ? '/admin/dashboard' : '/customer/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-emerald-300 hover:bg-white/[0.06]"
              >
                Dashboard
              </Link>
              <Link
                to="/customer/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06]"
              >
                My Bookings
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06]"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-t border-white/[0.07] pt-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary">
                Sign In
              </Link>
              <Link to="/venues" onClick={() => setMobileMenuOpen(false)} className="btn-primary">
                Book Arena
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
