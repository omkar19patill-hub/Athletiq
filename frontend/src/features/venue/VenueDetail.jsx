import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { venueService, courtService, slotService, favouriteService } from '../../services/apiServices';
import { useAuth } from '../../context/AuthContext';
import { BookingRequirementForm } from '../../components/forms/BookingRequirementForm';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { MapPin, Star, Heart, Calendar, Clock, CheckCircle2, AlertCircle, Shield, Award } from 'lucide-react';

// Today's date in the user's local timezone (toISOString() is UTC and shows yesterday early in the morning in IST)
const localDateString = (d = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// True when a slot on `date` (YYYY-MM-DD) starting at `startTime` (HH:mm[:ss]) has already started, in local time.
// The backend enforces the same rule; this only greys the slot out.
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

  if (loading || !venue) {
    return (
      <div className="min-h-screen bg-surface-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Venue Header & Images */}
        <div className="bg-white rounded-card p-6 shadow-soft border border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900">{venue.name}</h1>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full uppercase tracking-wider">
                  {venue.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary-600" /> {venue.address}, {venue.city}, {venue.state} - {venue.pincode}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500 font-extrabold text-lg">
                  <Star className="w-5 h-5 fill-amber-500" /> {venue.averageRating || '4.5'}
                </div>
                <span className="text-xs text-slate-400">Based on {venue.totalReviews || 0} reviews</span>
              </div>

              {user?.role === 'CUSTOMER' && (
                <button
                  onClick={handleToggleFav}
                  className={`p-3 rounded-2xl border transition-all ${
                    isFav ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-600' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-80 rounded-2xl overflow-hidden">
            <div className="md:col-span-2 h-full bg-slate-100 overflow-hidden">
              <img
                src={venue.imageUrls?.[0] || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=1200'}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4 h-full">
              <img
                src={venue.imageUrls?.[1] || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800'}
                alt="Venue secondary"
                className="w-full h-full object-cover rounded-2xl bg-slate-100"
              />
              <img
                src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800"
                alt="Venue tertiary"
                className="w-full h-full object-cover rounded-2xl bg-slate-100"
              />
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{venue.description}</p>
        </div>

        {/* Court & Slot Booking Section */}
        <div className="bg-white rounded-card p-8 shadow-soft border border-slate-100 space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Select Court & Book Slot</h2>
            <p className="text-xs text-slate-500 mt-1">Pick a court, choose your preferred time slot, and fill court preparation requirements</p>
          </div>

          {/* Court Tabs */}
          {courts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No courts listed for this venue yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {courts.map((court) => (
                  <button
                    key={court.id}
                    onClick={() => setSelectedCourt(court)}
                    className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                      selectedCourt?.id === court.id
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{court.courtName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCourt?.id === court.id ? 'bg-primary-700 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      ₹{court.pricePerHour}/hr
                    </span>
                  </button>
                ))}
              </div>

              {/* Date Selector */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <Calendar className="w-5 h-5 text-primary-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Booking Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  min={localDateString()}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* Slot Availability Grid */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center justify-between">
                  <span>Available Time Slots for {selectedDate}</span>
                  <span className="text-xs font-normal text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Available</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span> Booked</span>
                  </span>
                </h3>

                {loadingSlots ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="h-16 bg-slate-100 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl text-slate-500 text-xs font-semibold">
                    No time slots configured for this court on {selectedDate}. Please choose another date or court.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {slots.map((slot) => {
                      const isPast = hasStarted(selectedDate, slot.startTime);
                      const isAvailable = slot.slotStatus === 'AVAILABLE' && !isPast;
                      return (
                        <button
                          key={slot.id}
                          disabled={!isAvailable}
                          onClick={() => handleSlotClick(slot)}
                          className={`p-3 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
                            isAvailable
                              ? 'bg-emerald-50/50 border-emerald-300 text-emerald-800 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-md cursor-pointer'
                              : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 mb-1 opacity-70" />
                          <span className="text-xs font-extrabold">{slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}</span>
                          <span className="text-[10px] font-semibold mt-0.5">{isPast ? 'PAST' : slot.slotStatus}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
