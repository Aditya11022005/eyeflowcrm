import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Gift, Calendar, MessageSquare, Star, Coins, 
  Save, Loader2, Play, CheckCircle, RefreshCw, Send, Users, AlertCircle 
} from 'lucide-react';
import api from '../utils/api.js';

const MarketingPage = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dashboard Data
  const [config, setConfig] = useState({
    loyaltyPointsEnabled: false,
    pointsPerRupee: 0.1,
    pointValueInRupees: 1.0,
    birthdayWishesEnabled: false,
    birthdayTemplate: '',
    checkupRemindersEnabled: false,
    checkupTemplate: '',
    googleReviewEnabled: false,
    googleReviewLink: '',
    googleReviewTemplate: '',
    whatsappGatewayProvider: 'none',
    whatsappGatewayInstanceId: '',
    whatsappGatewayToken: '',
  });

  const [birthdaysToday, setBirthdaysToday] = useState([]);
  const [anniversariesToday, setAnniversariesToday] = useState([]);
  const [checkupDue, setCheckupDue] = useState([]);
  const [logs, setLogs] = useState([]);

  // Campaign Trigger Form States
  const [selectedCheckupPatients, setSelectedCheckupPatients] = useState([]);
  const [selectedBirthdayPatients, setSelectedBirthdayPatients] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/marketing/dashboard');
      if (res.data.success) {
        setConfig(res.data.config);
        setBirthdaysToday(res.data.birthdaysToday || []);
        setAnniversariesToday(res.data.anniversariesToday || []);
        setCheckupDue(res.data.checkupDue || []);
        setLogs(res.data.logs || []);
        
        // Auto-select all checkup due patients by default
        setSelectedCheckupPatients((res.data.checkupDue || []).map(p => p._id));
        setSelectedBirthdayPatients((res.data.birthdaysToday || []).map(p => p._id));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load marketing dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.put('/marketing/config', config);
      if (res.data.success) {
        setConfig(res.data.config);
        setSuccessMsg('Marketing settings and loyalty config updated successfully.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error saving configuration.');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendSingleWhatsApp = async (campaignType, patient) => {
    setTriggering(true);
    setSuccessMsg('');
    setError('');
    try {
      const res = await api.post('/marketing/trigger', {
        campaignType,
        patientIds: [patient._id]
      });
      if (res.data.success) {
        setSuccessMsg(`Logged campaign for ${patient.name}`);
        fetchDashboardData();

        const log = res.data.logs?.[0];
        if (log) {
          let phoneNum = log.recipientPhone.replace(/\D/g, '');
          if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
          const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(log.message)}`;
          window.open(url, '_blank');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to trigger message.');
    } finally {
      setTriggering(false);
    }
  };

  const handleTriggerBirthdayWishes = async () => {
    if (selectedBirthdayPatients.length === 0) return;
    setTriggering(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/marketing/trigger', {
        campaignType: 'birthday',
        patientIds: selectedBirthdayPatients
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchDashboardData(); // Reload logs

        // Open WhatsApp tabs for triggered messages
        const triggeredLogs = res.data.logs || [];
        triggeredLogs.forEach((log, index) => {
          setTimeout(() => {
            let phoneNum = log.recipientPhone.replace(/\D/g, '');
            if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
            const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(log.message)}`;
            window.open(url, '_blank');
          }, index * 800);
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send birthday wishes.');
    } finally {
      setTriggering(false);
    }
  };

  const handleTriggerCheckupReminders = async () => {
    if (selectedCheckupPatients.length === 0) return;
    setTriggering(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/marketing/trigger', {
        campaignType: 'annual-reminder',
        patientIds: selectedCheckupPatients
      });
      if (res.data.success) {
        setSuccessMsg(res.data.message);
        fetchDashboardData(); // Reload logs

        // Open WhatsApp tabs for triggered messages
        const triggeredLogs = res.data.logs || [];
        triggeredLogs.forEach((log, index) => {
          setTimeout(() => {
            let phoneNum = log.recipientPhone.replace(/\D/g, '');
            if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
            const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(log.message)}`;
            window.open(url, '_blank');
          }, index * 800);
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send checkup reminders.');
    } finally {
      setTriggering(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      setError('Broadcast message cannot be empty.');
      return;
    }

    setSendingBroadcast(true);
    setSuccessMsg('');
    setError('');

    try {
      // Find all patients to send broadcast to (in this tenant)
      const patientRes = await api.get('/patients?limit=1000');
      const allPatients = patientRes.data.patients || [];
      const patientIds = allPatients.map(p => p._id);

      if (patientIds.length === 0) {
        setError('No patients found to broadcast message to.');
        setSendingBroadcast(false);
        return;
      }

      const res = await api.post('/marketing/trigger', {
        campaignType: 'bulk-broadcast',
        patientIds,
        customMessage: broadcastMessage
      });

      if (res.data.success) {
        setBroadcastMessage('');
        fetchDashboardData(); // Reload logs

        const triggeredLogs = res.data.logs || [];
        // Open WhatsApp for the first 10 to avoid page freeze
        const toOpen = triggeredLogs.slice(0, 10);
        toOpen.forEach((log, index) => {
          setTimeout(() => {
            let phoneNum = log.recipientPhone.replace(/\D/g, '');
            if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
            const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(log.message)}`;
            window.open(url, '_blank');
          }, index * 800);
        });

        if (triggeredLogs.length > 10) {
          setSuccessMsg(`Broadcast logged for ${triggeredLogs.length} patients. Opened WhatsApp Web tabs for the first 10. You can send to remaining patients via the Campaign Logs tab.`);
        } else {
          setSuccessMsg(`Broadcast successfully sent to ${triggeredLogs.length} patients!`);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send bulk broadcast.');
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 border-4 text-clinic-500 animate-spin mb-2" />
        <p className="text-xs text-slate-500">Loading Marketing Campaigns & Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-clinic-500" />
            Marketing & Loyalty Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Boost clinic revenues with smart WhatsApp/SMS campaigns and loyalty point rewards
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Data
        </button>
      </div>

      {/* Message banners */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'campaigns' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          Active Campaigns
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'broadcast' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          Bulk Broadcast (SMS/WhatsApp)
        </button>
        <button
          onClick={() => setActiveTab('loyalty')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'loyalty' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          Loyalty & Setup Config
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-3 border-b-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'logs' 
              ? 'border-clinic-500 text-clinic-600 dark:text-clinic-400' 
              : 'border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white'
          }`}
        >
          Campaign Logs
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Birthday Panel */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Birthdays Today</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-bold">
                    {birthdaysToday.length} due
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Patients having birthdays today. Wishes will be sent using the configured discount template.
                </p>

                {birthdaysToday.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No birthdays today. Check back tomorrow!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {birthdaysToday.map(p => (
                      <div key={p._id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/20">
                        <div>
                          <span className="font-semibold block text-slate-850 dark:text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendSingleWhatsApp('birthday', p)}
                            className="p-1 px-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg font-bold text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Send className="w-2.5 h-2.5" />
                            Send
                          </button>
                          <input
                            type="checkbox"
                            checked={selectedBirthdayPatients.includes(p._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBirthdayPatients([...selectedBirthdayPatients, p._id]);
                              } else {
                                setSelectedBirthdayPatients(selectedBirthdayPatients.filter(id => id !== p._id));
                              }
                            }}
                            className="rounded text-clinic-600 focus:ring-clinic-500 h-4 w-4"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {birthdaysToday.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex justify-end">
                  <button
                    onClick={handleTriggerBirthdayWishes}
                    disabled={triggering || selectedBirthdayPatients.length === 0}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-500/10 hover:bg-indigo-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {triggering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Send Birthday Wishes ({selectedBirthdayPatients.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Checkup Due Panel */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Annual Checkups Overdue</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">
                    {checkupDue.length} due
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Patients whose latest eye test was done more than 1 year (365 days) ago.
                </p>

                {checkupDue.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No patient overdue for annual eye checkup currently.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {checkupDue.map(p => (
                      <div key={p._id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/20">
                        <div>
                          <span className="font-semibold block text-slate-850 dark:text-white">{p.name}</span>
                          <span className="text-[10px] text-slate-400">Last checkup: {new Date(p.latestCheckup).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSendSingleWhatsApp('annual-reminder', p)}
                            className="p-1 px-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 rounded-lg font-bold text-[9px] flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Send className="w-2.5 h-2.5" />
                            Send
                          </button>
                          <input
                            type="checkbox"
                            checked={selectedCheckupPatients.includes(p._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCheckupPatients([...selectedCheckupPatients, p._id]);
                              } else {
                                setSelectedCheckupPatients(selectedCheckupPatients.filter(id => id !== p._id));
                              }
                            }}
                            className="rounded text-clinic-600 focus:ring-clinic-500 h-4 w-4"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {checkupDue.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex justify-end">
                  <button
                    onClick={handleTriggerCheckupReminders}
                    disabled={triggering || selectedCheckupPatients.length === 0}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold shadow-md shadow-amber-500/10 hover:bg-amber-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {triggering ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        Send Checkup Reminders ({selectedCheckupPatients.length})
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Bulk Broadcast */}
        {activeTab === 'broadcast' && (
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-5 h-5 text-clinic-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Send Bulk SMS/WhatsApp Broadcast</h3>
              </div>

              <p>
                This will send your message template to all patient profiles registered in Eyelitz. Standard placeholders like <code className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded text-[10px]">[Patient Name]</code> and <code className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded text-[10px]">[Clinic Name]</code> can be used in your message text.
              </p>
 
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Broadcast Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Hello [Patient Name], Eyelitz Clinic is offering a flat 20% discount on all premium sunglasses this summer! Bring this SMS to redeem."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  Sends message to all registered patient contacts.
                </div>
                <button
                  type="submit"
                  disabled={sendingBroadcast || !broadcastMessage}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {sendingBroadcast ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Broadcasting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Send Broadcast Campaign
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Loyalty & Configurations */}
        {activeTab === 'loyalty' && (
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Loyalty settings */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Coins className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Loyalty Points System</h3>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="block font-bold text-xs text-slate-850 dark:text-white">Enable Loyalty System</span>
                  <span className="text-[10px] text-slate-400">Reward patients when they make purchases</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.loyaltyPointsEnabled}
                    onChange={(e) => setConfig({ ...config, loyaltyPointsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:height-4 after:w-4 after:transition-all peer-checked:bg-clinic-500"></div>
                </label>
              </div>

              {config.loyaltyPointsEnabled && (
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Points Per 1 Rupee spent
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.pointsPerRupee}
                      onChange={(e) => setConfig({ ...config, pointsPerRupee: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      1 Point Value (INR)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={config.pointValueInRupees}
                      onChange={(e) => setConfig({ ...config, pointValueInRupees: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp Gateway Settings */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Background WhatsApp Automation</h3>
              </div>
              <p className="text-[11px] text-slate-400">
                To send birthday wishes and checkup reminders 100% automatically in the background at 9:00 AM (without opening browser tabs), configure a WhatsApp Gateway API like Ultramsg.
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Gateway Provider
                </label>
                <select
                  value={config.whatsappGatewayProvider || 'none'}
                  onChange={(e) => setConfig({ ...config, whatsappGatewayProvider: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                >
                  <option value="none">None (Manual Redirect via WhatsApp Web Link)</option>
                  <option value="ultramsg">Ultramsg API Gateway (100% Automatic background)</option>
                </select>
              </div>

              {config.whatsappGatewayProvider === 'ultramsg' && (
                <div className="space-y-3 animate-fadeIn">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Ultramsg Instance ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. instance12345"
                      value={config.whatsappGatewayInstanceId || ''}
                      onChange={(e) => setConfig({ ...config, whatsappGatewayInstanceId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Ultramsg Token
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter API token"
                      value={config.whatsappGatewayToken || ''}
                      onChange={(e) => setConfig({ ...config, whatsappGatewayToken: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Campaign templates settings */}
            <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Star className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Campaign Templates & Settings</h3>
              </div>

              {/* Birthday template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Birthday Wishes Template
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.birthdayWishesEnabled}
                      onChange={(e) => setConfig({ ...config, birthdayWishesEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-clinic-500"></div>
                  </label>
                </div>
                <textarea
                  rows={2}
                  disabled={!config.birthdayWishesEnabled}
                  value={config.birthdayTemplate}
                  onChange={(e) => setConfig({ ...config, birthdayTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Checkup template */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Annual Checkup Reminders
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.checkupRemindersEnabled}
                      onChange={(e) => setConfig({ ...config, checkupRemindersEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-clinic-500"></div>
                  </label>
                </div>
                <textarea
                  rows={2}
                  disabled={!config.checkupRemindersEnabled}
                  value={config.checkupTemplate}
                  onChange={(e) => setConfig({ ...config, checkupTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                />
              </div>

              {/* Google Reviews */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Google Review Request
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.googleReviewEnabled}
                      onChange={(e) => setConfig({ ...config, googleReviewEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-clinic-500"></div>
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <input
                    type="url"
                    disabled={!config.googleReviewEnabled}
                    placeholder="https://g.page/r/your-google-place-id/review"
                    value={config.googleReviewLink}
                    onChange={(e) => setConfig({ ...config, googleReviewLink: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                  />
                  <textarea
                    rows={2}
                    disabled={!config.googleReviewEnabled}
                    placeholder="Template"
                    value={config.googleReviewTemplate}
                    onChange={(e) => setConfig({ ...config, googleReviewTemplate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {savingConfig ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Configurations
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Logs */}
        {activeTab === 'logs' && (
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Megaphone className="w-5 h-5 text-clinic-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-250 text-sm">Campaign Execution History</h3>
            </div>

            {logs.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No marketing campaigns sent out yet. Run them in the Active Campaigns or Broadcast tab!
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3">Sent Time</th>
                      <th className="py-3">Campaign Type</th>
                      <th className="py-3">Recipient</th>
                      <th className="py-3">Message Content</th>
                      <th className="py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-55/10 dark:hover:bg-slate-900/10">
                        <td className="py-3 whitespace-nowrap text-slate-500">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                            log.campaignType === 'birthday' ? 'bg-indigo-50 text-indigo-600' :
                            log.campaignType === 'annual-reminder' ? 'bg-amber-50 text-amber-600' :
                            log.campaignType === 'google-review' ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-550'
                          }`}>
                            {log.campaignType.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-slate-750 dark:text-slate-200 block">{log.recipientName}</span>
                          <span className="text-[10px] text-slate-400">{log.recipientPhone}</span>
                        </td>
                        <td className="py-3 max-w-sm truncate text-slate-650 dark:text-slate-350" title={log.message}>
                          {log.message}
                        </td>
                        <td className="py-3 text-right flex items-center justify-end gap-2">
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full">
                            Sent
                          </span>
                          <button
                            onClick={() => {
                              let phoneNum = log.recipientPhone.replace(/\D/g, '');
                              if (phoneNum.length === 10) phoneNum = '91' + phoneNum;
                              const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(log.message)}`;
                              window.open(url, '_blank');
                            }}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Resend or Send via WhatsApp Web"
                          >
                            <Send className="w-2.5 h-2.5" />
                            Send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default MarketingPage;
