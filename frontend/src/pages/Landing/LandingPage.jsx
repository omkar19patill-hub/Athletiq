import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Shield, ArrowRight, Search, Calendar, CheckCircle2, 
  Star, MapPin, Users, Activity, Clock, 
  ChevronRight, Compass, ShieldCheck 
} from 'lucide-react';
import { venueService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [activeSportIndex, setActiveSportIndex] = useState(0);

  // Quick Search state
  const [hudCity, setHudCity] = useState('');
  const [hudSport, setHudSport] = useState('ALL');
  const [hudPincode, setHudPincode] = useState('');
  const [hudPinInfo, setHudPinInfo] = useState(null);
  const [resolvingHudPin, setResolvingHudPin] = useState(false);

  // Real-time PIN code lookup
  useEffect(() => {
    if (hudPincode && hudPincode.trim().length >= 3) {
      setResolvingHudPin(true);
      venueService.lookupPincode(hudPincode.trim())
        .then((res) => {
          if (res.success && res.data) {
            setHudPinInfo(res.data);
          } else {
            setHudPinInfo(null);
          }
        })
        .catch(() => setHudPinInfo(null))
        .finally(() => setResolvingHudPin(false));
    } else {
      setHudPinInfo(null);
    }
  }, [hudPincode]);

  // Live dynamic update of displayed venues when PIN, City, or Sport changes
  useEffect(() => {
    if (hudPincode && hudPincode.trim().length >= 5) {
      setLoadingVenues(true);
      venueService.search({ pincode: hudPincode.trim(), sport: hudSport !== 'ALL' ? hudSport : undefined, size: 6 })
        .then((res) => {
          if (res.success && res.data.content.length > 0) {
            setFeaturedVenues(res.data.content);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingVenues(false));
    } else if (hudCity) {
      setLoadingVenues(true);
      venueService.search({ city: hudCity, sport: hudSport !== 'ALL' ? hudSport : undefined, size: 6 })
        .then((res) => {
          if (res.success) {
            setFeaturedVenues(res.data.content);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingVenues(false));
    } else {
      venueService.getFeatured()
        .then((res) => {
          if (res.success) setFeaturedVenues(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingVenues(false));
    }
  }, [hudPincode, hudCity, hudSport]);

  const handleHudSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (hudCity) query.set('city', hudCity);
    if (hudSport && hudSport !== 'ALL') query.set('sport', hudSport);
    if (hudPincode) query.set('pincode', hudPincode);
    navigate(`/venues?${query.toString()}`);
  };

  const sportsArenaConfig = [
    {
      name: 'Football Turfs',
      tagline: 'FIFA-grade 5v5 & 7v7 artificial turf pitches with professional floodlights',
      icon: '⚽',
      query: 'FOOTBALL',
      accentColor: '#10B981',
      surface: 'Monofilament 50mm Rubber Infill Turf',
      lighting: '800 Lux LED Stadium Floodlights',
      dimensions: '42m x 25m Enclosed Arena',
      pitchGraphic: 'M10,20 L190,20 L190,120 L10,120 Z M100,20 L100,120 M100,70 A20,20 0 1,0 100,69.9 M10,45 L35,45 L35,95 L10,95 M190,45 L165,45 L165,95 L190,95',
      bgImg: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Box Cricket Nets',
      tagline: 'High-tension enclosed turf nets with pace tracking and bowling machines',
      icon: '🏏',
      query: 'CRICKET',
      accentColor: '#F59E0B',
      surface: 'High-Density 15mm Curled Turf Pitch',
      lighting: 'Shadow-Free Omni Floodlight Grid',
      dimensions: '110ft x 55ft Enclosed Box',
      pitchGraphic: 'M20,20 L180,20 L180,120 L20,120 Z M70,40 L130,40 L130,100 L70,100 Z M100,20 L100,120',
      bgImg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Badminton Courts',
      tagline: 'BWF-approved synthetic mats & teak wooden courts with anti-glare overheads',
      icon: '🏸',
      query: 'BADMINTON',
      accentColor: '#38BDF8',
      surface: 'BWF Approved 4.5mm PVC Cushion Mat',
      lighting: 'Anti-Glare Non-Flicker Overhead Panels',
      dimensions: '13.4m x 6.1m Regulation Court',
      pitchGraphic: 'M30,20 L170,20 L170,120 L30,120 Z M100,20 L100,120 M50,20 L50,120 M150,20 L150,120 M30,70 L170,70',
      bgImg: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Basketball Courts',
      tagline: 'FIBA standard shock-absorbent acrylic & polyurethane cushion courts',
      icon: '🏀',
      query: 'BASKETBALL',
      accentColor: '#F43F5E',
      surface: 'Interlocking Shock-Absorbent Tiles',
      lighting: 'Night Match Floodlight Towers',
      dimensions: '28m x 15m Regulation Half/Full',
      pitchGraphic: 'M20,20 L180,20 L180,120 L20,120 Z M100,20 L100,120 M100,70 A25,25 0 1,0 100,69.9 M20,40 L50,40 L50,100 L20,100 M180,40 L150,40 L150,100 L180,100',
      bgImg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop&q=80',
    },
  ];

  const activeSport = sportsArenaConfig[activeSportIndex];

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      {/* 1. HERO SECTION with Photorealistic Stadium Background */}
      <section className="relative overflow-hidden pt-16 pb-28 lg:pt-24 lg:pb-36 stadium-hero-bg border-b border-white/[0.08]">
        
        {/* Subtle radial lighting accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            {/* Neo-Brutalist Sticker Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 sticker-badge sticker-volt"
            >
              <span className="w-2 h-2 rounded-full bg-black"></span>
              Verified Sports Venues & Real-time Booking
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white uppercase leading-tight"
            >
              Book Premier Sports Turfs <br className="hidden sm:inline" />
              <span className="text-[#00FF87] underline decoration-4 decoration-black">
                Under the Floodlights
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              Reserve football turfs, cricket nets, and indoor courts in seconds. Search by location PIN code or city with guaranteed instant slot lock and secure Stripe checkout.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              <Link
                to="/venues"
                className="btn-primary py-3.5 px-6 text-sm rounded-lg"
              >
                <span>Find Venues Near You</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                to="/admin/login"
                className="btn-secondary py-3.5 px-6 text-sm rounded-lg"
              >
                <Shield className="w-4 h-4 text-[#00FF87]" />
                <span>Venue Partner Login</span>
              </Link>
            </motion.div>

          </div>

          {/* Clean Modern Search Card */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <form onSubmit={handleHudSearch} className="p-4 sm:p-5 rounded-xl bg-[#0F172A] border-2 border-black shadow-[6px_6px_0px_#000000] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              
              {/* City Selector */}
              <div className="lg:col-span-3 bg-[#0B0F17] border-2 border-black shadow-[2px_2px_0px_#000] rounded-lg px-3.5 py-2.5 transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#00FF87]" /> City
                </label>
                <select
                  value={hudCity}
                  onChange={(e) => setHudCity(e.target.value)}
                  className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#0F172A] text-white">All Metro Cities</option>
                  <option value="Bangalore" className="bg-[#0F172A] text-white">Bangalore</option>
                  <option value="Mumbai" className="bg-[#0F172A] text-white">Mumbai</option>
                  <option value="Gurugram" className="bg-[#0F172A] text-white">Gurugram</option>
                  <option value="Pune" className="bg-[#0F172A] text-white">Pune</option>
                  <option value="Hyderabad" className="bg-[#0F172A] text-white">Hyderabad</option>
                </select>
              </div>

              {/* Area PIN Code */}
              <div className="lg:col-span-3 bg-[#0B0F17] border-2 border-black shadow-[2px_2px_0px_#000] rounded-lg px-3.5 py-2.5 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#00E5FF]" /> Area PIN Code
                  </label>
                  {resolvingHudPin && <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={hudPincode}
                  onChange={(e) => setHudPincode(e.target.value)}
                  placeholder="e.g. 560034"
                  className="w-full bg-transparent text-white font-bold text-sm placeholder:text-slate-500 focus:outline-none"
                />
                {hudPinInfo && (
                  <div className="text-[11px] text-[#00FF87] mt-1 flex items-center gap-1 truncate font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] shrink-0" />
                    <span>{hudPinInfo.area}, {hudPinInfo.city}</span>
                  </div>
                )}
              </div>

              {/* Sport Type */}
              <div className="lg:col-span-3 bg-[#0B0F17] border-2 border-black shadow-[2px_2px_0px_#000] rounded-lg px-3.5 py-2.5 transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#FACC15]" /> Sport
                </label>
                <select
                  value={hudSport}
                  onChange={(e) => setHudSport(e.target.value)}
                  className="w-full bg-transparent text-white font-bold text-sm focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-[#0F172A] text-white">All Sports</option>
                  <option value="FOOTBALL" className="bg-[#0F172A] text-white">⚽ Football</option>
                  <option value="CRICKET" className="bg-[#0F172A] text-white">🏏 Cricket</option>
                  <option value="BADMINTON" className="bg-[#0F172A] text-white">🏸 Badminton</option>
                  <option value="BASKETBALL" className="bg-[#0F172A] text-white">🏀 Basketball</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-3.5 px-5 btn-primary text-sm font-black rounded-lg"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>Search Arenas</span>
                </button>
              </div>

            </form>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Courts
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> High-Lux Floodlights
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Stripe Refund Policy
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. SPORT CATEGORY PREVIEWS */}
      <section className="py-20 bg-[#0B0F17] border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Turfs & Courts
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
                Choose Your Sport
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Select a discipline to view standard court dimensions, turf specifications, and available floodlight arenas.
            </p>
          </div>

          {/* Sport Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {sportsArenaConfig.map((sport, idx) => (
              <button
                key={sport.name}
                onClick={() => setActiveSportIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
                  activeSportIndex === idx
                    ? 'bg-slate-800/90 border-emerald-500/60 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="text-2xl mb-2">{sport.icon}</div>
                <div className="text-base font-semibold text-white">{sport.name}</div>
                <div className="text-xs text-slate-400 mt-1 line-clamp-1">{sport.surface.split(' ')[0]} surface</div>
                {activeSportIndex === idx && (
                  <motion.div 
                    layoutId="activeSportIndicator" 
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-emerald-400 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Active Sport Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl min-h-[380px] flex flex-col lg:flex-row items-center">
            
            {/* Background Image Preview */}
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSport.name}
                src={activeSport.bgImg}
                alt={activeSport.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            </AnimatePresence>

            {/* Dark gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>

            {/* Details */}
            <div className="relative z-10 p-8 lg:p-12 max-w-xl space-y-5">
              <div className="inline-block px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Official Tournament Standards
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {activeSport.name}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {activeSport.tagline}
              </p>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-400">Surface Type:</span>
                  <span className="text-white font-medium">{activeSport.surface}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  <span className="text-slate-400">Lighting Quality:</span>
                  <span className="text-white font-medium">{activeSport.lighting}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-slate-400">Dimensions:</span>
                  <span className="text-white font-medium">{activeSport.dimensions}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/venues?sport=${activeSport.query}`}
                  className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-lg"
                >
                  <span>Explore {activeSport.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Court Blueprint Graphic */}
            <div className="relative z-10 flex-1 w-full p-8 flex items-center justify-center">
              <div className="w-full max-w-md aspect-[16/10] border border-slate-700/80 rounded-xl p-4 bg-slate-950/70 backdrop-blur-md relative flex items-center justify-center">
                <svg viewBox="0 0 200 140" className="w-full h-full stroke-emerald-400/90 fill-none stroke-[1.8]">
                  <path d={activeSport.pitchGraphic} />
                </svg>
                <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Certified Court Dimensions
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FEATURED VENUES */}
      <section className="py-20 bg-[#0B0F17] border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10">
            <div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Handpicked Locations
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
                {hudPincode && hudPinInfo ? (
                  <span>Venues Near {hudPinInfo.area}</span>
                ) : (
                  <span>Popular Sports Venues</span>
                )}
              </h2>
            </div>
            <Link 
              to="/venues" 
              className="btn-secondary py-2 px-4 text-xs font-medium rounded-lg"
            >
              <span>View All Venues ({featuredVenues.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingVenues ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col group"
                >
                  {/* Photo Container */}
                  <div className="relative h-52 overflow-hidden bg-slate-950">
                    <img
                      src={venue.imageUrls?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1000'}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-slate-700/60 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Available Today
                      </span>
                      {venue.distanceKm !== undefined && venue.distanceKm !== null && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-900/80 backdrop-blur-md text-sky-400 border border-slate-700/60">
                          {venue.distanceKm === 0 ? 'Exact Match' : `${venue.distanceKm.toFixed(1)} km`}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-semibold text-amber-400 flex items-center gap-1 border border-slate-700/60">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {venue.averageRating || '4.8'}
                    </div>

                    {/* City Tag on Bottom of Image */}
                    <div className="absolute bottom-3 left-3 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {venue.city} • PIN {venue.pincode}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {venue.description}
                      </p>
                    </div>

                    <div className="pt-3.5 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                        <span className="text-base font-bold text-white">
                          ₹400 <span className="text-xs text-slate-400 font-normal">/ hour</span>
                        </span>
                      </div>

                      <Link
                        to={`/venues/${venue.id}`}
                        className="btn-primary py-2 px-4 text-xs font-semibold rounded-lg"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20 bg-[#080C14] border-b border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-display text-white">
              How Athletiq Works
            </h2>
            <p className="text-slate-400 text-sm">
              Discover, reserve, and play on verified turf courts in your neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-base flex items-center justify-center">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Search by PIN Code or City</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Enter your area PIN code or choose a city to instantly browse floodlit turfs, badminton courts, and cricket nets nearest to you.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 font-bold text-base flex items-center justify-center">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Pick Your Court & Slot</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Check real-time court availability, filter by morning or evening hours, and customize equipment needs like balls and bibs.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-base flex items-center justify-center">
                03
              </div>
              <h3 className="text-lg font-bold text-white">Instant Confirmation & Receipt</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Pay securely via Stripe with automated digital passes, matchday receipts, and a guaranteed hassle-free cancellation policy.
              </p>
            </div>

          </div>

        </div>
      </section>


      <Footer />
    </div>
  );
};
