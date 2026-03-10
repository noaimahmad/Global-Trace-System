import React, { useState, useEffect } from 'react';
import { Shield, Users, AlertCircle, BarChart3, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { formatDate, maskValue, cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then(res => res.json()),
      fetch('/api/admin/reports').then(res => res.json()),
      fetch('/api/admin/users').then(res => res.json())
    ]).then(([statsData, reportsData, usersData]) => {
      setStats(statsData);
      setReports(reportsData);
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    await fetch(`/api/admin/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    // Refresh reports
    const res = await fetch('/api/admin/reports');
    setReports(await res.json());
  };

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-10 w-64 bg-white/5 rounded" />
    <div className="grid grid-cols-3 gap-6">
      <div className="h-32 bg-white/5 rounded-2xl" />
      <div className="h-32 bg-white/5 rounded-2xl" />
      <div className="h-32 bg-white/5 rounded-2xl" />
    </div>
  </div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Control Center</h1>
        <p className="text-zinc-500">System-wide monitoring and moderation tools.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-500' },
          { label: 'Fraud Reports', value: stats.reports, icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Total Inspections', value: stats.checks, icon: BarChart3, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className={`p-2 rounded-lg bg-white/5 ${stat.color} w-fit mb-4`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 mb-6">
        <button 
          onClick={() => setActiveTab('reports')}
          className={cn(
            "pb-4 px-2 text-sm font-medium transition-all relative",
            activeTab === 'reports' ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          Fraud Reports
          {activeTab === 'reports' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={cn(
            "pb-4 px-2 text-sm font-medium transition-all relative",
            activeTab === 'users' ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
          )}
        >
          User Management
          {activeTab === 'users' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
        </button>
      </div>

      {/* Content */}
      <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        {activeTab === 'reports' ? (
          <>
            <h3 className="text-xl font-bold mb-6">Pending Fraud Reports</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="pb-4 font-medium">Reporter</th>
                    <th className="pb-4 font-medium">Category</th>
                    <th className="pb-4 font-medium">Indicator</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((report) => (
                    <tr key={report.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-medium">{report.user_name}</p>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold uppercase">
                          {report.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="text-sm font-mono text-zinc-400">{maskValue(report.indicator_value, 8)}</p>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          report.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                          report.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                          'bg-red-500/10 text-red-500'
                        )}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-zinc-500">
                        {formatDate(report.created_at)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(report.id, 'resolved')}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all"
                            title="Resolve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(report.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-6">Registered Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="pb-4 font-medium">Name</th>
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Role</th>
                    <th className="pb-4 font-medium">Joined</th>
                    <th className="pb-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4">
                        <p className="text-sm font-medium">{user.name}</p>
                      </td>
                      <td className="py-4">
                        <p className="text-sm text-zinc-400">{user.email}</p>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 text-xs text-zinc-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-xs text-zinc-500 hover:text-white transition-colors">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
