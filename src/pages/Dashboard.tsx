import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Globe, 
  Shield, 
  Smartphone, 
  Clock, 
  AlertCircle,
  TrendingUp,
  MapPin,
  Cpu,
  Zap,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { getFingerprint } from '../lib/fingerprint';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Mon', checks: 12 },
  { name: 'Tue', checks: 19 },
  { name: 'Wed', checks: 15 },
  { name: 'Thu', checks: 22 },
  { name: 'Fri', checks: 30 },
  { name: 'Sat', checks: 18 },
  { name: 'Sun', checks: 25 },
];

export default function Dashboard() {
  const [ipData, setIpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');

  useEffect(() => {
    // Get Fingerprint
    getFingerprint().then(id => setVisitorId(id));

    fetch('/api/my-ip')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setIpData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard IP fetch error:', err);
        setLoading(false);
      });
  }, []);

  const stats = [
    { label: 'Public IP', value: ipData?.ip || 'Detecting...', icon: Globe, color: 'text-blue-500' },
    { label: 'Browser ID', value: visitorId || 'Generating...', icon: Fingerprint, color: 'text-purple-500' },
    { label: 'Location', value: ipData ? `${ipData.city}, ${ipData.country_code}` : 'Detecting...', icon: MapPin, color: 'text-emerald-500' },
    { label: 'Risk Score', value: 'Low (12/100)', icon: Shield, color: 'text-cyan-500' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Security Overview</h1>
        <p className="text-zinc-500">Welcome back. Here's your current network and device status.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-sm text-zinc-500 mb-1">{stat.label}</p>
            <p className="text-lg font-bold truncate">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Inspection Activity
            </h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorChecks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: '1px solid #ffffff10',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="checks" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorChecks)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Risk Alerts
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-500 mb-1">Unusual Login</p>
                <p className="text-xs text-zinc-400">Login from new IP detected 2 hours ago.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-emerald-500 mb-1">System Secure</p>
                <p className="text-xs text-zinc-400">All security protocols are active.</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
            <Zap className="absolute -right-4 -bottom-4 h-24 w-24 text-emerald-500/10 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold mb-2">Upgrade to Pro</h3>
            <p className="text-sm text-zinc-400 mb-4">Get real-time carrier lookup and advanced threat intelligence.</p>
            <button className="w-full py-2 bg-emerald-500 text-black font-bold rounded-xl text-sm hover:bg-emerald-400 transition-colors">
              View Plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
