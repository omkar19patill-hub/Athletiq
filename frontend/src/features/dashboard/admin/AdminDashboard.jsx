import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, bookingService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { 
  Users, Building2, Trophy, Calendar, DollarSign, Clock, Shield, 
  TrendingUp, PieChart as PieIcon, BarChart3, Plus, Settings 
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getAdminStats()
      .then((res) => {
        if (res.success) setStats(res.data);
      })
      .catch(() => {});

    bookingService.getAllBookings({ page: 0, size: 5 })
      .then((res) => {
        if (res.success) setRecentBookings(res.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#4CAF50', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-surface-background flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 text-white p-8 rounded-card shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" /> SportSphere Admin Portal
            </div>
            <h1 className="text-3xl font-extrabold">Executive Analytics & Operations</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time venue performance, court utilization, and revenue monitoring</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/venues/new"
              className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Venue
            </Link>
            <Link
              to="/admin/slots"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Settings className="w-4 h-4" /> Manage Slots
            </Link>
          </div>
        </div>

        {/* 6 Metric Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customers</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalCustomers || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Venues</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalVenues || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Courts</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalCourts || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Today's Bookings</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats?.todayBookings || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Revenue</span>
            <span className="text-2xl font-extrabold text-primary-600">₹{stats?.monthlyRevenue || 0}</span>
          </div>

          <div className="bg-white p-5 rounded-card shadow-soft border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pending</span>
            <span className="text-2xl font-extrabold text-amber-600">{stats?.pendingBookings || 0}</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" /> Revenue Trend (Last 7 Days)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.revenueByDay || []}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#4CAF50" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings Count Chart */}
          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Daily Bookings Volume
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.bookingsByDay || []}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Sports Pie Chart */}
          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-600" /> Popular Sports Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.popularSports || []}
                    dataKey="count"
                    nameKey="sport"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ sport }) => sport}
                  >
                    {(stats?.popularSports || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Booking Hours Bar Chart */}
          <div className="bg-white p-6 rounded-card shadow-soft border border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Peak Booking Hours
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.peakHours || []}>
                  <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-card shadow-soft border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-extrabold text-slate-900">Recent Customer Bookings</h3>
            <Link to="/admin/bookings" className="text-xs font-bold text-primary-600 hover:underline">
              View All Bookings
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Ref No</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Venue & Court</th>
                  <th className="px-6 py-4">Slot Time</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {recentBookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-extrabold text-slate-900 font-mono">{bk.bookingNumber}</td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-900">{bk.customerName}</span>
                      <span className="text-[11px] text-slate-400">{bk.customerEmail}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold text-slate-900">{bk.venueName}</span>
                      <span className="text-[11px] text-slate-400">{bk.courtName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="block font-bold">{bk.bookingDate}</span>
                      <span className="text-[11px] text-slate-400">{bk.startTime?.substring(0, 5)} - {bk.endTime?.substring(0, 5)}</span>
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900">₹{bk.totalAmount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                        {bk.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};
