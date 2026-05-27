import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Eye, ClipboardList, Glasses, 
  CalendarPlus, CreditCard, ChevronRight, ArrowLeft, Trash2 
} from 'lucide-react';
import api from '../utils/api.js';

const PatientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const res = await api.get(`/patients/${id}`);
        if (res.data.success) {
          setPatient(res.data.patient);
          setPrescriptions(res.data.prescriptions);
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading patient details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatientDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient profile and all associated checkup files?')) return;

    try {
      const res = await api.delete(`/patients/${id}`);
      if (res.data.success) {
        navigate('/patients');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete patient record');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return <div className="p-6 text-center text-rose-500 font-bold">{error || 'Patient not found.'}</div>;
  }

  const age = patient.dob 
    ? new Date().getFullYear() - new Date(patient.dob).getFullYear()
    : 'N/A';

  return (
    <div className="space-y-6">
      {/* Back Button & header actions */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link to="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to list
        </Link>
        <button
          onClick={handleDelete}
          className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/30 rounded-xl transition-all"
          title="Delete Patient Record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Patient Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center font-bold text-lg">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">{patient.name}</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">Gender: {patient.gender}</p>
            </div>
          </div>

          <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
            <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{patient.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{patient.address || 'Address not listed'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-650 dark:text-slate-350">
              <User className="w-4 h-4 text-slate-400" />
              <span>DOB: {patient.dob ? `${new Date(patient.dob).toLocaleDateString()} (${age} yrs)` : 'N/A'}</span>
            </div>
          </div>

          {patient.notes && (
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">Medical History Summary</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                {patient.notes}
              </p>
            </div>
          )}

          {/* Quick CTA Actions */}
          <div className="space-y-2 pt-2">
            <Link 
              to={`/checkups?patientId=${patient._id}`}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-clinic-150 text-clinic-600 dark:border-clinic-900/50 dark:text-clinic-400 bg-clinic-50/20 dark:bg-clinic-950/10 text-xs font-bold hover:bg-clinic-50 dark:hover:bg-clinic-950/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                New Eye Checkup
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>

            <Link 
              to={`/orders?patientId=${patient._id}`}
              className="flex items-center justify-between w-full p-3 rounded-xl border border-emerald-150 text-emerald-600 dark:border-emerald-900/50 dark:text-emerald-450 bg-emerald-50/20 dark:bg-emerald-950/10 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all"
            >
              <span className="flex items-center gap-2">
                <Glasses className="w-4 h-4" />
                Order Glasses / Lenses
              </span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* History Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eye Checkups History */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 mb-4 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              Vision Diagnostic History
            </h3>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No checkups recorded. Add one above to begin.</p>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((pr) => (
                  <div key={pr._id} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-800 hover:border-slate-250 transition-all space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {new Date(pr.checkupDate).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 ml-2">
                          by {pr.doctorId?.name || 'Optometrist'}
                        </span>
                      </div>
                      <Link 
                        to={`/prescriptions/${pr._id}`}
                        className="text-clinic-600 font-bold hover:underline"
                      >
                        Print Rx
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                        <span className="font-bold text-clinic-600 block mb-1">Right Eye (OD)</span>
                        <p>Sph: {pr.rightEye.sph} | Cyl: {pr.rightEye.cyl} | Axis: {pr.rightEye.axis || '-'}</p>
                        <p className="mt-0.5">PD: {pr.rightEye.pd || '-'} | VA: {pr.rightEye.va || '-'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                        <span className="font-bold text-cyan-600 block mb-1">Left Eye (OS)</span>
                        <p>Sph: {pr.leftEye.sph} | Cyl: {pr.leftEye.cyl} | Axis: {pr.leftEye.axis || '-'}</p>
                        <p className="mt-0.5">PD: {pr.leftEye.pd || '-'} | VA: {pr.leftEye.va || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Glasses Orders History */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 mb-4 flex items-center gap-2">
              <Glasses className="w-4 h-4 text-slate-400" />
              Glasses & Lenses Orders
            </h3>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center">No orders recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-3">Order ID</th>
                      <th className="py-3">Fulfillment</th>
                      <th className="py-3">Payment</th>
                      <th className="py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-slate-55/10 dark:hover:bg-slate-900/10">
                        <td className="py-3">
                          <span className="font-bold text-slate-700 dark:text-slate-250 block">{o.orderNumber}</span>
                          <span className="text-[10px] text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                            o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {o.orderStatus.replace(/-/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                            o.paymentStatus === 'paid' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-550'
                          }`}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold">₹{o.finalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
