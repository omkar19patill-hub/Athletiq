import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService, courtService, slotService, favouriteService } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import { BookingRequirementForm } from '../../components/forms/BookingRequirementForm';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { 
  MapPin, Star, Heart, Calendar, Clock, CheckCircle2, 
  Layers, ArrowRight, ExternalLink, Building2
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
        <div className="glass-panel relative overflow-hidden">

          {/* Photos: only the venue's own images are shown */}
          {(() => {
            const photos = (venue.imageUrls || []).filter(Boolean);
            if (photos.length === 0) {
              return (
                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/10 sm:h-64" aria-hidden="true">
                  <Building2 className="h-12 w-12 text-slate-600" />
                </div>
              );
            }
            return (
              <div className={`grid grid-cols-1 gap-1.5 ${photos.length > 1 ? 'lg:grid-cols-12' : ''}`}>
                <div className={`group relative h-[300px] overflow-hidden bg-[#0B0F17] sm:h-[420px] ${photos.length > 1 ? 'lg:col-span-8' : ''}`}>
                  <img src={photos[0]} alt={venue.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/80 via-transparent to-transparent" aria-hidden="true" />
                </div>
                {photos.length > 1 && (
                  <div className="hidden gap-1.5 lg:col-span-4 lg:grid" style={{ gridTemplateRows: `repeat(${Math.min(photos.length - 1, 2)}, minmax(0, 1fr))` }}>
                    {photos.slice(1, 3).map((src, i) => (
                      <div key={src} className="relative overflow-hidden bg-[#0B0F17]">
                        <img src={src} alt={`${venue.name} photo ${i + 2}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Venue Info */}
          <div className="flex flex-col items-start justify-between gap-6 border-t border-white/[0.07] p-6 sm:p-8 md:flex-row md:items-center">
            <div className="space-y-2">
              {venue.status && (
                <span className="sticker-badge sticker-volt">{venue.status}</span>
              )}
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {venue.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{venue.address}, {venue.city}, {venue.state} · PIN {venue.pincode}</span>
                </p>

                {venue.latitude && venue.longitude && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs font-semibold text-sky-300 transition-colors hover:bg-sky-400/20"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Get directions
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {venue.averageRating != null && Number(venue.totalReviews) > 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1.5 text-lg font-bold text-amber-300">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> {Number(venue.averageRating).toFixed(1)}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {venue.totalReviews} {Number(venue.totalReviews) === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">No reviews yet</span>
              )}

              {user?.role === 'CUSTOMER' && (
                <button
                  onClick={handleToggleFav}
                  aria-pressed={isFav}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  className={`rounded-xl border p-3 transition-all ${
                    isFav
                      ? 'border-rose-400/40 bg-rose-500/10 text-rose-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-400' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <div className="border-t border-white/[0.07] px-6 pb-6 pt-4 text-sm leading-relaxed text-slate-300 sm:px-8">
              {venue.description}
            </div>
          )}
        </div>

        {/* Court & Slot Booking Section */}
        <div className="glass-panel space-y-6 p-6 sm:p-8">

          <div className="flex flex-col items-start justify-between gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-end">
            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                Court schedule
              </span>
              <h2 className="font-display text-2xl font-bold text-white">
                Select a court and slot
              </h2>
            </div>

            {/* Date Picker */}
            <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2">
              <Calendar className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-xs font-medium text-slate-300">Date</span>
              <input
                type="date"
                value={selectedDate}
                min={localDateString()}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="neo-input cursor-pointer px-2.5 py-1 text-xs font-medium"
              />
            </label>
          </div>

          {/* Court Selector Tabs */}
          {courts.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-slate-400">
              No courts are registered for this venue yet.
            </div>
          ) : (
            <div className="space-y-6">

              <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Courts">
                {courts.map((court) => {
                  const active = selectedCourt?.id === court.id;
                  return (
                    <button
                      key={court.id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedCourt(court)}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                        active
                          ? 'border-emerald-400/50 bg-emerald-500/15 text-white shadow-volt'
                          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <Layers className={`h-3.5 w-3.5 ${active ? 'text-emerald-300' : 'text-slate-500'}`} />
                      <span>{court.courtName}</span>
                      <span className="text-slate-400">· {court.sportType}</span>
                      <span className={`ml-1 rounded-md px-1.5 py-0.5 ${active ? 'bg-[#00FF87] text-[#04140B]' : 'bg-white/[0.06] text-slate-200'}`}>₹{court.pricePerHour}/hr</span>
                    </button>
                  );
                })}
              </div>

              {/* Slot Grid by Time Period */}
              <div className="space-y-6 pt-2">
                {loadingSlots ? (
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.04]"></div>
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-8 text-center text-sm text-slate-400">
                    No time slots for {selectedCourt?.courtName} on {selectedDate}. Try another date.
                  </div>
                ) : (
                  phases.map((phaseTitle) => {
                    const phaseSlots = slots.filter((s) => getSlotPhase(s.startTime) === phaseTitle);
                    if (phaseSlots.length === 0) return null;

                    return (
                      <div key={phaseTitle} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs font-semibold text-slate-200">
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true"></span> {phaseTitle}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
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
                                aria-label={`${slot.startTime.substring(0, 5)} to ${slot.endTime.substring(0, 5)}, ${isPast ? 'past' : slot.slotStatus === 'AVAILABLE' ? 'open' : 'booked'}`}
                                className={`group flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 ${
                                  isAvailable
                                    ? 'cursor-pointer border-emerald-400/30 bg-emerald-500/[0.06] text-white hover:-translate-y-0.5 hover:border-[#00FF87] hover:bg-[#00FF87] hover:text-[#04140B] hover:shadow-volt'
                                    : 'cursor-not-allowed border-white/[0.05] bg-black/30 text-slate-600'
                                }`}
                              >
                                <Clock className="mb-1 h-3.5 w-3.5 opacity-70" />
                                <span className="text-xs font-semibold">
                                  {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                </span>
                                <span className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wide ${isAvailable ? 'text-emerald-300 group-hover:text-[#04140B]' : ''}`}>
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
          <div className="glass-panel space-y-4 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                  Location
                </span>
                <h3 className="font-display text-xl font-bold text-white">
                  Map and directions
                </h3>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-4 py-2 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 text-sky-300" />
                Open in Google Maps
              </a>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/[0.07]">
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
