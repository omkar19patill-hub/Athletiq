import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, bookingService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Calendar, Clock, Heart, Star, Search, Download, XCircle, ChevronLeft, ChevronRight, LayoutDashboard, User } from 'lucide-react';

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
    if (!window.confirm('Are you sure you want to cancel this booking? Refund policy will apply based on time remaining.')) return;
    
    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId, { cancellationReason: 'Cancelled from customer dashboard' });
      fetchBookings(page);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Customer Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your turf reservations, upcoming matches and profile</p>
          </div>
          <Link
            to="/venues"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md shadow-primary-500/20 transition-all"
          >
            + Book New Turf
          </Link>
        </div>

        {/* Dashboard Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 block">{stats?.upcomingBookings || 0}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 block">{stats?.totalBookings || 0}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 block">{stats?.cancelledBookings || 0}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cancelled</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <span className="text-2xl font-extrabold text-slate-900 block">{stats?.favouriteVenues || 0}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Favourites</span>
            </div>
          </div>
        </div>

        {/* Bookings History Table */}
        <div className="bg-white rounded-card shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900">Recent Booking History</h3>
            <span className="text-xs font-bold text-slate-400">Total: {bookings.length}</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800">No bookings created yet.</p>
              <Link to="/venues" className="text-xs font-bold text-primary-600 hover:underline mt-1 inline-block">
                Browse available turfs to make your first booking
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Booking Ref</th>
                    <th className="px-6 py-4">Venue</th>
                    <th className="px-6 py-4">Court</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {bookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-slate-900 font-mono">{bk.bookingNumber}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{bk.venueName}</td>
                      <td className="px-6 py-4">{bk.courtName}</td>
                      <td className="px-6 py-4">
                        <span className="block font-bold">{bk.bookingDate}</span>
                        <span className="text-[11px] text-slate-400">{bk.startTime?.substring(0, 5)} - {bk.endTime?.substring(0, 5)}</span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-900">₹{bk.totalAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          bk.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          bk.bookingStatus === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {bk.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/booking/receipt/${bk.id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Receipt
                        </Link>

                        {bk.bookingStatus === 'CONFIRMED' && (
                          <button
                            disabled={cancellingId === bk.id}
                            onClick={() => handleCancelBooking(bk.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[11px] disabled:opacity-50"
                          >
                            {cancellingId === bk.id ? 'Cancelling...' : 'Cancel'}
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
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={page === 0}
                onClick={() => { setPage(page - 1); fetchBookings(page - 1); }}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg disabled:opacity-40 text-xs font-bold"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600">Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => { setPage(page + 1); fetchBookings(page + 1); }}
                className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg disabled:opacity-40 text-xs font-bold"
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
