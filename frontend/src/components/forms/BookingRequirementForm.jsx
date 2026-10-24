import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/apiServices';
import { StripePaymentModal } from '../../features/booking/StripePaymentModal';
import { X, CheckCircle2, AlertCircle, ClipboardList, Shield } from 'lucide-react';

export const BookingRequirementForm = ({ slot, court, venue, onClose }) => {
  const navigate = useNavigate();

  const [occasion, setOccasion] = useState('PRACTICE');
  const [playersCount, setPlayersCount] = useState(10);
  const [equipmentRequired, setEquipmentRequired] = useState([]);
  const [preparationRequired, setPreparationRequired] = useState(['Clean Court']);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const equipmentOptions = [
    'Football', 'Badminton Rackets', 'Cricket Kit', 'Shuttlecock',
    'Cones', 'Bibs', 'Goal Posts', 'Other'
  ];

  const prepOptions = [
    'Clean Court', 'Water Turf', 'Flood Lights', 'Goal Posts',
    'Net Setup', 'Scoreboard'
  ];

  const handleEquipmentToggle = (item) => {
    setEquipmentRequired((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handlePrepToggle = (item) => {
    setPreparationRequired((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // 1. Create Booking (holds slot and initiates Stripe PaymentIntent)
      const bookingRes = await bookingService.create({ slotId: slot.id });
      
      if (bookingRes.success) {
        const booking = bookingRes.data;

        // 2. Submit Requirement Form
        await bookingService.saveRequirement({
          bookingId: booking.id,
          occasion,
          playersCount: parseInt(playersCount, 10),
          equipmentRequired,
          preparationRequired,
          additionalNotes,
        });

        // 3. Open Stripe Payment Checkout Modal
        setCreatedBooking(booking);
        setShowPaymentModal(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to reserve slot. It may have already been booked.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-800 overflow-hidden my-6 text-white">
        
        {/* Modal Header */}
        <div className="bg-slate-950/80 p-5 border-b border-slate-800 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <ClipboardList className="w-4 h-4" /> Match Details & Preferences
            </div>
            <h2 className="text-lg font-bold font-display text-white">{venue.name} — {court.courtName}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {slot.bookingDate} • {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)} • ₹{court.pricePerHour}/hr
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto custom-scrollbar">
          
          {/* Occasion Radio */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Occasion Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['PRACTICE', 'FRIENDLY_MATCH', 'TOURNAMENT', 'CORPORATE_EVENT', 'BIRTHDAY', 'OTHER'].map((occ) => (
                <button
                  type="button"
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-center ${
                    occasion === occ
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-semibold shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {occ.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Players Count */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Estimated Number of Players
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={playersCount}
              onChange={(e) => setPlayersCount(e.target.value)}
              className="w-36 px-3.5 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Equipment Checkboxes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Equipment Support (Optional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {equipmentOptions.map((item) => {
                const checked = equipmentRequired.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleEquipmentToggle(item)}
                    className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      checked 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-800'
                    }`}>
                      {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preparation Checkboxes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Court Preparation Requirements
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {prepOptions.map((item) => {
                const checked = preparationRequired.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handlePrepToggle(item)}
                    className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      checked 
                        ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                      checked ? 'bg-sky-500 border-sky-500 text-slate-950' : 'border-slate-600 bg-slate-800'
                    }`}>
                      {checked && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Additional Instructions (Optional)
            </label>
            <textarea
              rows="2"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Requesting extra water, referee whistle, or changing room access..."
              className="w-full px-3.5 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Court Booking Fee</span>
              <span className="text-xl font-bold font-display text-white">₹{court.pricePerHour}</span>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-2 px-4 text-xs font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary py-2 px-5 text-xs font-semibold rounded-lg disabled:opacity-50"
              >
                <span>{submitting ? 'Holding Slot...' : 'Continue to Payment'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>

      {showPaymentModal && createdBooking && (
        <StripePaymentModal
          booking={createdBooking}
          court={court}
          venue={venue}
          slot={slot}
          onClose={() => {
            setShowPaymentModal(false);
            onClose();
          }}
        />
      )}
    </div>
  );
};
