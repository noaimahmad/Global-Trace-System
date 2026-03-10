import React, { useState } from 'react';
import { AlertTriangle, Send, Shield, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function FraudReport() {
  const [formData, setFormData] = useState({
    category: 'phishing',
    indicator: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/fraud-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8"
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">Report Submitted</h2>
        <p className="text-zinc-400 max-w-md mb-8">
          Thank you for contributing to our threat intelligence. Our moderators will review your report and update our reputation database.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Fraud Report</h1>
        <p className="text-zinc-500">Report suspicious indicators to help protect the community.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50 transition-all"
                  >
                    <option value="phishing">Phishing Link</option>
                    <option value="scam_number">Scam Phone Number</option>
                    <option value="malicious_ip">Malicious IP</option>
                    <option value="impersonation">Impersonation Attempt</option>
                    <option value="other">Other Fraud</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Indicator Value</label>
                  <input
                    type="text"
                    value={formData.indicator}
                    onChange={(e) => setFormData({ ...formData, indicator: e.target.value })}
                    placeholder="URL, Phone, or IP"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Description & Evidence</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide details about the suspicious activity..."
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white outline-none focus:border-emerald-500/50 transition-all resize-none"
                  required
                />
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                <Info className="h-5 w-5 text-zinc-500 mt-0.5" />
                <p className="text-xs text-zinc-500 leading-relaxed">
                  By submitting this report, you confirm that the information provided is accurate to the best of your knowledge. False reporting may result in account restrictions.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-black/30 border-t-black animate-spin rounded-full" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
              Why Report?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              Your reports help us build a safer internet for everyone. When you report a malicious indicator, we:
            </p>
            <ul className="space-y-3">
              {[
                "Update our reputation database",
                "Alert other users in real-time",
                "Share data with security partners",
                "Block malicious traffic patterns"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-emerald-500">
              <Shield className="h-5 w-5" />
              Moderation Process
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every report is reviewed by our security team. We verify indicators against multiple sources before marking them as malicious in our system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
