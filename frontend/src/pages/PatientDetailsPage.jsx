import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  User, Phone, Mail, MapPin, Eye, ClipboardList, Glasses, 
  CalendarPlus, CreditCard, ChevronRight, ArrowLeft, Trash2,
  FileText, UploadCloud, Download, ExternalLink, Loader2, Coins,
  Edit, X
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

  // Attachments State
  const [fileToUpload, setFileToUpload] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit Patient State
  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleOpenEditModal = () => {
    if (patient) {
      setName(patient.name || '');
      setPhone(patient.phone || '');
      setEmail(patient.email || '');
      setGender(patient.gender || 'unspecified');
      
      let formattedDob = '';
      if (patient.dob) {
        try {
          formattedDob = new Date(patient.dob).toISOString().split('T')[0];
        } catch (e) {
          formattedDob = patient.dob.substring(0, 10);
        }
      }
      setDob(formattedDob);
      setAddress(patient.address || '');
      setNotes(patient.notes || '');
      setLoyaltyPoints(patient.loyaltyPoints || 0);
      setSubmitError('');
      setShowEditModal(true);
    }
  };

  const handleEditPatient = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      const res = await api.put(`/patients/${id}`, {
        name,
        phone,
        email,
        gender,
        dob: dob || null,
        address,
        notes,
        loyaltyPoints: Number(loyaltyPoints)
      });

      if (res.data.success) {
        setPatient(res.data.patient);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || 'Error updating patient information.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!fileToUpload) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploadingAttachment(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      // 1. Upload to Cloudinary
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadRes.data.success) {
        const fileUrl = uploadRes.data.url;
        const nameToSave = attachmentName.trim() || fileToUpload.name;
        
        // 2. Add to Patient model
        const res = await api.post(`/patients/${id}/attachments`, {
          name: nameToSave,
          url: fileUrl,
          fileType: fileToUpload.type,
        });

        if (res.data.success) {
          setPatient(res.data.patient);
          setFileToUpload(null);
          setAttachmentName('');
          // Reset file input
          const fileInput = document.getElementById('patient-file-input');
          if (fileInput) fileInput.value = '';
        }
      }
    } catch (err) {
      console.error(err);
      setUploadError(err.response?.data?.message || 'Error uploading file to cloud.');
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Are you sure you want to delete this document/invoice?')) return;

    try {
      const res = await api.delete(`/patients/${id}/attachments/${attachmentId}`);
      if (res.data.success) {
        setPatient(res.data.patient);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete attachment.');
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenEditModal}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Edit Patient Details"
          >
            <Edit className="w-4 h-4 text-clinic-500" />
            Edit Info
          </button>
          <button
            onClick={handleDelete}
            className="p-2 border border-rose-100 text-rose-500 hover:bg-rose-50 dark:border-rose-950/20 dark:hover:bg-rose-950/30 rounded-xl transition-all"
            title="Delete Patient Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
            <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
              <Coins className="w-4.5 h-4.5 text-amber-500" />
              <span className="font-bold">Loyalty Balance: {patient.loyaltyPoints || 0} pts</span>
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

          {/* Medical Scans, Invoices & Attachments (Stored on Cloudinary) */}
          <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Patient Documents, Scans & External Invoices
            </h3>

            {/* List existing files */}
            {(!patient.attachments || patient.attachments.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center bg-slate-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                No attachments uploaded. Keep reports, invoices, or eye scan images here.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patient.attachments.map((att) => (
                  <div key={att._id} className="p-3 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-clinic-500/10 text-clinic-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-bold text-xs text-slate-750 dark:text-slate-200 block truncate" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(att.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-clinic-600 hover:bg-clinic-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(att._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload form */}
            <form onSubmit={handleUploadAttachment} className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850/60 bg-slate-50/30 dark:bg-slate-900/10 space-y-4">
              <span className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Upload New Document / Image / Invoice
              </span>

              {uploadError && (
                <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-semibold">
                  {uploadError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Document Name / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Left Eye OCT Scan, External Bill"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select File
                  </label>
                  <input
                    id="patient-file-input"
                    type="file"
                    required
                    onChange={(e) => setFileToUpload(e.target.files[0])}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:bg-clinic-50 file:text-clinic-700 hover:file:bg-clinic-100 dark:file:bg-slate-800 dark:file:text-white cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploadingAttachment}
                  className="px-4 py-2 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {uploadingAttachment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Uploading File...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload to Cloud
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Edit Patient Profile</h3>

            {submitError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleEditPatient} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Gender</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white dark:bg-darkbg-100"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="unspecified">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Loyalty Points</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(e.target.value)}
                  />
                </div>
                
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street and house number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Medical Notes & Comments</label>
                <textarea
                  rows={3}
                  placeholder="Allergies, previous eye surgeries, etc."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white text-sm"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {submitLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;
