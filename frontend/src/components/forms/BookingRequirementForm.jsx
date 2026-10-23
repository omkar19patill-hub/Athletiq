import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/apiServices';
import { X, CheckCircle2, AlertCircle, Sparkles, ClipboardList } from 'lucide-react';

export const BookingRequirementForm = ({ slot, court, venue, onClose }) => {
  const navigate = useNavigate();

  const [occasion, setOccasion] = useState('PRACTICE');
  const [playersCount, setPlayersCount] = useState(10);
  const [equipmentRequired, setEquipmentRequired] = useState([]);
  const [preparationRequired, setPreparationRequired] = useState(['Clean Court']);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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
      // 1. Create Booking
      const bookingRes = await bookingService.create({ slotId: slot.id });
      
      if (bookingRes.success) {
        const bookingId = bookingRes.data.id;

        // 2. Submit Requirement Form
        await bookingService.saveRequirement({
          bookingId,
          occasion,
          playersCount: parseInt(playersCount, 10),
          equipmentRequired,
          preparationRequired,
          additionalNotes,
        });

        // 3. Navigate to Confirmation & Receipt
        navigate(`/booking/confirmation/${bookingId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking. Slot may no longer be available.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-card max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
              <ClipboardList className="w-4 h-4" /> Booking Requirement Form
            </div>
            <h2 className="text-xl font-extrabold">{venue.name} — {court.courtName}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Date: {slot.bookingDate} | Time: {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)} | Amount: ₹{court.pricePerHour}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Occasion Radio */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Occasion Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['PRACTICE', 'FRIENDLY_MATCH', 'TOURNAMENT', 'CORPORATE_EVENT', 'BIRTHDAY', 'OTHER'].map((occ) => (
                <button
                  type="button"
                  key={occ}
                  onClick={() => setOccasion(occ)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all text-center ${
                    occasion === occ
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {occ.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Players Count */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Estimated Players Count <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              required
              value={playersCount}
              onChange={(e) => setPlayersCount(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Equipment Required Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Equipment Required
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {equipmentOptions.map((item) => {
                const checked = equipmentRequired.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handleEquipmentToggle(item)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      checked ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      checked ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preparation Required Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Court Preparation Required
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {prepOptions.map((item) => {
                const checked = preparationRequired.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => handlePrepToggle(item)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                      checked ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      checked ? 'bg-primary-600 border-primary-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Additional Notes / Requests
            </label>
            <textarea
              rows="3"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Please keep floodlights turned on by 6 PM..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Total Payable</span>
              <span className="text-xl font-extrabold text-slate-900">₹{court.pricePerHour}</span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Confirming Booking...' : 'Confirm & Create Booking'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
