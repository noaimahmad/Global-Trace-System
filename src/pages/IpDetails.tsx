import React, { useState, useEffect } from 'react';
import { MapPin, Globe, Shield, Zap, Clock, Info, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
const markerIcon = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const markerShadow = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

export default function IpDetails() {
  const [ipData, setIpData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error('IpDetails fetch error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    <div className="h-8 w-48 bg-white/5 rounded" />
    <div className="h-64 bg-white/5 rounded-2xl" />
  </div>;

  const position: [number, number] = [ipData.lat, ipData.lon];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My IP Details</h1>
        <p className="text-zinc-500">Detailed inspection of your current network connection.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Map Card */}
          <div className="h-[400px] rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] relative">
            <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <Marker position={position}>
                <Popup>
                  Approximate Location: <br /> {ipData.city}, {ipData.country}
                </Popup>
              </Marker>
              <ChangeView center={position} />
            </MapContainer>
            <div className="absolute bottom-4 left-4 z-[1000] right-4 bg-amber-500/90 text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              NOTICE: Geolocation is approximate and based on IP metadata. It does not represent your exact physical address.
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'IP Address', value: ipData.ip, icon: Globe },
              { label: 'ISP / Provider', value: ipData.isp, icon: Zap },
              { label: 'City', value: ipData.city, icon: MapPin },
              { label: 'Region', value: ipData.region, icon: MapPin },
              { label: 'Country', value: ipData.country, icon: Globe },
              { label: 'Timezone', value: ipData.timezone, icon: Clock },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 text-emerald-500">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Security Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">VPN Detected</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${ipData.vpn ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {ipData.vpn ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">Proxy Detected</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${ipData.proxy ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {ipData.proxy ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">Tor Exit Node</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${ipData.tor ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                  {ipData.tor ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              What is this?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This tool analyzes the public network information your browser shares when connecting to our servers. It helps you understand how you appear to the internet and verify if your VPN or privacy tools are working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
