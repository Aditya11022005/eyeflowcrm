import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Glasses, Search, Plus, Filter, Calendar, ArrowRight, Eye, Play, CheckCircle2, ChevronRight, X } from 'lucide-react';
import api from '../utils/api.js';

const OrdersPage = () => {
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId') || '';

  const [orders, setOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]); // to look up frame SKUs
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery);
  const [frameBrand, setFrameBrand] = useState('');
  const [frameModel, setFrameModel] = useState('');
  const [frameColor, setFrameColor] = useState('');
  const [frameSku, setFrameSku] = useState('');
  const [framePrice, setFramePrice] = useState('0');

  const [lensType, setLensType] = useState('Single Vision');
  const [lensBrand, setLensBrand] = useState('');
  const [lensCoating, setLensCoating] = useState('Anti-Glare');
  const [lensPrice, setLensPrice] = useState('0');

  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [amountPaid, setAmountPaid] = useState('0');
  const [promisedDate, setPromisedDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitError, setSubmitError] = useState('');

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

  // Load lists when onboarding modal is opened
  useEffect(() => {
    const loadModalOptions = async () => {
      try {
        const patientRes = await api.get('/patients?limit=100');
        const invRes = await api.get('/inventory?category=frame');
        if (patientRes.data.success) setPatients(patientRes.data.patients || []);
        if (invRes.data.success) setInventory(invRes.data.inventory || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadModalOptions();
  }, []);

  // Pre-fill price when selecting a frame from stock list
  const handleFrameSkuChange = (sku) => {
    setFrameSku(sku);
    const item = inventory.find(i => i.sku === sku);
    if (item) {
      setFrameBrand(item.brand || '');
      setFrameModel(item.name || '');
      setFramePrice(String(item.sellingPrice));
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const res = await api.post('/orders', {
        patientId: selectedPatientId,
        frameDetails: {
          brand: frameBrand,
          model: frameModel,
          color: frameColor,
          sku: frameSku,
          price: Number(framePrice),
        },
        lensDetails: {
          type: lensType,
          brand: lensBrand,
          coating: lensCoating,
          price: Number(lensPrice),
        },
        discount: Number(discount),
        tax: Number(tax),
        amountPaid: Number(amountPaid),
        promisedDate: promisedDate || null,
        remarks,
        invoiceDate,
      });

      if (res.data.success) {
        setShowAddModal(false);
        // Reset states
        setSelectedPatientId('');
        setFrameBrand('');
        setFrameModel('');
        setFrameColor('');
        setFrameSku('');
        setFramePrice('0');
        setLensBrand('');
        setLensPrice('0');
        setDiscount('0');
        setTax('0');
        setAmountPaid('0');
        setPromisedDate('');
        setRemarks('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        fetchOrders();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error processing optical order.');
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

  const calculateTotal = () => {
    const fPrice = Number(framePrice) || 0;
    const lPrice = Number(lensPrice) || 0;
    const sub = fPrice + lPrice;
    const disc = Number(discount) || 0;
    const tx = Number(tax) || 0;
    return Math.max(0, sub - disc + tx);
  };

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
        <div className="flex items-center justify-center h-60">
          <div className="w-8 h-8 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-3xl">
          <Glasses className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No active orders</p>
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
                    o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
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
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-205">₹{o.amountPaid} / ₹{o.finalAmount}</span>
                </div>

                <div className="flex gap-1.5 flex-wrap justify-end">
                  {o.paymentStatus !== 'paid' && (
                    <button 
                      onClick={() => handleMarkPaid(o._id, o.finalAmount)}
                      className="px-2 py-1 text-[9px] font-black bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors"
                    >
                      Mark Paid
                    </button>
                  )}
                  {o.orderStatus === 'pending' && (
                    <button 
                      onClick={() => updateOrderStatus(o._id, 'sent-to-lab')}
                      className="px-2 py-1 text-[9px] font-extrabold bg-clinic-500 text-white rounded-lg flex items-center gap-0.5 hover:bg-clinic-600 cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5 fill-white" />
                      Send Lab
                    </button>
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
          <div className="w-full max-w-xl bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
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

            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select Patient</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              {/* Frame details selection */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-clinic-600 mb-2">1. Frame Specifications</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Select from Stock SKU</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100"
                      value={frameSku}
                      onChange={(e) => handleFrameSkuChange(e.target.value)}
                    >
                      <option value="">-- Choose Stock Item --</option>
                      {inventory.map(item => (
                        <option key={item._id} value={item.sku}>{item.name} ({item.brand}) - SKU: {item.sku} (Qty: {item.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Frame Color</label>
                    <input type="text" placeholder="Matte Black" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="col-span-2">
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Frame Brand / Brand details (if custom)</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={frameBrand} onChange={(e) => setFrameBrand(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Frame Price (₹)</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={framePrice} onChange={(e) => setFramePrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Lens Details */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <h4 className="text-xs font-bold text-emerald-600 mb-2">2. Lens Specifications</h4>
                
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Lens Type</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                      value={lensType}
                      onChange={(e) => setLensType(e.target.value)}
                    >
                      <option value="Single Vision">Single Vision</option>
                      <option value="Bifocal">Bifocal</option>
                      <option value="Progressive">Progressive</option>
                      <option value="Contact Lenses">Contact Lenses</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Lens Brand / Coating</label>
                    <input type="text" placeholder="Essilor Crizal Blue" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={lensBrand} onChange={(e) => setLensBrand(e.target.value)} />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-1">Lens Price (₹)</label>
                    <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={lensPrice} onChange={(e) => setLensPrice(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Price Calculations & Billing */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">3. Invoicing adjustments</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Discount (₹)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Taxes (₹)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={tax} onChange={(e) => setTax(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Amount Paid (₹)</label>
                      <input type="number" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Promised Date</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={promisedDate} onChange={(e) => setPromisedDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Invoice / Order Date</label>
                      <input type="date" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Order Summary box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800">
                  <div className="text-xs space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Pricing Summary</span>
                    <div className="flex justify-between"><span>Frame Cost:</span> <span>₹{framePrice}</span></div>
                    <div className="flex justify-between"><span>Lens Cost:</span> <span>₹{lensPrice}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span className="text-rose-500">-₹{discount}</span></div>
                    <div className="flex justify-between"><span>Taxes:</span> <span>+₹{tax}</span></div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-2 flex justify-between font-black text-sm text-slate-800 dark:text-white">
                    <span>Total Amount:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs"
                >
                  Finalize Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
