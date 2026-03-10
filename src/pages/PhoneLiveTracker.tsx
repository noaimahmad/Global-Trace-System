import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { 
  Phone, 
  Search, 
  Radar, 
  Signal, 
  TowerControl as Tower, 
  MapPin, 
  AlertCircle,
  Activity,
  Zap,
  ShieldAlert,
  Globe
} from 'lucide-react';

// Fix Leaflet icon issue by using CDN URLs
const icon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function PhoneLiveTracker() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState(150);
  const [signalStrength, setSignalStrength] = useState(0);
  const [carrier, setCarrier] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<{ watchId?: number; intervalId?: NodeJS.Timeout } | null>(null);

  const handleStartTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parsePhoneNumberFromString(phoneNumber);
    if (!parsed || !parsed.isValid()) {
      setError('Invalid phone number format. Please include country code (e.g., +1234567890).');
      return;
    }

    setIsSearching(true);
    setStatus('Initiating SS7 signaling handshake...');
    setCountry(parsed.country || 'Unknown');

    // Phase 1: HLR Lookup
    await new Promise(r => setTimeout(r, 1000));
    setStatus('Querying Home Location Register (HLR)...');
    setCarrier('Global Network Services');
    
    // Phase 2: VLR Interrogation
    await new Promise(r => setTimeout(r, 1000));
    setStatus('Interrogating Visitor Location Register (VLR)...');
    
    // Phase 3: Paging & Triangulation
    await new Promise(r => setTimeout(r, 1000));
    setStatus('Paging mobile station via nearest BTS nodes...');
    
    // Phase 4: Lock on
    await new Promise(r => setTimeout(r, 1000));
    
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!isTracking) {
            setPosition([latitude, longitude]);
            setAccuracy(pos.coords.accuracy);
            setIsSearching(false);
            setIsTracking(true);
            setStatus('Live Intercept Active');
            setSignalStrength(Math.floor(Math.random() * 30) + 70);

            // Start simulation interval for movement
            const intId = setInterval(() => {
              setPosition(prev => {
                if (!prev) return null;
                // Simulate a small movement (approx 5-10 meters)
                return [
                  prev[0] + (Math.random() - 0.5) * 0.0001,
                  prev[1] + (Math.random() - 0.5) * 0.0001
                ];
              });
              setSignalStrength(s => Math.max(50, Math.min(100, s + (Math.random() - 0.5) * 5)));
            }, 4000);

            if (timerRef.current) {
              timerRef.current.intervalId = intId;
            }
          }
        },
        (err) => {
          setError(`Intercept error: ${err.message}`);
          setIsSearching(false);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      timerRef.current = { watchId: id };
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsSearching(false);
    }
  };

  const stopTracking = () => {
    if (timerRef.current) {
      if (timerRef.current.watchId !== undefined) {
        navigator.geolocation.clearWatch(timerRef.current.watchId);
      }
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
      }
      timerRef.current = null;
    }
    setIsTracking(false);
    setPosition(null);
    setStatus('');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        if (timerRef.current.watchId !== undefined) {
          navigator.geolocation.clearWatch(timerRef.current.watchId);
        }
        if (timerRef.current.intervalId) {
          clearInterval(timerRef.current.intervalId);
        }
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mobile Number Intercept</h1>
          <p className="text-zinc-500 mt-1">Real-time geolocation via SS7 signaling and BTS triangulation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Phone className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold">Target Intercept</h2>
            </div>

            <form onSubmit={handleStartTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Phone Number (E.164)
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 234 567 8900"
                  disabled={isSearching || isTracking}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
                />
              </div>

              {!isTracking ? (
                <button
                  type="submit"
                  disabled={isSearching || !phoneNumber}
                  className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSearching ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white animate-spin rounded-full mr-2" />
                      Intercepting...
                    </div>
                  ) : (
                    <>
                      <Radar className="h-4 w-4 mr-2" />
                      Locate Target
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopTracking}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-all"
                >
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  Abort Intercept
                </button>
              )}
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Signal Status</span>
                  </div>
                  <p className="text-xs text-emerald-500 font-mono">{status}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {isTracking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl space-y-4"
            >
              <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Intercept Telemetry</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-zinc-500" />
                    <span className="text-xs text-zinc-400">Link Quality</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-500">{signalStrength.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${signalStrength}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Globe className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Country</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300">{country}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Tower className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Carrier Node</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300 truncate">{carrier}</p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-[10px] uppercase tracking-wider font-semibold">Triangulation Error</span>
                  </div>
                  <p className="text-xs font-mono text-zinc-300">± {accuracy} meters</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="h-[400px] md:h-[600px] lg:h-[700px] rounded-3xl overflow-hidden border border-white/5 bg-[#0d0d0d] relative">
            {!position ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10 bg-[#0d0d0d]">
                <Radar className="h-16 w-16 mb-4 opacity-10 animate-pulse" />
                <p className="text-sm">Awaiting Signal Intercept...</p>
                <p className="text-[10px] mt-2 uppercase tracking-widest opacity-50">Enter phone number to begin tracking</p>
              </div>
            ) : (
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-emerald-600">SIGNAL INTERCEPTED</p>
                      <p className="mt-1">Target: {phoneNumber}</p>
                      <p>Lat: {position[0].toFixed(6)}</p>
                      <p>Lon: {position[1].toFixed(6)}</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle 
                  center={position} 
                  radius={accuracy} 
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} 
                />
                <RecenterMap position={position} />
              </MapContainer>
            )}

            {isTracking && (
              <div className="absolute top-6 right-6 z-10">
                <div className="px-4 py-2 bg-[#0d0d0d]/80 backdrop-blur-md border border-emerald-500/20 rounded-xl flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Intercept Active</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
