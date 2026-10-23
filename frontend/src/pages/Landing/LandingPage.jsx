import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Shield, User, ArrowRight, Search, Calendar, CheckCircle2, 
  Star, MapPin, Users, Activity, Sparkles, HelpCircle 
} from 'lucide-react';
import { venueService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const LandingPage = () => {
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  useEffect(() => {
    venueService.getFeatured()
      .then((res) => {
        if (res.success) setFeaturedVenues(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingVenues(false));
  }, []);

  const popularSports = [
    { name: 'Football', icon: '⚽', desc: 'FIFA 5v5 & 7v7 turfs', color: 'from-emerald-500 to-teal-600', query: 'FOOTBALL' },
    { name: 'Cricket', icon: '🏏', desc: 'Indoor box & outdoor grounds', color: 'from-amber-500 to-orange-600', query: 'CRICKET' },
    { name: 'Badminton', icon: '🏸', desc: 'Synthetic & wooden courts', color: 'from-blue-500 to-indigo-600', query: 'BADMINTON' },
    { name: 'Basketball', icon: '🏀', desc: 'Outdoor & FIBA courts', color: 'from-purple-500 to-pink-600', query: 'BASKETBALL' },
  ];

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-primary-50/30 to-surface-background pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT SIDE */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 text-primary-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-primary-600" />
                #1 Sports Venue Booking Network
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Book Your Favorite <span className="text-primary-600 underline decoration-primary-300 decoration-wavy decoration-2">Sports Turf</span> in Minutes
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
                Search, compare and book badminton courts, football turfs, cricket grounds and more with real-time availability.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/venues"
                  className="px-8 py-4 text-base font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-3"
                >
                  Explore Venues <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 text-base font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  How It Works
                </a>
              </div>

              {/* Badges */}
              <div className="pt-8 border-t border-slate-200/60 flex items-center gap-8 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> Instant Booking
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> Zero Convenience Fee
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> 100% Refund Policy
                </div>
              </div>
            </motion.div>

            {/* RIGHT SIDE — Modern Animated Cards */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6"
            >
              {/* Card 1: ADMIN */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-card p-6 shadow-xl border border-slate-700/50 relative overflow-hidden group"
              >
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-primary-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded-full uppercase tracking-wider">
                    Venue Owner
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">ADMIN PORTAL</h3>
                <p className="text-slate-400 text-xs mb-6">Manage courts, dynamic slot pricing, customer bookings and revenue analytics.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/admin/login"
                    className="py-2.5 px-4 text-center text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register?role=ADMIN"
                    className="py-2.5 px-4 text-center text-xs font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>

              {/* Card 2: CUSTOMER */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-card p-6 shadow-soft border border-slate-100 relative overflow-hidden group hover:border-primary-200 transition-all"
              >
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-100/50 rounded-full blur-2xl group-hover:bg-primary-200/50 transition-all"></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    Sports Player
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">CUSTOMER PORTAL</h3>
                <p className="text-slate-500 text-xs mb-6">Find nearby sports turfs, pick preferred slots, and confirm instant bookings.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="py-2.5 px-4 text-center text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="py-2.5 px-4 text-center text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-md shadow-primary-500/20 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Explore Popular Sports
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              Choose your sport and view top rated venues near you with available time slots.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularSports.map((sport, index) => (
              <Link key={index} to={`/venues?sport=${sport.query}`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="p-6 rounded-card bg-surface-background border border-slate-100 shadow-sm hover:shadow-hover transition-all text-left relative overflow-hidden group"
                >
                  <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{sport.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{sport.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">{sport.desc}</p>
                  <span className="text-xs font-bold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Turfs <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Venues */}
      <section className="py-20 bg-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
                Featured Venues
              </h2>
              <p className="mt-2 text-slate-500 text-base">
                Handpicked sports complexes with state-of-the-art facilities and amenities.
              </p>
            </div>
            <Link to="/venues" className="mt-4 sm:mt-0 text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All Venues ({featuredVenues.length}) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingVenues ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white rounded-card animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredVenues.map((venue) => (
                <motion.div
                  key={venue.id}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-card overflow-hidden shadow-soft border border-slate-100 flex flex-col group"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={venue.imageUrls?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {venue.averageRating || '4.5'}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {venue.city}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{venue.description}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Starting from</span>
                        <span className="text-base font-extrabold text-slate-900">₹400 <span className="text-xs font-normal text-slate-500">/ hr</span></span>
                      </div>
                      <Link
                        to={`/venues/${venue.id}`}
                        className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
                      >
                        Book Slot
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              How SportSphere Works
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              3 simple steps to reserve your sports court and play with your squad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-surface-background p-8 rounded-card border border-slate-100 relative text-center">
              <div className="w-14 h-14 bg-primary-100 text-primary-700 text-xl font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Search & Compare</h3>
              <p className="text-slate-500 text-sm">
                Filter courts by city, sport, pricing, user reviews, and preferred date.
              </p>
            </div>

            <div className="bg-surface-background p-8 rounded-card border border-slate-100 relative text-center">
              <div className="w-14 h-14 bg-primary-100 text-primary-700 text-xl font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pick Slot & Requirements</h3>
              <p className="text-slate-500 text-sm">
                Select hourly time slot and fill custom court preparations & equipment needs.
              </p>
            </div>

            <div className="bg-surface-background p-8 rounded-card border border-slate-100 relative text-center">
              <div className="w-14 h-14 bg-primary-100 text-primary-700 text-xl font-extrabold rounded-2xl flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Confirmation</h3>
              <p className="text-slate-500 text-sm">
                Receive instant booking pass, automated receipt PDF, and guaranteed turf access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-20 bg-surface-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Loved by 50,000+ Players
            </h2>
            <p className="mt-3 text-slate-500 text-base">
              See what sports enthusiasts and team captains have to say about SportSphere.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-card shadow-soft border border-slate-100">
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                "Finding box cricket grounds in Mumbai during weekends was a headache until SportSphere. Instant slot confirmation and transparent refund policy!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  AP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Aditya Patel</h4>
                  <span className="text-xs text-slate-400">Cricket Captain, Mumbai</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-card shadow-soft border border-slate-100">
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                "The requirement form before booking allowed us to request floodlights and bibs for our weekend corporate football league. Super smooth!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center text-sm">
                  NK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Neha Kulkarni</h4>
                  <span className="text-xs text-slate-400">Corporate Manager, Bangalore</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-card shadow-soft border border-slate-100">
              <div className="flex text-amber-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                "As a venue manager, the Admin dashboard gave us full control over court slots, live revenue analytics, and zero double bookings!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm">
                  VR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Vikram Rao</h4>
                  <span className="text-xs text-slate-400">Venue Owner, Apex Arena</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-4xl font-extrabold text-primary-400 block mb-1">500+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Verified Venues</span>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-primary-400 block mb-1">50,000+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Bookings Completed</span>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-primary-400 block mb-1">20+</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Cities Active</span>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-primary-400 block mb-1">4.9 ★</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
