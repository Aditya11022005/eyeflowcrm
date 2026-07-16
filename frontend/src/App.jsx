import React, { useEffect } from 'react';
import { ExternalLink, ArrowRight, Sparkles } from 'lucide-react';

function App() {
  const targetUrl = "https://eyelitz-crm.vercel.app/";

  useEffect(() => {
    // Automatically redirect after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6 py-12 relative overflow-hidden font-sans text-slate-100 select-none">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-clinic-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-8 p-10 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-md relative z-10 shadow-2xl">
        {/* Animated Brand Glow */}
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-clinic-500/20 blur-xl rounded-full scale-90" />
            <div className="p-4 bg-gradient-to-tr from-clinic-500/10 to-indigo-500/10 rounded-2xl border border-clinic-500/30 text-clinic-400 relative z-10">
              <Sparkles className="w-10 h-10 animate-bounce" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            We Have Moved!
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Eyelitz CRM has migrated to a new, highly optimized server environment to serve you better.
          </p>
          <div className="p-4 bg-slate-950/50 border border-slate-800/60 rounded-2xl flex items-center justify-center gap-2.5">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">NEW URL:</span>
            <a 
              href={targetUrl}
              className="text-xs font-black text-clinic-400 hover:text-clinic-300 hover:underline transition-all flex items-center gap-1"
            >
              eyelitz-crm.vercel.app
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 animate-pulse">
            Redirecting you automatically in a few seconds...
          </p>
        </div>

        <div className="pt-2">
          <a
            href={targetUrl}
            className="w-full py-3.5 bg-gradient-to-r from-clinic-500 to-indigo-600 hover:from-clinic-600 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-clinic-500/15"
          >
            <span>Proceed to CRM</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest pointer-events-none">
        Eyelitz Visionary Solutions
      </div>
    </div>
  );
}

export default App;
