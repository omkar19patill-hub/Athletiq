import React, { useEffect, useState } from 'react';
import { userService } from '../../../services/apiServices';
import { Navbar } from '../../../components/Navbar';
import { Footer } from '../../../components/Footer';
import { Users, Shield, UserX, Trash2, Ban, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    userService.getAll({ page: 0, size: 50 })
      .then((res) => {
        if (res.success) setUsers(res.data.content);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleToggleBlock = async (id) => {
    try {
      await userService.toggleBlock(id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userService.delete(id);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans relative selection:bg-volt selection:text-slate-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8 relative z-10">
        
        {/* Header HUD */}
        <div className="glass-panel border-white/10 p-8 rounded-3xl relative overflow-hidden shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-volt/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-volt/10 border border-volt/30 text-volt text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <Users className="w-3.5 h-3.5" /> ATHLETE & SQUAD ROSTER
            </div>
            <h1 className="text-3xl md:text-4xl font-black font-display text-white tracking-tight uppercase">
              User & Gate Access Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Monitor registered players, arena owners, turnstile permissions, and ban list
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-panel border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 font-mono text-xs flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-volt animate-ping" /> Loading player roster...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Athlete / Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Clearance Role</th>
                    <th className="px-6 py-4">Turnstile Status</th>
                    <th className="px-6 py-4 text-right">Gate Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-volt">#{u.id}</td>
                      <td className="px-6 py-4">
                        <span className="block font-bold text-white text-sm">{u.firstName} {u.lastName}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">{u.email}</td>
                      <td className="px-6 py-4 font-mono text-slate-400">{u.phone || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${
                          u.role === 'ADMIN' 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                            : 'bg-cyan/10 border-cyan/30 text-cyan'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider border ${
                          u.isBlocked 
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                            : 'bg-volt/10 border-volt/30 text-volt'
                        }`}>
                          {u.isBlocked ? 'ACCESS REVOKED' : 'AUTHORIZED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleBlock(u.id)}
                            className={`px-3 py-1 font-mono font-bold rounded-lg text-[10px] uppercase tracking-wider transition-colors border ${
                              u.isBlocked 
                                ? 'bg-volt/10 border-volt/30 text-volt hover:bg-volt hover:text-slate-950' 
                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white'
                            }`}
                          >
                            {u.isBlocked ? 'Restore Access' : 'Revoke Access'}
                          </button>
                        )}
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-mono">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

