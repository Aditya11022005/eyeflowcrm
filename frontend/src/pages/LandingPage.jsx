import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Shield, Users, Activity, CheckCircle, Sparkles, ArrowRight, Zap, Award, FileText, Star, Quote } from 'lucide-react';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.svg';

const LandingPage = () => {
  const [packages, setPackages] = useState([
    {
      _id: 'default-monthly',
      name: 'Monthly Pack',
      price: 299,
      billingCycle: 'month',
      features: ['Unlimited patients & checkups', 'Frame stock catalog with alerts', 'Lab order tracking tracker', 'Dynamic invoices and bills'],
      badge: 'Standard'
    },
    {
      _id: 'default-yearly',
      name: 'Yearly Savings',
      price: 3399,
      billingCycle: 'year',
      features: ['Everything in Monthly Pack', 'Priority laboratory updates', 'Platform Superadmin direct support', '1-year stability lock'],
      badge: 'Best Value'
    }
  ]);

  const [announcement, setAnnouncement] = useState({
    text: '🎉 Eyelitz CRM v2.0 Released! Try it for free for 30 days. No credit card required.',
    bgColor: 'bg-clinic-500',
    textColor: 'text-white',
    active: true
  });

  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await api.get('/public/landing-data');
        if (res.data.success) {
          if (res.data.packages && res.data.packages.length > 0) {
            setPackages(res.data.packages);
          }
          // If there is no active announcement, set it to null
          setAnnouncement(res.data.announcement || null);
          setTestimonials(res.data.testimonials || []);
        }
      } catch (err) {
        console.error('Error loading dynamic landing data:', err);
      }
    };
    fetchLandingData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 selection:bg-clinic-500 selection:text-white flex flex-col justify-between">
      <div>
        {/* Announcement Banner */}
        {announcement && announcement.active && (
          <div className={`py-3 px-4 text-center text-xs font-black ${announcement.bgColor || 'bg-clinic-500'} ${announcement.textColor || 'text-white'} transition-all`}>
            {announcement.link ? (
              <a href={announcement.link} className="hover:underline inline-flex items-center justify-center gap-1.5">
                {announcement.text}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span>{announcement.text}</span>
            )}
          </div>
        )}

        {/* Navbar */}
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center">
            <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-24 h-24 object-contain" />
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
            Eyelitz CRM is the premium MERN-stack multi-tenant platform for patient medical files, visual acuity prescriptions, stock counts, invoicing, and laboratory order tracking.
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

        {/* Platform Statistics Bar */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-900/40 text-center hover-scale hover:shadow-xl hover:shadow-clinic-500/5 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 to-cyan-500 dark:from-clinic-450 dark:to-cyan-400">
                10+
              </p>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                Active Clinics & Stores
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trusted by leading opticians and doctors.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-900/40 text-center hover-scale hover:shadow-xl hover:shadow-clinic-500/5 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 flex items-center justify-center mb-6">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 to-cyan-500 dark:from-clinic-450 dark:to-cyan-400">
                2,500+
              </p>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                Patients Managed
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fully isolated records with high data privacy.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-900/40 text-center hover-scale hover:shadow-xl hover:shadow-clinic-500/5 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 to-cyan-500 dark:from-clinic-450 dark:to-cyan-400">
                4,800+
              </p>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                Prescriptions Compiled
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Spheres, cylinders, axis, and PD values tracked.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-900/40 text-center hover-scale hover:shadow-xl hover:shadow-clinic-500/5 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-clinic-600 to-cyan-500 dark:from-clinic-450 dark:to-cyan-400">
                99.9%
              </p>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                System Uptime
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Ensuring uninterrupted clinical operations.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Table */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900 text-center">
          <h2 className="text-4xl font-extrabold">Simple, Predictable Plans</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">All features unlocked. 30 days trial, cancel anytime.</p>

          <div className={`mt-16 grid grid-cols-1 ${packages.length === 1 ? 'max-w-md' : packages.length === 2 ? 'max-w-4xl md:grid-cols-2' : 'max-w-6xl md:grid-cols-3'} gap-8 mx-auto`}>
            {packages.map((pkg) => {
              const isYearly = pkg.billingCycle === 'year';
              return (
                <div 
                  key={pkg._id} 
                  className={`p-8 rounded-3xl text-left relative flex flex-col justify-between transition-all ${
                    isYearly 
                      ? 'border-2 border-clinic-500 bg-white dark:bg-slate-900/80 shadow-xl shadow-clinic-500/5' 
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40'
                  }`}
                >
                  {pkg.badge && (
                    <div className={`absolute -top-3 right-6 ${isYearly ? 'bg-clinic-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-350'} text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                      {isYearly && <Zap className="w-3 h-3 fill-white" />}
                      {pkg.badge}
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold ${isYearly ? 'text-clinic-600 dark:text-clinic-400' : 'text-slate-700 dark:text-slate-350'}`}>
                        {pkg.name}
                      </h3>
                    </div>
                    <p className="text-4xl font-black mb-6">
                      ₹{pkg.price.toLocaleString('en-IN')}
                      <span className="text-base font-normal text-slate-500">/{pkg.billingCycle === 'year' ? 'year' : 'month'}</span>
                    </p>
                    
                    <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400 mb-8">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-clinic-500 shrink-0" /> 
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link 
                    to={`/signup?plan=${pkg.billingCycle}`} 
                    className={`w-full py-3 text-center rounded-xl font-extrabold transition-all ${
                      isYearly 
                        ? 'bg-clinic-500 text-white hover:bg-clinic-600 shadow-md shadow-clinic-500/20 shadow-clinic-500/10' 
                        : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90'
                    }`}
                  >
                    {isYearly ? 'Claim Annual Pack' : 'Get Started'}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-100 dark:border-slate-900">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-4">
                <Quote className="w-3.5 h-3.5 fill-clinic-500/10" />
                What Clinicians Say
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
                Trusted by Hundreds of Eye Care Professionals
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div 
                  key={t._id || idx} 
                  className="p-8 rounded-3xl border border-slate-150 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:border-clinic-500 dark:hover:border-clinic-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-clinic-500/5 flex flex-col justify-between group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-4">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-650 dark:text-slate-350 text-sm leading-relaxed mb-6 italic">
                      "{t.text}"
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-clinic-500 to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-clinic-500/10">
                      {t.avatar || (t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C')}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-150 group-hover:text-clinic-500 dark:group-hover:text-clinic-400 transition-colors">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-450 dark:text-slate-400 font-semibold">
                        {t.role} — <span className="text-clinic-600 dark:text-clinic-400">{t.clinic}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 py-12 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 w-full flex flex-col items-center justify-center gap-4">
        <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-24 h-24 object-contain" />
        <p>© 2026 Eyelitz CRM. Designed for Ophthalmology Clinics, Optical Stores & Eye Checkup Labs.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
