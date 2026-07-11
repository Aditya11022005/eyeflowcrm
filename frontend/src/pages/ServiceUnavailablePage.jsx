import React from 'react';
import { RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import error404Vector from '../assets/error_404_vector.png';

const ServiceUnavailablePage = () => {
  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#ffffff] via-[#f0f7ff] to-[#e6edff] px-6 lg:px-16 py-12 relative overflow-hidden font-sans">
      {/* Background decorative glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-clinic-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[60%] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column: Typography and Call-To-Actions */}
        <div className="lg:col-span-6 text-left space-y-6 order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-extrabold shadow-sm">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>OFFLINE STATUS DETECTED</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-none">
              Service <br className="hidden md:inline" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 via-indigo-600 to-purple-600">
                Unavailable
              </span>
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-md font-medium">
              Service not available right now. Please try again later.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 max-w-sm">
            <button
              onClick={handleRetry}
              className="px-6 py-3.5 bg-clinic-500 hover:bg-clinic-600 hover:scale-102 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-clinic-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <Link
              to="/"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 hover:scale-102 active:scale-98 text-slate-700 hover:text-slate-900 text-xs font-black rounded-xl transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Homepage</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Beautiful Flat Vector Illustration */}
        <div className="lg:col-span-6 flex justify-center items-center order-1 lg:order-2">
          <div className="relative group">
            {/* Visual glow behind the illustration */}
            <div className="absolute inset-0 bg-clinic-500/5 blur-3xl rounded-full opacity-60 group-hover:opacity-85 transition-opacity duration-500" />
            <img 
              src={error404Vector} 
              alt="Service Unavailable Vector Illustration" 
              className="w-full max-w-md lg:max-w-lg h-auto object-contain relative z-10 drop-shadow-[0_8px_30px_rgba(0,0,0,0.12)] transform group-hover:scale-102 transition-all duration-500 rounded-3xl" 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ServiceUnavailablePage;
