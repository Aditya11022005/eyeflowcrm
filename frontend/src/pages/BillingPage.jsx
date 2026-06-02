import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Receipt, CreditCard, Sparkles, AlertTriangle, ArrowRight, 
  ShieldCheck, Check, Loader2, Plus, Trash, X, Coins 
} from 'lucide-react';
import api from '../utils/api.js';
import { updateStoreInfo } from '../store/authSlice.js';

const BillingPage = () => {
  const { user, store } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [invoices, setInvoices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Simulated Razorpay Modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [priceToPay, setPriceToPay] = useState(299);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');



  // Custom Invoice Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceTermsEdit, setInvoiceTermsEdit] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [invoiceStatus, setInvoiceStatus] = useState('paid');
  const [invoiceError, setInvoiceError] = useState('');
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  // Loyalty states
  const [redeemPoints, setRedeemPoints] = useState('0');
  const [selectedPatientPoints, setSelectedPatientPoints] = useState(0);

  // Inventory Auto-suggest states
  const [inventoryItemsList, setInventoryItemsList] = useState([]);
  const [activeRowIdx, setActiveRowIdx] = useState(null);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing/invoices');
      if (res.data.success) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await api.get('/public/landing-data');
      if (res.data.success) {
        setPackages(res.data.packages || []);
      }
    } catch (err) {
      console.error('Error fetching packages for billing:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPackages();
  }, []);


  // Fetch patients lists for selector dropdown
  useEffect(() => {
    const loadPatientsOptions = async () => {
      try {
        const res = await api.get('/patients?limit=100');
        if (res.data.success) {
          setPatients(res.data.patients || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadPatientsOptions();
  }, []);

  // Fetch inventory for item suggestions
  useEffect(() => {
    if (showInvoiceModal) {
      setInvoiceTermsEdit(store?.invoiceTerms || '');
      const loadInventoryOptions = async () => {
        try {
          const res = await api.get('/inventory?limit=1000');
          if (res.data.success) {
            setInventoryItemsList(res.data.inventory || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadInventoryOptions();
    }
  }, [showInvoiceModal, store]);

  const handleAddItemRow = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItemRow = (index) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  const filteredSuggestions = (searchText) => {
    if (!searchText || !searchText.trim()) return [];
    return inventoryItemsList.filter(item => 
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchText.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(searchText.toLowerCase()))
    ).slice(0, 5); // Limit to top 5 matches
  };

  const calculateInvoiceSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
  };

  const calculateInvoiceTotal = () => {
    const sub = calculateInvoiceSubtotal();
    const disc = Number(discount) || 0;
    const pointsDisc = (store?.loyaltyPointsEnabled ? Number(redeemPoints) : 0) * (store?.pointValueInRupees || 1.0);
    const tx = Number(tax) || 0;
    return Math.max(0, sub - disc - pointsDisc + tx);
  };

  const handleCreateCustomInvoice = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setInvoiceError('Please select a patient.');
      return;
    }
    if (invoiceItems.some(i => !i.description || i.price <= 0)) {
      setInvoiceError('Please enter a description and price for all items.');
      return;
    }

    setGeneratingInvoice(true);
    setInvoiceError('');

    try {
      const res = await api.post('/billing/invoices', {
        patientId: selectedPatientId,
        items: invoiceItems,
        discount: Number(discount),
        redeemPoints: store?.loyaltyPointsEnabled ? Number(redeemPoints) : 0,
        tax: Number(tax),
        paymentMethod,
        status: invoiceStatus,
        terms: invoiceTermsEdit,
      });

      if (res.data.success) {
        setShowInvoiceModal(false);
        // Reset states
        setSelectedPatientId('');
        setInvoiceItems([{ description: '', quantity: 1, price: 0 }]);
        setDiscount('0');
        setRedeemPoints('0');
        setSelectedPatientPoints(0);
        setTax('0');
        setPaymentMethod('cash');
        setInvoiceStatus('paid');
        fetchInvoices();
      }
    } catch (err) {
      setInvoiceError(err.response?.data?.message || 'Error generating invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handleSendWhatsAppDirect = (invoice) => {
    if (!invoice || !invoice.patientId) return;

    const patient = invoice.patientId;
    const invoiceLink = window.location.origin + "/invoices/" + invoice._id;

    const message = `*INVOICE RECEIPT - ${(store?.name || 'EYELITZ').toUpperCase()}*
--------------------------
*Invoice No:* ${invoice.invoiceNumber}
*Date:* ${new Date(invoice.createdAt).toLocaleDateString()}
*Patient Name:* ${patient.name}
*Total Amount:* ₹${invoice.totalAmount}

तुमचे बिल पाहण्यासाठी आणि PDF डाऊनलोड करण्यासाठी खालील लिंकवर क्लिक करा:
${invoiceLink}

Thank you for choosing ${store?.name || 'us'}!`;

    // Clean phone number: keep only digits
    let phoneNum = patient.phone.replace(/\D/g, '');
    if (phoneNum.length === 10) {
      phoneNum = '91' + phoneNum; // Add India prefix
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getPlanBasePrice = (plan) => {
    const matchedPkg = packages.find(p => p.billingCycle === (plan === 'monthly' ? 'month' : 'year'));
    return matchedPkg ? matchedPkg.price : (plan === 'monthly' ? 299 : 3399);
  };

  const openPaymentSimulator = (plan, price, pkgId = '') => {
    setSelectedPlan(plan);
    setPriceToPay(price);
    setSelectedPackageId(pkgId);
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
    setShowPayModal(true);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.post('/billing/validate-coupon', {
        code: couponCode,
        planType: selectedPlan,
        packageId: selectedPackageId || undefined
      });
      if (res.data.success) {
        setAppliedCoupon(res.data);
        setPriceToPay(res.data.finalPrice);
        setCouponError('');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setPriceToPay(getPlanBasePrice(selectedPlan));
    } finally {
      setCouponLoading(false);
    }
  };


  const handleSimulatePayment = async () => {
    setSubmitting(true);
    try {
      const mockPayId = `pay_rzp_mock_${Math.floor(100000000 + Math.random() * 900000000)}`;
      const res = await api.post('/billing/subscribe', {
        planType: selectedPlan,
        packageId: selectedPackageId || undefined,
        razorpayPaymentId: mockPayId,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      if (res.data.success) {
        dispatch(updateStoreInfo(res.data.store));
        setShowPayModal(false);
        alert(`Simulated payment successful! Plan upgraded to ${selectedPlan} tier.`);
      }
    } catch (err) {
      console.error(err);
      alert('Simulated billing error');
    } finally {
      setSubmitting(false);
    }
  };

  const isOwner = user?.role === 'owner';
  const isExpired = store?.subscriptionStatus === 'expired';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Billing & Subscriptions</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">View clinic transactions and manage SaaS subscription plans</p>
      </div>

      {/* Subscription upgrade card section (Visible to Owner only) */}
      {isOwner && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status Display Card */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Subscription Tier</span>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-black text-slate-800 dark:text-slate-100 capitalize">{store?.subscriptionPlan} Tier</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                  store?.subscriptionStatus === 'active' 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                    : store?.subscriptionStatus === 'trial'
                      ? 'bg-clinic-50 text-clinic-600 dark:bg-clinic-950/20'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                }`}>
                  {store?.subscriptionStatus}
                </span>
              </div>
              <div className="text-xs text-slate-500 space-y-1.5 border-t border-slate-50 dark:border-slate-850 pt-4">
                <p>Ends: {store?.subscriptionEndDate ? new Date(store.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                <p>Trial Limit: {store?.trialEndDate ? new Date(store.trialEndDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            {isExpired && (
              <div className="mt-6 p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-150 dark:border-rose-900 text-rose-600 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5" />
                Service locked. Renew plan.
              </div>
            )}
          </div>

          {/* Pricing Grid triggers */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
            {packages.length > 0 ? (
              packages.map((pkg) => {
                const isYearly = pkg.billingCycle === 'year';
                return (
                  <div key={pkg._id} className={`p-4 rounded-2xl border flex flex-col justify-between relative ${isYearly ? 'border-2 border-clinic-500 shadow-sm' : 'border-slate-150 dark:border-slate-800'}`}>
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-4 bg-clinic-500 text-white font-black text-[8px] px-2 py-0.5 rounded-full uppercase">{pkg.badge}</span>
                    )}
                    <div>
                      <h4 className={`font-bold text-sm ${isYearly ? 'text-clinic-650 dark:text-clinic-450' : 'text-slate-705 dark:text-slate-300'}`}>{pkg.name}</h4>
                      <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">₹{pkg.price}<span className="text-xs font-normal text-slate-400">/{pkg.billingCycle === 'month' ? 'mo' : 'yr'}</span></p>
                      <p className="text-[10px] text-slate-400 mt-2">{pkg.features[0] || 'Dynamic custom package features.'}</p>
                    </div>
                    <button
                      onClick={() => openPaymentSimulator(pkg.billingCycle === 'month' ? 'monthly' : 'yearly', pkg.price, pkg._id)}
                      className={`mt-6 w-full py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isYearly ? 'bg-clinic-500 text-white hover:bg-clinic-600 shadow-sm shadow-clinic-500/10' : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:opacity-90'}`}
                    >
                      Simulate Upgrade
                    </button>
                  </div>
                );
              })
            ) : (
              <>
                {/* Monthly Package */}
                <div className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Monthly Plan</h4>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">₹299<span className="text-xs font-normal text-slate-400">/mo</span></p>
                    <p className="text-[10px] text-slate-400 mt-2">Excellent for growing clinics needing month-to-month flexibility.</p>
                  </div>
                  <button
                    onClick={() => openPaymentSimulator('monthly', 299)}
                    className="mt-6 w-full py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Simulate Upgrade
                  </button>
                </div>

                {/* Yearly Savings Package */}
                <div className="p-4 rounded-2xl border-2 border-clinic-500 flex flex-col justify-between relative shadow-sm">
                  <span className="absolute -top-2.5 right-4 bg-clinic-500 text-white font-black text-[8px] px-2 py-0.5 rounded-full uppercase">15% Off</span>
                  <div>
                    <h4 className="font-bold text-sm text-clinic-650 dark:text-clinic-400">Annual Plan</h4>
                    <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">₹3,399<span className="text-xs font-normal text-slate-400">/yr</span></p>
                    <p className="text-[10px] text-slate-400 mt-2">Best value. Locked-in pricing with platform priority support.</p>
                  </div>
                  <button
                    onClick={() => openPaymentSimulator('yearly', 3399)}
                    className="mt-6 w-full py-2.5 bg-clinic-500 text-white rounded-xl text-xs font-bold hover:bg-clinic-600 transition-colors shadow-sm shadow-clinic-500/10 cursor-pointer"
                  >
                    Simulate Upgrade
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invoices List Table */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            Receipt & Invoices Catalog
          </h3>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="px-3.5 py-1.5 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-clinic-500/10"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Custom Invoice
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center">No invoices generated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3">Invoice ID</th>
                  <th className="py-3">Customer</th>
                  <th className="py-3">Method</th>
                  <th className="py-3">Fulfillment Status</th>
                  <th className="py-3 text-right">Invoice Amount</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-55/10">
                    <td className="py-3">
                      <span className="font-bold text-slate-700 dark:text-slate-200 block">{inv.invoiceNumber}</span>
                      <span className="text-[9px] text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="py-3 font-semibold">{inv.patientId?.name || 'Walk-in'}</td>
                    <td className="py-3 capitalize text-slate-500 font-medium">{inv.paymentMethod}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-150 text-slate-555'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-slate-850 dark:text-slate-150">₹{inv.totalAmount}</td>
                    <td className="py-3 text-right space-x-3">
                      <Link 
                        to={`/invoices/${inv._id}`}
                        className="text-clinic-600 hover:text-clinic-700 font-bold hover:underline"
                      >
                        View / Print
                      </Link>
                      {inv.patientId?.phone && (
                        <button 
                          onClick={() => handleSendWhatsAppDirect(inv)}
                          className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer bg-transparent border-0 outline-none"
                        >
                          WhatsApp
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Razorpay Simulation Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative overflow-hidden text-slate-900">
            {/* Header branding */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-black text-slate-800">Razorpay Payment Simulator</span>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
              <p className="text-xs text-slate-500">Upgrade Option:</p>
              <h4 className="text-base font-black capitalize mt-0.5 text-slate-800">{selectedPlan} Subscription Package</h4>
              
              {/* Coupon Code Input */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">Promo Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-250 text-xs uppercase font-mono tracking-wider text-slate-850 bg-white"
                    placeholder="e.g. WELCOME50"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    disabled={appliedCoupon || couponLoading}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedCoupon(null);
                        setCouponCode('');
                        setPriceToPay(getPlanBasePrice(selectedPlan));
                      }}
                      className="px-3 py-1.5 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold hover:bg-rose-100 cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-indigo-700 cursor-pointer"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[10px] text-rose-500 font-semibold mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Coupon "{appliedCoupon.code}" applied! Saved {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`}.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-600">Total payable (INR):</span>
                <span className="text-xl font-black text-indigo-650 flex flex-col items-end">
                  {appliedCoupon && (
                    <span className="text-xs line-through text-slate-400 font-bold">₹{getPlanBasePrice(selectedPlan)}</span>
                  )}
                  <span>₹{priceToPay}</span>
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mb-6 leading-relaxed">
              This triggers a sandbox payment simulation. No real funds or credit cards are involved. Confirming will set an active plan on the database.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayModal(false)}
                className="w-1/2 py-3 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSimulatePayment}
                disabled={submitting}
                className="w-1/2 py-3 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Simulate Success
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Invoice Generator Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Generate Custom Bill / Invoice</h3>

            {invoiceError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {invoiceError}
              </div>
            )}

            <form onSubmit={handleCreateCustomInvoice} className="space-y-4 text-xs">
              {/* Patient Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select Customer / Patient</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={selectedPatientId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedPatientId(id);
                    const selected = patients.find(p => p._id === id);
                    setSelectedPatientPoints(selected ? (selected.loyaltyPoints || 0) : 0);
                    setRedeemPoints('0');
                  }}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              {/* Invoice Line Items */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-clinic-600">Line Items List</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const fee = store?.eyeCheckupFee || 100;
                        const exists = invoiceItems.some(item => item.description === 'Eye Checkup Fee');
                        if (!exists) {
                          if (invoiceItems.length === 1 && !invoiceItems[0].description && Number(invoiceItems[0].price) === 0) {
                            setInvoiceItems([{ description: 'Eye Checkup Fee', quantity: 1, price: fee }]);
                          } else {
                            setInvoiceItems([...invoiceItems, { description: 'Eye Checkup Fee', quantity: 1, price: fee }]);
                          }
                        }
                      }}
                      className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      + Eye Checkup (₹{store?.eyeCheckupFee || 100})
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItemRow}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      + Add Item Row
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {invoiceItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1 relative">
                        {idx === 0 && <label className="block text-[9px] font-bold text-slate-400 mb-1">Description</label>}
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lens Solution / Eye Drop"
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          onFocus={() => setActiveRowIdx(idx)}
                          onBlur={() => setTimeout(() => setActiveRowIdx(null), 250)}
                        />
                        {activeRowIdx === idx && filteredSuggestions(item.description).length > 0 && (
                          <div className="absolute left-0 right-0 z-50 mt-1 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-850 rounded-xl shadow-xl max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredSuggestions(item.description).map((sug) => (
                              <button
                                key={sug._id}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-xs flex justify-between items-center"
                                onClick={() => {
                                  const newItems = [...invoiceItems];
                                  newItems[idx].description = sug.name;
                                  newItems[idx].price = sug.sellingPrice;
                                  setInvoiceItems(newItems);
                                  setActiveRowIdx(null);
                                }}
                              >
                                <div>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{sug.name}</span>
                                  {sug.brand && <span className="text-[10px] text-slate-450 block">{sug.brand}</span>}
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-clinic-600 dark:text-clinic-400 block">₹{sug.sellingPrice}</span>
                                  <span className={`text-[9px] font-bold ${sug.quantity <= sug.minStockAlert ? 'text-rose-500' : 'text-slate-400'}`}>
                                    Stock: {sug.quantity}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-16">
                        {idx === 0 && <label className="block text-[9px] font-bold text-slate-400 mb-1">Qty</label>}
                        <input
                          type="number"
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white text-center"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="w-24">
                        {idx === 0 && <label className="block text-[9px] font-bold text-slate-400 mb-1">Unit Price (₹)</label>}
                        <input
                          type="number"
                          required
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white text-right"
                          value={item.price}
                          onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                        />
                      </div>
                      {invoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 rounded-lg"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjustments & Ledger Box */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Adjustments & Payments</h4>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Discount (₹)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Tax Amount (₹)</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                      />
                    </div>
                  </div>

                  {store?.loyaltyPointsEnabled && selectedPatientPoints > 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          Loyalty Balance: {selectedPatientPoints} pts
                        </span>
                        <span className="text-slate-500 text-[9px]">(1 pt = ₹{store?.pointValueInRupees || 1})</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <label className="text-[9px] font-bold text-slate-500 uppercase shrink-0">Redeem Points:</label>
                        <input
                          type="number"
                          max={selectedPatientPoints}
                          min="0"
                          className="w-full px-2.5 py-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-lg text-xs dark:text-white font-bold"
                          value={redeemPoints}
                          onChange={(e) => {
                            const val = Math.min(Number(e.target.value), selectedPatientPoints);
                            setRedeemPoints(isNaN(val) ? '0' : String(val));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Payment Method</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100"
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
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Fulfillment Status</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value)}
                      >
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subtotal & final box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl flex flex-col justify-between border border-slate-100 dark:border-slate-800">
                  <div className="text-xs space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">Total Calculation</span>
                    <div className="flex justify-between"><span>Subtotal:</span> <span>₹{calculateInvoiceSubtotal()}</span></div>
                    <div className="flex justify-between"><span>Discount:</span> <span className="text-rose-500">-₹{discount}</span></div>
                    {store?.loyaltyPointsEnabled && Number(redeemPoints) > 0 && (
                      <div className="flex justify-between text-amber-600 dark:text-amber-450 font-bold">
                        <span>Points Discount:</span> 
                        <span>-₹{Number(redeemPoints) * (store?.pointValueInRupees || 1)}</span>
                      </div>
                    )}
                    <div className="flex justify-between"><span>Taxation:</span> <span>+₹{tax}</span></div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 flex justify-between font-black text-sm text-slate-800 dark:text-white">
                    <span>Total Amount:</span>
                    <span>₹{calculateInvoiceTotal()}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-[9px] font-bold text-slate-400 mb-1">Invoice Terms & Conditions (Editable)</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-xs dark:text-white font-medium"
                    value={invoiceTermsEdit}
                    onChange={(e) => setInvoiceTermsEdit(e.target.value)}
                    placeholder="Invoice terms..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingInvoice}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors cursor-pointer"
                >
                  {generatingInvoice ? 'Generating bill...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
