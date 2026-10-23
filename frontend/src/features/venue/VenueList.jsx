import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { venueService } from '../../services/apiServices';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Search, MapPin, Star, Filter, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export const VenueList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  // Filters state
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(0);

  useEffect(() => {
    venueService.getCities()
      .then((res) => {
        if (res.success) setCities(res.data);
      })
      .catch(() => {});
  }, []);

  const fetchVenues = () => {
    setLoading(true);
    const params = {
      city: city || undefined,
      sport: sport || undefined,
      keyword: keyword || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      page,
      size: 9,
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

  useEffect(() => {
    fetchVenues();
  }, [city, sport, page, sortBy, sortDir]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchVenues();
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Explore Sports Venues</h1>
          <p className="text-sm text-slate-400 mt-1">Book top-rated sports turfs, badminton courts and grounds across India</p>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="mt-6 bg-white p-3 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 text-slate-800">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by venue name..."
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-48 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setPage(0); }}
                className="w-full bg-transparent text-sm focus:outline-none font-medium text-slate-700"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-48 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
              <select
                value={sport}
                onChange={(e) => { setSport(e.target.value); setPage(0); }}
                className="w-full bg-transparent text-sm focus:outline-none font-medium text-slate-700"
              >
                <option value="">All Sports</option>
                <option value="FOOTBALL">⚽ Football</option>
                <option value="CRICKET">🏏 Cricket</option>
                <option value="BADMINTON">🏸 Badminton</option>
                <option value="BASKETBALL">🏀 Basketball</option>
                <option value="TENNIS">🎾 Tennis</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary-500/20"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-600" /> Filters
                </h3>
                <button
                  onClick={() => {
                    setCity('');
                    setSport('');
                    setKeyword('');
                    setMinPrice('');
                    setMaxPrice('');
                    setMinRating('');
                    setPage(0);
                  }}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  Reset All
                </button>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Max Price per Hour</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Minimum Rating</label>
                <div className="space-y-2">
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={minRating === String(stars)}
                        onChange={() => setMinRating(String(stars))}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex items-center gap-1">
                        {stars}+ <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> & above
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setPage(0); fetchVenues(); }}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Venues Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-semibold text-slate-500">
                Showing <strong className="text-slate-900">{venues.length}</strong> venues
              </span>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 text-xs font-semibold">Sort by:</span>
                <select
                  value={`${sortBy}-${sortDir}`}
                  onChange={(e) => {
                    const [b, d] = e.target.value.split('-');
                    setSortBy(b);
                    setSortDir(d);
                  }}
                  className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-72 bg-white rounded-card animate-pulse"></div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="bg-white rounded-card p-12 text-center border border-slate-100">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No Venues Found</h3>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or removing filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {venues.map((venue) => (
                  <motion.div
                    key={venue.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-card overflow-hidden shadow-soft border border-slate-100 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={venue.imageUrls?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'}
                          alt={venue.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {venue.averageRating || '4.5'}
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="text-[11px] font-bold text-primary-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {venue.city}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {venue.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{venue.address}</p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Courts Available</span>
                        <span className="text-xs font-bold text-slate-700">{venue.totalCourts || 2} Courts</span>
                      </div>
                      <Link
                        to={`/venues/${venue.id}`}
                        className="px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-all shadow-sm"
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 px-4">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
