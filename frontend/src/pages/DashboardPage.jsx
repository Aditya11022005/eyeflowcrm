import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Glasses, IndianRupee, AlertTriangle, 
  Activity, ArrowRight, ShieldAlert
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../utils/api.js';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    dailyAppointments: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0,
  });
  const [charts, setCharts] = useState({
    revenueTrend: [],
    patientGrowth: [],
  });
  const [activities, setActivities] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setMetrics(res.data.metrics);
          setCharts(res.data.charts);
          setActivities(res.data.recentActivities || []);
          setLowStockList(res.data.lowStockList || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error loading dashboard report details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center gap-3">
        <ShieldAlert className="w-6 h-6" />
        <div>
          <h3 className="font-bold">Operational Error</h3>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Patients', value: metrics.totalPatients, icon: <Users className="w-5 h-5 text-clinic-600" />, bg: 'bg-clinic-50 dark:bg-clinic-950/20' },
    { title: "Today's Queue", value: metrics.dailyAppointments, icon: <Calendar className="w-5 h-5 text-emerald-600" />, bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Pending Orders', value: metrics.pendingOrders, icon: <Glasses className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Total Earnings', value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: <IndianRupee className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50 dark:bg-purple-950/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Clinic Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time store metrics and diagnostic summaries</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((c, i) => (
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line Chart */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">Revenue Growth (₹)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Registration Bar Chart */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4">Patient Registrations</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.patientGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="patients" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Catalog Warnings</h3>
            {metrics.lowStockItems > 0 && (
              <span className="flex items-center gap-1 text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full dark:bg-rose-950/20 font-bold">
                <AlertTriangle className="w-3 h-3" />
                {metrics.lowStockItems} Low
              </span>
            )}
          </div>

          <div className="space-y-3">
            {lowStockList.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">Stock levels optimal.</p>
            ) : (
              lowStockList.map((item) => (
                <div key={item._id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Brand: {item.brand} | SKU: {item.sku}</p>
                  </div>
                  <span className="font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-1 rounded">
                    Qty: {item.quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Recent Activity Log
          </h3>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No recent actions recorded.</p>
            ) : (
              activities.map((act, idx) => (
                <div key={idx} className="flex gap-4 items-start text-xs border-b border-slate-50 dark:border-slate-900 pb-3 last:border-0 last:pb-0">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-350">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{act.title}</p>
                    <p className="text-slate-500 dark:text-slate-400">{act.desc}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{new Date(act.time).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
