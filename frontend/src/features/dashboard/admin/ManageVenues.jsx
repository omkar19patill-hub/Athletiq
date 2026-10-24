import React, { useEffect, useState } from 'react';
import { venueService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Building2, Plus, Trash2, Edit2, MapPin, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ManageVenues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    imageUrls: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'],
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = () => {
    setLoading(true);
    venueService.getAll({ page: 0, size: 50 })
      .then((res) => {
        if (res.success) setVenues(res.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await venueService.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        imageUrls: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'],
      });
      fetchVenues();
    } catch (err) {
      alert(err.message || 'Failed to create venue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue? All associated courts and slots will be permanently removed.')) return;
    try {
      await venueService.delete(id);
      fetchVenues();
    } catch (err) {
      alert(err.message || 'Failed to delete venue');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 relative z-10">
        
        {/* Header HUD */}
        <div className="glass-panel border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" /> TURF & ARENA ASSET REGISTRY
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight uppercase">
              Manage Sports Venues
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Register floodlit stadiums, indoor wooden courts, and multi-sport complexes
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="relative z-10 px-5 py-3 bg-gradient-to-r from-volt to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-volt hover:scale-105 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Register New Venue
          </button>
        </div>

        {/* Venues Table */}
        <div className="glass-panel border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-volt animate-ping" /> Loading arena registry...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Venue & Specification</th>
                    <th className="px-6 py-4">City / PIN</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4">Courts</th>
                    <th className="px-6 py-4">Operational Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-slate-300">
                  {venues.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-volt">#{v.id}</td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white text-sm">{v.name}</span>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{v.description || 'Pro-grade athletic facility'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-cyan/10 border border-cyan/30 text-cyan font-mono text-[11px] font-bold">
                          {v.city} {v.pincode ? `• ${v.pincode}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 truncate max-w-xs font-mono text-[11px]">{v.address}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-white">{v.totalCourts || 0} Courts</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-volt/10 text-volt border border-volt/30">
                          {v.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleDeleteVenue(v.id)}
                          className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete Venue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {venues.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-mono">
                        No venues registered yet. Click "Register New Venue" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Add Venue Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stadium-pitch/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-stadium-night/95 border border-white/15 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-volt/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black font-display uppercase tracking-wider text-white">Register Arena Facility</h3>
                <p className="text-xs font-mono text-slate-400">Add new turf or sports complex to the network</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVenue} className="relative z-10 space-y-4 text-xs font-mono">
              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Arena Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Apex Floodlight Arena"
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="FIFA standard synthetic 3G turf with floodlight towers..."
                  className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Maharashtra"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Link Road, Andheri West"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase tracking-wider mb-1.5">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="400053"
                    className="w-full px-3.5 py-2.5 bg-white/[0.04] border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt font-sans"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-slate-400 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-volt to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-neon-volt hover:scale-105 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Arena'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

