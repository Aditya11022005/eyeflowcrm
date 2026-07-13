import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import emailjs from '@emailjs/browser';
import { Glasses, Search, Plus, Filter, Calendar, ArrowRight, Eye, Play, CheckCircle2, ChevronRight, X, FlaskConical } from 'lucide-react';
import api from '../utils/api.js';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId') || '';
  const { store } = useSelector((state) => state.auth);

  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]); // Frame and lens stock catalog
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  // Lab Partner Dispatch States
  const [labPartners, setLabPartners] = useState([]);
  const [dispatchOrderId, setDispatchOrderId] = useState(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [dispatchDataResult, setDispatchDataResult] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  const [discount, setDiscount] = useState('0');
  const [discountType, setDiscountType] = useState('value'); // 'value' (₹) or 'percent' (%)
  const [tax, setTax] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [promisedDate, setPromisedDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitError, setSubmitError] = useState('');

  // Multi-item order specs
  const [orderItems, setOrderItems] = useState([
    {
      id: 1,
      frameBrand: '',
      frameModel: '',
      frameColor: '',
      frameSku: '',
      framePrice: '0',
      lensType: 'Single Vision',
      lensBrand: '',
      lensCoating: 'Anti-Glare',
      lensSku: '',
      lensPrice: '0',
      frameSearchQuery: '',
      lensSearchQuery: '',
      showFrameDropdown: false,
      showLensDropdown: false
    }
  ]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?status=${statusFilter}&search=${search}`);
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 450);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter]);

  // Load lists when page loads
  useEffect(() => {
    const loadModalOptions = async () => {
      try {
        const patientRes = await api.get('/patients?limit=100');
        const invRes = await api.get('/inventory');
        const partnersRes = await api.get('/partners');
        if (patientRes.data.success) setPatients(patientRes.data.patients || []);
        if (invRes.data.success) setInventory(invRes.data.inventory || []);
        if (partnersRes.data.success) setLabPartners(partnersRes.data.partners.filter(p => p.active) || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadModalOptions();
  }, []);

  // Pre-populate patient query if query param is present
  useEffect(() => {
    if (patientIdFromQuery && patients.length > 0) {
      const p = patients.find(p => p._id === patientIdFromQuery);
      if (p) {
        setPatientSearchQuery(`${p.name} (${p.phone})`);
        setSelectedPatientId(p._id);
      }
    }
  }, [patientIdFromQuery, patients]);

  // Handle clicks outside of dropdown lists
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close patient search if clicking outside
      const patientContainer = document.getElementById('patient-select-container');
      if (patientContainer && !patientContainer.contains(event.target)) {
        setShowPatientDropdown(false);
      }
      
      // Close frame & lens dropdowns
      setOrderItems(prev => prev.map((item, idx) => {
        const frameContainer = document.getElementById(`frame-sku-container-${idx}`);
        const lensContainer = document.getElementById(`lens-sku-container-${idx}`);
        
        let showFrame = item.showFrameDropdown;
        let showLens = item.showLensDropdown;
        
        if (frameContainer && !frameContainer.contains(event.target)) {
          showFrame = false;
        }
        if (lensContainer && !lensContainer.contains(event.target)) {
          showLens = false;
        }
        
        return {
          ...item,
          showFrameDropdown: showFrame,
          showLensDropdown: showLens
        };
      }));
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Onboard multiple specs
  const handleAddOrderItem = () => {
    setOrderItems(prev => [
      ...prev,
      {
        id: Date.now(),
        frameBrand: '',
        frameModel: '',
        frameColor: '',
        frameSku: '',
        framePrice: '0',
        lensType: 'Single Vision',
        lensBrand: '',
        lensCoating: 'Anti-Glare',
        lensSku: '',
        lensPrice: '0',
        frameSearchQuery: '',
        lensSearchQuery: '',
        showFrameDropdown: false,
        showLensDropdown: false
      }
    ]);
  };

  const handleRemoveOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Pre-fill fields when selecting items from stock
  const handleFrameSkuChange = (index, sku) => {
    const item = inventory.find(i => i.sku === sku);
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index].frameSku = sku;
      newItems[index].frameSearchQuery = item ? `${item.name} (${item.brand}) - SKU: ${item.sku}` : sku;
      newItems[index].showFrameDropdown = false;
      if (item) {
        newItems[index].frameBrand = item.brand || '';
        newItems[index].frameModel = item.name || '';
        newItems[index].framePrice = String(item.sellingPrice);
      }
      return newItems;
    });
  };

  const handleLensSkuChange = (index, sku) => {
    const item = inventory.find(i => i.sku === sku);
    setOrderItems(prev => {
      const newItems = [...prev];
      newItems[index].lensSku = sku;
      newItems[index].lensSearchQuery = item ? `${item.name} (${item.brand}) - SKU: ${item.sku}` : sku;
      newItems[index].showLensDropdown = false;
      if (item) {
        newItems[index].lensBrand = item.brand || item.name || '';
        newItems[index].lensPrice = String(item.sellingPrice);
        if (item.description && item.description.toLowerCase().includes('progressive')) {
          newItems[index].lensType = 'Progressive';
        } else if (item.description && item.description.toLowerCase().includes('bifocal')) {
          newItems[index].lensType = 'Bifocal';
        } else if (item.description && item.description.toLowerCase().includes('contact')) {
          newItems[index].lensType = 'Contact Lenses';
        }
      }
      return newItems;
    });
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => {
      const fPrice = Number(item.framePrice) || 0;
      const lPrice = Number(item.lensPrice) || 0;
      return sum + fPrice + lPrice;
    }, 0);
  };

  const getDiscountAmount = () => {
    const sub = calculateSubtotal();
    const val = Number(discount) || 0;
    if (discountType === 'percent') {
      return Math.round(sub * (val / 100));
    }
    return val;
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const disc = getDiscountAmount();
    const tx = Number(tax) || 0;
    return Math.max(0, sub - disc + tx);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setSubmitError('Please select a patient.');
      return;
    }
    setSubmitError('');

    const totalSubtotal = calculateSubtotal();
    const totalDiscount = getDiscountAmount();
    const totalTax = Number(tax) || 0;
    const totalPaid = Number(amountPaid) || 0;

    try {
      // Send separate orders in a loop, allocating discount/tax/payments proportionally
      const promises = orderItems.map((item, idx) => {
        const itemSubtotal = (Number(item.framePrice) || 0) + (Number(item.lensPrice) || 0);
        const ratio = totalSubtotal > 0 ? (itemSubtotal / totalSubtotal) : (1 / orderItems.length);
        const itemDiscount = Math.round(totalDiscount * ratio);
        const itemTax = Math.round(totalTax * ratio);
        const itemPaid = Math.round(totalPaid * ratio);

        return api.post('/orders', {
          patientId: selectedPatientId,
          frameDetails: {
            brand: item.frameBrand,
            model: item.frameModel,
            color: item.frameColor,
            sku: item.frameSku,
            price: Number(item.framePrice),
          },
          lensDetails: {
            type: item.lensType,
            brand: item.lensBrand,
            coating: item.lensCoating,
            sku: item.lensSku || '',
            price: Number(item.lensPrice),
          },
          discount: itemDiscount,
          tax: itemTax,
          amountPaid: itemPaid,
          promisedDate: promisedDate || null,
          remarks: remarks + (orderItems.length > 1 ? ` (Eyeglass ${idx + 1} of ${orderItems.length})` : ''),
          invoiceDate,
          paymentMethod
        });
      });

      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.data.success);

      if (allSuccessful) {
        setShowAddModal(false);
        // Reset states
        setSelectedPatientId('');
        setPatientSearchQuery('');
        setOrderItems([
          {
            id: Date.now(),
            frameBrand: '',
            frameModel: '',
            frameColor: '',
            frameSku: '',
            framePrice: '0',
            lensType: 'Single Vision',
            lensBrand: '',
            lensCoating: 'Anti-Glare',
            lensSku: '',
            lensPrice: '0',
            frameSearchQuery: '',
            lensSearchQuery: '',
            showFrameDropdown: false,
            showLensDropdown: false
          }
        ]);
        setDiscount('0');
        setDiscountType('value');
        setTax('0');
        setAmountPaid('0');
        setPromisedDate('');
        setRemarks('');
        setPaymentMethod('cash');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        fetchOrders();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error processing optical orders.');
    }
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/orders/${id}`, { orderStatus: newStatus });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order fulfillment phase');
    }
  };

  const handleOpenDispatchModal = (orderId) => {
    setDispatchOrderId(orderId);
    setSelectedPartnerId(labPartners[0]?._id || '');
    setSelectedChannel('whatsapp');
    setDispatchDataResult(null);
    setDispatchLoading(false);
  };

  const handleConfirmDispatch = async () => {
    setDispatchLoading(true);
    try {
      let res;
      if (selectedPartnerId) {
        res = await api.post('/partners/dispatch', {
          orderId: dispatchOrderId,
          partnerId: selectedPartnerId,
          channel: selectedChannel
        });
      } else {
        res = await api.put(`/orders/${dispatchOrderId}`, {
          orderStatus: 'sent-to-lab',
          labPartnerId: null,
          labDispatchChannel: ''
        });
      }

      if (res.data.success) {
        fetchOrders();
        if (selectedPartnerId && res.data.dispatchData) {
          setDispatchDataResult({
            ...res.data.dispatchData,
            systemStatus: res.data.systemStatus
          });
        } else {
          setDispatchOrderId(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error assigning order to lab.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleSendEmailJS = async (dispatchData) => {
    const serviceId = 'service_ay96v1j';
    const templateId = 'template_nakxoa1';
    const publicKey = 'x4y8TIP6sPJ36mjYK';

    try {
      const templateParams = {
        email: dispatchData.email,
        order_number: dispatchData.orderNumber || '',
        patient_name: dispatchData.patient_name || 'N/A',
        promised_date: dispatchData.promised_date || 'N/A',
        
        frame_brand: dispatchData.frame_brand || 'N/A',
        frame_model: dispatchData.frame_model || 'N/A',
        frame_color: dispatchData.frame_color || 'N/A',
        frame_sku: dispatchData.frame_sku || 'N/A',
        
        lens_type: dispatchData.lens_type || 'N/A',
        lens_brand: dispatchData.lens_brand || 'N/A',
        lens_coating: dispatchData.lens_coating || 'N/A',
        lens_sku: dispatchData.lens_sku || 'N/A',
        
        od_sph: dispatchData.od_sph || '0.00',
        od_cyl: dispatchData.od_cyl || '0.00',
        od_axis: dispatchData.od_axis || '-',
        od_add: dispatchData.od_add || '-',
        od_pd: dispatchData.od_pd || '-',
        od_va: dispatchData.od_va || '-',
        
        os_sph: dispatchData.os_sph || '0.00',
        os_cyl: dispatchData.os_cyl || '0.00',
        os_axis: dispatchData.os_axis || '-',
        os_add: dispatchData.os_add || '-',
        os_pd: dispatchData.os_pd || '-',
        os_va: dispatchData.os_va || '-',
        
        remarks: dispatchData.remarks || 'N/A',
        
        clinic_name: dispatchData.clinic_name || store?.name || 'Clinic',
        clinic_phone: dispatchData.clinic_phone || store?.phone || 'N/A',
        clinic_email: dispatchData.clinic_email || store?.email || 'eyelitzcrm@gmail.com',
        clinic_address: dispatchData.clinic_address || store?.address || 'N/A'
      };

      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      alert('Email sent successfully via EmailJS!');
      setDispatchOrderId(null);
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Failed to send email directly. Falling back to default mail client.');
      window.location.href = `mailto:${dispatchData.email}?subject=Optical Lab Prescription Dispatch - ${dispatchData.orderNumber}&body=${encodeURIComponent(dispatchData.messageText + '\n\n---------------------------------------\nSent via Eyelitz CRM - eyelitz.com')}`;
      setDispatchOrderId(null);
    }
  };

  const handleMarkPaid = async (id, finalAmount) => {
    try {
      const res = await api.put(`/orders/${id}`, { amountPaid: finalAmount });
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert('Error updating order payment status');
    }
  };

  // Filter stock lists based on item queries
  const getFilteredFrames = (searchQuery) => {
    const frames = inventory.filter(item => item.category === 'frame');
    if (!searchQuery) return frames;
    return frames.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredLenses = (searchQuery) => {
    const lenses = inventory.filter(item => item.category === 'lens');
    if (!searchQuery) return lenses;
    return lenses.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const filteredPatients = patients.filter(p => {
    if (!patientSearchQuery) return true;
    return (
      p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
      p.phone.includes(patientSearchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Lab Orders</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage eyeglass orders and fulfillment progress</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order number or patient name..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 text-sm dark:text-white font-semibold"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="sent-to-lab">Sent to Lab</option>
            <option value="ready-for-pickup">Ready for Pickup</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Database Board */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded-lg w-28" />
                <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded-full w-20" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-850 rounded-lg w-full" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-850 rounded-lg w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded-lg w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded-lg w-24" />
                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-850 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-3xl">
          <Glasses className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-330">No active orders</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Create a customer order to track lens fabrication.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((o) => (
            <div key={o._id} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono block">{o.orderNumber}</span>
                    <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-sm mt-0.5">{o.patientId?.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider capitalize ${
                    o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 
                    o.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                  }`}>
                    {o.orderStatus.replace(/-/g, ' ')}
                  </span>
                </div>

                {/* Glass Specs */}
                <div className="text-[10px] space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {o.frameDetails?.brand && (
                    <p><span className="text-slate-400 font-semibold uppercase">Frame:</span> {o.frameDetails.brand} ({o.frameDetails.model || ''})</p>
                  )}
                  {o.lensDetails?.type && (
                    <p><span className="text-slate-400 font-semibold uppercase">Lens:</span> {o.lensDetails.type} ({o.lensDetails.coating || ''})</p>
                  )}
                  {o.promisedDate && (
                    <p className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Fulfillment: {new Date(o.promisedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Paid Status</span>
                  <span className="font-bold text-xs text-slate-850 dark:text-slate-200">₹{o.amountPaid} / ₹{o.finalAmount}</span>
                </div>

                <div className="flex gap-1.5 flex-wrap justify-end">
                  {o.orderStatus !== 'cancelled' && o.paymentStatus !== 'paid' && (
                    <button 
                      onClick={() => handleMarkPaid(o._id, o.finalAmount)}
                      className="px-2 py-1 text-[9px] font-black bg-purple-650 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                  {o.orderStatus === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleOpenDispatchModal(o._id)}
                        className="px-2 py-1 text-[9px] font-extrabold bg-clinic-500 text-white rounded-lg flex items-center gap-0.5 hover:bg-clinic-600 cursor-pointer"
                      >
                        <Play className="w-2.5 h-2.5 fill-white" />
                        Send Lab
                      </button>
                      <button 
                        onClick={() => setCancellingOrderId(o._id)}
                        className="px-2 py-1 text-[9px] font-extrabold bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center gap-0.5 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                        Cancel
                      </button>
                    </>
                  )}
                  {o.orderStatus === 'sent-to-lab' && (
                    <button 
                      onClick={() => updateOrderStatus(o._id, 'ready-for-pickup')}
                      className="px-2 py-1 text-[9px] font-extrabold bg-amber-500 text-white rounded-lg flex items-center gap-0.5 hover:bg-amber-600 cursor-pointer"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Ready
                    </button>
                  )}
                  {o.orderStatus === 'ready-for-pickup' && (
                    <button 
                      onClick={() => updateOrderStatus(o._id, 'delivered')}
                      className="px-2 py-1 text-[9px] font-extrabold bg-emerald-500 text-white rounded-lg flex items-center gap-0.5 hover:bg-emerald-600 cursor-pointer"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Deliver
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Create Eyeglass Order</h3>

            {submitError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleCreateOrder} className="space-y-5">
              
              {/* Searchable Patient Selector */}
              <div className="relative" id="patient-select-container">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select Patient</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Search patient by name or phone..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setSelectedPatientId(''); // Reset selection while typing
                      setShowPatientDropdown(true);
                    }}
                    onFocus={() => setShowPatientDropdown(true)}
                  />
                  {selectedPatientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId('');
                        setPatientSearchQuery('');
                        setShowPatientDropdown(true);
                      }}
                      className="absolute right-3 top-2.5 text-slate-405 hover:text-slate-650 text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {showPatientDropdown && (
                  <div className="absolute z-30 w-full mt-1 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPatients.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-500 italic">No patients found</div>
                    ) : (
                      filteredPatients.map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p._id);
                            setPatientSearchQuery(`${p.name} (${p.phone})`);
                            setShowPatientDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col ${
                            selectedPatientId === p._id ? 'bg-clinic-500/10 dark:bg-clinic-950/20 border-l-4 border-clinic-500' : ''
                          }`}
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{p.phone}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic list of eyeglass items */}
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className="p-5 rounded-3xl border border-slate-200 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/10 space-y-4 relative shadow-sm">
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOrderItem(item.id)}
                        className="absolute top-4 right-4 p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all text-[10px] font-black uppercase"
                      >
                        Remove Item
                      </button>
                    )}
                    
                    <span className="block text-[10px] font-black uppercase text-clinic-600 dark:text-clinic-400 tracking-wider">Order Item #{index + 1} Specifications</span>

                    {/* 1. Frame Specifications */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200">1. Frame Specifications</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Searchable Frame SKU */}
                        <div className="relative" id={`frame-sku-container-${index}`}>
                          <label className="block text-[9px] font-bold text-slate-405 mb-1.5 uppercase">Select from Stock SKU</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search Frame SKU or Name..."
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100"
                              value={item.frameSearchQuery}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrderItems(prev => {
                                  const newItems = [...prev];
                                  newItems[index].frameSearchQuery = val;
                                  newItems[index].frameSku = ''; // reset selection
                                  newItems[index].showFrameDropdown = true;
                                  return newItems;
                                });
                              }}
                              onFocus={() => {
                                setOrderItems(prev => {
                                  const newItems = [...prev];
                                  newItems[index].showFrameDropdown = true;
                                  return newItems;
                                });
                              }}
                            />
                            {item.frameSku && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderItems(prev => {
                                    const newItems = [...prev];
                                    newItems[index].frameSku = '';
                                    newItems[index].frameSearchQuery = '';
                                    newItems[index].showFrameDropdown = true;
                                    return newItems;
                                  });
                                }}
                                className="absolute right-2 top-2 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {item.showFrameDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                              {getFilteredFrames(item.frameSearchQuery).length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-500 italic">No frames found</div>
                              ) : (
                                getFilteredFrames(item.frameSearchQuery).map(f => (
                                  <button
                                    key={f._id}
                                    type="button"
                                    onClick={() => handleFrameSkuChange(index, f.sku)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col"
                                  >
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{f.name} ({f.brand})</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5">SKU: {f.sku} | Price: ₹{f.sellingPrice} | Qty: {f.quantity}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-405 mb-1.5 uppercase">Frame Color</label>
                          <input
                            type="text"
                            placeholder="Matte Black"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                            value={item.frameColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].frameColor = val;
                                return newItems;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-slate-405 mb-1.5 uppercase">Frame Brand / Model Details (if custom)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                            value={item.frameBrand}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].frameBrand = val;
                                return newItems;
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-405 mb-1.5 uppercase">Frame Price (₹)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                            value={item.framePrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].framePrice = val;
                                return newItems;
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Lens Specifications */}
                    <div className="space-y-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
                      <h4 className="text-[11px] font-black text-slate-800 dark:text-slate-200">2. Lens Specifications</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Searchable Lens SKU */}
                        <div className="relative" id={`lens-sku-container-${index}`}>
                          <label className="block text-[9px] font-bold text-slate-455 mb-1.5 uppercase">Select from Stock SKU (Lens)</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search Lens SKU or Name..."
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100"
                              value={item.lensSearchQuery}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrderItems(prev => {
                                  const newItems = [...prev];
                                  newItems[index].lensSearchQuery = val;
                                  newItems[index].lensSku = ''; // reset selection
                                  newItems[index].showLensDropdown = true;
                                  return newItems;
                                });
                              }}
                              onFocus={() => {
                                setOrderItems(prev => {
                                  const newItems = [...prev];
                                  newItems[index].showLensDropdown = true;
                                  return newItems;
                                });
                              }}
                            />
                            {item.lensSku && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOrderItems(prev => {
                                    const newItems = [...prev];
                                    newItems[index].lensSku = '';
                                    newItems[index].lensSearchQuery = '';
                                    newItems[index].showLensDropdown = true;
                                    return newItems;
                                  });
                                }}
                                className="absolute right-2 top-2 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
                              >
                                Clear
                              </button>
                            )}
                          </div>

                          {item.showLensDropdown && (
                            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                              {getFilteredLenses(item.lensSearchQuery).length === 0 ? (
                                <div className="px-3 py-2 text-xs text-slate-500 italic">No lenses found</div>
                              ) : (
                                getFilteredLenses(item.lensSearchQuery).map(l => (
                                  <button
                                    key={l._id}
                                    type="button"
                                    onClick={() => handleLensSkuChange(index, l.sku)}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex flex-col"
                                  >
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{l.name} ({l.brand})</span>
                                    <span className="text-[9px] text-slate-400 mt-0.5">SKU: {l.sku} | Price: ₹{l.sellingPrice} | Qty: {l.quantity}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-455 mb-1.5 uppercase">Lens Type</label>
                          <select
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                            value={item.lensType}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].lensType = val;
                                return newItems;
                              });
                            }}
                          >
                            <option value="Single Vision">Single Vision</option>
                            <option value="Bifocal">Bifocal</option>
                            <option value="Progressive">Progressive</option>
                            <option value="Contact Lenses">Contact Lenses</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="col-span-2">
                          <label className="block text-[9px] font-bold text-slate-455 mb-1.5 uppercase">Lens Brand / Coating / Coating Details</label>
                          <input
                            type="text"
                            placeholder="Essilor Crizal Blue"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                            value={item.lensBrand}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].lensBrand = val;
                                return newItems;
                              });
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-455 mb-1.5 uppercase">Lens Price (₹)</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                            value={item.lensPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              setOrderItems(prev => {
                                const newItems = [...prev];
                                newItems[index].lensPrice = val;
                                return newItems;
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add item button */}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleAddOrderItem}
                  className="px-4 py-2 border border-clinic-150 text-clinic-600 dark:border-clinic-900/50 dark:text-clinic-400 bg-clinic-50/20 rounded-xl text-xs font-bold hover:bg-clinic-50 dark:hover:bg-clinic-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Frame / Lens to Order
                </button>
              </div>

              {/* Invoicing, Price summary, calculations */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-850 dark:text-slate-250">3. Invoicing adjustments</h4>
                  
                  {/* Discount Section */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Discount Type</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <option value="value">Flat Discount (₹)</option>
                        <option value="percent">Percentage Discount (%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">
                        {discountType === 'percent' ? 'Discount Percentage (%)' : 'Discount Rupee Value (₹)'}
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        max={discountType === 'percent' ? '100' : undefined}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" 
                        value={discount} 
                        onChange={(e) => setDiscount(e.target.value)} 
                      />
                    </div>
                  </div>

                  {/* Payment specs */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Amount Paid (₹)</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" 
                        value={amountPaid} 
                        onChange={(e) => setAmountPaid(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Payment Method</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI / Scanner</option>
                        <option value="net-banking">Net Banking</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Taxes (₹)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={tax} onChange={(e) => setTax(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Promised Date</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white font-semibold" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Invoice / Order Date</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white font-semibold" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Pricing Summary Block */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl flex flex-col justify-between border border-slate-150 dark:border-slate-800 h-full">
                  <div className="text-xs space-y-2">
                    <span className="block text-[10px] font-black uppercase text-slate-400">Pricing Summary</span>
                    <div className="flex justify-between">
                      <span>Total Frame Cost:</span> 
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{orderItems.reduce((sum, item) => sum + (Number(item.framePrice) || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Lens Cost:</span> 
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{orderItems.reduce((sum, item) => sum + (Number(item.lensPrice) || 0), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span> 
                      <span className="text-rose-500 font-semibold">
                        -₹{getDiscountAmount().toLocaleString('en-IN')} {discountType === 'percent' && `(${discount}%)`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes:</span> 
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        +₹{(Number(tax) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-4 flex justify-between font-black text-sm text-slate-850 dark:text-white">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal().toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs cursor-pointer"
                >
                  Finalize Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative overflow-hidden">
            <button
              onClick={() => setCancellingOrderId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-slate-850 dark:text-white mb-2">Cancel Eyeglass Order</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to cancel this order? This action is permanent and will trigger the following processes:
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                  Restores frame and lens inventory stock quantities (+1 to inventory).
                </div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <div className="text-[10px] text-rose-800 dark:text-rose-300 font-semibold leading-relaxed">
                  Resets the order payment values to unpaid and clears all outstanding invoice balances.
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setCancellingOrderId(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = cancellingOrderId;
                  setCancellingOrderId(null);
                  await updateOrderStatus(id, 'cancelled');
                }}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 hover:bg-rose-600 transition-colors cursor-pointer"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Dispatch Modal */}
      {dispatchOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative">
            <button
              onClick={() => setDispatchOrderId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {!dispatchDataResult ? (
              <>
                <div className="flex items-center gap-2 mb-2 text-clinic-500">
                  <FlaskConical className="w-5 h-5 animate-pulse" />
                  <h3 className="text-base font-black text-slate-850 dark:text-white">Send Order to Lab</h3>
                </div>
                <p className="text-[11px] text-slate-455 mb-4">
                  Select a lab partner to fulfill manufacturing and choose how you want to dispatch specs.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Lab Partner</label>
                    <select
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100"
                      value={selectedPartnerId}
                      onChange={(e) => setSelectedPartnerId(e.target.value)}
                    >
                      <option value="">None (Send to lab without linking partner)</option>
                      {labPartners.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                    {labPartners.length === 0 && (
                      <p className="text-[9px] text-amber-500 mt-1">
                        ⚠️ No active lab partners registered. You can add profiles in the "Lab Partners" tab.
                      </p>
                    )}
                  </div>

                  {selectedPartnerId && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1.5">Dispatch Channel</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['whatsapp', 'email', 'sms'].map((ch) => (
                          <button
                            key={ch}
                            type="button"
                            onClick={() => setSelectedChannel(ch)}
                            className={`py-2 rounded-xl border font-bold text-xs capitalize cursor-pointer transition-all ${
                              selectedChannel === ch
                                ? 'border-clinic-500 bg-clinic-50 text-clinic-600 dark:bg-clinic-950/20 dark:text-clinic-400'
                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350'
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setDispatchOrderId(null)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-650 dark:text-slate-350 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDispatch}
                    disabled={dispatchLoading}
                    className="px-5 py-2 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs cursor-pointer disabled:opacity-50"
                  >
                    {dispatchLoading ? 'Sending...' : 'Confirm Send'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="text-base font-black text-slate-850 dark:text-white">Order Sent & Dispatched!</h3>
                </div>
                <p className="text-[11px] text-slate-455 mb-2">
                  The order status has been updated to <strong>sent-to-lab</strong>.
                </p>
                <div className="mb-4 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900 rounded-xl text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>System Status: {dispatchDataResult.systemStatus}</span>
                </div>
                <p className="text-[11px] text-slate-455 mb-4">
                  Outbound dispatch logs successfully generated. Click below to verify or trigger manual fallback client protocols for <strong>{dispatchDataResult.name}</strong>.
                </p>

                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto mb-5 font-mono text-[9px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                  {dispatchDataResult.messageText}
                </div>

                <div className="flex flex-col gap-2">
                  {selectedChannel === 'whatsapp' && (
                    <a
                      href={`https://api.whatsapp.com/send?phone=${dispatchDataResult.phone.replace(/\D/g, '')}&text=${encodeURIComponent(dispatchDataResult.messageText)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setDispatchOrderId(null)}
                      className="w-full text-center py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-650/15 flex items-center justify-center gap-1.5"
                    >
                      Send via WhatsApp
                    </a>
                  )}

                  {selectedChannel === 'email' && (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => handleSendEmailJS(dispatchDataResult)}
                        className="w-full text-center py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-650/15 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Send Email directly from System
                      </button>
                    </div>
                  )}

                  {selectedChannel === 'sms' && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(dispatchDataResult.messageText);
                        alert('Prescription Ticket text copied to clipboard! You can paste and send it via your SMS application.');
                        setDispatchOrderId(null);
                      }}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Copy Ticket & Close
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDispatchOrderId(null)}
                    className="w-full text-center py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer mt-1"
                  >
                    Close Dialog
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
