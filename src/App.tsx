import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import IpDetails from './pages/IpDetails';
import PhoneValidator from './pages/PhoneValidator';
import ReputationChecker from './pages/ReputationChecker';
import BrowserFingerprint from './pages/BrowserFingerprint';
import FraudReport from './pages/FraudReport';
import AdminDashboard from './pages/AdminDashboard';
import RealTimeTracker from './pages/RealTimeTracker';
import ImeiTracker from './pages/ImeiTracker';
import ImeiLiveTracker from './pages/ImeiLiveTracker';
import PhoneLiveTracker from './pages/PhoneLiveTracker';

function AppContent() {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 animate-spin rounded-full" />
      </div>
    );
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
    }
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'ip-details': return <IpDetails />;
      case 'phone-validator': return <PhoneValidator />;
      case 'reputation': return <ReputationChecker />;
      case 'fingerprint': return <BrowserFingerprint />;
      case 'fraud-report': return <FraudReport />;
      case 'real-time': return <RealTimeTracker />;
      case 'imei-tracker': return <ImeiTracker />;
      case 'imei-live': return <ImeiLiveTracker />;
      case 'phone-live': return <PhoneLiveTracker />;
      case 'admin': return <AdminDashboard />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
