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

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/billing/public/invoices/${id}`);
        if (res.data.success) {
          setInvoice(res.data.invoice);
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

  const clinic = (invoice?.storeId && typeof invoice.storeId === 'object') ? invoice.storeId : (store || {});

  const handleWhatsAppSend = () => {
    if (!invoice || !invoice.patientId) return;

    const patient = invoice.patientId;
    const invoiceLink = window.location.origin + "/invoices/" + invoice._id;

    const message = `*INVOICE RECEIPT - ${(clinic.name || 'EYELITZ').toUpperCase()}*
--------------------------
*Invoice No:* ${invoice.invoiceNumber}
*Date:* ${new Date(invoice.createdAt).toLocaleDateString()}
*Patient Name:* ${patient.name}
*Total Amount:* ₹${invoice.totalAmount}

तुमचे बिल पाहण्यासाठी आणि PDF डाऊनलोड करण्यासाठी खालील लिंकवर क्लिक करा:
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
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
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

      {/* Printable Sheet Card */}
      <div className="p-8 md:p-12 rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-sm print-card">
        {/* Letterhead Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            {clinic.logo ? (
              <img src={clinic.logo} alt={clinic.name} className="h-12 w-auto max-w-[150px] object-contain rounded-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-clinic-50 text-clinic-600 flex items-center justify-center font-black text-sm border border-clinic-100">
                {clinic.name ? clinic.name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 3).toUpperCase() : 'EC'}
              </div>
            )}
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">{clinic.name || 'Eye Care Clinic'}</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Transaction Invoice Receipt</p>
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
            <span className="font-semibold text-slate-700">{invoice.invoiceNumber}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Billing Date</span>
            <span className="font-semibold text-slate-700">{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Payment Status</span>
            <span className="font-extrabold text-emerald-600 uppercase">{invoice.status}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="py-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-clinic-600 tracking-wider">Line Items Detail</h4>
          
          <table className="w-full text-left text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
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

        {/* Price Summary adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-slate-200 text-xs">
          <div className="md:col-span-2 space-y-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Invoice Terms & Remarks</span>
            <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              Thank you for your purchase. Optics frames support 1-year manufacturers warranties. Corrective lens scratches are not covered by warranty limits.
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Subtotal:</span>
              <span className="font-bold">₹{invoice.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Discount:</span>
              <span className="text-rose-500 font-bold">-₹{invoice.discount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Taxation:</span>
              <span className="font-bold">+₹{invoice.tax}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 font-black text-sm text-slate-800">
              <span>Total Paid:</span>
              <span>₹{invoice.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Footer print disclaimer */}
        <div className="border-t border-slate-150 pt-6 mt-12 text-center text-[10px] text-slate-450 font-medium space-y-1">
          <p>This invoice is electronically generated and managed via <strong>Eyelitz CRM</strong>.</p>
          <p>For platform inquiries, contact provider at <span className="text-clinic-600 font-semibold">billing@eyelitz.com</span></p>
          <p className="text-[9px] text-slate-350 mt-1">Payment Method: {invoice.paymentMethod?.toUpperCase()} | Status: {invoice.status?.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailsPage;
