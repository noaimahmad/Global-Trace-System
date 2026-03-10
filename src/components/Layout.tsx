import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Shield, 
  Activity, 
  MapPin, 
  Phone, 
  Search, 
  Fingerprint,
  History, 
  AlertTriangle, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Smartphone,
  Radar,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function Layout({ children, activePage, setActivePage }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ip-details', label: 'My IP Details', icon: MapPin },
    { id: 'phone-validator', label: 'Phone Validator', icon: Phone },
    { id: 'reputation', label: 'Reputation Checker', icon: Search },
    { id: 'fingerprint', label: 'Browser Fingerprint', icon: Fingerprint },
    { id: 'fraud-report', label: 'Fraud Report', icon: AlertTriangle },
    { id: 'real-time', label: 'Real-time Tracker', icon: Activity },
    { id: 'imei-tracker', label: 'IMEI Intelligence', icon: Smartphone },
    { id: 'imei-live', label: 'IMEI Live Tracker', icon: Radar },
    { id: 'phone-live', label: 'Phone Intercept', icon: Zap },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Panel', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-white/5 bg-[#0d0d0d] lg:block">
        <div className="flex h-20 items-center px-6 border-b border-white/5">
          <Shield className="h-8 w-8 text-emerald-500 mr-3" />
          <span className="text-xl font-bold tracking-tight">Global Trace</span>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "flex w-full items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                activePage === item.id 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 mr-3 transition-colors",
                activePage === item.id ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center mr-3">
              <UserIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex w-full items-center px-4 py-2 text-sm text-zinc-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-40 w-full border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-emerald-500 mr-2" />
            <span className="font-bold">Global Trace</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] lg:hidden"
          >
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-emerald-500 mr-2" />
                <span className="font-bold">Global Trace</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-4 py-4 rounded-xl",
                    activePage === item.id ? "bg-emerald-500/10 text-emerald-500" : "text-zinc-400"
                  )}
                >
                  <item.icon className="h-5 w-5 mr-4" />
                  <span className="text-lg font-medium">{item.label}</span>
                </button>
              ))}
              <button 
                onClick={logout}
                className="flex w-full items-center px-4 py-4 text-zinc-400"
              >
                <LogOut className="h-5 w-5 mr-4" />
                Logout
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
