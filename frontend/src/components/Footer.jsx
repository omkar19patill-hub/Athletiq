import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#080C14] text-slate-400 pt-16 pb-12 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Callout Banner */}
        <div className="mb-14 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="text-white font-bold text-lg font-display">Ready for Matchday?</div>
              <p className="text-xs text-slate-400 mt-0.5">Find and book verified floodlit courts across top sports complexes.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/venues"
              className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-lg"
            >
              Explore Venues
            </Link>
            <Link
              to="/register?role=ADMIN"
              className="btn-secondary py-2.5 px-4 text-xs font-medium rounded-lg"
            >
              List Your Venue
            </Link>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Trophy className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight font-display">
                ATHLET<span className="text-emerald-400">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Premier sports turf and court reservation platform. Real-time availability, instant slot locks, and secure Stripe payments.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Sports Categories */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3.5 text-slate-200">Sports & Courts</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/venues" className="hover:text-white transition-colors">All Venues</Link></li>
              <li><Link to="/venues?sport=FOOTBALL" className="hover:text-white transition-colors">Football Turfs</Link></li>
              <li><Link to="/venues?sport=CRICKET" className="hover:text-white transition-colors">Box Cricket Nets</Link></li>
              <li><Link to="/venues?sport=BADMINTON" className="hover:text-white transition-colors">Badminton Courts</Link></li>
              <li><Link to="/venues?sport=BASKETBALL" className="hover:text-white transition-colors">Basketball Courts</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3.5 text-slate-200">Account & Portals</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/login" className="hover:text-white transition-colors">Customer Login</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link to="/admin/login" className="hover:text-white transition-colors">Venue Partner Portal</Link></li>
              <li><Link to="/customer/bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3.5 text-slate-200">Locations & Contact</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Major Metro Centers across Mumbai, Bangalore, Pune, Gurugram, and Hyderabad</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@athletiq.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} ATHLETIQ Technologies. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Refund Guarantee</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
