import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Shield, Users, Activity, CheckCircle, Sparkles, ArrowRight, Zap, 
  Award, FileText, Star, Quote, ChevronDown, Check, ShieldAlert, 
  RotateCcw, DollarSign, Clock, LayoutGrid, Calendar, HelpCircle, 
  Flame, TrendingUp, Laptop, Printer
} from 'lucide-react';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';
import dashboardMockup from '../assets/dashboard_mockup.png';

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
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 selection:bg-clinic-500 selection:text-white flex flex-col justify-between scroll-smooth">
      <div>
        {/* Announcement Banner */}
        {announcement && announcement.active && (
          <div className={`py-2 px-4 text-center text-xs font-bold ${announcement.bgColor || 'bg-clinic-500'} ${announcement.textColor || 'text-white'} transition-all`}>
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

        {/* Sticky Header Glassmorphic */}
        <nav className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          isScrolled 
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 py-4 shadow-sm' 
            : 'bg-transparent py-6'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-350">
                Eyelitz<span className="text-clinic-500">CRM</span>
              </span>
            </Link>

            {/* Navigation links for smooth scroll */}
            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-clinic-500 transition-colors">Features</a>
              <a href="#virtualization" className="hover:text-clinic-500 transition-colors">Virtual Demo</a>
              <a href="#roi" className="hover:text-clinic-500 transition-colors">Calculator</a>
              <a href="#pricing" className="hover:text-clinic-500 transition-colors">Pricing</a>
              <a href="#faqs" className="hover:text-clinic-500 transition-colors">FAQs</a>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-clinic-500 transition-colors">
                Sign In
              </Link>
              <Link to="/signup" className="px-5 py-2 text-sm font-extrabold text-white bg-clinic-500 hover:bg-clinic-600 rounded-xl shadow-md shadow-clinic-500/10 hover:shadow-lg hover:shadow-clinic-500/20 transition-all hover:scale-105 active:scale-95">
                Start Free Trial
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
          {/* Decorative blur backgrounds */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-clinic-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/30 border border-clinic-100 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-6 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-clinic-500 animate-pulse" />
              SaaS Suite For Optical Stores & Eye Care Clinics
            </motion.div>
            
            {/* Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white"
            >
              Manage your Eye Clinic or Optical Shop <span className="bg-clip-text text-transparent bg-gradient-to-r from-clinic-500 via-sky-400 to-cyan-500">with Ease</span>.
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              Eyelitz CRM is the premium all-in-one platform for patient medical files, visual acuity prescriptions, stock catalog alerts, invoicing, and laboratory order tracking.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex items-center justify-center gap-4 flex-wrap"
            >
              <Link to="/signup" className="px-8 py-4 bg-gradient-to-r from-clinic-650 to-clinic-500 bg-clinic-500 text-white rounded-2xl font-bold shadow-lg shadow-clinic-500/20 hover:shadow-xl hover:shadow-clinic-500/30 hover:scale-[1.03] transition-all flex items-center gap-2 active:scale-95">
                Get Started (30-Day Free Trial)
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#virtualization" className="px-8 py-4 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-850 transition-all flex items-center gap-2 active:scale-95">
                <Laptop className="w-4 h-4 text-clinic-500" />
                Explore Demo
              </a>
            </motion.div>
          </div>

          {/* Interactive Floating Product Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative mx-auto max-w-5xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/50 p-3 shadow-2xl shadow-clinic-500/5 backdrop-blur-sm group"
          >
            {/* Window control dots */}
            <div className="absolute top-7 left-7 flex gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 relative aspect-[16/10]">
              <img 
                src={dashboardMockup} 
                alt="Eyelitz CRM Dashboard Representation" 
                className="w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Visual Badge: Active Patients */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 hidden sm:flex items-center gap-3 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Patients</p>
                <p className="text-lg font-black text-slate-850 dark:text-slate-100">2,580+</p>
              </div>
            </motion.div>

            {/* Floating Visual Badge: System Activity */}
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Status Check</p>
                <p className="text-xs font-black text-emerald-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Syncing Active
                </p>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-4">
              <Award className="w-3.5 h-3.5 fill-clinic-500/10" />
              Enterprise Capabilities
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Everything your Store Needs to Scale
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm md:text-base">
              A comprehensive system built specifically to eliminate spreadsheets, paper prescription pads, and inventory guesswork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:border-clinic-500/50 dark:hover:border-clinic-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-clinic-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-clinic-500 transition-colors">Multi-Tenant Isolation</h3>
              <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">
                Completely isolated database layers guarantee that staff or patients from branch A are restricted from viewing reports or prescriptions under branch B.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:border-clinic-500/50 dark:hover:border-clinic-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-clinic-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-clinic-500 transition-colors">Visual Acuity Rx</h3>
              <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">
                Log Spherical, Cylindrical, Axis, ADD, and Pupillary Distance (PD) for Left and Right eyes. Download or print beautifully organized digital prescriptions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:border-clinic-500/50 dark:hover:border-clinic-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-clinic-500/5 group">
              <div className="w-12 h-12 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-clinic-500 transition-colors">Smart Stock Alerts</h3>
              <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed">
                Input safety thresholds for frames, lenses, and clinic fluids. The app flags items visually and alerts staff instantly before stock reaches zero.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE DEMO & VIRTUALIZATION SECTION           */}
        {/* ---------------------------------------------------- */}
        <section id="virtualization" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-4">
              <LayoutGrid className="w-3.5 h-3.5 text-clinic-500" />
              Live Virtualization Demo
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              Test Our Core Features Live
            </h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm md:text-base">
              Interact with these live widgets to see how Eyelitz CRM streamlines checkups, handles inventory thresholds, and manages lab jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            
            {/* Widget 1: Prescription & Acuity Printer */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 rounded-lg text-xs font-black">Feature 1</span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Refraction Records</h3>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl text-xs font-bold">
                    <button 
                      onClick={() => setRxEye('OD')} 
                      className={`px-3 py-1.5 rounded-lg transition-colors ${rxEye === 'OD' ? 'bg-clinic-500 text-white' : 'text-slate-500'}`}
                    >
                      OD (Right Eye)
                    </button>
                    <button 
                      onClick={() => setRxEye('OS')} 
                      className={`px-3 py-1.5 rounded-lg transition-colors ${rxEye === 'OS' ? 'bg-clinic-500 text-white' : 'text-slate-500'}`}
                    >
                      OS (Left Eye)
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Click the tabs to inspect prescription details for the right (OD) or left (OS) eye. Toggle the print simulation to review physical print outputs.
                </p>

                {/* Prescription Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-900 relative">
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                    <div>Sphere</div>
                    <div>Cylinder</div>
                    <div>Axis</div>
                    <div>ADD</div>
                    <div>PD (mm)</div>
                  </div>
                  
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={rxEye}
                      initial={{ opacity: 0, x: rxEye === 'OD' ? -10 : 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: rxEye === 'OD' ? 10 : -10 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-5 gap-2 text-center font-bold text-slate-800 dark:text-slate-200 text-sm py-2"
                    >
                      <div className="bg-clinic-500/5 dark:bg-clinic-500/10 p-2 rounded-lg text-clinic-600 dark:text-clinic-400">{mockPrescription[rxEye].sphere}</div>
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">{mockPrescription[rxEye].cylinder}</div>
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">{mockPrescription[rxEye].axis}°</div>
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">{mockPrescription[rxEye].add}</div>
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg">{mockPrescription[rxEye].pd}</div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-450 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-emerald-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Visual Acuity Saved
                    </span>
                    <span>Patient Ref: #EY-893</span>
                  </div>
                </div>

                {/* Print Simulation Overlay */}
                <AnimatePresence>
                  {rxPrinted && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between border border-clinic-500/30 rounded-3xl z-10"
                    >
                      <div className="text-left">
                        <div className="flex justify-between items-start border-b pb-3 mb-4 border-slate-200 dark:border-slate-800">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">Eyelitz Vision Clinic</h4>
                            <p className="text-[10px] text-slate-400">Prescription Invoice Receipt</p>
                          </div>
                          <span className="text-[10px] font-black bg-clinic-50 px-2 py-1 text-clinic-600 rounded">ORIGINAL RX</span>
                        </div>
                        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-350">
                          <p><strong>Patient Name:</strong> Rohan Sharma (Age: 32)</p>
                          <p><strong>OD (Right):</strong> Sph {mockPrescription.OD.sphere} | Cyl {mockPrescription.OD.cylinder} | Axis {mockPrescription.OD.axis}° | PD {mockPrescription.OD.pd}</p>
                          <p><strong>OS (Left):</strong> Sph {mockPrescription.OS.sphere} | Cyl {mockPrescription.OS.cylinder} | Axis {mockPrescription.OS.axis}° | PD {mockPrescription.OS.pd}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[9px] text-slate-400">Compiled digitally via Eyelitz CRM</p>
                        <button 
                          onClick={() => setRxPrinted(false)} 
                          className="text-xs font-black text-rose-500 hover:underline"
                        >
                          Close Preview
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setRxPrinted(true)}
                  className="w-full py-3 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-clinic-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  Simulate Rx Print Document
                </button>
              </div>
            </div>

            {/* Widget 2: Interactive Smart Inventory Alert */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 rounded-lg text-xs font-black">Feature 2</span>
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Smart Inventory Warns</h3>
                  </div>
                  
                  {/* Status Indicator */}
                  {inventoryCount > 2 ? (
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In Stock
                    </span>
                  ) : inventoryCount > 0 ? (
                    <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-black flex items-center gap-1 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Low Stock Warning
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-black flex items-center gap-1 animate-ping">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      Critical Stock Out
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Sell frames mockups to decrease count. Once stock falls below the threshold (2 pairs), Eyelitz fires dashboard warnings automatically.
                </p>

                {/* Product Detail Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-900">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Ray-Ban Aviator Gold</h4>
                      <p className="text-[10px] text-slate-400">SKU: RB-AV-GLD-58</p>
                    </div>
                    <p className="text-xs font-bold text-slate-400">Threshold Alert: &lt; 3</p>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      <span>Available Quantity: {inventoryCount} units</span>
                      <span>5 Limit Max</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          inventoryCount > 2 ? 'bg-emerald-500' : inventoryCount > 0 ? 'bg-amber-500' : 'bg-rose-600'
                        }`}
                        animate={{ width: `${(inventoryCount / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Alert Warning Box */}
                  <AnimatePresence>
                    {inventoryCount <= 2 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl flex items-start gap-2 text-xs"
                      >
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold">System alert warning triggered</p>
                          <p className="text-[10px] opacity-90">Stock quantity ({inventoryCount}) is below safety threshold. Restock recommended.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={handleSellPair}
                  disabled={inventoryCount === 0}
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
                >
                  Record Sale (-1)
                </button>
                <button 
                  onClick={handleRestock}
                  className="py-3 px-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-all text-slate-600 dark:text-slate-400 flex items-center justify-center"
                  title="Restock"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Widget 3: Live Lab Job Card Status */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 rounded-lg text-xs font-black">Feature 3</span>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Laboratory order tracking</h3>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Click 'Simulate Next Stage' to progress lens cutting and fitting steps. Patient job cards update in real-time, keeping front desks in sync.
                </p>

                {/* Pipeline Steps */}
                <div className="space-y-4">
                  {labStages.map((stage, idx) => {
                    const isActive = labStage === idx;
                    const isCompleted = labStage > idx;
                    return (
                      <div key={idx} className="flex gap-4 items-start relative group">
                        {/* Connecting Line */}
                        {idx < labStages.length - 1 && (
                          <div className={`absolute left-3 top-6 w-[2px] h-[34px] -z-10 transition-colors duration-300 ${
                            isCompleted ? 'bg-clinic-500' : 'bg-slate-200 dark:bg-slate-800'
                          }`} />
                        )}

                        {/* Node Bubble */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-305 text-[10px] font-black ${
                          isActive 
                            ? 'bg-clinic-500 border-clinic-500 text-white shadow-md shadow-clinic-500/20 scale-110' 
                            : isCompleted 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        {/* Stage Description */}
                        <div>
                          <h4 className={`text-xs font-bold transition-colors ${isActive ? 'text-clinic-600 dark:text-clinic-400 font-extrabold' : 'text-slate-700 dark:text-slate-450'}`}>
                            {stage.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{stage.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleNextLabStage}
                  className="w-full py-3 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-clinic-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <RotateCcw className="w-4 h-4 animate-spin-slow" />
                  Simulate Next Lab Stage
                </button>
              </div>
            </div>

            {/* Widget 4: Multi-Tenant Secure Locks */}
            <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-clinic-500/10 text-clinic-600 dark:text-clinic-400 rounded-lg text-xs font-black">Feature 4</span>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Multi-Tenant Isolation Lock</h3>
                </div>

                <p className="text-xs text-slate-500 mb-6">
                  Simulate queries to test database security. Requesting data within your own tenant is approved; attempting cross-tenant queries is immediately blocked.
                </p>

                {/* Secure Flow Grid */}
                <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-150 dark:border-slate-900">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-black text-clinic-650 dark:text-clinic-450 uppercase">Tenant Store A</p>
                      <p className="text-[9px] text-slate-400 mt-1">Token: CLI-009A</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 opacity-60">
                      <p className="text-[10px] font-black text-rose-500 uppercase">Tenant Store B</p>
                      <p className="text-[9px] text-slate-400 mt-1">Token: CLI-012B</p>
                    </div>
                  </div>

                  {/* Flow result screen */}
                  <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-850 flex items-center justify-center min-h-[90px] text-center">
                    <AnimatePresence mode="wait">
                      {tenantQuery === null && (
                        <motion.p key="idle" className="text-[11px] text-slate-400 font-semibold">Ready. Select a test operation below.</motion.p>
                      )}
                      {tenantQuery === 'requesting' && (
                        <motion.div key="req" className="flex flex-col items-center gap-1.5">
                          <span className="w-5 h-5 border-2 border-clinic-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-[10px] font-extrabold text-slate-500">Scanning JWT scopes...</p>
                        </motion.div>
                      )}
                      {tenantQuery === 'blocked' && (
                        <motion.div 
                          key="blocked" 
                          initial={{ scale: 0.95, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }} 
                          className="flex flex-col items-center gap-1 text-rose-600"
                        >
                          <ShieldAlert className="w-5 h-5 text-rose-500 animate-bounce" />
                          <p className="text-xs font-black uppercase">ACCESS BLOCK: Mismatch</p>
                          <p className="text-[9px] opacity-80">Security error: JWT scope CLI-009A cannot query CLI-012B.</p>
                        </motion.div>
                      )}
                      {tenantQuery === 'allowed' && (
                        <motion.div 
                          key="allowed" 
                          initial={{ scale: 0.95, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }} 
                          className="flex flex-col items-center gap-1 text-emerald-600"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <p className="text-xs font-black uppercase">ACCESS APPROVED</p>
                          <p className="text-[9px] opacity-80">Success: Isolated datasets retrieved securely.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Secure Actions */}
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => simulateTenantQuery('own')}
                  className="flex-1 py-3 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-clinic-500/10"
                >
                  Query Store A Data
                </button>
                <button 
                  onClick={() => simulateTenantQuery('cross')}
                  className="flex-1 py-3 border border-rose-500/20 hover:bg-rose-500/10 text-rose-600 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  Attempt Store B Read
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* Optometry SaaS Workflow / Steps */}
        <section className="bg-slate-100 dark:bg-slate-900/50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">How Eyelitz Works</h2>
              <p className="mt-4 text-slate-550 dark:text-slate-400 text-sm md:text-base">
                A simple workflow built to take patients from booking a checkup to optical lens dispatch in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-clinic-500 text-white font-black text-sm flex items-center justify-center border-4 border-slate-100 dark:border-slate-950">1</span>
                <h4 className="font-extrabold text-base mb-2 mt-2">Log Checkup</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter optical checkup history and vision readings on any mobile tablet or desktop.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-clinic-500 text-white font-black text-sm flex items-center justify-center border-4 border-slate-100 dark:border-slate-950">2</span>
                <h4 className="font-extrabold text-base mb-2 mt-2">Verify Prescription</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Confirm OD and OS specs. Generate digital refraction sheets and download prints.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-clinic-500 text-white font-black text-sm flex items-center justify-center border-4 border-slate-100 dark:border-slate-950">3</span>
                <h4 className="font-extrabold text-base mb-2 mt-2">Track Lab Order</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Assign frames to laboratory grinding. Progress orders through lens coating steps.
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative">
                <span className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-clinic-500 text-white font-black text-sm flex items-center justify-center border-4 border-slate-100 dark:border-slate-950">4</span>
                <h4 className="font-extrabold text-base mb-2 mt-2">Invoice & Bill</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Combine lenses and frames into beautiful itemized receipts. Record payments and sales data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- */}
        {/* INTERACTIVE ROI CALCULATOR SECTION                   */}
        {/* ---------------------------------------------------- */}
        <section id="roi" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/50 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                SaaS ROI Estimator
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Calculate your Savings
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Optical stores waste dozens of hours every month recording patients manually on index cards or compiling spreadsheets. Eyelitz pays for itself in time and error-reduction savings.
              </p>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Reduce optical record errors by up to 98%</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Save an average of 66 hours of manual bookkeeping monthly</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-350">Prevent inventory leaks and stock-out delays</p>
                </div>
              </div>
            </div>

            {/* Interactive Calculator Widget */}
            <div className="lg:col-span-7 p-8 rounded-3xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-slate-900/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Clinic Metrics Input
              </h3>

              <div className="space-y-6">
                {/* Variable 1: Patients per Month */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Patients Processed / Month</span>
                    <span className="text-clinic-600 dark:text-clinic-400 font-extrabold">{patientsPerMonth} patients</span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="1000" 
                    step="10"
                    value={patientsPerMonth}
                    onChange={(e) => setPatientsPerMonth(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-clinic-500"
                  />
                </div>

                {/* Variable 2: Avg Billing Rate */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Average Prescription Sale Ticket</span>
                    <span className="text-clinic-600 dark:text-clinic-400 font-extrabold">₹{billingRate.toLocaleString('en-IN')}</span>
                  </div>
                  <input 
                    type="range" 
                    min="200" 
                    max="5000" 
                    step="100"
                    value={billingRate}
                    onChange={(e) => setBillingRate(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-clinic-500"
                  />
                </div>

                {/* Variable 3: Daily manual hours spent */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">Manual Paperwork Wasted / Day</span>
                    <span className="text-clinic-600 dark:text-clinic-400 font-extrabold">{hoursWasted} hours</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={hoursWasted}
                    onChange={(e) => setHoursWasted(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-clinic-500"
                  />
                </div>
              </div>

              {/* Outputs Summary */}
              <div className="mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 text-center">
                  <div className="w-8 h-8 rounded-lg bg-clinic-500/10 text-clinic-600 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-slate-450 tracking-wider">Time Saved</p>
                  <p className="text-lg font-black text-slate-850 dark:text-slate-100 mt-0.5">{hoursSavedPerMonth} Hrs/mo</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] uppercase font-black text-emerald-600 tracking-wider">Estimated ROI</p>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">₹{monthlySavings.toLocaleString('en-IN')}/mo</p>
                </div>
              </div>

              {/* Annual Savings Alert */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl text-center">
                <p className="text-xs opacity-90 font-bold">Estimated Annual Clinic Value Added</p>
                <p className="text-2xl font-black mt-1">₹{annualSavings.toLocaleString('en-IN')}</p>
              </div>

            </div>

          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight">Simple, Predictable Plans</h2>
            <p className="mt-4 text-slate-550 dark:text-slate-400">All features unlocked. 30 days free trial, cancel anytime.</p>
            
            {/* Monthly / Yearly Billing Toggle */}
            <div className="mt-8 inline-flex items-center gap-1.5 bg-slate-150 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
              <button 
                onClick={() => setBillingCycle('month')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                  billingCycle === 'month' 
                    ? 'bg-clinic-500 text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Monthly Billing
              </button>
              <button 
                onClick={() => setBillingCycle('year')}
                className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  billingCycle === 'year' 
                    ? 'bg-clinic-500 text-white shadow-md' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                Yearly Saving
                <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] rounded-full uppercase tracking-wider font-extrabold">
                  Save 15%
                </span>
              </button>
            </div>
          </div>

          <div className={`mt-16 grid grid-cols-1 ${
            packages.length === 1 
              ? 'max-w-md' 
              : packages.length === 2 
                ? 'max-w-4xl md:grid-cols-2' 
                : 'max-w-6xl md:grid-cols-3'
            } gap-8 mx-auto`}
          >
            {packages.map((pkg) => {
              const isYearly = pkg.billingCycle === 'year';
              
              // Filter based on active billing selection toggle to highlight and group plans
              const isHighlighted = (billingCycle === 'year' && isYearly) || (billingCycle === 'month' && !isYearly);

              return (
                <motion.div 
                  key={pkg._id} 
                  layout
                  className={`p-8 rounded-3xl text-left relative flex flex-col justify-between transition-all duration-300 ${
                    isHighlighted 
                      ? 'border-2 border-clinic-500 bg-white dark:bg-slate-900 shadow-xl shadow-clinic-500/10 scale-102 z-10' 
                      : 'border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/20 opacity-75'
                  }`}
                >
                  {pkg.badge && (
                    <div className={`absolute -top-3 right-6 ${
                      isHighlighted ? 'bg-clinic-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    } text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1`}>
                      {isYearly && <Zap className="w-3 h-3 fill-white" />}
                      {pkg.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold ${isHighlighted ? 'text-clinic-600 dark:text-clinic-400' : 'text-slate-650'}`}>
                        {pkg.name}
                      </h3>
                    </div>

                    <p className="text-4xl font-black mb-6">
                      ₹{pkg.price.toLocaleString('en-IN')}
                      <span className="text-base font-normal text-slate-500">
                        /{pkg.billingCycle === 'year' ? 'year' : 'month'}
                      </span>
                    </p>
                    
                    <ul className="space-y-3.5 text-sm text-slate-500 dark:text-slate-400 mb-8">
                      {pkg.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-clinic-500 shrink-0" /> 
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-350">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link 
                    to={`/signup?plan=${pkg.billingCycle}`} 
                    className={`w-full py-3.5 text-center rounded-xl font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
                      isHighlighted 
                        ? 'bg-clinic-500 text-white hover:bg-clinic-600 shadow-md shadow-clinic-500/10' 
                        : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90'
                    }`}
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-4">
              <Quote className="w-3.5 h-3.5 fill-clinic-500/10" />
              Clinician Feedback
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Trusted by Eye Care Professionals
            </h2>
            <p className="mt-4 text-slate-550 dark:text-slate-400 text-sm md:text-base">
              See how leading doctors and optical store owners manage their operations and save hours daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayTestimonials.map((t, idx) => (
              <div 
                key={t._id || idx} 
                className="p-8 rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 hover:border-clinic-500 dark:hover:border-clinic-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-clinic-500/5 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-6 italic">
                    "{t.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-clinic-500 to-cyan-400 text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-clinic-500/10">
                    {t.avatar || (t.name ? t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'C')}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 group-hover:text-clinic-500 dark:group-hover:text-clinic-400 transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold">
                      {t.role} — <span className="text-clinic-600 dark:text-clinic-400 font-extrabold">{t.clinic}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section id="faqs" className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-900">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-clinic-50 dark:bg-clinic-950/20 border border-clinic-150 dark:border-clinic-900/50 rounded-full text-clinic-600 dark:text-clinic-400 text-xs font-bold mb-4">
              <HelpCircle className="w-3.5 h-3.5 text-clinic-500" />
              Frequently Asked Questions
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Got Questions?</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400 text-sm">Everything you need to know about the SaaS platform security, setup, and features.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/20 overflow-hidden transition-all"
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-clinic-500' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-850 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/10">
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

        {/* Final CTA Banner */}
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="p-8 md:p-16 rounded-3xl bg-gradient-to-r from-clinic-600 to-cyan-500 text-white text-center relative overflow-hidden shadow-xl shadow-clinic-500/10">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.03] pointer-events-none" />
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="max-w-2xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Ready to Upgrade your Eye Store Operations?
              </h2>
              <p className="text-sm opacity-90 leading-relaxed">
                Join optical store owners and clinical specialists using Eyelitz CRM to secure client records, save paperwork hours, and optimize visual inventory limits.
              </p>
              
              <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
                <Link to="/signup" className="px-8 py-4 bg-white text-clinic-600 hover:text-clinic-700 rounded-2xl font-extrabold shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all flex items-center gap-2 active:scale-95">
                  Sign Up For Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/login" className="px-6 py-4 border border-white/30 hover:border-white/50 hover:bg-white/10 rounded-2xl font-bold transition-all active:scale-95">
                  Access Account
                </Link>
              </div>

              <p className="text-[10px] opacity-75 font-semibold">
                No Credit Card Required • Instant Deployment • 30-Day Free Trial
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 text-sm text-slate-500">
          
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-base tracking-tight text-slate-850 dark:text-slate-100">
                Eyelitz<span className="text-clinic-500">CRM</span>
              </span>
            </div>
            <p className="text-xs max-w-sm leading-relaxed">
              Eyelitz is a premium multi-tenant SaaS application dedicated to modernizing visual refraction checkups, client billing, custom inventory counts, and optometry lab integrations.
            </p>
            <p className="text-xs">
              © 2026 Eyelitz CRM. All rights reserved.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-clinic-500 transition-colors">Key Features</a></li>
              <li><a href="#virtualization" className="hover:text-clinic-500 transition-colors">Interactive Demo</a></li>
              <li><a href="#roi" className="hover:text-clinic-500 transition-colors">Savings Calculator</a></li>
              <li><a href="#pricing" className="hover:text-clinic-500 transition-colors">Pricing Options</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs">SaaS Capabilities</h4>
            <ul className="space-y-2 text-xs">
              <li>Refraction Charts</li>
              <li>Multi-Tenant JWT Isolation</li>
              <li>Inventory alerts</li>
              <li>Lab Job Cards tracking</li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
