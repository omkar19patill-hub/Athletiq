import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, bookingService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { 
  Users, Building2, Trophy, Calendar, DollarSign, Clock, Shield, 
  TrendingUp, PieChart as PieIcon, BarChart3, Plus, Settings, ArrowUpRight,
  CheckCircle2, XCircle, AlertCircle, Check, X, Bell, RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const loadData = () => {
    dashboardService.getAdminStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    // Fetch pending requests awaiting turf creator approval
    bookingService.getAllBookings({ page: 0, size: 50, status: 'PENDING' })
      .then((res) => {
        if (res.success) setPendingBookings(res.data.content || []);
      })
      .catch(() => {});

    bookingService.getAllBookings({ page: 0, size: 10 })
      .then((res) => {
        if (res.success) setRecentBookings(res.data.content || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptBooking = async (bookingId, bookingNumber) => {
    setActionLoading(bookingId);
    try {
      const res = await bookingService.accept(bookingId);
      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Booking #${bookingNumber} accepted and confirmed! The player's match pass is now active.`
        });
        loadData();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to accept booking.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectBooking = async (bookingId, bookingNumber) => {
    const reason = window.prompt("Reason for declining this booking request:", "Pitch unavailable or maintenance");
    if (reason === null) return;

    setActionLoading(bookingId);
    try {
      const res = await bookingService.reject(bookingId, reason);
      if (res.success) {
        setActionMessage({
          type: 'info',
          text: `Booking #${bookingNumber} was declined. The slot has been reopened and refund initiated.`
        });
        loadData();
      }
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to decline booking.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#A855F7', '#EC4899'];

  const customTooltipStyle = {
    backgroundColor: '#0F172A',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    color: '#F8FAFC',
    fontSize: '12px',
    fontWeight: 500,
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Admin Header */}
        <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                <Shield className="w-3.5 h-3.5" /> Venue Partner & Owner Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Earnings & Operations Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Real-time booking revenue, court capacity utilization, and settlement metrics
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/admin/venues/new"
                className="btn-primary py-2.5 px-4 text-xs font-semibold rounded-lg"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Venue</span>
              </Link>
              <Link
                to="/admin/slots"
                className="btn-secondary py-2.5 px-4 text-xs font-medium rounded-lg"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Manage Slots</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 6 Metric Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Total Players</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold font-display text-white">{stats?.totalCustomers || 0}</span>
            <div className="text-[11px] text-slate-400 mt-1">Registered users</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Venues</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-2xl font-bold font-display text-white">{stats?.totalVenues || 0}</span>
            <div className="text-[11px] text-slate-400 mt-1">Active complexes</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Courts & Turfs</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-bold font-display text-white">{stats?.totalCourts || 0}</span>
            <div className="text-[11px] text-slate-400 mt-1">Multi-sport ready</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Today's Bookings</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold font-display text-white">{stats?.todayBookings || 0}</span>
            <div className="text-[11px] text-slate-400 mt-1">Slots reserved</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Monthly Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold font-display text-emerald-400">₹{stats?.monthlyRevenue || 0}</span>
            <div className="text-[11px] text-emerald-400/90 mt-1">Gross this month</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-medium text-slate-400">Total Lifetime</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <span className="text-2xl font-bold font-display text-sky-400">₹{stats?.totalRevenue || 0}</span>
            <div className="text-[11px] text-slate-400 mt-1">Total settlements</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Revenue Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue Trajectory (Last 7 Days)
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">₹ INR Settled</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueByDay || []}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2.5} 
                    dot={{ r: 3, fill: '#10B981' }} 
                    activeDot={{ r: 5, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings Count Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" /> Daily Booking Volume
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Slots Reserved</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.bookingsByDay || []}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="count" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Sports Pie Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-purple-400" /> Revenue Share by Sport
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Categories</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.popularSports || []}
                    dataKey="count"
                    nameKey="sport"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label={({ sport }) => sport}
                    stroke="#0B0F17"
                    strokeWidth={2}
                  >
                    {(stats?.popularSports || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Booking Hours Bar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" /> Peak Time Slots
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">24h Schedule</span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.peakHours || []}>
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Feedback Alert Message */}
        {actionMessage && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
            actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            actionMessage.type === 'info' ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' :
            'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Turf Creator Approval Queue: Pending Booking Requests */}
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 bg-amber-500/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-display">
                    Incoming Turf Booking Requests
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                    pendingBookings.length > 0 
                      ? 'bg-amber-500 text-slate-950 font-black animate-pulse' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {pendingBookings.length} {pendingBookings.length === 1 ? 'Request' : 'Requests'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Matches reserved by players awaiting your direct confirmation. Confirm to activate their match pass or decline to trigger a refund.
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Refresh requests"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {pendingBookings.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mx-auto" />
                <p className="text-sm font-semibold text-white">All Booking Requests Handled!</p>
                <p className="text-xs text-slate-400">There are no pending player bookings waiting for your approval right now.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Booking Ref</th>
                    <th className="px-5 py-3.5">Player Details</th>
                    <th className="px-5 py-3.5">Turf & Pitch</th>
                    <th className="px-5 py-3.5">Match Time</th>
                    <th className="px-5 py-3.5">Paid Amount</th>
                    <th className="px-5 py-3.5 text-right">Accept / Decline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
                  {pendingBookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-800/40 transition-colors bg-amber-500/[0.02]">
                      <td className="px-5 py-4 font-mono font-bold text-amber-400 text-xs">
                        {bk.bookingNumber}
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-bold text-white text-xs">{bk.customerName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{bk.customerEmail}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-bold text-white">{bk.venueName}</span>
                        <span className="text-[11px] text-emerald-400 font-medium">{bk.courtName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="block font-semibold text-slate-200">{bk.bookingDate}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{bk.startTime?.substring(0, 5)} - {bk.endTime?.substring(0, 5)}</span>
                      </td>
                      <td className="px-5 py-4 font-bold text-white font-mono text-sm">
                        ₹{bk.totalAmount}
                        <span className="block text-[10px] text-emerald-400 font-sans font-normal">Authorized via Stripe</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={actionLoading === bk.id}
                            onClick={() => handleAcceptBooking(bk.id, bk.bookingNumber)}
                            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-500/20 disabled:opacity-50"
                          >
                            {actionLoading === bk.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                            <span>Accept & Confirm</span>
                          </button>

                          <button
                            disabled={actionLoading === bk.id}
                            onClick={() => handleRejectBooking(bk.id, bk.bookingNumber)}
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-lg text-xs flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Customer Bookings</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time slot reservations across your sports complexes</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/40 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Booking Ref</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Venue & Court</th>
                  <th className="px-5 py-3">Date & Time</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-normal">
                {recentBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-400">{bk.bookingNumber}</td>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-white">{bk.customerName}</span>
                      <span className="text-[11px] text-slate-400">{bk.customerEmail}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block font-medium text-white">{bk.venueName}</span>
                      <span className="text-[11px] text-sky-400">{bk.courtName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="block text-slate-200">{bk.bookingDate}</span>
                      <span className="text-[11px] text-slate-400">{bk.startTime?.substring(0, 5)} - {bk.endTime?.substring(0, 5)}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-white">₹{bk.totalAmount}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {bk.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                      No bookings recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};
