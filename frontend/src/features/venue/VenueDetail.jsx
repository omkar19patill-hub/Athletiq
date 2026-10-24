import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService, courtService, slotService, favouriteService } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import { BookingRequirementForm } from '../../components/forms/BookingRequirementForm';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { 
  MapPin, Star, Heart, Calendar, Clock, CheckCircle2, 
  Layers, ArrowRight, ExternalLink 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TurfLocationMap } from './TurfLocationMap';

// Today's date in local ISO YYYY-MM-DD
const localDateString = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// True when a slot on date starting at startTime has already started
const hasStarted = (date, startTime) => new Date(`${date}T${startTime.slice(0, 5)}:00`) <= new Date();

export const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [venue, setVenue] = useState(null);
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState(localDateString);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Booking Modal state
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [showRequirementForm, setShowRequirementForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    venueService.getById(id)
      .then((res) => {
        if (res.success) {
          setVenue(res.data);
        }
      })
      .catch(() => {});

    courtService.getByVenue(id)
      .then((res) => {
        if (res.success && res.data.length > 0) {
          setCourts(res.data);
          setSelectedCourt(res.data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    if (user && user.role === 'CUSTOMER') {
      favouriteService.check(id)
        .then((res) => setIsFav(res.data))
        .catch(() => {});
    }
  }, [id, user]);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      setLoadingSlots(true);
      slotService.getByCourtAndDate(selectedCourt.id, selectedDate)
        .then((res) => {
          if (res.success) setSlots(res.data);
        })
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedCourt, selectedDate]);

  const handleToggleFav = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await favouriteService.toggle(id);
      setIsFav(res.data);
    } catch (err) {}
  };

  const handleSlotClick = (slot) => {
    if (slot.slotStatus !== 'AVAILABLE' || hasStarted(selectedDate, slot.startTime)) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedSlotForBooking(slot);
    setShowRequirementForm(true);
  };

  // Group slots into time periods
  const getSlotPhase = (startTime) => {
    const hour = parseInt(startTime.split(':')[0], 10);
    if (hour < 12) return 'Morning (6 AM - 12 PM)';
    if (hour < 17) return 'Afternoon (12 PM - 5 PM)';
    if (hour < 20) return 'Evening (5 PM - 8 PM)';
    return 'Night Floodlights (8 PM - Midnight)';
  };

  const phases = [
    'Morning (6 AM - 12 PM)',
    'Afternoon (12 PM - 5 PM)',
    'Evening (5 PM - 8 PM)',
    'Night Floodlights (8 PM - Midnight)'
  ];

  if (loading || !venue) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Venue Header & Photos */}
        <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Primary Photo View */}
            <div className="lg:col-span-8 relative h-[360px] sm:h-[440px] overflow-hidden bg-slate-950 group">
              <img
                src={venue.imageUrls?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1600'}
                alt={venue.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30"></div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-slate-700/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified Arena
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-medium bg-slate-900/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
                  {venue.status}
                </span>
              </div>
            </div>

            {/* Secondary Photo Stack */}
            <div className="hidden lg:grid lg:col-span-4 grid-rows-2 gap-2 p-2 bg-slate-900">
              <div className="relative h-full overflow-hidden rounded-xl bg-slate-950">
                <img
                  src={venue.imageUrls?.[1] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'}
                  alt="Secondary court perspective"
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                />
              </div>

              <div className="relative h-full overflow-hidden rounded-xl bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
                  alt="Dugout view"
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Venue Info Strip */}
          <div className="p-6 sm:p-8 bg-slate-900 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                {venue.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 pt-0.5">
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{venue.address}, {venue.city}, {venue.state} • PIN {venue.pincode}</span>
                </p>

                {venue.latitude && venue.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Get Directions</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5 text-amber-400 font-bold text-lg">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {venue.averageRating || '4.8'}
                </div>
                <span className="text-[11px] text-slate-400">
                  {venue.totalReviews || 12} Verified Reviews
                </span>
              </div>

              {user?.role === 'CUSTOMER' && (
                <button
                  onClick={handleToggleFav}
                  className={`p-3 rounded-xl border transition-all ${
                    isFav 
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="px-6 sm:px-8 pb-6 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
            {venue.description}
          </div>

        </div>

        {/* Court & Slot Booking Section */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                Court Schedules
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                Select Court & Reserve Slot
              </h2>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2.5 bg-slate-800/70 px-3.5 py-2 rounded-xl border border-slate-700/80">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Date:</span>
              <input
                type="date"
                value={selectedDate}
                min={localDateString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-slate-900 px-2.5 py-1 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Court Selector Tabs */}
          {courts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
              No courts currently registered for this venue.
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="flex flex-wrap gap-2.5">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-2 ${
                      selectedCourt?.id === court.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{court.courtName}</span>
                    <span className="opacity-80">({court.sportType})</span>
                    <span className="ml-1 font-bold">₹{court.pricePerHour}/hr</span>
                  </button>
                ))}
              </div>

              {/* Slot Grid by Time Period */}
              <div className="space-y-6 pt-2">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 rounded-xl bg-slate-800/50 animate-pulse"></div>
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400 text-xs">
                    No time slots configured for {selectedCourt?.courtName} on {selectedDate}. Please select another date.
                  </div>
                ) : (
                  phases.map((phaseTitle) => {
                    const phaseSlots = slots.filter((s) => getSlotPhase(s.startTime) === phaseTitle);
                    if (phaseSlots.length === 0) return null;

                    return (
                      <div key={phaseTitle} className="space-y-3">
                        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> {phaseTitle}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {phaseSlots.filter(s => s.slotStatus === 'AVAILABLE' && !hasStarted(selectedDate, s.startTime)).length} available
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                          {phaseSlots.map((slot) => {
                            const isPast = hasStarted(selectedDate, slot.startTime);
                            const isAvailable = slot.slotStatus === 'AVAILABLE' && !isPast;

                            return (
                              <button
                                key={slot.id}
                                disabled={!isAvailable}
                                onClick={() => handleSlotClick(slot)}
                                className={`p-3 rounded-xl border text-center transition-all duration-150 flex flex-col items-center justify-center ${
                                  isAvailable
                                    ? 'bg-slate-800/60 border-emerald-500/30 hover:border-emerald-500 text-white hover:bg-emerald-500 hover:text-slate-950 cursor-pointer shadow-sm'
                                    : 'bg-slate-950/60 border-slate-800/60 text-slate-600 cursor-not-allowed line-through'
                                }`}
                              >
                                <Clock className="w-3.5 h-3.5 mb-1 opacity-70" />
                                <span className="text-xs font-semibold">
                                  {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                </span>
                                <span className="text-[10px] font-medium mt-0.5">
                                  {isPast ? 'Past' : slot.slotStatus === 'AVAILABLE' ? 'Open' : 'Booked'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}

              </div>

            </div>
          )}

        </div>

        {/* Venue Location & Radar Map */}
        {venue.latitude && venue.longitude && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider block mb-1">
                  Geographic Location
                </span>
                <h3 className="text-lg sm:text-xl font-bold font-display text-white">
                  Arena Turf Coordinates & Directions
                </h3>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-2 px-4 text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                <span>Open in Google Maps Navigation</span>
              </a>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800">
              <TurfLocationMap
                venues={[venue]}
                centerCoords={{ lat: venue.latitude, lng: venue.longitude }}
                pincodeInfo={{
                  pincode: venue.pincode,
                  area: venue.address,
                  city: venue.city
                }}
                selectedVenueId={venue.id}
                height="380px"
              />
            </div>
          </div>
        )}

      </div>

      {/* Booking Requirement Form Modal */}
      {showRequirementForm && selectedSlotForBooking && selectedCourt && (
        <BookingRequirementForm
          slot={selectedSlotForBooking}
          court={selectedCourt}
          venue={venue}
          onClose={() => setShowRequirementForm(false)}
        />
      )}

      <Footer />
    </div>
  );
};
