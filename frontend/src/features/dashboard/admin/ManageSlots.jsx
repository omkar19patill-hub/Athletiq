import React, { useEffect, useState } from 'react';
import { slotService, courtService, venueService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Clock, Plus, Lock, Unlock, Trash2, Calendar, AlertCircle } from 'lucide-react';

export const ManageSlots = () => {
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk slot form
  const [bulkData, setBulkData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    slotStartTime: '06:00',
    slotEndTime: '22:00',
    slotDurationMinutes: 60,
  });

  useEffect(() => {
    venueService.getAll({ page: 0, size: 50 })
      .then((res) => {
        if (res.success) setVenues(res.data.content);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedVenueId) {
      courtService.getByVenue(selectedVenueId)
        .then((res) => {
          if (res.success) {
            setCourts(res.data);
            if (res.data.length > 0) setSelectedCourtId(res.data[0].id);
          }
        })
        .catch(() => setCourts([]));
    }
  }, [selectedVenueId]);

  useEffect(() => {
    if (selectedCourtId && selectedDate) {
      fetchSlots();
    }
  }, [selectedCourtId, selectedDate]);

  const fetchSlots = () => {
    setLoadingSlots(true);
    slotService.getByCourtAndDate(selectedCourtId, selectedDate)
      .then((res) => {
        if (res.success) setSlots(res.data);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  };

  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!selectedCourtId) {
      alert('Please select a venue and court first');
      return;
    }

    setSubmitting(true);
    try {
      await slotService.bulkCreate({
        courtId: selectedCourtId,
        ...bulkData,
      });
      alert('Bulk slots generated successfully!');
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Failed to generate bulk slots');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (slot) => {
    try {
      if (slot.slotStatus === 'BLOCKED') {
        await slotService.unblock(slot.id);
      } else if (slot.slotStatus === 'AVAILABLE') {
        await slotService.block(slot.id);
      }
      fetchSlots();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Court Slots</h1>
          <p className="text-xs text-slate-500 mt-1">Generate bulk operating time slots and block/unblock specific hours</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bulk Generator Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" /> Bulk Slot Generator
            </h3>

            <form onSubmit={handleBulkGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Venue *</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="">Choose Venue</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Select Court *</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  required
                  disabled={courts.length === 0}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="">Choose Court</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id}>{c.courtName} (₹{c.pricePerHour}/hr)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={bulkData.startDate}
                    onChange={(e) => setBulkData({ ...bulkData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={bulkData.endDate}
                    onChange={(e) => setBulkData({ ...bulkData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Opening Time</label>
                  <input
                    type="time"
                    required
                    value={bulkData.slotStartTime}
                    onChange={(e) => setBulkData({ ...bulkData, slotStartTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Closing Time</label>
                  <input
                    type="time"
                    required
                    value={bulkData.slotEndTime}
                    onChange={(e) => setBulkData({ ...bulkData, slotEndTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Slot Duration</label>
                <select
                  value={bulkData.slotDurationMinutes}
                  onChange={(e) => setBulkData({ ...bulkData, slotDurationMinutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value={60}>60 Minutes (1 Hour)</option>
                  <option value={120}>120 Minutes (2 Hours)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Generating Slots...' : 'Generate Slots Schedule'}
              </button>
            </form>
          </div>

          {/* Existing Slots Viewer */}
          <div className="lg:col-span-8 bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-sm font-extrabold text-slate-900">Manage Slots for Date</h3>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              />
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">Loading court slots...</div>
            ) : slots.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No slots found for this court on {selectedDate}.</p>
                <p className="text-xs text-slate-400 mt-1">Use the Bulk Slot Generator on the left to create slots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between items-center text-center ${
                      s.slotStatus === 'AVAILABLE' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                      s.slotStatus === 'BLOCKED' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                      'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider my-1">{s.slotStatus}</span>

                    {s.slotStatus !== 'BOOKED' && (
                      <button
                        onClick={() => handleToggleBlock(s)}
                        className={`mt-2 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                          s.slotStatus === 'BLOCKED'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'bg-amber-600 text-white hover:bg-amber-700'
                        }`}
                      >
                        {s.slotStatus === 'BLOCKED' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {s.slotStatus === 'BLOCKED' ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
