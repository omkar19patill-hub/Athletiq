import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const columns = [
  {
    title: 'Sports & Courts',
    links: [
      ['/venues', 'All Venues'],
      ['/venues?sport=FOOTBALL', 'Football Turfs'],
      ['/venues?sport=CRICKET', 'Box Cricket Nets'],
      ['/venues?sport=BADMINTON', 'Badminton Courts'],
      ['/venues?sport=BASKETBALL', 'Basketball Courts'],
    ],
  },
  {
    title: 'Account',
    links: [
      ['/login', 'Customer Login'],
      ['/register', 'Create Account'],
      ['/admin/login', 'Venue Partner Portal'],
      ['/customer/bookings', 'My Bookings'],
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#080C14] pt-14 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Callout */}
        <div className="glass-panel mb-14 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-bold text-white">Ready to play?</p>
            <p className="mt-1 text-sm text-slate-400">Find a court, pick an open slot and book in a few steps.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/venues" className="btn-primary">
              Explore Venues <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register?role=ADMIN" className="btn-secondary">
              List Your Venue
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 space-y-4">
            <BrandLogo className="w-40 rounded-xl ring-1 ring-white/10" />
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Book sports turfs and courts by the slot, with secure online payment through Stripe.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {col.links.map(([to, label]) => (
                  <li key={to}>
                    <Link to={to} className="transition-colors hover:text-white">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/[0.07] pt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} ATHLETIQ. Play More. Plan Less.
        </div>
      </div>
    </footer>
  );
};
