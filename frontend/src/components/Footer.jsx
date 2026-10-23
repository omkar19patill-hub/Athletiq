import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Sport<span className="text-primary-500">Sphere</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              The ultimate multi-venue sports turf booking platform. Instant court reservation with real-time availability across major Indian cities.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-primary-600 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/venues" className="hover:text-primary-400 transition-colors">Explore All Venues</Link></li>
              <li><Link to="/register" className="hover:text-primary-400 transition-colors">Booker Registration</Link></li>
              <li><Link to="/login" className="hover:text-primary-400 transition-colors">Partner Admin Login</Link></li>
              <li><a href="#how-it-works" className="hover:text-primary-400 transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Popular Sports</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/venues?sport=FOOTBALL" className="hover:text-primary-400 transition-colors">Football Turfs</Link></li>
              <li><Link to="/venues?sport=CRICKET" className="hover:text-primary-400 transition-colors">Box Cricket Grounds</Link></li>
              <li><Link to="/venues?sport=BADMINTON" className="hover:text-primary-400 transition-colors">Badminton Courts</Link></li>
              <li><Link to="/venues?sport=TENNIS" className="hover:text-primary-400 transition-colors">Tennis Courts</Link></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">Contact Support</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <span>Indiranagar 100ft Road, Bangalore, Karnataka 560038</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 shrink-0" />
                <span>support@sportsphere.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SportSphere Platform Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
            <a href="#" className="hover:text-slate-400">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
