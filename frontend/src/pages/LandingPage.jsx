import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, Users, Activity, CheckCircle, Sparkles, ArrowRight, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 selection:bg-clinic-500 selection:text-white">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-clinic-500 to-cyan-400 text-white shadow-lg shadow-clinic-500/20">
            <Eye className="w-5.5 h-5.5" />
          </div>
          <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 to-cyan-500 dark:from-clinic-400 dark:to-cyan-300">
            EyeFlow CRM
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-clinic-600 transition-colors">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2.5 text-sm font-extrabold text-white bg-clinic-500 rounded-xl hover:bg-clinic-600 shadow-md shadow-clinic-500/10 hover:shadow-lg transition-all hover:scale-105">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Modern Optometry Suite
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
          Manage your Eye Clinic or Optical Shop <span className="bg-clip-text text-transparent bg-gradient-to-r from-clinic-500 to-cyan-400">with Ease</span>.
        </h1>
        
        <p className="mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          EyeFlow CRM is the premium MERN-stack multi-tenant platform for patient medical files, visual acuity prescriptions, stock counts, invoicing, and laboratory order tracking.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
          <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-clinic-600 to-clinic-500 text-white rounded-2xl font-bold shadow-lg shadow-clinic-500/20 hover:shadow-xl hover:shadow-clinic-500/30 hover:scale-[1.03] transition-all flex items-center gap-2">
            Get Started (30-Day Free Trial)
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a href="#pricing" className="px-8 py-4 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            View Pricing
          </a>
        </div>
      </header>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900">
        <h2 className="text-3xl font-extrabold text-center mb-16">
          Everything your store needs to scale
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Tenant Isolation</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Completely isolated database storage blocks staff or patients from Store A from viewing records under Store B.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Refraction Prescriptions</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Track Right Eye (OD) and Left Eye (OS) Sphere, Cylinder, Axis, ADD, and PD parameters and compile instant prints.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover-scale">
            <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Inventory Alert Warnings</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Configure stock counts. Get real-time system dashboard notifications when frame or solutions fall below threshold values.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900 text-center">
        <h2 className="text-4xl font-extrabold">Simple, Predictable Plans</h2>
        <p className="mt-4 text-slate-500 dark:text-slate-400">All features unlocked. 30 days trial, cancel anytime.</p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-left relative flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-350">Monthly Pack</h3>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-bold">Standard</span>
              </div>
              <p className="text-4xl font-black mb-6">₹299<span className="text-base font-normal text-slate-500">/month</span></p>
              
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Unlimited patients & checkups</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Frame stock catalog with alerts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Lab order tracking tracker</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Dynamic invoices and bills</li>
              </ul>
            </div>
            <Link to="/signup?plan=monthly" className="w-full py-3 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-center rounded-xl font-extrabold hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>

          {/* Yearly Plan */}
          <div className="p-8 rounded-3xl border-2 border-clinic-500 bg-white dark:bg-slate-900/80 text-left relative flex flex-col justify-between shadow-xl shadow-clinic-500/5">
            <div className="absolute -top-3 right-6 bg-clinic-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" />
              Save 15%
            </div>
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-clinic-600 dark:text-clinic-400">Yearly Savings</h3>
                <span className="text-xs bg-clinic-50 dark:bg-clinic-950/40 text-clinic-600 px-3 py-1 rounded-full font-bold">Best Value</span>
              </div>
              <p className="text-4xl font-black mb-6">₹3,399<span className="text-base font-normal text-slate-500">/year</span></p>

              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Everything in Monthly Pack</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Priority laboratory updates</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> Platform Superadmin direct support</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-clinic-500" /> 1-year stability lock</li>
              </ul>
            </div>
            <Link to="/signup?plan=yearly" className="w-full py-3 bg-clinic-500 text-white text-center rounded-xl font-extrabold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/20">
              Claim Annual Pack
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 py-12 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
        <p>© 2026 EyeFlow CRM. Designed for Ophthalmology Clinics, Optical Stores & Eye Checkup Labs.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
