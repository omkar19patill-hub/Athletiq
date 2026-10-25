import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { venueService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { 
  Search, MapPin, Star, ChevronLeft, ChevronRight, 
  Navigation, Compass, SlidersHorizontal, ArrowRight, Building2,
  LayoutGrid, Map, Columns, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TurfLocationMap } from './TurfLocationMap';

export const VenueList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // Filters state
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  // Geolocation, Pincode & Map state
  const [pincodeInfo, setPincodeInfo] = useState(null);
  const [resolvingPin, setResolvingPin] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'map'
  const [selectedVenueId, setSelectedVenueId] = useState(null);
  const [userCoords, setUserCoords] = useState(null);

  const centerCoords = pincodeInfo?.latitude && pincodeInfo?.longitude
    ? { lat: pincodeInfo.latitude, lng: pincodeInfo.longitude }
    : userCoords;

  // Sync state when URL params change
  useEffect(() => {
    const urlCity = searchParams.get('city');
    const urlPincode = searchParams.get('pincode');
    const urlSport = searchParams.get('sport');
    const urlKeyword = searchParams.get('keyword');

    if (urlCity !== null && urlCity !== city) setCity(urlCity);
    if (urlPincode !== null && urlPincode !== pincode) setPincode(urlPincode);
    if (urlSport !== null && urlSport !== sport) setSport(urlSport);
    if (urlKeyword !== null && urlKeyword !== keyword) setKeyword(urlKeyword);
  }, [searchParams]);

  useEffect(() => {
    venueService.getCities()
      .then((res) => {
        if (res.success) setCities(res.data);
      })
      .catch(() => {});
  }, []);

  // Real-time PIN code geographic lookup
  useEffect(() => {
    if (pincode && pincode.trim().length >= 3) {
      setResolvingPin(true);
      venueService.lookupPincode(pincode.trim())
        .then((res) => {
          if (res.success && res.data) {
            setPincodeInfo(res.data);
          } else {
            setPincodeInfo(null);
          }
        })
        .catch(() => setPincodeInfo(null))
        .finally(() => setResolvingPin(false));
    } else {
      setPincodeInfo(null);
    }
  }, [pincode]);

  const fetchVenues = () => {
    setLoading(true);
    setNearbyActive(false);
    setLocationError('');
    const params = {
      city: city || undefined,
      pincode: pincode ? pincode.trim() : undefined,
      sport: sport || undefined,
      keyword: keyword || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      page,
      size: 12,
      sortBy,
      sortDir,
    };

    venueService.search(params)
      .then((res) => {
        if (res.success) {
          setVenues(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        venueService.getNearby({ lat: latitude, lng: longitude, radiusKm: 35 })
          .then((res) => {
            if (res.success) {
              setVenues(res.data);
              setNearbyActive(true);
              setTotalPages(1);
            }
          })
          .catch(() => {
            setLocationError('Unable to fetch nearby arenas.');
          })
          .finally(() => setLocating(false));
      },
      (err) => {
        setLocating(false);
        setLocationError('Location access was denied. You can search by PIN code instead.');
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!nearbyActive) {
      fetchVenues();
    }
  }, [city, pincode, sport, minPrice, maxPrice, minRating, sortBy, sortDir, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchVenues();
  };

  const sportPills = [
    { label: 'All Sports', value: '' },
    { label: '⚽ Football', value: 'FOOTBALL' },
    { label: '🏏 Cricket', value: 'CRICKET' },
    { label: '🏸 Badminton', value: 'BADMINTON' },
    { label: '🏀 Basketball', value: 'BASKETBALL' },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Header Title & Mode */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Venues</span>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Explore sports venues
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Find and book turfs, badminton courts and cricket nets.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleGetLocation}
              disabled={locating}
              aria-pressed={nearbyActive}
              className={`${nearbyActive ? 'btn-primary' : 'btn-secondary'} px-3.5 py-2 text-xs`}
            >
              <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : nearbyActive ? 'fill-[#04140B]' : 'text-emerald-400'}`} />
              <span>{locating ? 'Locating…' : nearbyActive ? 'Near me (on)' : 'Near me'}</span>
            </button>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              aria-expanded={showAdvancedFilters}
              className="btn-secondary px-3 py-2 text-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline font-medium">Filters</span>
            </button>
          </div>
        </div>

        {locationError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {locationError}
          </div>
        )}

        {/* Neo-Brutalist Search Bar */}
        <div className="glass-panel space-y-3 p-3 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            
            {/* Keyword Search */}
            <div className="lg:col-span-5 relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                aria-label="Search venues"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search arena, club or locality…"
                className="neo-input w-full py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            {/* City Filter */}
            <div className="lg:col-span-3">
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(0); }}
                aria-label="City"
                className="neo-input w-full cursor-pointer px-3.5 py-2.5 text-sm font-medium"
              >
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* PIN Code Filter */}
            <div className="lg:col-span-2 relative">
              <Compass className="pointer-events-none absolute left-3.5 top-1/2 w-4 h-4 -translate-y-1/2 text-[#00FF87]" />
              <input
                type="text"
                inputMode="numeric"
                aria-label="PIN code"
                maxLength={6}
                value={pincode}
                onChange={(e) => { setPincode(e.target.value); setPage(0); }}
                placeholder="PIN code"
                className="neo-input w-full py-2.5 pl-10 pr-3 text-sm font-medium"
              />
            </div>

            {/* Submit Filter Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="btn-primary w-full py-2.5"
              >
                Search
              </button>
            </div>

          </form>

          {/* Quick Sport Pills */}
          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.07] pt-3" role="group" aria-label="Sport">
            <span className="mr-1 text-xs font-medium text-slate-400">Sport</span>
            {sportPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => { setSport(pill.value); setPage(0); }}
                aria-pressed={sport === pill.value}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  sport === pill.value
                    ? 'border-[#00FF87]/60 bg-[#00FF87] text-[#04140B]'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Advanced Drawer Filters */}
          <AnimatePresence>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 gap-3 overflow-hidden border-t border-white/[0.07] pt-3 sm:grid-cols-3"
              >
                <div>
                  <label htmlFor="flt-price" className="mb-1.5 block text-xs font-medium text-slate-400">Max price / hr (₹)</label>
                  <input
                    id="flt-price"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 1500"
                    className="neo-input w-full px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="flt-rating" className="mb-1.5 block text-xs font-medium text-slate-400">Minimum rating</label>
                  <select
                    id="flt-rating"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="neo-input w-full px-3 py-2 text-sm"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.0">4.0 ★ & above</option>
                    <option value="4.5">4.5 ★ & above</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="flt-sort" className="mb-1.5 block text-xs font-medium text-slate-400">Sort order</label>
                  <select
                    id="flt-sort"
                    value={`${sortBy}_${sortDir}`}
                    onChange={(e) => {
                      const [by, dir] = e.target.value.split('_');
                      setSortBy(by);
                      setSortDir(dir);
                    }}
                    className="neo-input w-full px-3 py-2 text-sm"
                  >
                    <option value="createdAt_desc">Latest Added</option>
                    <option value="name_asc">Venue Name (A-Z)</option>
                    <option value="city_asc">City Order</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Results Header */}
        <div className="space-y-2">
          {pincode && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3.5 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>
                  Showing venues near: <strong className="text-white">{pincodeInfo ? `${pincodeInfo.area}, ${pincodeInfo.city} (PIN ${pincode})` : `PIN ${pincode}`}</strong>
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Sorted by distance from PIN {pincode}
              </span>
            </div>
          )}

          <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span>Showing <strong className="text-white font-semibold">{venues.length}</strong> venues</span>
              {nearbyActive && (
                <span className="text-emerald-400 flex items-center gap-1 font-medium">
                  <Navigation className="w-3 h-3 fill-emerald-400" /> Sorted by GPS Distance
                </span>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1" role="group" aria-label="View mode">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'split'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Map View"
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split Radar</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all ${
                  viewMode === 'map'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Interactive Map Only"
              >
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Map View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Venues Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"></div>
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="glass-panel mx-auto flex max-w-xl flex-col items-center px-6 py-10 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <Search className="h-5 w-5 text-slate-400" />
            </span>
            <h3 className="font-display text-lg font-semibold text-white">No venues match your search</h3>
            <p className="mt-1 max-w-sm text-sm text-slate-400">
              Try other filters, clear the PIN code, or widen your search.
            </p>
            <button
              onClick={() => {
                setCity('');
                setPincode('');
                setSport('');
                setKeyword('');
                setMinPrice('');
                setMaxPrice('');
                setMinRating('');
                setNearbyActive(false);
              }}
              className="btn-secondary mt-5 px-4 py-2 text-xs"
            >
              Reset filters
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* Full Screen Map View */
          <div className="space-y-4">
            <TurfLocationMap
              venues={venues}
              centerCoords={centerCoords}
              pincodeInfo={pincodeInfo}
              selectedVenueId={selectedVenueId}
              onSelectVenue={(v) => setSelectedVenueId(v.id)}
              height="650px"
            />
          </div>
        ) : viewMode === 'split' ? (
          /* High-Tech Split Radar View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Neo-Brutalist Venue Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenueId(venue.id)}
                  className={`neo-card group flex cursor-pointer flex-col overflow-hidden ${
                    selectedVenueId === venue.id ? '!border-emerald-400/50 shadow-volt' : 'glass-card-hover'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative h-44 overflow-hidden bg-slate-950 border-b border-white/10">
                    {venue.imageUrls?.[0] ? (
                      <img src={venue.imageUrls[0]} alt={venue.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-sky-500/5" aria-hidden="true">
                        <Building2 className="h-9 w-9 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                    {/* Top Sticker Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                      {venue.distanceKm !== undefined && venue.distanceKm !== null && (
                        <span className="sticker-badge sticker-cyan">
                          {venue.distanceKm < 1 ? '< 1 km' : `${venue.distanceKm.toFixed(1)} km`}
                        </span>
                      )}
                    </div>

                    {venue.averageRating != null && Number(venue.totalReviews) > 0 && (
                    <div className="absolute top-2.5 right-2.5 sticker-badge sticker-yellow">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                      {Number(venue.averageRating).toFixed(1)}
                    </div>
                  )}

                    <div className="absolute bottom-2.5 left-2.5 sticker-badge sticker-dark">
                      <MapPin className="w-3 h-3 text-[#00FF87]" /> {venue.city} • PIN {venue.pincode}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {venue.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {venue.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-400">
                        {venue.totalCourts != null && (
                          <><span className="text-sm font-semibold text-white">{venue.totalCourts}</span> {venue.totalCourts === 1 ? 'court' : 'courts'}</>
                        )}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Get Directions on Google Maps"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 shrink-0 rounded-lg border border-white/10 bg-white/[0.04] text-cyan-300 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/10"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <Link
                          to={`/venues/${venue.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="btn-primary py-1.5 px-3.5 text-xs"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Sticky Interactive Turf Location Map */}
            <div className="lg:col-span-5 sticky top-20">
              <TurfLocationMap
                venues={venues}
                centerCoords={centerCoords}
                pincodeInfo={pincodeInfo}
                selectedVenueId={selectedVenueId}
                onSelectVenue={(v) => setSelectedVenueId(v.id)}
                height="620px"
              />
            </div>
          </div>
        ) : (
          /* Classic 3-Column Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div
                key={venue.id}
                className="neo-card glass-card-hover group flex flex-col overflow-hidden"
              >
                {/* Image Container */}
                <div className="relative h-52 overflow-hidden bg-slate-950 border-b border-white/10">
                  {venue.imageUrls?.[0] ? (
                      <img src={venue.imageUrls[0]} alt={venue.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-500/10 to-sky-500/5" aria-hidden="true">
                        <Building2 className="h-9 w-9 text-slate-600" />
                      </div>
                    )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {venue.distanceKm !== undefined && venue.distanceKm !== null && (
                      <span className="sticker-badge sticker-cyan">
                        {venue.distanceKm < 1 ? '< 1 km' : `${venue.distanceKm.toFixed(1)} km`}
                      </span>
                    )}
                  </div>

                  {venue.averageRating != null && Number(venue.totalReviews) > 0 && (
                    <div className="absolute top-3 right-3 sticker-badge sticker-yellow">
                      <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                      {Number(venue.averageRating).toFixed(1)}
                    </div>
                  )}

                  {/* City & PIN badge on bottom of picture */}
                  <div className="absolute bottom-3 left-3 sticker-badge sticker-dark">
                    <MapPin className="w-3.5 h-3.5 text-[#00FF87]" /> {venue.city} • PIN {venue.pincode}
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {venue.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {venue.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                        {venue.totalCourts != null && (
                          <><span className="text-sm font-semibold text-white">{venue.totalCourts}</span> {venue.totalCourts === 1 ? 'court' : 'courts'}</>
                        )}
                      </span>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Get Directions in Google Maps"
                        className="p-2.5 shrink-0 rounded-lg border border-white/10 bg-white/[0.04] text-cyan-300 transition-colors hover:border-cyan-300/50 hover:bg-cyan-400/10"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <Link
                        to={`/venues/${venue.id}`}
                        className="btn-primary py-2 px-4 text-xs"
                      >
                        <span>Book Slot</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-6">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="btn-secondary p-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-400 px-3">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="btn-secondary p-2"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};
