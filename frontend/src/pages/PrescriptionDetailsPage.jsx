import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Printer, Eye, Calendar, Sparkles, Building } from 'lucide-react';
import api from '../utils/api.js';

const PrescriptionDetailsPage = () => {
  const { id } = useParams();
  const { store } = useSelector((state) => state.auth);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const res = await api.get(`/prescriptions/${id}`);
        if (res.data.success) {
          setPrescription(res.data.prescription);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading prescription detail.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescription();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-clinic-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !prescription) {
    return <div className="p-6 text-center text-rose-500 font-bold">{error || 'Prescription file not found.'}</div>;
  }

  const patient = prescription.patientId;
  const doctor = prescription.doctorId;
  const age = patient?.dob 
    ? new Date().getFullYear() - new Date(patient.dob).getFullYear()
    : 'N/A';
  const clinic = (prescription.storeId && typeof prescription.storeId === 'object') ? prescription.storeId : (store || {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back & Print Row */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 no-print">
        <Link 
          to={`/patients/${patient?._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patient Profile
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
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
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Refraction Prescription Letter</p>
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
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Patient Name</span>
            <span className="font-extrabold text-slate-805">{patient?.name}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Age / Gender</span>
            <span className="font-semibold text-slate-700 capitalize">{age} yrs / {patient?.gender}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Checkup Date</span>
            <span className="font-semibold text-slate-700">{new Date(prescription.checkupDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Prescribed By</span>
            <span className="font-extrabold text-slate-805">Dr. {doctor?.name || 'Optometrist'}</span>
          </div>
        </div>

        {/* Refraction Values Grid */}
        <div className="py-6 space-y-4">
          <h4 className="text-xs font-black uppercase text-clinic-600 tracking-wider">Refraction Eye Diagnostics (Rx)</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 border-r border-slate-200">Eye</th>
                  <th className="py-2.5 border-r border-slate-200">Sphere (SPH)</th>
                  <th className="py-2.5 border-r border-slate-200">Cylinder (CYL)</th>
                  <th className="py-2.5 border-r border-slate-200">Axis</th>
                  <th className="py-2.5 border-r border-slate-200">ADD</th>
                  <th className="py-2.5 border-r border-slate-200">P.D.</th>
                  <th className="py-2.5">Acuity (V.A.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                <tr>
                  <td className="py-3 border-r border-slate-200 bg-slate-50/50 font-bold text-clinic-650">OD (Right)</td>
                  <td className="py-3 border-r border-slate-200">{prescription.rightEye.sph}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.rightEye.cyl}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.rightEye.axis || '-'}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.rightEye.add || '-'}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.rightEye.pd || '-'}</td>
                  <td className="py-3">{prescription.rightEye.va || '-'}</td>
                </tr>
                <tr>
                  <td className="py-3 border-r border-slate-200 bg-slate-50/50 font-bold text-cyan-650">OS (Left)</td>
                  <td className="py-3 border-r border-slate-200">{prescription.leftEye.sph}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.leftEye.cyl}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.leftEye.axis || '-'}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.leftEye.add || '-'}</td>
                  <td className="py-3 border-r border-slate-200">{prescription.leftEye.pd || '-'}</td>
                  <td className="py-3">{prescription.leftEye.va || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Remarks and Lens Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-t border-slate-200 text-xs">
          <div className="md:col-span-2 space-y-2">
            <span className="text-[9px] text-slate-400 font-bold uppercase block">Optometrist Remarks / Instructions</span>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
              {prescription.remarks || 'No specific instructions. Wear corrective lenses.'}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase block mb-1">Recommended Lens</span>
              <span className="font-extrabold text-clinic-600 bg-clinic-50 border border-clinic-150 px-3 py-1 rounded-full">
                {prescription.lensTypeRecommended || 'Single Vision'}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <span className="text-[9px] text-slate-400 font-bold uppercase block mb-6">Doctor Signature</span>
              <p className="font-bold text-slate-800 text-sm border-b border-slate-400 inline-block pb-1 font-serif italic">
                {prescription.doctorSignature || `Dr. ${doctor?.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Footer print disclaimer */}
        <div className="border-t border-slate-150 pt-6 mt-12 text-center text-[10px] text-slate-455 font-medium space-y-1">
          <p>This prescription is electronically generated and managed via <strong>Eyelitz CRM</strong>.</p>
          <p>Please consult your optometrist if you experience strain or headaches. Support: <span className="text-clinic-600 font-semibold">billing@eyelitz.com</span></p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetailsPage;
