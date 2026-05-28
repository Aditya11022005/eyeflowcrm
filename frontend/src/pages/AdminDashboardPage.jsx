import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Activity, Award, Calendar, Edit2, Ban, 
  ShieldAlert, Check, X, Plus, Trash2, Megaphone, MessageSquare, Star, Tag 
} from 'lucide-react';
import api from '../utils/api.js';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('stores'); // 'stores', 'packages', 'announcements', 'testimonials', 'coupons'
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    trialStores: 0,
    expiredStores: 0,
    totalOwners: 0,
  });
  
  const [stores, setStores] = useState([]);
  const [packages, setPackages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Clinic/Store editing state
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [editingClinic, setEditingClinic] = useState(null);
  const [clinicName, setClinicName] = useState('');
  const [clinicSlug, setClinicSlug] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicOwnerName, setClinicOwnerName] = useState('');
  const [clinicPassword, setClinicPassword] = useState('');
  const [clinicPlan, setClinicPlan] = useState('free');
  const [clinicStatus, setClinicStatus] = useState('trial');
  const [clinicEndDate, setClinicEndDate] = useState('');

  // Package editing state
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState('');
  const [packageCycle, setPackageCycle] = useState('month');
  const [packageFeatures, setPackageFeatures] = useState('');
  const [packageBadge, setPackageBadge] = useState('');
  const [packageActive, setPackageActive] = useState(true);

  // Announcement editing state
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementBg, setAnnouncementBg] = useState('bg-clinic-500');
  const [announcementTextCol, setAnnouncementTextCol] = useState('text-white');
  const [announcementLink, setAnnouncementLink] = useState('');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Testimonial editing state
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialName, setTestimonialName] = useState('');
  const [testimonialRole, setTestimonialRole] = useState('');
  const [testimonialClinic, setTestimonialClinic] = useState('');
  const [testimonialRating, setTestimonialRating] = useState('5');
  const [testimonialText, setTestimonialText] = useState('');
  const [testimonialActive, setTestimonialActive] = useState(true);

  // Coupon editing state
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponExpiry, setCouponExpiry] = useState('');
  const [couponActive, setCouponActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const fetchPlatformData = async () => {
    try {
      const res = await api.get('/superadmin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setStores(res.data.stores || []);
      }
    } catch (err) {
      console.error(err);
      setError('Superadmin authorization failed. Check admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/superadmin/packages');
      if (res.data.success) {
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/superadmin/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/superadmin/testimonials');
      if (res.data.success) {
        setTestimonials(res.data.testimonials || []);
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/superadmin/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons || []);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  useEffect(() => {
    fetchPlatformData();
    fetchPackages();
    fetchAnnouncements();
    fetchTestimonials();
    fetchCoupons();
  }, []);

  // Clinic CRUD handlers
  const handleClinicNameChange = (val) => {
    setClinicName(val);
    if (!editingClinic) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setClinicSlug(slug);
    }
  };

  const handleOpenClinic = (st = null) => {
    if (st) {
      setEditingClinic(st);
      setClinicName(st.name);
      setClinicSlug(st.slug);
      setClinicEmail(st.email);
      setClinicPhone(st.phone);
      setClinicAddress(st.address || '');
      setClinicOwnerName('');
      setClinicPassword('');
      setClinicPlan(st.subscriptionPlan);
      setClinicStatus(st.subscriptionStatus);
      setClinicEndDate(st.subscriptionEndDate ? new Date(st.subscriptionEndDate).toISOString().split('T')[0] : '');
    } else {
      setEditingClinic(null);
      setClinicName('');
      setClinicSlug('');
      setClinicEmail('');
      setClinicPhone('');
      setClinicAddress('');
      setClinicOwnerName('');
      setClinicPassword('');
      setClinicPlan('free');
      setClinicStatus('trial');
      setClinicEndDate('');
    }
    setShowClinicModal(true);
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      name: clinicName,
      slug: clinicSlug.toLowerCase().trim(),
      email: clinicEmail.toLowerCase().trim(),
      phone: clinicPhone.trim(),
      address: clinicAddress,
      ownerName: clinicOwnerName,
      password: clinicPassword,
      subscriptionPlan: clinicPlan,
      subscriptionStatus: clinicStatus,
      subscriptionEndDate: clinicEndDate ? new Date(clinicEndDate) : null
    };

    try {
      if (editingClinic) {
        delete body.password;
        delete body.ownerName;
        await api.put(`/superadmin/stores/${editingClinic._id}`, body);
      } else {
        await api.post('/superadmin/stores', body);
      }
      setShowClinicModal(false);
      fetchPlatformData();
      alert('Clinic details updated successfully.');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving clinic settings.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClinic = async (id) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this clinic? All users, patient records, and billing receipts will be permanently removed. This action CANNOT be undone.')) return;
    try {
      await api.delete(`/superadmin/stores/${id}`);
      fetchPlatformData();
      alert('Clinic and all associated records permanently deleted.');
    } catch (err) {
      console.error(err);
      alert('Error deleting clinic.');
    }
  };

  // ==================== PACKAGES HANDLERS ====================
  const handleOpenPackage = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageName(pkg.name);
      setPackagePrice(pkg.price);
      setPackageCycle(pkg.billingCycle);
      setPackageFeatures(pkg.features.join('\n'));
      setPackageBadge(pkg.badge || '');
      setPackageActive(pkg.active);
    } else {
      setEditingPackage(null);
      setPackageName('');
      setPackagePrice('');
      setPackageCycle('month');
      setPackageFeatures('');
      setPackageBadge('');
      setPackageActive(true);
    }
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      name: packageName,
      price: Number(packagePrice),
      billingCycle: packageCycle,
      features: packageFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      badge: packageBadge,
      active: packageActive,
    };

    try {
      if (editingPackage) {
        await api.put(`/superadmin/packages/${editingPackage._id}`, body);
      } else {
        await api.post('/superadmin/packages', body);
      }
      setShowPackageModal(false);
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert('Error saving package plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pricing package?')) return;
    try {
      await api.delete(`/superadmin/packages/${id}`);
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert('Error deleting package.');
    }
  };

  const handleTogglePackageActive = async (pkg) => {
    try {
      await api.put(`/superadmin/packages/${pkg._id}`, { active: !pkg.active });
      fetchPackages();
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== ANNOUNCEMENTS HANDLERS ====================
  const handleOpenAnnouncement = (ann = null) => {
    if (ann) {
      setEditingAnnouncement(ann);
      setAnnouncementText(ann.text);
      setAnnouncementBg(ann.bgColor || 'bg-clinic-500');
      setAnnouncementTextCol(ann.textColor || 'text-white');
      setAnnouncementLink(ann.link || '');
      setAnnouncementActive(ann.active);
    } else {
      setEditingAnnouncement(null);
      setAnnouncementText('');
      setAnnouncementBg('bg-clinic-500');
      setAnnouncementTextCol('text-white');
      setAnnouncementLink('');
      setAnnouncementActive(true);
    }
    setShowAnnouncementModal(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      text: announcementText,
      bgColor: announcementBg,
      textColor: announcementTextCol,
      link: announcementLink,
      active: announcementActive,
    };

    try {
      if (editingAnnouncement) {
        await api.put(`/superadmin/announcements/${editingAnnouncement._id}`, body);
      } else {
        await api.post('/superadmin/announcements', body);
      }
      setShowAnnouncementModal(false);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Error saving announcement banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/superadmin/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Error deleting announcement.');
    }
  };

  const handleToggleAnnouncementActive = async (ann) => {
    try {
      await api.put(`/superadmin/announcements/${ann._id}`, { active: !ann.active });
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== TESTIMONIALS HANDLERS ====================
  const handleOpenTestimonial = (test = null) => {
    if (test) {
      setEditingTestimonial(test);
      setTestimonialName(test.name);
      setTestimonialRole(test.role);
      setTestimonialClinic(test.clinic);
      setTestimonialRating(test.rating.toString());
      setTestimonialText(test.text);
      setTestimonialActive(test.active);
    } else {
      setEditingTestimonial(null);
      setTestimonialName('');
      setTestimonialRole('');
      setTestimonialClinic('');
      setTestimonialRating('5');
      setTestimonialText('');
      setTestimonialActive(true);
    }
    setShowTestimonialModal(true);
  };

  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      name: testimonialName,
      role: testimonialRole,
      clinic: testimonialClinic,
      rating: Number(testimonialRating),
      text: testimonialText,
      active: testimonialActive,
    };

    try {
      if (editingTestimonial) {
        await api.put(`/superadmin/testimonials/${editingTestimonial._id}`, body);
      } else {
        await api.post('/superadmin/testimonials', body);
      }
      setShowTestimonialModal(false);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      alert('Error saving testimonial.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.delete(`/superadmin/testimonials/${id}`);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      alert('Error deleting testimonial.');
    }
  };

  const handleToggleTestimonialActive = async (test) => {
    try {
      await api.put(`/superadmin/testimonials/${test._id}`, { active: !test.active });
      fetchTestimonials();
    } catch (err) {
      console.error(err);
    }
  };

  // ==================== COUPON HANDLERS ====================
  const handleOpenCoupon = (cop = null) => {
    if (cop) {
      setEditingCoupon(cop);
      setCouponCode(cop.code);
      setCouponType(cop.discountType);
      setCouponValue(cop.discountValue);
      setCouponExpiry(cop.expiryDate ? new Date(cop.expiryDate).toISOString().split('T')[0] : '');
      setCouponActive(cop.active);
    } else {
      setEditingCoupon(null);
      setCouponCode('');
      setCouponType('percentage');
      setCouponValue('');
      setCouponExpiry('');
      setCouponActive(true);
    }
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const body = {
      code: couponCode.toUpperCase().trim(),
      discountType: couponType,
      discountValue: Number(couponValue),
      expiryDate: couponExpiry ? new Date(couponExpiry) : null,
      active: couponActive,
    };

    try {
      if (editingCoupon) {
        await api.put(`/superadmin/coupons/${editingCoupon._id}`, body);
      } else {
        await api.post('/superadmin/coupons', body);
      }
      setShowCouponModal(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount coupon?')) return;
    try {
      await api.delete(`/superadmin/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert('Error deleting coupon.');
    }
  };

  const handleToggleCouponActive = async (cop) => {
    try {
      await api.put(`/superadmin/coupons/${cop._id}`, { active: !cop.active });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 font-bold flex items-center justify-center gap-3">
        <ShieldAlert className="w-6 h-6" />
        {error}
      </div>
    );
  }

  const cards = [
    { title: 'Registered Clinics', value: stats.totalStores, icon: <Shield className="w-5 h-5 text-indigo-650" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { title: 'Subscribed Stores', value: stats.activeStores, icon: <Award className="w-5 h-5 text-emerald-650" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Active Trials', value: stats.trialStores, icon: <Activity className="w-5 h-5 text-clinic-650" />, bg: 'bg-clinic-50 dark:bg-clinic-950/20' },
    { title: 'Overdue / Expired', value: stats.expiredStores, icon: <ShieldAlert className="w-5 h-5 text-rose-650" />, bg: 'bg-rose-50 dark:bg-rose-950/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">SaaS Command Panel</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Global tenant dashboard and dynamic config controls</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-455 uppercase tracking-wider">{c.title}</span>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{c.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${c.bg}`}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stores' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          Clinics Directory
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'packages' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" />
          Pricing Plans
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'announcements' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Announcement Banner
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'testimonials' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Client Reviews
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'coupons' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Tag className="w-4 h-4" />
          Promo Coupons
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'stores' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-850 dark:text-slate-200">Clinic Registries</h3>
            <button
              onClick={() => handleOpenClinic()}
              className="px-4 py-2 text-xs bg-clinic-500 text-white font-extrabold rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Clinic
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Clinic / Slug</th>
                  <th className="px-6 py-4">Onboarding Owner</th>
                  <th className="px-6 py-4">Plan Tier</th>
                  <th className="px-6 py-4">Billing Status</th>
                  <th className="px-6 py-4">Fulfillment End</th>
                  <th className="px-6 py-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-355">
                {stores.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-850 dark:text-slate-100">{st.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">/{st.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{st.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{st.phone}</p>
                    </td>
                    <td className="px-6 py-4 capitalize font-semibold">{st.subscriptionPlan}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        st.subscriptionStatus === 'active' 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                          : st.subscriptionStatus === 'trial'
                            ? 'bg-clinic-50 text-clinic-600 dark:bg-clinic-950/20'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                      }`}>
                        {st.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">
                      {st.subscriptionEndDate ? new Date(st.subscriptionEndDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenClinic(st)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                        title="Edit Clinic Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClinic(st._id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-955 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                        title="Permanently Delete Store"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-805 bg-white dark:bg-darkbg-100 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200">SaaS Packages</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Pricing options rendered in cards on public pages</p>
            </div>
            <button
              onClick={() => handleOpenPackage()}
              className="px-4 py-2 text-xs bg-clinic-500 text-white font-extrabold rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Plan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-805 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Package Name</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Billing Cycle</th>
                  <th className="px-6 py-4">Promo Badge</th>
                  <th className="px-6 py-4">Features List</th>
                  <th className="px-6 py-4">Active Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-750 dark:text-slate-350">
                {packages.map((pkg) => (
                  <tr key={pkg._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4 font-bold text-slate-805 dark:text-slate-100">{pkg.name}</td>
                    <td className="px-6 py-4 font-mono font-extrabold">₹{pkg.price}</td>
                    <td className="px-6 py-4 capitalize font-semibold">{pkg.billingCycle}ly</td>
                    <td className="px-6 py-4">
                      {pkg.badge ? (
                        <span className="bg-clinic-50 dark:bg-clinic-950/20 text-clinic-600 dark:text-clinic-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          {pkg.badge}
                        </span>
                      ) : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={pkg.features.join(', ')}>
                      {pkg.features.join(', ')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePackageActive(pkg)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer ${
                          pkg.active 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {pkg.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenPackage(pkg)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg._id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-955 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/30 rounded-lg cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-850 dark:text-slate-200">Announcement Banner Management</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">System broadcast shown at the top of the public landing page</p>
            </div>
            <button
              onClick={() => handleOpenAnnouncement()}
              className="px-4 py-2 text-xs bg-clinic-500 text-white font-extrabold rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Banner
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Announcement Text</th>
                  <th className="px-6 py-4">Bg Style</th>
                  <th className="px-6 py-4">Text Style</th>
                  <th className="px-6 py-4">Hyperlink</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-755 dark:text-slate-355">
                {announcements.map((ann) => (
                  <tr key={ann._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4 font-bold max-w-sm truncate" title={ann.text}>{ann.text}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-550 dark:text-slate-400">{ann.bgColor}</td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-550 dark:text-slate-400">{ann.textColor}</td>
                    <td className="px-6 py-4 max-w-xs truncate text-clinic-550 font-semibold underline">
                      {ann.link ? <a href={ann.link} target="_blank" rel="noopener noreferrer">{ann.link}</a> : <span className="text-slate-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleAnnouncementActive(ann)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer ${
                          ann.active 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {ann.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAnnouncement(ann)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                        title="Edit Banner"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann._id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-955 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/30 rounded-lg cursor-pointer"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'testimonials' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-855 dark:text-slate-200">Customer Testimonials</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Reviews displayed dynamically in the landing page feedback section</p>
            </div>
            <button
              onClick={() => handleOpenTestimonial()}
              className="px-4 py-2 text-xs bg-clinic-500 text-white font-extrabold rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Review
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-805 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">Role / Clinic</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Feedback Review</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-755 dark:text-slate-355">
                {testimonials.map((test) => (
                  <tr key={test._id} className="hover:bg-slate-55/20">
                    <td className="px-6 py-4 font-bold text-slate-805 dark:text-slate-100">{test.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{test.role}</p>
                      <p className="text-[10px] text-clinic-500 mt-0.5">{test.clinic}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(test.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-450" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm truncate" title={test.text}>{test.text}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleTestimonialActive(test)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer ${
                          test.active 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {test.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenTestimonial(test)}
                        className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                        title="Edit Review"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(test._id)}
                        className="p-1.5 border border-rose-100 dark:border-rose-955 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/30 rounded-lg cursor-pointer"
                        title="Delete Review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'coupons' && (
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-855 dark:text-slate-200">Promo Coupons Management</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Manage SaaS discount coupons applied during clinic registrations & upgrades</p>
            </div>
            <button
              onClick={() => handleOpenCoupon()}
              className="px-4 py-2 text-xs bg-clinic-500 text-white font-extrabold rounded-xl hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Coupon
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-805 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Coupon Code</th>
                  <th className="px-6 py-4">Discount Type</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-755 dark:text-slate-355">
                {coupons.map((cop) => {
                  const hasExpired = cop.expiryDate && new Date(cop.expiryDate) < new Date();
                  return (
                    <tr key={cop._id} className="hover:bg-slate-55/20">
                      <td className="px-6 py-4 font-mono font-bold text-slate-850 dark:text-slate-100 tracking-wider">
                        {cop.code}
                      </td>
                      <td className="px-6 py-4 capitalize font-semibold">{cop.discountType}</td>
                      <td className="px-6 py-4 font-extrabold text-clinic-600 dark:text-clinic-400">
                        {cop.discountType === 'percentage' ? `${cop.discountValue}%` : `₹${cop.discountValue}`}
                      </td>
                      <td className="px-6 py-4 font-mono">
                        {cop.expiryDate ? (
                          <span className={hasExpired ? 'text-rose-500 font-bold' : 'text-slate-550 dark:text-slate-400'}>
                            {new Date(cop.expiryDate).toLocaleDateString()} {hasExpired && '(Expired)'}
                          </span>
                        ) : <span className="text-slate-400 italic">Never Expires</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleCouponActive(cop)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase cursor-pointer ${
                            cop.active && !hasExpired
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          disabled={hasExpired}
                        >
                          {hasExpired ? 'Expired' : cop.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenCoupon(cop)}
                          className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-655 hover:bg-slate-55 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                          title="Edit Coupon"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(cop._id)}
                          className="p-1.5 border border-rose-100 dark:border-rose-955 text-rose-500 hover:bg-rose-55 dark:hover:bg-rose-955/30 rounded-lg cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clinic Onboarding/Editing Modal */}
      {showClinicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowClinicModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-805 dark:text-slate-100 mb-6">
              {editingClinic ? 'Edit Clinic Profile' : 'Onboard New Clinic'}
            </h3>

            <form onSubmit={handleSaveClinic} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Clinic Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="Vision Care Clinic"
                    value={clinicName}
                    onChange={(e) => handleClinicNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">URL Slug</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white font-mono"
                    placeholder="vision-care"
                    value={clinicSlug}
                    onChange={(e) => setClinicSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Clinic Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="info@visioncare.com"
                    value={clinicEmail}
                    onChange={(e) => setClinicEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Clinic Phone</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="9876543210"
                    value={clinicPhone}
                    onChange={(e) => setClinicPhone(e.target.value)}
                  />
                </div>
              </div>

              {!editingClinic && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-855 space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Owner Credentials Setup</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Owner Full Name</label>
                      <input
                        type="text"
                        required={!editingClinic}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 focus:ring-2 focus:ring-clinic-500 dark:text-white"
                        placeholder="Dr. Aditya Raj"
                        value={clinicOwnerName}
                        onChange={(e) => setClinicOwnerName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Login Password</label>
                      <input
                        type="password"
                        required={!editingClinic}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 focus:ring-2 focus:ring-clinic-500 dark:text-white"
                        placeholder="••••••••"
                        value={clinicPassword}
                        onChange={(e) => setClinicPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Clinic Physical Address</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="e.g. 102 Metro Plaza, Mumbai"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Plan Tier</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                    value={clinicPlan}
                    onChange={(e) => setClinicPlan(e.target.value)}
                  >
                    <option value="free">Free</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Status</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                    value={clinicStatus}
                    onChange={(e) => setClinicStatus(e.target.value)}
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Expiration Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white font-mono"
                    value={clinicEndDate}
                    onChange={(e) => setClinicEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClinicModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-805 rounded-xl font-bold text-slate-655 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Creator/Editor Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPackageModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-805 dark:text-slate-100 mb-6">
              {editingPackage ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}
            </h3>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="Monthly Plan"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="299"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Billing Cycle</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                    value={packageCycle}
                    onChange={(e) => setPackageCycle(e.target.value)}
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Promo Badge (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="Best Value / Popular"
                  value={packageBadge}
                  onChange={(e) => setPackageBadge(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Features List (One feature per line)</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="Feature A&#10;Feature B&#10;Feature C"
                  value={packageFeatures}
                  onChange={(e) => setPackageFeatures(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="packageActive"
                  className="rounded text-clinic-500 focus:ring-clinic-500 cursor-pointer"
                  checked={packageActive}
                  onChange={(e) => setPackageActive(e.target.checked)}
                />
                <label htmlFor="packageActive" className="text-slate-655 dark:text-slate-355 select-none cursor-pointer">Active / Render plan on public pages</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-805 rounded-xl font-bold text-slate-655 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Creator/Editor Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAnnouncementModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 mb-6">
              {editingAnnouncement ? 'Edit Announcement Banner' : 'Create Announcement Banner'}
            </h3>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Banner Broadcast Text</label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="🎉 Eyelitz CRM v2.0 Released! Try it for free for 30 days."
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Background Tailwind Color</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="bg-clinic-500"
                    value={announcementBg}
                    onChange={(e) => setAnnouncementBg(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Text Tailwind Color</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="text-white"
                    value={announcementTextCol}
                    onChange={(e) => setAnnouncementTextCol(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Clickable Hyperlink (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white font-mono"
                  placeholder="https://eyelitz.com/offer"
                  value={announcementLink}
                  onChange={(e) => setAnnouncementLink(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="announcementActive"
                  className="rounded text-clinic-500 focus:ring-clinic-500 cursor-pointer"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                />
                <label htmlFor="announcementActive" className="text-slate-655 dark:text-slate-355 select-none cursor-pointer">Active / Show at top of public site</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-805 rounded-xl font-bold text-slate-655 dark:text-slate-355"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Creator/Editor Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTestimonialModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-850 dark:text-slate-100 mb-6">
              {editingTestimonial ? 'Edit Client Testimonial' : 'Add Client Testimonial'}
            </h3>

            <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Client Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-805 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="Dr. Harshal Kulkarni"
                  value={testimonialName}
                  onChange={(e) => setTestimonialName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Professional Designation</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="Chief Ophthalmologist"
                    value={testimonialRole}
                    onChange={(e) => setTestimonialRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Clinic Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="Om Opticals Pune"
                    value={testimonialClinic}
                    onChange={(e) => setTestimonialClinic(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Star Rating (1-5)</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={testimonialRating}
                  onChange={(e) => setTestimonialRating(e.target.value)}
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                  <option value="2">★★☆☆☆ (2 Stars)</option>
                  <option value="1">★☆☆☆☆ (1 Star)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Feedback / Review Description</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white text-sm"
                  placeholder="Eyelitz CRM completely transformed our front-office billing and scheduling..."
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testimonialActive"
                  className="rounded text-clinic-500 focus:ring-clinic-500 cursor-pointer"
                  checked={testimonialActive}
                  onChange={(e) => setTestimonialActive(e.target.checked)}
                />
                <label htmlFor="testimonialActive" className="text-slate-655 dark:text-slate-355 select-none cursor-pointer">Active / Show review on public landing page</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTestimonialModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl font-bold text-slate-655 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Save Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Creator/Editor Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-855 dark:text-slate-100 mb-6">
              {editingCoupon ? 'Edit Coupon Code' : 'Create Promo Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Promo Coupon Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white font-mono uppercase tracking-widest"
                  placeholder="SAVE50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Discount Type</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                    value={couponType}
                    onChange={(e) => setCouponType(e.target.value)}
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Discount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1.5">Discount Value</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    placeholder="15"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Coupon Expiry Date (Optional)</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white font-mono"
                  value={couponExpiry}
                  onChange={(e) => setCouponExpiry(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  className="rounded text-clinic-500 focus:ring-clinic-500 cursor-pointer"
                  checked={couponActive}
                  onChange={(e) => setCouponActive(e.target.checked)}
                />
                <label htmlFor="couponActive" className="text-slate-655 dark:text-slate-355 select-none cursor-pointer">Active / Allow clients to redeem this coupon</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-805 rounded-xl font-bold text-slate-655 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
