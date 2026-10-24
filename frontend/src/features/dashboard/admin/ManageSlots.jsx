import React, { useEffect, useState } from 'react';
import { slotService, courtService, venueService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Clock, Plus, Lock, Unlock, Calendar, AlertCircle, Layers, Sliders } from 'lucide-react';

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
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans relative selection:bg-volt selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 relative z-10">
        
        {/* Header HUD */}
        <div className="glass-panel border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Clock className="w-3.5 h-3.5" /> ARENA SCHEDULING & CAPACITY MATRIX
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight uppercase">
              Tactical Slot Controller
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Batch produce match hours, lock blackout periods, and optimize floodlight peak slots
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Bulk Generator Card */}
          <div className="lg:col-span-4 glass-panel border-white/10 p-6 rounded-3xl shadow-2xl space-y-5 relative overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Sliders className="w-4 h-4 text-volt" />
              <h3 className="text-sm font-black font-display text-white uppercase tracking-wider">
                Bulk Generator HUD
              </h3>
            </div>

            <form onSubmit={handleBulkGenerate} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Select Arena *</label>
                <select
                  value={selectedVenueId}
                  onChange={(e) => setSelectedVenueId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-volt font-sans"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Choose Venue</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id} className="bg-slate-900 text-white">{v.name} ({v.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Select Pitch / Court *</label>
                <select
                  value={selectedCourtId}
                  onChange={(e) => setSelectedCourtId(e.target.value)}
                  required
                  disabled={courts.length === 0}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-volt font-sans disabled:opacity-40"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Choose Court</option>
                  {courts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">{c.courtName} (₹{c.pricePerHour}/hr)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={bulkData.startDate}
                    onChange={(e) => setBulkData({ ...bulkData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={bulkData.endDate}
                    onChange={(e) => setBulkData({ ...bulkData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-volt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">First Kick-off</label>
                  <input
                    type="time"
                    required
                    value={bulkData.slotStartTime}
                    onChange={(e) => setBulkData({ ...bulkData, slotStartTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-volt"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Final Whistle</label>
                  <input
                    type="time"
                    required
                    value={bulkData.slotEndTime}
                    onChange={(e) => setBulkData({ ...bulkData, slotEndTime: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white/[0.04] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-volt"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Duration</label>
                <select
                  value={bulkData.slotDurationMinutes}
                  onChange={(e) => setBulkData({ ...bulkData, slotDurationMinutes: parseInt(e.target.value, 10) })}
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-volt font-sans"
                >
                  <option value={60} className="bg-slate-900 text-white">60 Minutes Standard Match</option>
                  <option value={120} className="bg-slate-900 text-white">120 Minutes Extended Tournament</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-volt to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-volt hover:scale-105 transition-all disabled:opacity-50 font-sans"
              >
                {submitting ? 'Generating Schedule...' : 'Generate Batch Slots'}
              </button>
            </form>
          </div>

          {/* Existing Slots Viewer */}
          <div className="lg:col-span-8 glass-panel border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-black font-display uppercase tracking-wider text-white">Court Slot Matrix</h3>
                <p className="text-xs text-slate-400 font-mono">Live match slots for the selected pitch</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 bg-white/[0.06] border border-white/20 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan"
                />
              </div>
            </div>

            {loadingSlots ? (
              <div className="p-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-ping" /> Synchronizing slot matrix...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-16 text-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-white font-display">NO SLOTS IN CURRENT TIMELINE</p>
                <p className="text-xs text-slate-400 mt-1 font-mono">No operational hours generated for this court on {selectedDate}. Use the generator to batch create slots.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between items-center text-center transition-all ${
                      s.slotStatus === 'AVAILABLE' 
                        ? 'bg-volt/10 border-volt/30 text-white shadow-[0_0_15px_-3px_rgba(0,255,135,0.15)]' :
                      s.slotStatus === 'BLOCKED' 
                        ? 'bg-amber-500/10 border-amber-500/30 text-white' :
                        'bg-white/[0.02] border-white/10 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-mono font-black tracking-wider text-white">
                      {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                    </span>
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wider my-1.5 px-2 py-0.5 rounded-full ${
                      s.slotStatus === 'AVAILABLE' ? 'bg-volt/20 text-volt' :
                      s.slotStatus === 'BLOCKED' ? 'bg-amber-400/20 text-amber-400' :
                      'bg-white/10 text-slate-400'
                    }`}>
                      {s.slotStatus}
                    </span>

                    {s.slotStatus !== 'BOOKED' && (
                      <button
                        onClick={() => handleToggleBlock(s)}
                        className={`mt-2 px-3 py-1 text-[10px] font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                          s.slotStatus === 'BLOCKED'
                            ? 'bg-volt text-slate-950 hover:bg-emerald-400'
                            : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                        }`}
                      >
                        {s.slotStatus === 'BLOCKED' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {s.slotStatus === 'BLOCKED' ? 'Unblock' : 'Block Slot'}
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

