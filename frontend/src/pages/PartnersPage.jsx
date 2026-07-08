import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  Plus, Pencil, Trash2, X, FlaskConical, User, Phone, Mail, 
  MapPin, AlertCircle, Glasses, Calendar, Clock, CheckCircle2, 
  ArrowLeft, Search, Check, Info
} from 'lucide-react';
import api from '../utils/api.js';

const PartnersPage = () => {
  const { user } = useSelector((state) => state.auth);
  const isOwner = user?.role === 'owner';

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selected Partner Details
  const [selectedPartnerId, setSelectedPartnerId] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Search Filter
  const [search, setSearch] = useState('');

  // Modals States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [deletingPartnerId, setDeletingPartnerId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [active, setActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/partners');
      if (res.data.success) {
        setPartners(res.data.partners);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve lab partners list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerDetails = async (partnerId) => {
    setDetailsLoading(true);
    try {
      const res = await api.get(`/partners/${partnerId}/orders`);
      if (res.data.success) {
        setPartnerDetails(res.data);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to load partner orders tracking statistics.');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPartnerId) {
      fetchPartnerDetails(selectedPartnerId);
    } else {
      setPartnerDetails(null);
    }
  }, [selectedPartnerId]);

  const handleOpenAddModal = () => {
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFormError('');
    setShowAddModal(true);
  };

  const handleCreatePartner = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setFormError('Please fill in Name, Phone and Email fields.');
      return;
    }
    setFormError('');
    setFormSubmitLoading(true);
    try {
      const res = await api.post('/partners', {
        name,
        contactPerson,
        phone,
        email,
        address
      });
      if (res.data.success) {
        setShowAddModal(false);
        fetchPartners();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error creating lab partner.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleOpenEditModal = (partner) => {
    setEditingPartner(partner);
    setName(partner.name || '');
    setContactPerson(partner.contactPerson || '');
    setPhone(partner.phone || '');
    setEmail(partner.email || '');
    setAddress(partner.address || '');
    setActive(partner.active);
    setFormError('');
    setShowEditModal(true);
  };

  const handleUpdatePartner = async (e) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      setFormError('Please fill in Name, Phone and Email fields.');
      return;
    }
    setFormError('');
    setFormSubmitLoading(true);
    try {
      const res = await api.put(`/partners/${editingPartner._id}`, {
        name,
        contactPerson,
        phone,
        email,
        address,
        active
      });
      if (res.data.success) {
        setShowEditModal(false);
        setEditingPartner(null);
        fetchPartners();
        if (selectedPartnerId === editingPartner._id) {
          fetchPartnerDetails(editingPartner._id);
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error updating lab partner details.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleDeletePartner = async () => {
    try {
      const res = await api.delete(`/partners/${deletingPartnerId}`);
      if (res.data.success) {
        setDeletingPartnerId(null);
        setSelectedPartnerId(null);
        fetchPartners();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing lab partner.');
    }
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.contactPerson && p.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-850 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-clinic-500" />
            Lab Partners Directory
          </h2>
          <p className="text-xs text-slate-450 mt-1">
            Manage contract optical labs, dispatch prescription orders, and track manufacturing queues.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-2xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Lab Partner
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 border border-rose-250 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Main Section: Lab Partners Directory */}
          <div className={`lg:col-span-1 space-y-4 ${selectedPartnerId ? 'hidden lg:block' : 'block'}`}>
            {/* Search filter bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, contact, email..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-xs font-semibold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredPartners.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850">
                <FlaskConical className="w-10 h-10 mx-auto text-slate-350 dark:text-slate-600 mb-3" />
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No partners found</h4>
                <p className="text-[10px] text-slate-450 mt-1 max-w-xs mx-auto">Create a partner profile to begin assigning glasses orders to external optical labs.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredPartners.map((partner) => (
                  <div
                    key={partner._id}
                    onClick={() => setSelectedPartnerId(partner._id)}
                    className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 relative group flex justify-between items-start ${
                      selectedPartnerId === partner._id
                        ? 'border-clinic-500 bg-clinic-500/5 dark:bg-clinic-950/10'
                        : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-darkbg-100 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-2 max-w-[70%]">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 group-hover:text-clinic-600 dark:group-hover:text-clinic-400 transition-colors truncate">
                          {partner.name}
                        </span>
                        {!partner.active && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 uppercase">Inactive</span>
                        )}
                      </div>
                      <div className="space-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {partner.contactPerson && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{partner.contactPerson}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{partner.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{partner.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Edit/Delete options */}
                    <div className="flex gap-1 no-print">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(partner);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                        title="Edit lab info"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingPartnerId(partner._id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                          title="Remove lab"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Section: Lab Partner Expanded Details & Orders tracking */}
          <div className={`lg:col-span-2 ${selectedPartnerId ? 'block' : 'hidden lg:block'}`}>
            {!selectedPartnerId ? (
              <div className="h-64 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-darkbg-100 text-center p-6">
                <FlaskConical className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse mb-3" />
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-350 uppercase tracking-wider">Select a Lab Partner</h4>
                <p className="text-[10px] text-slate-450 mt-1 max-w-xs">Click a partner on the left directory to track their orders pipeline, status ratios, and contact cards.</p>
              </div>
            ) : detailsLoading ? (
              <div className="h-64 flex items-center justify-center border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-darkbg-100">
                <div className="w-8 h-8 border-3 border-clinic-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : partnerDetails ? (
              <div className="space-y-6">
                {/* Back button visible only on mobile */}
                <button
                  onClick={() => setSelectedPartnerId(null)}
                  className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Directory
                </button>

                {/* Partner Card Panel */}
                <div className="p-6 border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h3 className="text-base font-black text-slate-850 dark:text-white">{partnerDetails.partner.name}</h3>
                      {partnerDetails.partner.contactPerson && (
                        <p className="text-[11px] text-slate-450 mt-0.5">Contact: {partnerDetails.partner.contactPerson}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`mailto:${partnerDetails.partner.email}`}
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email Lab
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?phone=${partnerDetails.partner.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-emerald-600 dark:text-emerald-450 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
                      <Phone className="w-4 h-4 text-clinic-500 shrink-0" />
                      <span>{partnerDetails.partner.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
                      <Mail className="w-4 h-4 text-clinic-500 shrink-0" />
                      <span className="truncate">{partnerDetails.partner.email}</span>
                    </div>
                    {partnerDetails.partner.address && (
                      <div className="flex items-start gap-2.5 text-slate-650 dark:text-slate-350 sm:col-span-2">
                        <MapPin className="w-4 h-4 text-clinic-500 shrink-0 mt-0.5" />
                        <span>{partnerDetails.partner.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Highlights */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-850 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-black text-slate-455">Total Orders</span>
                    <p className="text-xl font-black text-slate-850 dark:text-white mt-1">{partnerDetails.stats.totalOrdersCount}</p>
                  </div>
                  <div className="p-4 bg-amber-500/5 dark:bg-amber-955/10 border border-amber-200/50 dark:border-amber-900/20 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-black text-amber-600 dark:text-amber-450">Active Queue</span>
                    <p className="text-xl font-black text-amber-600 dark:text-amber-450 mt-1">{partnerDetails.stats.activeCount}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-955/10 border border-emerald-250/50 dark:border-emerald-900/20 rounded-2xl text-center">
                    <span className="text-[9px] uppercase tracking-wider font-black text-emerald-600 dark:text-emerald-450">Completed</span>
                    <p className="text-xl font-black text-emerald-650 dark:text-emerald-400 mt-1">{partnerDetails.stats.completedCount}</p>
                  </div>
                </div>

                {/* Orders Tracking List Table */}
                <div className="p-6 border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-750 dark:text-slate-300 tracking-wider">Orders Dispatched to this Partner</h4>

                  {partnerDetails.orders.length === 0 ? (
                    <p className="text-[10px] text-slate-450 italic py-4 text-center">No orders have been dispatched to this lab partner yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase tracking-wider text-[9px] font-black">
                            <th className="py-2.5">Order No</th>
                            <th className="py-2.5">Patient</th>
                            <th className="py-2.5">Promised Date</th>
                            <th className="py-2.5 text-center">Status</th>
                            <th className="py-2.5 text-right">Sent via</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium text-slate-800 dark:text-slate-200">
                          {partnerDetails.orders.map((ord) => (
                            <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <td className="py-3 font-mono font-bold text-clinic-600 dark:text-clinic-400">{ord.orderNumber}</td>
                              <td className="py-3 font-semibold">{ord.patientId?.name || 'Walk-in'}</td>
                              <td className="py-3 text-slate-500">
                                {ord.promisedDate ? new Date(ord.promisedDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  ord.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400' :
                                  ord.orderStatus === 'ready-for-pickup' ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400' :
                                  ord.orderStatus === 'sent-to-lab' ? 'bg-amber-50 text-amber-655 dark:bg-amber-950/20 dark:text-amber-450 animate-pulse' :
                                  ord.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-650 dark:bg-rose-950/20 dark:text-rose-450' :
                                  'bg-slate-50 text-slate-650 dark:bg-slate-800 dark:text-slate-350'
                                }`}>
                                  {ord.orderStatus === 'sent-to-lab' ? 'In Lab' : ord.orderStatus.replace(/-/g, ' ')}
                                </span>
                              </td>
                              <td className="py-3 text-right capitalize text-slate-500 text-[10px]">
                                {ord.labDispatchChannel ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-350 font-bold border border-slate-100 dark:border-slate-750">
                                    {ord.labDispatchChannel}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Outbound System Dispatch Logs */}
                <div className="p-6 border border-slate-200 dark:border-slate-850 rounded-3xl bg-white dark:bg-darkbg-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase text-slate-750 dark:text-slate-300 tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-clinic-500" />
                    System Outbound Notification History
                  </h4>

                  {!partnerDetails.logs || partnerDetails.logs.length === 0 ? (
                    <p className="text-[10px] text-slate-455 italic py-4 text-center">No system message notifications have been dispatched yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 uppercase tracking-wider text-[9px] font-black">
                            <th className="py-2.5">Sent Time</th>
                            <th className="py-2.5">Order</th>
                            <th className="py-2.5">Channel</th>
                            <th className="py-2.5">Recipient</th>
                            <th className="py-2.5 text-right">Preview Specs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-medium text-slate-800 dark:text-slate-200">
                          {partnerDetails.logs.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <td className="py-3 text-[10px] text-slate-500">
                                {new Date(log.sentAt).toLocaleString()}
                              </td>
                              <td className="py-3 font-mono font-bold text-clinic-600 dark:text-clinic-400">
                                {log.orderId?.orderNumber || 'N/A'}
                              </td>
                              <td className="py-3 capitalize">
                                <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                                  log.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-650 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900' :
                                  log.channel === 'email' ? 'bg-blue-50 text-blue-650 border-blue-150 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900' :
                                  'bg-slate-50 text-slate-655 border-slate-150 dark:bg-slate-800 dark:text-slate-355 dark:border-slate-700'
                                }`}>
                                  {log.channel}
                                </span>
                              </td>
                              <td className="py-3 text-slate-500 text-[10px] truncate max-w-[120px]">{log.recipient}</td>
                              <td className="py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => alert(log.messageText)}
                                  className="text-[9px] font-black text-clinic-500 hover:underline cursor-pointer"
                                >
                                  View Specs
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-850 dark:text-white mb-5">Add Lab Partner</h3>

            {formError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Lab/Partner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Optical Lab"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mahesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lab@cityoptics.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Lab Address</label>
                <textarea
                  rows="2"
                  placeholder="Street details, Landmark, City..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs cursor-pointer disabled:opacity-50"
                >
                  {formSubmitLoading ? 'Saving...' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {showEditModal && editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingPartner(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-850 dark:text-white mb-5">Edit Lab Partner</h3>

            {formError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Lab/Partner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Optical Lab"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Contact Person Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mahesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. lab@cityoptics.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Lab Address</label>
                <textarea
                  rows="2"
                  placeholder="Street details, Landmark, City..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="edit-partner-active"
                  className="w-4 h-4 text-clinic-500 border-slate-300 rounded focus:ring-clinic-500"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <label htmlFor="edit-partner-active" className="text-xs font-semibold text-slate-705 dark:text-slate-350 select-none">
                  Partner is Active (Can receive orders)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPartner(null);
                  }}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs cursor-pointer disabled:opacity-50"
                >
                  {formSubmitLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Partner Modal */}
      {deletingPartnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => setDeletingPartnerId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2 text-rose-500">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-base font-black text-slate-850 dark:text-white">Remove Lab Partner</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to remove this lab partner? They will be permanently deleted and all of their active/past order history assignments will be cleared.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingPartnerId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePartner}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-md shadow-rose-500/10 transition-colors text-xs cursor-pointer"
              >
                Yes, Remove Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersPage;
