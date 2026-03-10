import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, ShieldCheck, Info, Search, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PhoneValidator() {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError('You must confirm ownership or authorization.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, consent: true })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Validation failed');
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Phone Validator</h1>
        <p className="text-zinc-500">Validate international phone number formats and metadata.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <form onSubmit={handleValidate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="consent" className="text-sm text-zinc-400 leading-relaxed">
                  I confirm that I own this phone number or I am explicitly authorized to verify its metadata. I understand this tool only provides syntax and public metadata validation.
                </label>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
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
                    Validate Metadata
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-amber-500">
              <ShieldCheck className="h-5 w-5" />
              Safety Notice
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This tool is for <strong>validation and metadata only</strong>. It cannot and will not reveal the real-time location, identity, or private messages of any individual. All checks are logged for security auditing.
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
                  <h3 className="text-xl font-bold">Validation Results</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${result.valid ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                    {result.valid ? 'VALID FORMAT' : 'INVALID FORMAT'}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-xs text-zinc-500 mb-1">E.164 Format</p>
                      <p className="font-mono text-emerald-400">{result.number}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-xs text-zinc-500 mb-1">Country</p>
                      <p className="font-medium">{result.country}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-xs text-zinc-500 mb-1">Line Type</p>
                      <p className="font-medium capitalize">{result.type}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5">
                      <p className="text-xs text-zinc-500 mb-1">Carrier</p>
                      <p className="font-medium">{result.carrier}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                    <p className="text-sm text-emerald-400/80 leading-relaxed">
                      The number follows international numbering plans for {result.country}. Carrier metadata is based on public allocation records.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Smartphone className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-400 mb-2">No Data to Display</h3>
                <p className="text-sm text-zinc-500 max-w-xs">
                  Enter a phone number and confirm authorization to see validation results.
                </p>
              </div>
            )}
          </AnimatePresence>

          <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-blue-500">
              <Info className="h-5 w-5" />
              How it works
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We use the Google libphonenumber library to parse and validate numbers against the latest international standards. This ensures your data is correctly formatted for global communications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
