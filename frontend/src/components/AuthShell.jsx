import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BrandLogo } from './BrandLogo';

// Shared presentation for login and registration screens. No logic lives here.
export const AuthShell = ({ eyebrow, title, subtitle, accent = 'emerald', children, footer }) => (
  <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans">
    <Navbar />

    <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo className="w-32 rounded-2xl ring-1 ring-white/10 shadow-raised" />
        </div>

        <div className="glass-panel relative overflow-hidden p-7 sm:p-8">
          <div
            className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${accent === 'sky' ? 'via-sky-400/70' : 'via-[#00FF87]/70'} to-transparent`}
            aria-hidden="true"
          />
          <div className="mb-6 text-center">
            {eyebrow && (
              <p className={`mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${accent === 'sky' ? 'text-sky-300' : 'text-emerald-300'}`}>
                {eyebrow}
              </p>
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="mt-6 border-t border-white/[0.07] pt-5 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </div>
    </main>

    <Footer />
  </div>
);

export const AuthError = ({ children }) => (
  <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-200">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
    <span>{children}</span>
  </div>
);

// Shared field styles for auth forms
export const authLabel = 'mb-1.5 block text-xs font-medium text-slate-300';
export const authInput = 'neo-input w-full px-3.5 py-2.5 text-sm';
export const authIconInput = 'neo-input w-full pl-10 pr-3.5 py-2.5 text-sm';
export const authIcon = 'pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500';
