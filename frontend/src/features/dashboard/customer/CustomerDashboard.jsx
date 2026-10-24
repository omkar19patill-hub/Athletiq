import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, bookingService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { 
  Calendar, Clock, Heart, Star, Search, Download, XCircle, 
  ChevronLeft, ChevronRight, LayoutDashboard, User, Zap, ArrowRight 
} from 'lucide-react';

export const CustomerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    dashboardService.getCustomerStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    fetchBookings(0);
  }, []);

  const fetchBookings = (pageNo) => {
    setLoading(true);
    bookingService.getMyBookings({ page: pageNo, size: 5 })
      .then((res) => {
        if (res.success) {
          setBookings(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Automated Stripe refund will apply based on time remaining.')) return;
    
    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId, { cancellationReason: 'Cancelled from player dashboard' });
      fetchBookings(page);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-8 rounded-3xl bg-[#0C1017] border border-white/[0.1] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-volt-neon/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-1">
            <div className="text-volt-neon font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-volt-neon" /> Command Headquarters
            </div>
            <h1 className="text-3xl font-black font-display text-white uppercase tracking-tight">
              Player Matchday Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Manage your turf reservations, upcoming squad fixtures, and VIP match passes
            </p>
          </div>

          <Link
            to="/venues"
            className="relative z-10 px-6 py-3 bg-volt-neon hover:bg-emerald-400 text-black font-black text-xs font-display uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,135,0.4)] transition-all flex items-center gap-2"
          >
            <span>+ Book New Match</span>
          </Link>
        </div>

        {/* 4 Neon Metric HUD Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-[#0C1017] p-6 rounded-3xl border border-white/[0.08] hover:border-volt-neon/40 shadow-xl flex items-center gap-4 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-volt-neon/10 border border-volt-neon/30 text-volt-neon flex items-center justify-center shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-black font-display text-white block">{stats?.upcomingBookings || 0}</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Upcoming</span>
            </div>
          </div>

          <div className="bg-[#0C1017] p-6 rounded-3xl border border-white/[0.08] hover:border-floodlight-cyan/40 shadow-xl flex items-center gap-4 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-floodlight-cyan/10 border border-floodlight-cyan/30 text-floodlight-cyan flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-black font-display text-white block">{stats?.totalBookings || 0}</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Total Matches</span>
            </div>
          </div>

          <div className="bg-[#0C1017] p-6 rounded-3xl border border-white/[0.08] hover:border-rose-500/40 shadow-xl flex items-center gap-4 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-3xl font-black font-display text-white block">{stats?.cancelledBookings || 0}</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Cancelled</span>
            </div>
          </div>

          <div className="bg-[#0C1017] p-6 rounded-3xl border border-white/[0.08] hover:border-amber-400/40 shadow-xl flex items-center gap-4 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
              <Heart className="w-7 h-7 fill-amber-400" />
            </div>
            <div>
              <span className="text-3xl font-black font-display text-white block">{stats?.favouriteVenues || 0}</span>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Favorites</span>
            </div>
          </div>

        </div>

        {/* Bookings History Table in Dark Stadium Style */}
        <div className="bg-[#0C1017] rounded-3xl border border-white/[0.1] shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.08] flex justify-between items-center">
            <h3 className="text-lg font-black font-display text-white uppercase tracking-tight">
              Recent Matchday Reservations
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: {bookings.length}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-mono text-xs">Loading match reservations...</div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-base font-bold text-white font-display">No match passes reserved yet.</p>
              <Link to="/venues" className="text-xs font-mono font-bold text-volt-neon hover:underline inline-block">
                Explore floodlit pitches to schedule your first fixture →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-white/[0.02] text-slate-400 uppercase tracking-wider font-bold border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-4">Match Pass</th>
                    <th className="px-6 py-4">Sports Arena</th>
                    <th className="px-6 py-4">Pitch / Court</th>
                    <th className="px-6 py-4">Kick-Off</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-medium text-slate-300">
                  {bookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 font-black text-white font-mono">{bk.bookingNumber}</td>
                      <td className="px-6 py-4 font-bold text-white font-display">{bk.venueName}</td>
                      <td className="px-6 py-4 text-slate-300">{bk.courtName}</td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white">{bk.bookingDate}</span>
                        <span className="text-[11px] text-slate-500">{bk.startTime?.substring(0, 5)} - {bk.endTime?.substring(0, 5)}</span>
                      </td>
                      <td className="px-6 py-4 font-black text-volt-neon font-display text-sm">₹{bk.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          bk.bookingStatus === 'CONFIRMED' ? 'bg-emerald-500/10 text-volt-neon border border-volt-neon/40' :
                          bk.bookingStatus === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/40 animate-pulse' :
                          bk.bookingStatus === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/40' : 'bg-white/10 text-slate-300'
                        }`}>
                          {bk.bookingStatus === 'PENDING' ? '⏳ Awaiting Owner Approval' : bk.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/booking/receipt/${bk.id}`}
                          className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-white font-bold rounded-xl text-[11px] inline-flex items-center gap-1 border border-white/10"
                        >
                          <Download className="w-3 h-3 text-volt-neon" /> VIP Pass
                        </Link>

                        {(bk.bookingStatus === 'CONFIRMED' || bk.bookingStatus === 'PENDING') && (
                          <button
                            disabled={cancellingId === bk.id}
                            onClick={() => handleCancelBooking(bk.id)}
                            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold rounded-xl text-[11px] disabled:opacity-50"
                          >
                            {cancellingId === bk.id ? 'Refunding...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <button
                disabled={page === 0}
                onClick={() => { setPage(page - 1); fetchBookings(page - 1); }}
                className="px-3 py-1.5 bg-white/[0.04] text-slate-300 rounded-xl disabled:opacity-30 font-bold"
              >
                Previous
              </button>
              <span className="text-slate-400">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(page + 1); fetchBookings(page + 1); }}
                className="px-3 py-1.5 bg-white/[0.04] text-slate-300 rounded-xl disabled:opacity-30 font-bold"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};
