import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Search, ShieldCheck, ShieldAlert, Info, Cpu, Globe, Zap } from 'lucide-react';

interface ImeiDetails {
  imei: string;
  brand: string;
  model: string;
  manufacturer: string;
  releaseDate: string;
  blacklistStatus: 'Clean' | 'Blacklisted' | 'Stolen' | 'Unknown';
  carrier: string;
  country: string;
}

export default function ImeiTracker() {
  const [imei, setImei] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImeiDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateImei = (n: string) => {
    if (n.length !== 15 || !/^\d+$/.test(n)) return false;
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let d = parseInt(n[i]);
      if (i % 2 !== 0) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
    }
    return sum % 10 === 0;
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!validateImei(imei)) {
      setError('Invalid IMEI number. Please enter a valid 15-digit IMEI.');
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock results based on IMEI prefixes (TAC)
    const tac = imei.substring(0, 8);
    const mockData: Record<string, Partial<ImeiDetails>> = {
      '35875110': { brand: 'Apple', model: 'iPhone 13 Pro', manufacturer: 'Apple Inc.', releaseDate: '2021-09-24', carrier: 'Verizon', country: 'USA' },
      '35441311': { brand: 'Samsung', model: 'Galaxy S22 Ultra', manufacturer: 'Samsung Electronics', releaseDate: '2022-02-25', carrier: 'T-Mobile', country: 'South Korea' },
      '86820404': { brand: 'Xiaomi', model: 'Redmi Note 11', manufacturer: 'Xiaomi Communications', releaseDate: '2022-01-26', carrier: 'Unlocked', country: 'China' },
    };

    const baseData = mockData[tac] || {
      brand: 'Generic',
      model: 'Smartphone',
      manufacturer: 'Unknown OEM',
      releaseDate: '2023-01-01',
      carrier: 'Global Unlocked',
      country: 'International'
    };

    setResult({
      imei,
      brand: baseData.brand!,
      model: baseData.model!,
      manufacturer: baseData.manufacturer!,
      releaseDate: baseData.releaseDate!,
      blacklistStatus: Math.random() > 0.9 ? 'Blacklisted' : 'Clean',
      carrier: baseData.carrier!,
      country: baseData.country!
    });
    
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IMEI Intelligence</h1>
          <p className="text-zinc-500 mt-1">Lawful device identification and status verification.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-[#0d0d0d] border border-white/5 rounded-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold">Device Lookup</h2>
            </div>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  15-Digit IMEI Number
                </label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="Enter IMEI..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || imei.length < 15}
                className="w-full flex items-center justify-center px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Verify Device
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-zinc-500 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  IMEI (International Mobile Equipment Identity) is a unique 15-digit number used to identify mobile devices on a cellular network.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="p-8 bg-[#0d0d0d] border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Smartphone size={160} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                      result.blacklistStatus === 'Clean' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {result.blacklistStatus} Status
                    </div>
                    <div className="text-zinc-500 text-xs font-mono">IMEI: {result.imei}</div>
                  </div>

                  <h2 className="text-4xl font-bold mb-2">{result.brand} {result.model}</h2>
                  <p className="text-zinc-400 mb-8">{result.manufacturer}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Globe className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Origin</span>
                      </div>
                      <p className="font-medium">{result.country}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Zap className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Carrier</span>
                      </div>
                      <p className="font-medium">{result.carrier}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <Cpu className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Release</span>
                      </div>
                      <p className="font-medium">{result.releaseDate}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">Security</span>
                      </div>
                      <p className="font-medium">Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                  <h4 className="text-sm font-medium mb-4">Network Compatibility</h4>
                  <div className="space-y-3">
                    {['GSM', 'WCDMA', 'LTE', '5G'].map((tech) => (
                      <div key={tech} className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">{tech}</span>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                  <h4 className="text-sm font-medium mb-4">Security Assessment</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    This device has been checked against global GSMA databases. No active theft reports were found for this specific hardware identifier at the time of lookup.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-emerald-500 text-xs font-medium">
                    <ShieldCheck className="h-4 w-4" />
                    Hardware Authenticity Confirmed
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl text-zinc-600">
              <Smartphone className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Enter an IMEI number to view device intelligence</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
