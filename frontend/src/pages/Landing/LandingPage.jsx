import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ArrowRight, Search, Star, MapPin, Activity,
  ChevronRight, Compass, CreditCard, CalendarCheck, Building2,
} from 'lucide-react';
import { venueService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { BrandLogo } from '../../components/BrandLogo';

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

  // Presentation only: neutral descriptions and an illustrative court layout per sport
  const sportsArenaConfig = [
    {
      name: 'Football Turfs',
      short: 'Turfs and pitches',
      tagline: 'Find football turfs for 5-a-side and 7-a-side games and book an open slot.',
      icon: '⚽',
      query: 'FOOTBALL',
      pitchGraphic: 'M10,20 L190,20 L190,120 L10,120 Z M100,20 L100,120 M100,70 A20,20 0 1,0 100,69.9 M10,45 L35,45 L35,95 L10,95 M190,45 L165,45 L165,95 L190,95',
      bgImg: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Box Cricket Nets',
      short: 'Nets and box grounds',
      tagline: 'Book enclosed box cricket grounds and practice nets for your squad.',
      icon: '🏏',
      query: 'CRICKET',
      pitchGraphic: 'M20,20 L180,20 L180,120 L20,120 Z M70,40 L130,40 L130,100 L70,100 Z M100,20 L100,120',
      bgImg: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Badminton Courts',
      short: 'Indoor courts',
      tagline: 'Reserve indoor badminton courts for singles or doubles.',
      icon: '🏸',
      query: 'BADMINTON',
      pitchGraphic: 'M30,20 L170,20 L170,120 L30,120 Z M100,20 L100,120 M50,20 L50,120 M150,20 L150,120 M30,70 L170,70',
      bgImg: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Basketball Courts',
      short: 'Full and half courts',
      tagline: 'Book full or half basketball courts for pickup games and practice.',
      icon: '🏀',
      query: 'BASKETBALL',
      pitchGraphic: 'M20,20 L180,20 L180,120 L20,120 Z M100,20 L100,120 M100,70 A25,25 0 1,0 100,69.9 M20,40 L50,40 L50,100 L20,100 M180,40 L150,40 L150,100 L180,100',
      bgImg: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1600&auto=format&fit=crop&q=80',
    },
  ];

  const activeSport = sportsArenaConfig[activeSportIndex];

  const steps = [
    { icon: Compass, color: 'text-emerald-300 bg-emerald-500/10', title: 'Search by PIN code or city', text: 'Enter your area PIN code or pick a city to browse turfs, courts and nets near you.' },
    { icon: CalendarCheck, color: 'text-sky-300 bg-sky-500/10', title: 'Pick your court and slot', text: 'Choose a court and an open time slot, then add any equipment or setup you need.' },
    { icon: CreditCard, color: 'text-amber-300 bg-amber-500/10', title: 'Pay and get your receipt', text: 'Pay securely with Stripe and keep a booking receipt you can download as a PDF.' },
  ];

  const fieldBox = 'rounded-xl border border-white/10 bg-[#0B0F17]/80 px-4 py-2.5 transition-colors focus-within:border-emerald-400/60 focus-within:ring-2 focus-within:ring-emerald-400/15';
  const fieldLabel = 'mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400';

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 flex flex-col font-sans">
      <Navbar />

      {/* 1. HERO */}
      <section className="relative overflow-hidden border-b border-white/[0.06] pt-16 pb-24 lg:pt-24 lg:pb-28 stadium-hero-bg">
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-full max-w-4xl -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="sticker-badge sticker-volt"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00FF87]" aria-hidden="true" />
              Play More. Plan Less.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl"
            >
              Book sports turfs
              <span className="block bg-gradient-to-r from-[#00FF87] to-emerald-300 bg-clip-text text-transparent">
                under the floodlights
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              Reserve football turfs, cricket nets and indoor courts. Search by PIN code or city and pay securely with Stripe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            >
              <Link to="/venues" className="btn-primary px-6 py-3.5 text-[15px]">
                Find venues near you
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/admin/login" className="btn-secondary px-6 py-3.5 text-[15px]">
                <Shield className="w-4 h-4 text-[#00FF87]" />
                Venue partner login
              </Link>
            </motion.div>
          </div>

          {/* Search console */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mx-auto mt-12 max-w-4xl"
          >
            <form onSubmit={handleHudSearch} className="glass-panel grid grid-cols-1 items-stretch gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-12" aria-label="Search venues">
              <div className={`lg:col-span-3 ${fieldBox}`}>
                <label htmlFor="hud-city" className={fieldLabel}>
                  <MapPin className="w-3.5 h-3.5 text-[#00FF87]" /> City
                </label>
                <select
                  id="hud-city"
                  value={hudCity}
                  onChange={(e) => setHudCity(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-semibold text-white focus:outline-none"
                >
                  <option value="">All cities</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Gurugram">Gurugram</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div className={`lg:col-span-3 ${fieldBox}`}>
                <div className="flex items-center justify-between">
                  <label htmlFor="hud-pin" className={fieldLabel}>
                    <Compass className="w-3.5 h-3.5 text-[#00E5FF]" /> Area PIN code
                  </label>
                  {resolvingHudPin && <span className="h-2 w-2 animate-ping rounded-full bg-[#00FF87]" aria-hidden="true" />}
                </div>
                <input
                  id="hud-pin"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={hudPincode}
                  onChange={(e) => setHudPincode(e.target.value)}
                  placeholder="e.g. 560034"
                  className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none"
                />
                {hudPinInfo && (
                  <div className="mt-1 flex items-center gap-1 truncate text-[11px] font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00FF87]" />
                    <span>{hudPinInfo.area}, {hudPinInfo.city}</span>
                  </div>
                )}
              </div>

              <div className={`lg:col-span-3 ${fieldBox}`}>
                <label htmlFor="hud-sport" className={fieldLabel}>
                  <Activity className="w-3.5 h-3.5 text-amber-300" /> Sport
                </label>
                <select
                  id="hud-sport"
                  value={hudSport}
                  onChange={(e) => setHudSport(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-semibold text-white focus:outline-none"
                >
                  <option value="ALL">All sports</option>
                  <option value="FOOTBALL">⚽ Football</option>
                  <option value="CRICKET">🏏 Cricket</option>
                  <option value="BADMINTON">🏸 Badminton</option>
                  <option value="BASKETBALL">🏀 Basketball</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <button type="submit" className="btn-primary h-full min-h-[52px] w-full">
                  <Search className="w-4 h-4" />
                  Search arenas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* 2. SPORTS */}
      <section className="border-b border-white/[0.06] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Turfs & courts</span>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Choose your sport</h2>
            </div>
            <p className="max-w-sm text-sm text-slate-400">Pick a sport to see what you can book and browse matching venues.</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4" role="tablist" aria-label="Sports">
            {sportsArenaConfig.map((sport, idx) => {
              const active = activeSportIndex === idx;
              return (
                <button
                  key={sport.name}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSportIndex(idx)}
                  className={`relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ${
                    active
                      ? 'border-emerald-400/40 bg-emerald-500/[0.08] shadow-volt'
                      : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{sport.icon}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{sport.name}</span>
                    <span className="block truncate text-xs text-slate-400">{sport.short}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-panel relative flex min-h-[320px] flex-col items-center overflow-hidden lg:flex-row" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeSport.name}
                src={activeSport.bgImg}
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17]/85 to-transparent" aria-hidden="true" />

            <div className="relative z-10 max-w-xl space-y-4 p-8 lg:p-12">
              <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{activeSport.name}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{activeSport.tagline}</p>
              <Link to={`/venues?sport=${activeSport.query}`} className="btn-primary">
                Explore {activeSport.name.toLowerCase()}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative z-10 flex w-full flex-1 items-center justify-center p-8">
              <div className="relative flex aspect-[16/10] w-full max-w-md items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F17]/70 p-5 backdrop-blur-md">
                <svg viewBox="0 0 200 140" className="h-full w-full fill-none stroke-emerald-400/90 stroke-[1.6]" aria-hidden="true">
                  <path d={activeSport.pitchGraphic} />
                </svg>
                <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-500">Illustrative layout</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. VENUES */}
      <section className="border-b border-white/[0.06] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Venues</span>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                {hudPincode && hudPinInfo ? <>Venues near {hudPinInfo.area}</> : 'Popular venues'}
              </h2>
            </div>
            <Link to="/venues" className="btn-secondary">
              View all venues
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingVenues ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          ) : featuredVenues.length === 0 ? (
            <div className="glass-panel flex flex-col items-center px-6 py-12 text-center">
              <Building2 className="mb-3 h-8 w-8 text-slate-600" />
              <p className="font-semibold text-white">No venues to show yet</p>
              <p className="mt-1 text-sm text-slate-400">Try another city or PIN code, or browse every venue.</p>
              <Link to="/venues" className="btn-secondary mt-5">Browse all venues</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVenues.map((venue) => (
                <article key={venue.id} className="neo-card group flex flex-col overflow-hidden">
                  <div className="relative h-48 overflow-hidden bg-[#0B0F17]">
                    {venue.imageUrls?.[0] ? (
                      <img
                        src={venue.imageUrls[0]}
                        alt={venue.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-sky-500/5" aria-hidden="true">
                        <Building2 className="h-10 w-10 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/90 via-transparent to-transparent" aria-hidden="true" />

                    {venue.distanceKm !== undefined && venue.distanceKm !== null && (
                      <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-[#0B0F17]/80 px-2.5 py-1 text-[11px] font-medium text-sky-300 backdrop-blur-md">
                        {venue.distanceKm === 0 ? 'Exact match' : `${venue.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                    {venue.averageRating != null && Number(venue.totalReviews) > 0 && (
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-[#0B0F17]/80 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {Number(venue.averageRating).toFixed(1)}
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-slate-200">
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" /> {venue.city}{venue.pincode ? ` · ${venue.pincode}` : ''}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                    <div>
                      <h3 className="line-clamp-1 text-lg font-semibold text-white transition-colors group-hover:text-emerald-300">{venue.name}</h3>
                      {venue.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{venue.description}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/[0.07] pt-4">
                      <span className="text-xs text-slate-400">
                        {venue.totalCourts != null ? (
                          <><span className="text-base font-semibold text-white">{venue.totalCourts}</span> {venue.totalCourts === 1 ? 'court' : 'courts'}</>
                        ) : null}
                      </span>
                      <Link to={`/venues/${venue.id}`} className="btn-primary px-4 py-2 text-xs">
                        Book slot
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">How it works</span>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Book in three steps</h2>
          </div>

          <ol className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="neo-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-sm font-semibold text-slate-600">0{i + 1}</span>
                </div>
                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 flex justify-center">
            <BrandLogo className="w-36 rounded-2xl opacity-90 ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
