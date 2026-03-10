import React, { useState } from 'react';
import { Search, Shield, AlertTriangle, CheckCircle2, Info, Globe, Link as LinkIcon, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ReputationChecker() {
  const [indicator, setIndicator] = useState('');
  const [type, setType] = useState('url');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check-reputation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indicator, type })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Check failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Reputation Checker</h1>
        <p className="text-zinc-500">Analyze URLs, domains, and IP addresses for security risks.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <form onSubmit={handleCheck} className="space-y-6">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                {['url', 'domain', 'ip'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      type === t ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  {type === 'url' ? 'Target URL' : type === 'domain' ? 'Domain Name' : 'IP Address'}
                </label>
                <div className="relative">
                  {type === 'url' ? <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" /> :
                   type === 'domain' ? <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" /> :
                   <Activity className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />}
                  <input
                    type="text"
                    value={indicator}
                    onChange={(e) => setIndicator(e.target.value)}
                    placeholder={type === 'url' ? 'https://example.com/path' : type === 'domain' ? 'example.com' : '8.8.8.8'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                ) : (
                  <>
                    <Search className="h-5 w-5" />
                    Analyze Indicator
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-500">
              <Shield className="h-5 w-5" />
              Threat Intelligence
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Our system cross-references indicators against multiple threat intelligence feeds and community blacklists to provide a comprehensive risk assessment.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Analysis Report</h3>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                    result.score > 70 ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    result.score > 30 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  }`}>
                    {result.summary}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.score}%` }}
                      className={`absolute h-full ${
                        result.score > 70 ? 'bg-red-500' :
                        result.score > 30 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 font-medium">
                    <span>LOW RISK</span>
                    <span>RISK SCORE: {result.score}/100</span>
                    <span>HIGH RISK</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-zinc-500 mb-1">Indicator Value</p>
                      <p className="font-mono text-sm truncate">{result.indicator}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs text-zinc-500 mb-1">Blacklist Hits</p>
                      <p className="font-bold text-lg">{result.hits} <span className="text-xs font-normal text-zinc-500">sources flagged this</span></p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <Info className="h-5 w-5 text-zinc-400 mt-0.5" />
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      This score is based on historical data and current threat patterns. A "Low Risk" score does not guarantee safety. Always exercise caution when visiting unknown links.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Search className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-400 mb-2">Ready for Analysis</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Enter a URL, domain, or IP address to perform a real-time reputation check.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
