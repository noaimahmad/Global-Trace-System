import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'motion/react';
import { Navigation, Map as MapIcon, Crosshair, History, Download, Trash2 } from 'lucide-react';

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

// Component to recenter map when position changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export default function RealTimeTracker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos: [number, number] = [latitude, longitude];
        setPosition(newPos);
        setPath((prev) => [...prev, newPos]);
      },
      (err) => {
        setError(err.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  const clearPath = () => {
    setPath([]);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Tracker</h1>
          <p className="text-zinc-500 mt-1">Monitor live location and path history.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
            >
              <Crosshair className="h-4 w-4 mr-2 animate-pulse" />
              Stop Tracking
            </button>
          )}
          
          <button
            onClick={clearPath}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title="Clear Path"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="h-[400px] md:h-[600px] rounded-3xl overflow-hidden border border-white/5 bg-[#0d0d0d] relative">
            {!position ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 z-10 bg-[#0d0d0d]">
                <MapIcon className="h-12 w-12 mb-4 opacity-20" />
                <p>Waiting for location data...</p>
                <p className="text-xs mt-2">Click "Start Tracking" to begin</p>
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
                    You are here! <br />
                    Lat: {position[0].toFixed(6)} <br />
                    Lon: {position[1].toFixed(6)}
                  </Popup>
                </Marker>
                {path.length > 1 && (
                  <Polyline positions={path} color="#10b981" weight={4} opacity={0.6} />
                )}
                <RecenterMap position={position} />
              </MapContainer>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl"
          >
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Current Position</h3>
            {position ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500">Latitude</p>
                  <p className="text-xl font-mono text-emerald-500">{position[0].toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Longitude</p>
                  <p className="text-xl font-mono text-emerald-500">{position[1].toFixed(6)}</p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-500">Points Captured</p>
                  <p className="text-lg font-medium">{path.length}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 italic">No data available</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl"
          >
            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Recent Path</h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {path.length === 0 ? (
                <p className="text-sm text-zinc-600 italic">History will appear here</p>
              ) : (
                [...path].reverse().slice(0, 10).map((pos, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                    <span className="text-zinc-400 font-mono">
                      {pos[0].toFixed(4)}, {pos[1].toFixed(4)}
                    </span>
                    <span className="text-zinc-600">
                      #{path.length - i}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
