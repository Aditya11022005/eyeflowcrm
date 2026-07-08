import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Printer, Send, Eye, Calendar, Sparkles, Building } from 'lucide-react';
import api from '../utils/api.js';

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const { user, store } = useSelector((state) => state.auth);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [tempTerms, setTempTerms] = useState('');
  const [updatingTerms, setUpdatingTerms] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/billing/public/invoices/${id}`);
        if (res.data.success) {
          setInvoice(res.data.invoice);
          setTempTerms(res.data.invoice.terms || '');
        }
      } catch (err) {
        console.error(err);
        setError('Error loading invoice details.');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleSaveTerms = async () => {
    setUpdatingTerms(true);
    try {
      const res = await api.put(`/billing/invoices/${id}`, { terms: tempTerms });
      if (res.data.success) {
        setInvoice({ ...invoice, terms: tempTerms });
        setIsEditingTerms(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error updating terms & conditions.');
    } finally {
      setUpdatingTerms(false);
    }
  };

  const clinic = (invoice?.storeId && typeof invoice.storeId === 'object') ? invoice.storeId : (store || {});

  const handleWhatsAppSend = () => {
    if (!invoice || !invoice.patientId) return;

    const patient = invoice.patientId;
    const invoiceLink = window.location.origin + "/invoices/" + invoice._id;

    const message = `*INVOICE RECEIPT - ${(clinic.name || 'EYELITZ').toUpperCase()}*
--------------------------
*Invoice No:* ${invoice.invoiceNumber}
*Date:* ${new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}
*Patient Name:* ${patient.name}
*Total Amount:* ₹${invoice.totalAmount}
*Amount Paid:* ₹${invoice.amountPaid || 0}
*Balance Due:* ₹${invoice.balanceDue || 0}
*Status:* ${invoice.status?.toUpperCase()}

तुम्चे बिल पाहण्यासाठी आणि PDF डाऊनलोड करण्यासाठी खालील लिंकवर क्लिक करा:
${invoiceLink}

Thank you for choosing ${clinic.name || 'us'}!`;

    // Clean phone number: keep only digits
    let phoneNum = patient.phone.replace(/\D/g, '');
    if (phoneNum.length === 10) {
      phoneNum = '91' + phoneNum; // Add India prefix by default if 10 digits
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !invoice) {
    return <div className="p-6 text-center text-rose-500 font-bold">{error || 'Invoice not found.'}</div>;
  }

  const patient = invoice.patientId;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Row (hides when printing) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 no-print pb-4">
        {user ? (
          <Link 
            to="/billing"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Billing
          </Link>
        ) : (
          <div />
        )}
        <div className="flex gap-2.5">
          {user && (
            <button
              onClick={handleWhatsAppSend}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer text-xs"
            >
              <Send className="w-4 h-4" />
              Send via WhatsApp
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </button>
        </div>
      </div>

      {/* Balance Payment Panel (Logged-in Store staff only) */}
      {user && invoice.balanceDue > 0 && (
        <div className="p-6 rounded-3xl border border-amber-200 dark:border-amber-900/30 bg-amber-500/5 dark:bg-amber-950/10 text-slate-900 dark:text-slate-100 shadow-sm space-y-3.5 no-print">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-500/10 text-amber-655 rounded-xl text-base">💳</span>
            <div>
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Manage Balance Payment</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Patient has paid ₹{invoice.amountPaid} advance. Remaining due is ₹{invoice.balanceDue}.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-grow">
              <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
              <input
                type="number"
                min="1"
                max={invoice.balanceDue}
                className="w-full pl-7 pr-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-darkbg-100 text-xs font-bold text-slate-800 dark:text-white"
                placeholder={`Enter amount (max ₹${invoice.balanceDue})`}
                id="balance-payment-input"
                defaultValue={invoice.balanceDue}
              />
            </div>
            <button
              onClick={async () => {
                const input = document.getElementById('balance-payment-input');
                const amt = Number(input?.value || invoice.balanceDue);
                if (isNaN(amt) || amt <= 0 || amt > invoice.balanceDue) {
                  alert('Please enter a valid payment amount.');
                  return;
                }
                const newPaid = (invoice.amountPaid || 0) + amt;
                try {
                  const res = await api.put(`/billing/invoices/${invoice._id}`, { amountPaid: newPaid });
                  if (res.data.success) {
                    setInvoice(res.data.invoice);
                    alert('Payment registered successfully!');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error updating payment.');
                }
              }}
              className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl text-xs font-bold hover:bg-clinic-600 shadow-md shadow-clinic-500/10 transition-all cursor-pointer text-center"
            >
              Confirm Payment
            </button>
            <button
              onClick={async () => {
                const newPaid = invoice.totalAmount;
                try {
                  const res = await api.put(`/billing/invoices/${invoice._id}`, { amountPaid: newPaid });
                  if (res.data.success) {
                    setInvoice(res.data.invoice);
                    alert('Full payment registered successfully!');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error updating payment.');
                }
              }}
              className="px-4 py-2.5 border border-clinic-150 text-clinic-600 dark:border-slate-850 dark:text-clinic-400 hover:bg-clinic-50 dark:hover:bg-slate-900/40 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Pay Full Due
            </button>
          </div>
        </div>
      )}

      {/* Printable Sheet Card */}
      <div className="p-8 md:p-12 rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm print-card">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            {clinic.logo ? (
              <img src={clinic.logo} alt={clinic.name} className="h-20 w-auto max-w-[250px] object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-clinic-50 text-clinic-600 flex items-center justify-center font-black text-sm border border-clinic-100">
                {clinic.name ? clinic.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'EC'}
              </div>
            )}
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">{clinic.name || 'Eye Care Clinic'}</span>
              <p className="text-[9px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">Transaction Invoice Receipt</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-500 space-y-0.5 max-w-xs">
            <p className="font-bold text-slate-800">{clinic.name || 'Eye Care Clinic'}</p>
            {clinic.address && <p className="leading-tight">{clinic.address}</p>}
            <p>Phone: {clinic.phone || 'N/A'}</p>
            <p>Email: {clinic.email || 'N/A'}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Customer Name</span>
            <span className="font-extrabold text-slate-805">{patient?.name || 'Walk-in'}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Invoice ID</span>
            <span className="font-semibold text-slate-705">{invoice.invoiceNumber}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Billing Date</span>
            <span className="font-semibold text-slate-705">{new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block font-mono">Payment Status</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
              invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-650 border border-emerald-105' :
              (invoice.amountPaid > 0 && invoice.balanceDue > 0) ? 'bg-amber-50 text-amber-655 border border-amber-105' :
              'bg-rose-50 text-rose-650 border border-rose-100'
            }`}>
              {(invoice.amountPaid > 0 && invoice.balanceDue > 0) ? 'partially-paid' : invoice.status}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-clinic-600 tracking-wider">Line Items Detail</h4>
          
          <table className="w-full text-left text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-750">
                <th className="px-4 py-2 border-r border-slate-200">Description</th>
                <th className="px-4 py-2 border-r border-slate-200 text-center">Quantity</th>
                <th className="px-4 py-2 border-r border-slate-200 text-right">Unit Price</th>
                <th className="px-4 py-2 text-right">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 border-r border-slate-200">{item.description}</td>
                  <td className="px-4 py-3 border-r border-slate-200 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 border-r border-slate-200 text-right">₹{item.price}</td>
                  <td className="px-4 py-3 text-right">₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Refraction Details Section */}
        {invoice.orderId && invoice.orderId.prescriptionId && (
          <div className="py-6 border-t border-slate-200 space-y-4">
            <h4 className="text-xs font-black uppercase text-clinic-600 tracking-wider">Vision Diagnostic (Refraction Details)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-750">
                    <th className="px-3 py-2 border-r border-slate-200 text-left">Eye</th>
                    <th className="px-3 py-2 border-r border-slate-200">Sphere (SPH)</th>
                    <th className="px-3 py-2 border-r border-slate-200">Cylinder (CYL)</th>
                    <th className="px-3 py-2 border-r border-slate-200">Axis</th>
                    <th className="px-3 py-2 border-r border-slate-200">Addition (ADD)</th>
                    <th className="px-3 py-2 border-r border-slate-200">Pupillary Distance (PD)</th>
                    <th className="px-3 py-2">Visual Acuity (VA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-850">
                  <tr>
                    <td className="px-3 py-2.5 border-r border-slate-200 text-left font-bold text-slate-700 bg-slate-50/50">Right Eye (OD)</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.rightEye?.sph || '0.00'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.rightEye?.cyl || '0.00'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.rightEye?.axis || '-'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.rightEye?.add || '-'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.rightEye?.pd || '-'}</td>
                    <td className="px-3 py-2.5">{invoice.orderId.prescriptionId.rightEye?.va || '-'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2.5 border-r border-slate-200 text-left font-bold text-slate-700 bg-slate-50/50">Left Eye (OS)</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.leftEye?.sph || '0.00'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.leftEye?.cyl || '0.00'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.leftEye?.axis || '-'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.leftEye?.add || '-'}</td>
                    <td className="px-3 py-2.5 border-r border-slate-200">{invoice.orderId.prescriptionId.leftEye?.pd || '-'}</td>
                    <td className="px-3 py-2.5">{invoice.orderId.prescriptionId.leftEye?.va || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {invoice.orderId.prescriptionId.remarks && (
              <p className="text-[10px] text-slate-500 italic mt-1">
                <strong>Doctor Remarks:</strong> {invoice.orderId.prescriptionId.remarks}
              </p>
            )}
          </div>
        )}

        {/* Price Summary adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-slate-200 text-xs">
          <div className="md:col-span-2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-slate-400 font-bold uppercase block font-mono">Invoice Terms & Remarks</span>
              {user && !isEditingTerms && (
                <button
                  onClick={() => setIsEditingTerms(true)}
                  className="text-[10px] text-clinic-600 hover:text-clinic-700 font-bold hover:underline no-print cursor-pointer bg-transparent border-0 outline-none"
                >
                  Edit Terms
                </button>
              )}
            </div>
            
            {isEditingTerms ? (
              <div className="space-y-2 no-print">
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium bg-slate-55 text-slate-900"
                  rows={4}
                  value={tempTerms}
                  onChange={(e) => setTempTerms(e.target.value)}
                  placeholder="Enter invoice-specific terms..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setTempTerms(invoice.terms || '');
                      setIsEditingTerms(false);
                    }}
                    disabled={updatingTerms}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTerms}
                    disabled={updatingTerms}
                    className="px-3 py-1.5 bg-clinic-500 text-white rounded-lg text-[10px] font-bold hover:bg-clinic-600 cursor-pointer"
                  >
                    {updatingTerms ? 'Saving...' : 'Save Terms'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line">
                {invoice.terms || clinic.invoiceTerms || "Thank you for your purchase. Optics frames support 1-year manufacturers warranties. Corrective lens scratches are not covered by warranty limits."}
              </p>
            )}
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Subtotal:</span>
              <span className="font-bold text-slate-800">₹{invoice.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Discount:</span>
              <span className="text-rose-500 font-bold">-₹{invoice.discount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Taxation:</span>
              <span className="font-bold text-slate-800">+₹{invoice.tax}</span>
            </div>
            <div className="flex justify-between border-t border-slate-250 pt-2 font-black text-xs text-slate-800">
              <span>Invoice Total:</span>
              <span>₹{invoice.totalAmount}</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-extrabold text-xs text-emerald-650">
              <span>{invoice.balanceDue > 0 ? 'Paid (Advance):' : 'Paid:'}</span>
              <span>₹{invoice.amountPaid || 0}</span>
            </div>
            <div className={`flex justify-between font-extrabold text-xs ${invoice.balanceDue > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
              <span>Balance Due:</span>
              <span>₹{invoice.balanceDue || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer print disclaimer */}
        <div className="border-t border-slate-150 pt-6 mt-12 text-center text-[10px] text-slate-450 font-medium space-y-1">
          <p>This invoice is electronically generated and managed via <strong>Eyelitz CRM</strong>.</p>
          <p>For platform inquiries, contact provider at <span className="text-clinic-600 font-semibold">eyelitzcrm@gmail.com</span></p>
          <p className="text-[9px] text-slate-350 mt-1 uppercase">Payment Method: {invoice.paymentMethod?.toUpperCase()} | Status: {((invoice.amountPaid > 0 && invoice.balanceDue > 0) ? 'partially-paid' : invoice.status)?.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
