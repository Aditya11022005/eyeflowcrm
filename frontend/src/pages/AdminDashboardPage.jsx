import React, { useState, useEffect } from 'react';
import { Shield, Users, Activity, Award, Calendar, Edit2, Ban, ShieldAlert, Check, X } from 'lucide-react';
import api from '../utils/api.js';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalStores: 0,
    activeStores: 0,
    trialStores: 0,
    expiredStores: 0,
    totalOwners: 0,
  });
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Manual override states
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePlan, setOverridePlan] = useState('monthly');
  const [overrideStatus, setOverrideStatus] = useState('active');
  const [overrideDays, setOverrideDays] = useState('30');
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

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const handleOpenOverride = (store) => {
    setSelectedStoreId(store._id);
    setOverridePlan(store.subscriptionPlan);
    setOverrideStatus(store.subscriptionStatus);
    setShowOverrideModal(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.put(`/superadmin/stores/${selectedStoreId}/subscription`, {
        plan: overridePlan,
        status: overrideStatus,
        durationDays: Number(overrideDays),
      });

      if (res.data.success) {
        setShowOverrideModal(false);
        fetchPlatformData();
        alert('Store subscription overrides applied successfully.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating store configurations.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFreeze = async (id) => {
    if (!window.confirm('Toggle freeze status? Expired stores are immediately locked out of their clinical views.')) return;

    try {
      const res = await api.delete(`/superadmin/stores/${id}`);
      if (res.data.success) {
        fetchPlatformData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update store status');
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
    { title: 'Registered Clinics', value: stats.totalStores, icon: <Shield className="w-5 h-5 text-indigo-600" />, bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { title: 'Subscribed Stores', value: stats.activeStores, icon: <Award className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Active Trials', value: stats.trialStores, icon: <Activity className="w-5 h-5 text-clinic-600" />, bg: 'bg-clinic-50 dark:bg-clinic-950/20' },
    { title: 'Overdue / Expired', value: stats.expiredStores, icon: <ShieldAlert className="w-5 h-5 text-rose-600" />, bg: 'bg-rose-50 dark:bg-rose-950/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">SaaS Command Panel</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Global tenant dashboard and billing controls</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{c.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${c.bg}`}>
              {c.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Stores List */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 mb-4">Clinic Registries</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Clinic / Slug</th>
                <th className="px-6 py-4">Onboarding Owner</th>
                <th className="px-6 py-4">Plan Tier</th>
                <th className="px-6 py-4">Billing Status</th>
                <th className="px-6 py-4">Fulfillment End</th>
                <th className="px-6 py-4 text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {stores.map((st) => (
                <tr key={st._id} className="hover:bg-slate-50/20">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{st.name}</p>
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
                      onClick={() => handleOpenOverride(st)}
                      className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg cursor-pointer"
                      title="Adjust Subscription"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleFreeze(st._id)}
                      className="p-1.5 border border-rose-100 dark:border-rose-950 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg cursor-pointer"
                      title="Freeze Store / Toggle Active"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Modify Store Subscription</h3>

            <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Plan Tier</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={overridePlan}
                  onChange={(e) => setOverridePlan(e.target.value)}
                >
                  <option value="free">Free</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Status</label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={overrideStatus}
                  onChange={(e) => setOverrideStatus(e.target.value)}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Add Duration (Days)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                  placeholder="30"
                  value={overrideDays}
                  onChange={(e) => setOverrideDays(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-650 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Apply Settings
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
