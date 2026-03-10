import React, { useState, useEffect } from 'react';
import { Fingerprint, Shield, Info, AlertTriangle, Cpu, Monitor, Globe, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function BrowserFingerprint() {
  const [fingerprint, setFingerprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFingerprint = async () => {
      // Simulate a bit of processing delay for "analysis" feel
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let canvasHash = 'Not supported';
      
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("GlobalTrace, <canvas> 1.0", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("GlobalTrace, <canvas> 1.0", 4, 17);
        canvasHash = canvas.toDataURL().slice(-50); // Just a slice for display
      }

      const data = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
        deviceMemory: (navigator as any).deviceMemory || 'Unknown',
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        colorDepth: window.screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        doNotTrack: navigator.doNotTrack || 'Not set',
        cookiesEnabled: navigator.cookieEnabled ? 'Yes' : 'No',
        canvasHash: canvasHash,
        touchPoints: navigator.maxTouchPoints || 0,
        pdfViewer: (navigator as any).pdfViewerEnabled ? 'Yes' : 'No'
      };

      setFingerprint(data);
      setLoading(false);
    };

    getFingerprint();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <Fingerprint className="h-16 w-16 text-emerald-500 opacity-50" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">Analyzing Browser Identity...</h2>
        <p className="text-zinc-500">Extracting hardware and software identifiers.</p>
      </div>
    );
  }

  const details = [
    { label: 'User Agent', value: fingerprint.userAgent, icon: Globe, category: 'Software' },
    { label: 'Screen Resolution', value: fingerprint.screenResolution, icon: Monitor, category: 'Hardware' },
    { label: 'Hardware Cores', value: `${fingerprint.hardwareConcurrency} Cores`, icon: Cpu, category: 'Hardware' },
    { label: 'Device Memory', value: `${fingerprint.deviceMemory} GB (Approx)`, icon: Zap, category: 'Hardware' },
    { label: 'Timezone', value: fingerprint.timezone, icon: Clock, category: 'Context' },
    { label: 'Language', value: fingerprint.language, icon: Globe, category: 'Context' },
    { label: 'Platform', value: fingerprint.platform, icon: Monitor, category: 'Software' },
    { label: 'Canvas Fingerprint', value: fingerprint.canvasHash, icon: Fingerprint, category: 'Unique ID' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Browser Fingerprint</h1>
        <p className="text-zinc-500">Understand how your browser appears to websites and tracking scripts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Fingerprint className="h-48 w-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Fingerprint className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Device Identity Profile</h3>
                  <p className="text-sm text-zinc-500">Unique hardware and software combination</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {details.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <item.icon className="h-4 w-4 text-zinc-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{item.category}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">{item.label}</p>
                    <p className="text-sm font-medium truncate">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <h4 className="font-bold text-amber-500 mb-1">Tracking Awareness</h4>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Websites use these data points to create a "fingerprint" that can identify you even if you clear your cookies or use Incognito mode. The more unique your combination of hardware and software, the easier you are to track.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Privacy Status
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">Do Not Track</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${fingerprint.doNotTrack === '1' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-500/20 text-zinc-500'}`}>
                  {fingerprint.doNotTrack === '1' ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">Cookies Enabled</span>
                <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-500">
                  {fingerprint.cookiesEnabled}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                <span className="text-sm text-zinc-400">PDF Viewer</span>
                <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-500">
                  {fingerprint.pdfViewer}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-500">
              <Info className="h-5 w-5" />
              Fingerprinting Protection
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              To reduce your fingerprint uniqueness, consider using privacy-focused browsers like Brave or Firefox, or extensions that spoof hardware information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
