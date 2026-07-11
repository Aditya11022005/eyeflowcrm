import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Shield, Users, Activity, CheckCircle, Sparkles, ArrowRight, Zap, 
  Award, FileText, Star, Quote, ChevronDown, Check, ShieldAlert, 
  RotateCcw, DollarSign, Clock, LayoutGrid, Calendar, HelpCircle, 
  Flame, TrendingUp, Laptop, Printer, Menu, X, Glasses
} from 'lucide-react';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';
import eyeglassesMockup from '../assets/eyeglasses_mockup.png';
import opticalStoreBg from '../assets/optical_store_bg.png';

const LandingPage = () => {
  const [packages, setPackages] = useState([
    {
      _id: 'default-monthly',
      name: 'Monthly Pack',
      price: 299,
      billingCycle: 'month',
      features: [
        'Unlimited patients & checkups', 
        'Frame stock catalog with alerts', 
        'Lab order tracking tracker', 
        'Dynamic invoices and bills'
      ],
      badge: 'Standard'
    },
    {
      _id: 'default-yearly',
      name: 'Yearly Savings',
      price: 3399,
      billingCycle: 'year',
      features: [
        'Everything in Monthly Pack', 
        'Priority laboratory updates', 
        'Platform Superadmin direct support', 
        '1-year stability lock',
        'Save 15% overall'
      ],
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
  const [billingCycle, setBillingCycle] = useState('month'); // 'month' or 'year'

  // Scroll detection for sticky header glassmorphism
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch dynamic backend data if available
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const res = await api.get('/public/landing-data');
        if (res.data.success) {
          if (res.data.packages && res.data.packages.length > 0) {
            setPackages(res.data.packages);
          }
          if (res.data.announcement) {
            setAnnouncement(res.data.announcement);
          }
          if (res.data.testimonials && res.data.testimonials.length > 0) {
            setTestimonials(res.data.testimonials);
          }
        }
      } catch (err) {
        console.error('Error loading dynamic landing data:', err);
      }
    };
    fetchLandingData();
  }, []);

  // Default fallback testimonials for rich visual layout if database is empty
  const displayTestimonials = testimonials.length > 0 ? testimonials : [
    {
      _id: 't1',
      name: 'Dr. Ananya Sharma',
      role: 'Chief Optometrist',
      clinic: 'Nayan Eye Care Centre',
      rating: 5,
      text: 'Eyelitz CRM has completely revolutionized how we track checkups. Writing refraction parameters on paper is history. The prints are extremely professional!'
    },
    {
      _id: 't2',
      name: 'Rajesh Mehta',
      role: 'Owner',
      clinic: 'Imperial Optical Stores',
      rating: 5,
      text: 'The inventory notifications are a lifesaver. We used to run out of popular contact lenses, but now the auto-alerts tell us exactly when and what to reorder.'
    },
    {
      _id: 't3',
      name: 'Dr. Vikram Sen',
      role: 'Ophthalmologist',
      clinic: 'Vision & Retina Clinic',
      rating: 5,
      text: 'Multi-tenant security was a major requirement for our multiple franchise stores. Eyelitz guarantees that data from one branch is strictly invisible to the others.'
    }
  ];

  // ----------------------------------------------------
  // Interactive State 1: Refraction Card Virtualization
  // ----------------------------------------------------
  const [rxEye, setRxEye] = useState('OD'); // OD (Right) or OS (Left)
  const [rxPrinted, setRxPrinted] = useState(false);

  const mockPrescription = {
    OD: { sphere: '-2.50', cylinder: '-0.75', axis: '180', add: '+1.50', pd: '31.5' },
    OS: { sphere: '-2.75', cylinder: '-0.50', axis: '175', add: '+1.50', pd: '32.0' }
  };

  // ----------------------------------------------------
  // Interactive State 2: Smart Inventory alert Widget
  // ----------------------------------------------------
  const [inventoryCount, setInventoryCount] = useState(5);
  const handleSellPair = () => {
    if (inventoryCount > 0) {
      setInventoryCount(prev => prev - 1);
    }
  };
  const handleRestock = () => {
    setInventoryCount(5);
  };

  // ----------------------------------------------------
  // Interactive State 3: Lab Order Pipeline simulation
  // ----------------------------------------------------
  const [labStage, setLabStage] = useState(0);
  const labStages = [
    { name: 'Intake', desc: 'Order logged & frame received' },
    { name: 'Lens Selection', desc: 'Sourcing organic lenses' },
    { name: 'Grinding', desc: 'Precision lathing to vision specs' },
    { name: 'Fitting', desc: 'Mounting lens in frame' },
    { name: 'Dispatched', desc: 'Quality checked & ready' }
  ];
  const handleNextLabStage = () => {
    setLabStage(prev => (prev + 1) % labStages.length);
  };

  // ----------------------------------------------------
  // Interactive State 4: Secure Lock Simulation
  // ----------------------------------------------------
  const [tenantQuery, setTenantQuery] = useState(null); // 'idle', 'requesting', 'blocked', 'allowed'
  const simulateTenantQuery = (actionType) => {
    setTenantQuery('requesting');
    setTimeout(() => {
      if (actionType === 'cross') {
        setTenantQuery('blocked');
      } else {
        setTenantQuery('allowed');
      }
    }, 1200);
  };

  // Active Simulator Tab state
  const [activeSimulatorTab, setActiveSimulatorTab] = useState('refraction');

  // ----------------------------------------------------
  // Interactive State 5: ROI Calculator
  // ----------------------------------------------------
  const [patientsPerMonth, setPatientsPerMonth] = useState(150);
  const [billingRate, setBillingRate] = useState(800);
  const [hoursWasted, setHoursWasted] = useState(3);

  // Calculations
  const hoursSavedPerMonth = hoursWasted * 22; // 22 working days
  const timeValueSaved = hoursSavedPerMonth * 300; // estimated ₹300/hour staff rate
  const revenueLeakPrevented = Math.round(patientsPerMonth * (billingRate * 0.04)); // assuming 4% billing correction from paper errors
  const monthlySavings = timeValueSaved + revenueLeakPrevented;
  const annualSavings = monthlySavings * 12;

  // ----------------------------------------------------
  // Interactive State 6: FAQ Accordion
  // ----------------------------------------------------
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
    {
      q: "How does the multi-tenant database keep my store's records safe?",
      a: "Eyelitz CRM uses secure logical data partition locks. Every database query is automatically scoped with your clinic's unique Tenant ID, guaranteeing that staff or patients from Store A can never access or view files belonging to Store B."
    },
    {
      q: "Can I print visual acuity prescriptions for patients directly?",
      a: "Absolutely. Once refraction checkup fields (Sphere, Cylinder, Axis, ADD, PD) are saved, you can print a beautifully styled vision Rx card with a single click. You can also print customized invoices."
    },
    {
      q: "Does the system support frame inventory counts and low stock warnings?",
      a: "Yes. You can manage your frame catalogue, brand tags, and contact lenses. You can configure safety thresholds for each item so that the system shows warning badges and dashboard alerts when counts run low."
    },
    {
      q: "Can we track lab jobs when frames are sent for lens fitting?",
      a: "Yes, Eyelitz has a dedicated Job Card tracker. You can set the order status (e.g., In Lab, Lens Grinding, Fitted, Ready for Delivery) and record custom lab notes. This keeps your front-desk staff informed when patients call."
    },
    {
      q: "Is there a setup cost or credit card requirement for the trial?",
      a: "None at all. You can sign up in 30 seconds and use Eyelitz completely free for 30 days. No credit card is required. If you decide to continue, plans start at just ₹299/month."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070b15] text-slate-100 selection:bg-clinic-500 selection:text-white flex flex-col justify-between scroll-smooth relative overflow-x-clip font-sans">
      
      {/* Radial ambient background glows */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[50%] rounded-full bg-clinic-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-15%] w-[50%] h-[55%] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[5%] left-[5%] w-[45%] h-[45%] rounded-full bg-indigo-500/8 blur-[120px] pointer-events-none z-0" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none z-0" />

      <div className="relative z-10 w-full">
        {/* Announcement Banner */}
        {announcement && announcement.active && (
          <div className={`py-2.5 px-4 text-center text-xs font-semibold ${announcement.bgColor || 'bg-clinic-500'} ${announcement.textColor || 'text-white'} transition-all shadow-md relative z-50`}>
            {announcement.link ? (
              <a href={announcement.link} className="hover:underline inline-flex items-center justify-center gap-1.5 transition-colors">
                {announcement.text}
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </a>
            ) : (
              <span>{announcement.text}</span>
            )}
          </div>
        )}

        {/* Sticky Header Glassmorphic */}
        <nav className={`sticky top-0 z-40 transition-all duration-300 w-full ${
          isScrolled || mobileMenuOpen
            ? 'bg-slate-950/85 backdrop-blur-lg border-b border-slate-800/80 py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
            : 'bg-transparent py-4'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center group">
              <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-36 md:w-44 h-10 md:h-12 object-contain group-hover:scale-102 transition-all duration-300" />
            </Link>

            {/* Navigation links with modern icons */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-350">
              <a href="#features" className="hover:text-clinic-400 transition-colors flex items-center gap-1.5 group/link">
                <LayoutGrid className="w-4 h-4 text-clinic-500 shrink-0 group-hover/link:rotate-6 transition-transform" />
                <span>Features</span>
              </a>
              <a href="#simulator" className="hover:text-clinic-400 transition-colors flex items-center gap-1.5 group/link">
                <Laptop className="w-4 h-4 text-clinic-500 shrink-0 group-hover/link:scale-110 transition-transform" />
                <span>Live Demo</span>
              </a>
              <a href="#roi" className="hover:text-clinic-400 transition-colors flex items-center gap-1.5 group/link">
                <TrendingUp className="w-4 h-4 text-clinic-500 shrink-0 group-hover/link:translate-y-[-2px] transition-transform" />
                <span>Calculator</span>
              </a>
              <a href="#pricing" className="hover:text-clinic-400 transition-colors flex items-center gap-1.5 group/link">
                <DollarSign className="w-4 h-4 text-clinic-500 shrink-0 group-hover/link:scale-110 transition-transform" />
                <span>Pricing</span>
              </a>
              <a href="#faqs" className="hover:text-clinic-400 transition-colors flex items-center gap-1.5 group/link">
                <HelpCircle className="w-4 h-4 text-clinic-500 shrink-0 group-hover/link:rotate-12 transition-transform" />
                <span>FAQs</span>
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-clinic-400 transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="relative group overflow-hidden px-6 py-2.5 text-sm font-extrabold text-white bg-clinic-500 hover:bg-clinic-600 rounded-xl shadow-lg shadow-clinic-500/20 hover:shadow-xl hover:shadow-clinic-500/30 transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10">Start Free Trial</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-clinic-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>

            {/* Mobile menu toggle button */}
            <div className="flex md:hidden items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-clinic-400" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden w-full bg-slate-950/95 backdrop-blur-md border-t border-slate-900/60 overflow-hidden"
              >
                <div className="px-6 py-5 flex flex-col gap-4.5 text-sm font-semibold text-slate-300">
                  <a 
                    href="#features" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-clinic-400 py-2.5 transition-colors border-b border-slate-900/60 flex items-center gap-3"
                  >
                    <LayoutGrid className="w-4.5 h-4.5 text-clinic-500" />
                    <span>Features</span>
                  </a>
                  <a 
                    href="#simulator" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-clinic-400 py-2.5 transition-colors border-b border-slate-900/60 flex items-center gap-3"
                  >
                    <Laptop className="w-4.5 h-4.5 text-clinic-500" />
                    <span>Live Demo</span>
                  </a>
                  <a 
                    href="#roi" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-clinic-400 py-2.5 transition-colors border-b border-slate-900/60 flex items-center gap-3"
                  >
                    <TrendingUp className="w-4.5 h-4.5 text-clinic-500" />
                    <span>Calculator</span>
                  </a>
                  <a 
                    href="#pricing" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-clinic-400 py-2.5 transition-colors border-b border-slate-900/60 flex items-center gap-3"
                  >
                    <DollarSign className="w-4.5 h-4.5 text-clinic-500" />
                    <span>Pricing</span>
                  </a>
                  <a 
                    href="#faqs" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-clinic-400 py-2.5 transition-colors border-b border-slate-900/60 flex items-center gap-3"
                  >
                    <HelpCircle className="w-4.5 h-4.5 text-clinic-500" />
                    <span>FAQs</span>
                  </a>
                  <div className="flex flex-col gap-3 pt-3">
                    <Link 
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 font-bold transition-all"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl bg-clinic-500 text-white font-extrabold shadow-md hover:bg-clinic-600 transition-all"
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Hero Section Redesign */}
        <section className="max-w-7xl mx-auto px-6 pt-6 md:pt-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Premium Text content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-clinic-400 text-xs font-bold shadow-inner backdrop-blur-sm"
            >
              <Sparkles className="w-4.5 h-4.5 text-clinic-400 animate-spin-slow" />
              <span>THE FUTURE OF OPTICAL CARE CLINICS & RETAIL</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.12]"
            >
              Streamline Visual Diagnostics & 
              <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-clinic-500 via-cyan-300 to-purple-400">
                Frame Stock Workflows
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-lg text-slate-350 max-w-2xl leading-relaxed font-medium"
            >
              Say goodbye to paper refraction charts. Eyelitz CRM organizes visual acuity records, automatically prints vision Rx cards, regulates frame inventory warnings, and notifies lab partners on job cards instantly.
            </motion.p>

            {/* Glowing CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4.5 pt-4"
            >
              <Link 
                to="/signup" 
                className="group relative overflow-hidden px-8 py-4 rounded-2xl bg-clinic-500 text-white font-extrabold text-center transition-all shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)] hover:scale-102 active:scale-98"
              >
                <span className="relative z-10 flex items-center justify-center gap-2.5">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-clinic-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <a 
                href="#simulator" 
                className="px-8 py-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-850/80 text-slate-200 font-bold text-center transition-all backdrop-blur-sm flex items-center justify-center gap-2 group"
              >
                <Laptop className="w-5 h-5 text-clinic-500 group-hover:scale-110 transition-transform" />
                <span>Try Live Simulator</span>
              </a>
            </motion.div>

            {/* Micro Feature Icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 pt-8 border-t border-slate-900/80 max-w-xl text-xs font-semibold text-slate-400"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>30-Day Free Trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant Online Setup</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Eyeglasses (Chashma) Graphic with Floating Widgets */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            
            {/* Background glowing halo */}
            <div className="absolute inset-0 bg-gradient-to-r from-clinic-500/20 to-purple-600/20 rounded-full blur-[70px] pointer-events-none scale-90" />

            {/* Main Eyeglasses Showcase Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/40 p-4 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-md overflow-hidden aspect-[4/3] flex items-center justify-center group"
            >
              <img 
                src={eyeglassesMockup} 
                alt="Premium glasses frame display" 
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
              />
              
              {/* Outer grid glass highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            </motion.div>

            {/* Floating Live Diagnostic Checkup Card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="absolute -top-6 -right-4 md:-right-6 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-[210px] select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-clinic-500/10 text-clinic-400 flex items-center justify-center shrink-0">
                <Glasses className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">VISION DIAGNOSTIC</p>
                <p className="text-xs font-black text-white">SPH: -2.50 | CYL: -0.75</p>
              </div>
            </motion.div>

            {/* Floating Live Barcode Status Card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 0.3 }}
              className="absolute -bottom-8 -left-4 md:-left-8 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-3 max-w-[220px] select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">CATALOG SYSTEM</p>
                <p className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  Low Stock alerts: ON
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Cards Grid Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/50 relative">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">DESIGNED FOR OPTICIANS</h2>
            <p className="text-3xl md:text-5xl font-black text-white">Full-Featured Core Engine</p>
            <p className="text-slate-450 font-medium">Everything your optical business needs, locked in a secure multi-tenant environment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/30 transition-all flex flex-col justify-between backdrop-blur-sm group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-clinic-500/10 text-clinic-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <Glasses className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white text-left">Clinical Refraction</h3>
                <p className="text-sm text-slate-400 text-left leading-relaxed">
                  Log vision checkup parameters (SPH, CYL, AXIS, ADD, PD) separately for left/right eye. Copy previous checks with one click.
                </p>
              </div>
              <div className="pt-6 flex items-center text-xs font-bold text-clinic-400 gap-1.5 cursor-pointer">
                <span>Vision Acuity System</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/30 transition-all flex flex-col justify-between backdrop-blur-sm group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-clinic-500/10 text-clinic-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white text-left">Frame Stock Alerts</h3>
                <p className="text-sm text-slate-400 text-left leading-relaxed">
                  Catalog frame models, brand tags, and colors. Low safety counts trigger warning alerts to ensure you never run out of inventory.
                </p>
              </div>
              <div className="pt-6 flex items-center text-xs font-bold text-clinic-400 gap-1.5 cursor-pointer">
                <span>Inventory Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/30 transition-all flex flex-col justify-between backdrop-blur-sm group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-clinic-500/10 text-clinic-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white text-left">Lab Dispatch logs</h3>
                <p className="text-sm text-slate-400 text-left leading-relaxed">
                  Send job orders directly to lab partners. Track grinding/fitting stages and trigger automated Whatsapp, SMS & email updates.
                </p>
              </div>
              <div className="pt-6 flex items-center text-xs font-bold text-clinic-400 gap-1.5 cursor-pointer">
                <span>Job Card Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              whileHover={{ y: -6 }}
              className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-slate-800/80 hover:bg-slate-900/30 transition-all flex flex-col justify-between backdrop-blur-sm group"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-clinic-500/10 text-clinic-400 flex items-center justify-center transition-transform group-hover:scale-110 duration-300">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white text-left">Secure Multi-Tenant</h3>
                <p className="text-sm text-slate-400 text-left leading-relaxed">
                  Strict logical data isolation guarantees your patient details, visual checkups, and sales ledgers are strictly invisible to other tenants.
                </p>
              </div>
              <div className="pt-6 flex items-center text-xs font-bold text-clinic-400 gap-1.5 cursor-pointer">
                <span>Tenant Isolation</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* Live Simulator Section */}
        <section id="simulator" className="max-w-6xl mx-auto px-6 py-20 relative">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-14 font-sans">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">LIVE OPTICAL SIMULATOR</h2>
            <p className="text-3xl md:text-4xl font-black text-white">Experience the Software Core</p>
            <p className="text-slate-400 text-sm">Interact with our live features directly to see how Eyelitz automates optical records.</p>
          </div>

          {/* Interactive Shell */}
          <div className="bg-slate-950/50 border border-slate-800/85 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Column: Tab Selectors */}
            <div className="lg:col-span-4 bg-slate-950/80 p-6 border-b lg:border-b-0 lg:border-r border-slate-900 flex flex-col gap-3">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 text-left">SIMULATOR CONTROLS</p>
              
              <button 
                onClick={() => setActiveSimulatorTab('refraction')}
                className={`w-full p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                  activeSimulatorTab === 'refraction' 
                    ? 'bg-clinic-500/10 border border-clinic-500/20 text-clinic-400 shadow-inner' 
                    : 'bg-slate-900/30 border border-transparent text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <Glasses className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Refraction specs</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Toggle visual checkups diagnostics</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveSimulatorTab('inventory')}
                className={`w-full p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                  activeSimulatorTab === 'inventory' 
                    ? 'bg-clinic-500/10 border border-clinic-500/20 text-clinic-400 shadow-inner' 
                    : 'bg-slate-900/30 border border-transparent text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <LayoutGrid className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Safety Stock alerts</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Test low count catalog triggers</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveSimulatorTab('lab')}
                className={`w-full p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                  activeSimulatorTab === 'lab' 
                    ? 'bg-clinic-500/10 border border-clinic-500/20 text-clinic-400 shadow-inner' 
                    : 'bg-slate-900/30 border border-transparent text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <Zap className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Lab Job Card pipeline</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Advance stages of frame fittings</p>
                </div>
              </button>

              <button 
                onClick={() => setActiveSimulatorTab('tenant')}
                className={`w-full p-4 rounded-xl flex items-center gap-3.5 transition-all text-left ${
                  activeSimulatorTab === 'tenant' 
                    ? 'bg-clinic-500/10 border border-clinic-500/20 text-clinic-400 shadow-inner' 
                    : 'bg-slate-900/30 border border-transparent text-slate-400 hover:bg-slate-900/60'
                }`}
              >
                <Shield className="w-5 h-5 shrink-0" />
                <div>
                  <p className="text-sm font-bold">Tenant Logical isolation</p>
                  <p className="text-[10px] text-slate-455 mt-0.5">Simulate franchise security blocks</p>
                </div>
              </button>
            </div>

            {/* Right Column: Dynamic Display Screen */}
            <div className="lg:col-span-8 p-8 flex items-center justify-center bg-slate-950/20 relative min-h-[350px]">
              
              <AnimatePresence mode="wait">
                
                {/* Refraction Simulator Screen */}
                {activeSimulatorTab === 'refraction' && (
                  <motion.div 
                    key="refraction"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-md space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Glasses className="w-5 h-5 text-clinic-500" />
                        <span className="text-sm font-black text-white">Visual Prescription Logger</span>
                      </div>
                      <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 text-[10px]">
                        <button 
                          onClick={() => setRxEye('OD')}
                          className={`px-3 py-1 font-extrabold rounded-md transition-all ${rxEye === 'OD' ? 'bg-clinic-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          Right Eye (OD)
                        </button>
                        <button 
                          onClick={() => setRxEye('OS')}
                          className={`px-3 py-1 font-extrabold rounded-md transition-all ${rxEye === 'OS' ? 'bg-clinic-500 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          Left Eye (OS)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-450 block">SPHERE</span>
                        <span className="text-base font-black text-white">{mockPrescription[rxEye].sphere}</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-455 block">CYLINDER</span>
                        <span className="text-base font-black text-white">{mockPrescription[rxEye].cylinder}</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-455 block">AXIS</span>
                        <span className="text-base font-black text-white">{mockPrescription[rxEye].axis}°</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-455 block">ADD</span>
                        <span className="text-base font-black text-white">{mockPrescription[rxEye].add}</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-455 block">P.D.</span>
                        <span className="text-base font-black text-white">{mockPrescription[rxEye].pd} mm</span>
                      </div>
                      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-center">
                        <span className="text-xs font-black text-emerald-500">20/20 Specs</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setRxPrinted(true);
                          setTimeout(() => setRxPrinted(false), 2000);
                        }}
                        className="flex-1 py-3 px-4 bg-clinic-500 hover:bg-clinic-600 active:scale-98 font-bold text-white text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-clinic-500/10"
                      >
                        <Printer className="w-4.5 h-4.5 shrink-0" />
                        <span>Print Rx Vision Card</span>
                      </button>
                      <button 
                        onClick={() => alert("Refraction parameters successfully copied from the patient's previous checkup! (Simulator)")}
                        className="py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-slate-300 text-xs rounded-xl transition-all"
                      >
                        Copy Previous
                      </button>
                    </div>

                    {rxPrinted && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 animate-bounce" />
                        <span>Print document generated! Sent successfully to optical lab partner.</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Inventory Simulator Screen */}
                {activeSimulatorTab === 'inventory' && (
                  <motion.div 
                    key="inventory"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-md space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-clinic-500" />
                        <span className="text-sm font-black text-white">Safety Stock Alerts</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">SKU: LE-AVIATOR-99</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                      <div>
                        <p className="text-base font-black text-white">Ray-Ban Aviator (Gold Frame)</p>
                        <p className="text-xs text-slate-400 mt-1">Safety stock trigger threshold: <strong className="text-amber-400">3 units</strong></p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-500">CURRENT STOCK</p>
                        <p className={`text-3xl font-black ${inventoryCount < 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                          {inventoryCount}
                        </p>
                      </div>
                    </div>

                    {inventoryCount < 3 ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-2.5 animate-pulse">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-450 mt-0.5" />
                        <div>
                          <p>CRITICAL STOCK WARNING</p>
                          <p className="text-[10px] text-rose-300 font-medium mt-1">Aviator frame counts have dropped below threshold. Auto alert notification dispatched.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2.5">
                        <CheckCircle className="w-5 h-5 shrink-0 text-emerald-450" />
                        <span>Inventory status safe. Count satisfies minimum buffer requirements.</span>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={handleSellPair}
                        disabled={inventoryCount === 0}
                        className="flex-1 py-3 px-4 bg-clinic-500 hover:bg-clinic-600 disabled:opacity-50 active:scale-98 font-bold text-white text-xs rounded-xl transition-all"
                      >
                        Sell 1 Frame (Simulate checkout)
                      </button>
                      <button 
                        onClick={handleRestock}
                        className="py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-slate-350 text-xs rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restock</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Lab Tracker Simulator Screen */}
                {activeSimulatorTab === 'lab' && (
                  <motion.div 
                    key="lab"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-md space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-clinic-500" />
                        <span className="text-sm font-black text-white">Job Card Dispatch Tracker</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">ORDER: ORD-260708-6517</span>
                    </div>

                    {/* Progress dots */}
                    <div className="flex items-center justify-between relative px-2">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-900 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-0 h-1 bg-clinic-500 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${(labStage / (labStages.length - 1)) * 100}%` }}
                      />
                      
                      {labStages.map((stage, idx) => (
                        <div 
                          key={stage.name}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 transition-all ${
                            idx <= labStage 
                              ? 'bg-clinic-500 text-white shadow-lg shadow-clinic-500/20 scale-110' 
                              : 'bg-slate-900 text-slate-550 border border-slate-800'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>

                    <div className="p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">ACTIVE LAB PROCESS</p>
                        <span className="px-2.5 py-0.5 rounded-full bg-clinic-500/10 text-clinic-400 text-[10px] font-extrabold border border-clinic-500/20">
                          {labStages[labStage].name}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mt-2">{labStages[labStage].desc}</p>
                      <p className="text-[10px] text-slate-450 mt-1">Automatic direct status alert sent to patient & lab partner via Whatsapp API.</p>
                    </div>

                    <button 
                      onClick={handleNextLabStage}
                      className="w-full py-3 px-4 bg-clinic-500 hover:bg-clinic-600 active:scale-98 font-bold text-white text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-clinic-500/10"
                    >
                      <span>Advance Pipeline Stage</span>
                      <ArrowRight className="w-4.5 h-4.5" />
                    </button>
                  </motion.div>
                )}

                {/* Tenant Simulator Screen */}
                {activeSimulatorTab === 'tenant' && (
                  <motion.div 
                    key="tenant"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-md space-y-6 text-left"
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-clinic-500" />
                        <span className="text-sm font-black text-white">Multi-Tenant logical Privacy simulation</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 block">CURRENT SESSION</span>
                        <span className="text-xs font-black text-white">Authorized Franchise Store A</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                        <span className="text-[9px] uppercase tracking-widest font-extrabold text-slate-500 block">DB QUERY SCOPE</span>
                        <span className="text-xs font-black text-clinic-400 font-mono">WHERE tenantId = "TENANT-001"</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => simulateTenantQuery('same')}
                        className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-slate-200 text-xs rounded-xl transition-all"
                      >
                        Request Store A patient details
                      </button>
                      <button 
                        onClick={() => simulateTenantQuery('cross')}
                        className="flex-1 py-3 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 font-bold text-slate-200 text-xs rounded-xl transition-all"
                      >
                        Request Store B patient details
                      </button>
                    </div>

                    {tenantQuery === 'requesting' && (
                      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 border-clinic-500 border-t-transparent animate-spin" />
                        <span className="text-xs text-slate-400">Verifying logical scopes on server...</span>
                      </div>
                    )}

                    {tenantQuery === 'allowed' && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
                        <CheckCircle className="w-5 h-5 shrink-0 text-emerald-450 mt-0.5" />
                        <div>
                          <p>ACCESS AUTHORIZED (200 OK)</p>
                          <p className="text-[10px] text-emerald-300 font-medium mt-1">Tenant ID validation matched. Database returned requested visual checkup records.</p>
                        </div>
                      </div>
                    )}

                    {tenantQuery === 'blocked' && (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-450 text-xs font-bold flex items-start gap-2.5 animate-fade-in">
                        <ShieldAlert className="w-5 h-5 shrink-0 text-rose-450 mt-0.5 animate-bounce" />
                        <div>
                          <p>SECURITY THREAT BLOCK (403 FORBIDDEN)</p>
                          <p className="text-[10px] text-rose-350 font-medium mt-1">Tenant validation mismatch! Logical locking system blocked database cross-access query attempt.</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        </section>

        {/* Savings ROI Calculator Section */}
        <section id="roi" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/50 relative">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">OPTICAL PRACTICE EFFICIENCY</h2>
            <p className="text-3xl md:text-5xl font-black text-white">ROI & Savings Calculator</p>
            <p className="text-slate-450 font-medium">Calculate how much revenue Eyelitz saves you by automating visual refraction checkups and inventory.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-slate-950/40 border border-slate-900/80 p-8 rounded-3xl backdrop-blur-sm shadow-2xl">
            
            {/* Sliders Input column */}
            <div className="lg:col-span-7 space-y-8 text-left">
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-300">Patients Checkups per Month</span>
                  <span className="text-base font-black text-clinic-400">{patientsPerMonth} checkups</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  step="10" 
                  value={patientsPerMonth} 
                  onChange={(e) => setPatientsPerMonth(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-slate-900 accent-clinic-500 cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-300">Average Order Billing Value</span>
                  <span className="text-base font-black text-clinic-400 font-sans">₹{billingRate}</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="5000" 
                  step="50" 
                  value={billingRate} 
                  onChange={(e) => setBillingRate(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-slate-900 accent-clinic-500 cursor-pointer"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-extrabold text-slate-300">Daily hours wasted on paper charts & dispatch followups</span>
                  <span className="text-base font-black text-clinic-400">{hoursWasted} hours</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1" 
                  value={hoursWasted} 
                  onChange={(e) => setHoursWasted(Number(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-slate-900 accent-clinic-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculations Output column */}
            <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-clinic-500/10 text-clinic-400 rounded-bl-xl text-[9px] uppercase font-black tracking-widest border-l border-b border-slate-800/80">
                ROI Spec
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500">ESTIMATED MONTHLY SAVINGS</p>
                  <p className="text-4xl font-black text-white mt-1">₹{monthlySavings.toLocaleString('en-IN')}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-5 text-xs font-semibold text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-550 uppercase block font-extrabold">Staff Time Freed</span>
                    <span className="text-sm font-black text-slate-200 block">{hoursSavedPerMonth} hrs/month</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-550 uppercase block font-extrabold">Revenue leak prevented</span>
                    <span className="text-sm font-black text-slate-200 block">₹{revenueLeakPrevented.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900/85 mt-6 space-y-2">
                <span className="text-[10px] text-slate-550 block font-extrabold uppercase tracking-wide">ESTIMATED ANNUAL VALUE ADDED</span>
                <span className="text-2xl font-black text-emerald-400">₹{annualSavings.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / Packages Section */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/50 relative">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">TRANSPARENT VALUE PLANS</h2>
            <p className="text-3xl md:text-5xl font-black text-white">Simple, Affordable Pricing</p>
            <p className="text-slate-450 font-medium">Select a package to deploy your isolated optical cloud database immediately.</p>
            
            {/* Cycle toggle slider */}
            <div className="inline-flex bg-slate-950 border border-slate-800 rounded-2xl p-1.5 text-xs mt-6">
              <button 
                onClick={() => setBillingCycle('month')}
                className={`px-5 py-2 rounded-xl font-extrabold transition-all ${
                  billingCycle === 'month' ? 'bg-clinic-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Plan
              </button>
              <button 
                onClick={() => setBillingCycle('year')}
                className={`px-5 py-2 rounded-xl font-extrabold transition-all ${
                  billingCycle === 'year' ? 'bg-clinic-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Yearly Plan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {packages
              .filter(p => p.billingCycle === billingCycle)
              .map((pkg) => (
                <div 
                  key={pkg._id}
                  className={`p-8 rounded-3xl border flex flex-col justify-between relative backdrop-blur-sm transition-all ${
                    pkg.badge === 'Best Value' 
                      ? 'bg-slate-950/60 border-clinic-500/50 shadow-[0_0_30px_-5px_rgba(14,165,233,0.15)] scale-102 z-10' 
                      : 'bg-slate-950/40 border-slate-900 shadow-xl'
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute top-5 right-5 px-3 py-1 bg-clinic-500/10 border border-clinic-500/25 text-clinic-400 rounded-full text-[10px] font-black uppercase">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="space-y-6 text-left">
                    <div>
                      <p className="text-sm font-extrabold text-slate-400 uppercase tracking-widest">{pkg.name}</p>
                      <p className="text-5xl font-black text-white mt-4">
                        ₹{pkg.price}
                        <span className="text-sm font-medium text-slate-500">/{pkg.billingCycle === 'month' ? 'mo' : 'yr'}</span>
                      </p>
                    </div>

                    <ul className="space-y-3.5 text-slate-300 text-sm">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2.5">
                          <CheckCircle className="w-5 h-5 text-clinic-450 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8">
                    <Link 
                      to={`/signup?package=${pkg._id}`}
                      className={`w-full py-3.5 rounded-2xl font-black text-xs text-center transition-all inline-block shadow-md ${
                        pkg.badge === 'Best Value'
                          ? 'bg-clinic-500 text-white hover:bg-clinic-600 shadow-clinic-500/10'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      Start 30-Day Free Trial
                    </Link>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Testimonials Carousel Section */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-900/50 relative">
          
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">WHAT CLINIC OWNERS SAY</h2>
            <p className="text-3xl md:text-5xl font-black text-white">Trusted by Optometrists</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayTestimonials.map((review) => (
              <div 
                key={review._id}
                className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between text-left backdrop-blur-sm relative group"
              >
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-clinic-500 text-clinic-500" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic leading-relaxed font-medium">"{review.text}"</p>
                </div>
                
                <div className="pt-6 border-t border-slate-900 mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-clinic-500/10 flex items-center justify-center font-black text-clinic-400 text-xs shrink-0 border border-clinic-500/20">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{review.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{review.role} • {review.clinic}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section id="faqs" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-900/50 relative">
          
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase tracking-widest font-black text-clinic-400">COMMON INQUIRIES</h2>
            <p className="text-3xl md:text-4xl font-black text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-900 bg-slate-950/30 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-slate-900/20 transition-all font-bold text-sm md:text-base text-slate-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-clinic-500 transition-transform shrink-0 duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-slate-900/80"
                      >
                        <div className="p-6 text-slate-400 text-xs md:text-sm text-left leading-relaxed font-medium">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Block */}
        <section className="max-w-5xl mx-auto px-6 pb-24 pt-10">
          <div 
            style={{ backgroundImage: `url(${opticalStoreBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="border border-slate-800/80 p-12 rounded-3xl text-center relative overflow-hidden shadow-2xl backdrop-blur-sm"
          >
            {/* Dark gradient mask overlays to blend the background image with exciting colors */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c2540]/85 via-[#0a1e35]/80 to-[#0f0e21]/90 z-0" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0c2540]/40 via-transparent to-[#0f0e21]/45 mix-blend-overlay z-0" />
            
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-widest font-black text-clinic-400">SECURE CLOUD PLATFORM</p>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-sans">Modernize Your Visual Refraction Today</h2>
              <p className="text-slate-350 text-sm leading-relaxed max-w-lg mx-auto font-sans">
                Join optical stores already scaling diagnostics, inventory alert warnings, and lab fitting dispatches with Eyelitz CRM.
              </p>
              <div className="pt-4">
                <Link 
                  to="/signup" 
                  className="px-8 py-3.5 bg-clinic-500 hover:bg-clinic-600 hover:scale-102 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-lg inline-block shadow-clinic-500/25"
                >
                  Start Your 30-Day Free Trial
                </Link>
                <p className="text-[10px] text-slate-500 mt-3 font-semibold font-sans">No Credit Card Required • Instant Deployment</p>
              </div>
            </div>
            
            {/* Visual background details */}
            <div className="absolute top-[-30%] left-[-20%] w-[50%] h-[150%] bg-clinic-500/5 blur-3xl pointer-events-none z-0" />
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-950/80 border-t border-slate-900/80 py-16 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-450">
          
          <div className="space-y-4 md:col-span-2 text-left">
            <div className="flex items-center gap-2">
              <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-36 h-10 object-contain" />
            </div>
            <p className="text-xs max-w-sm leading-relaxed text-slate-400 font-medium">
              Eyelitz is a premium multi-tenant SaaS application dedicated to modernizing visual refraction checkups, client billing, custom inventory counts, and optometry lab integrations.
            </p>
            <p className="text-[10px] text-slate-550 pt-2">
              © 2026 Eyelitz CRM. All rights reserved.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Product Core</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="#features" className="hover:text-clinic-400 transition-colors">Acuity Checkups</a></li>
              <li><a href="#features" className="hover:text-clinic-400 transition-colors">Frame Inventory</a></li>
              <li><a href="#features" className="hover:text-clinic-400 transition-colors">Lab Dispatching</a></li>
              <li><a href="#features" className="hover:text-clinic-400 transition-colors">Logical Isolation</a></li>
            </ul>
          </div>

          <div className="space-y-4 text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Enterprise Security</h4>
            <p className="text-xs text-slate-450 leading-relaxed font-medium">
              Every tenant database contains hard access-boundary locks ensuring HIPAA compliance and data isolation across all visual care franchise stores.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
