import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Eye, ShieldAlert, Sparkles, ClipboardCheck, Receipt } from 'lucide-react';
import api from '../utils/api.js';

const CheckupPage = () => {
  const { store } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdFromQuery = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [previousPrescription, setPreviousPrescription] = useState(null);

  // Vision variables (Right Eye)
  const [reSph, setReSph] = useState('0.00');
  const [reCyl, setReCyl] = useState('0.00');
  const [reAxis, setReAxis] = useState('');
  const [reAdd, setReAdd] = useState('');
  const [rePd, setRePd] = useState('');
  const [reVa, setReVa] = useState('6/6');

  // Vision variables (Left Eye)
  const [leSph, setLeSph] = useState('0.00');
  const [leCyl, setLeCyl] = useState('0.00');
  const [leAxis, setLeAxis] = useState('');
  const [leAdd, setLeAdd] = useState('');
  const [lePd, setLePd] = useState('');
  const [leVa, setLeVa] = useState('6/6');

  // Recommendations and remarks
  const [lensTypeRecommended, setLensTypeRecommended] = useState('Single Vision');
  const [remarks, setRemarks] = useState('');
  const [doctorSignature, setDoctorSignature] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Billing states
  const [generateBill, setGenerateBill] = useState(false);
  const [checkupFee, setCheckupFee] = useState(store?.eyeCheckupFee || 100);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [checkupDate, setCheckupDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (store?.eyeCheckupFee) {
      setCheckupFee(store.eyeCheckupFee);
    }
  }, [store]);

  // AI suggestion indicator
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    const loadPatientsList = async () => {
      try {
        const res = await api.get('/patients?limit=100');
        if (res.data.success) {
          const loadedPatients = res.data.patients || [];
          setPatients(loadedPatients);
          
          if (patientIdFromQuery) {
            const found = loadedPatients.find(p => p._id === patientIdFromQuery);
            if (found) {
              setPatientSearchQuery(`${found.name} (${found.phone})`);
            } else {
              try {
                const singleRes = await api.get(`/patients/${patientIdFromQuery}`);
                if (singleRes.data.success && singleRes.data.patient) {
                  const p = singleRes.data.patient;
                  setPatients(prev => [p, ...prev]);
                  setPatientSearchQuery(`${p.name} (${p.phone})`);
                }
              } catch (singleErr) {
                console.error('Error fetching single patient:', singleErr);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatientsList();
  }, [patientIdFromQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const container = document.getElementById('patient-search-container');
      if (container && !container.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPreviousPrescription = async () => {
      if (!selectedPatientId) {
        setPreviousPrescription(null);
        return;
      }
      try {
        const res = await api.get(`/prescriptions?patientId=${selectedPatientId}`);
        if (res.data.success && res.data.prescriptions && res.data.prescriptions.length > 0) {
          setPreviousPrescription(res.data.prescriptions[0]);
        } else {
          setPreviousPrescription(null);
        }
      } catch (err) {
        console.error('Error loading previous prescription:', err);
        setPreviousPrescription(null);
      }
    };
    fetchPreviousPrescription();
  }, [selectedPatientId]);

  const handleApplyPreviousRefraction = () => {
    if (previousPrescription) {
      setReSph(previousPrescription.rightEye.sph || '0.00');
      setReCyl(previousPrescription.rightEye.cyl || '0.00');
      setReAxis(previousPrescription.rightEye.axis || '');
      setReAdd(previousPrescription.rightEye.add || '');
      setRePd(previousPrescription.rightEye.pd || '');
      setReVa(previousPrescription.rightEye.va || '6/6');

      setLeSph(previousPrescription.leftEye.sph || '0.00');
      setLeCyl(previousPrescription.leftEye.cyl || '0.00');
      setLeAxis(previousPrescription.leftEye.axis || '');
      setLeAdd(previousPrescription.leftEye.add || '');
      setLePd(previousPrescription.leftEye.pd || '');
      setLeVa(previousPrescription.leftEye.va || '6/6');

      if (previousPrescription.lensTypeRecommended) {
        setLensTypeRecommended(previousPrescription.lensTypeRecommended);
      }
      if (previousPrescription.remarks) {
        setRemarks(previousPrescription.remarks);
      }
      if (previousPrescription.doctorSignature) {
        setDoctorSignature(previousPrescription.doctorSignature);
      }
    }
  };

  // AI Suggestion Engine (Rule-based clinical simulator)
  const triggerAiSuggestions = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const sphR = parseFloat(reSph) || 0;
      const sphL = parseFloat(leSph) || 0;
      const cylR = parseFloat(reCyl) || 0;
      const cylL = parseFloat(leCyl) || 0;

      let diagnosis = '';
      let lensRecom = '';

      if (sphR < 0 || sphL < 0) {
        const severity = Math.max(Math.abs(sphR), Math.abs(sphL)) > 3 ? 'high-power Myopia' : 'mild Myopia';
        diagnosis += `Patient exhibits ${severity} (near-sightedness). `;
      } else if (sphR > 0 || sphL > 0) {
        const severity = Math.max(sphR, sphL) > 3 ? 'high-power Hyperopia' : 'mild Hyperopia';
        diagnosis += `Patient exhibits ${severity} (far-sightedness). `;
      } else {
        diagnosis += 'Emmetropic vision detected in spherical bounds. ';
      }

      if (cylR !== 0 || cylL !== 0) {
        diagnosis += 'Astigmatism present in visual test. ';
        lensRecom = 'cylindrical corrective lenses with anti-reflective coating.';
      } else {
        lensRecom = 'spherical corrective lenses.';
      }

      if (reAdd || leAdd) {
        diagnosis += 'Presbyopia detected for reading distances. Recommend progressive lenses.';
        setLensTypeRecommended('Progressive');
      } else {
        setLensTypeRecommended(cylR !== 0 || cylL !== 0 ? 'Bifocal' : 'Single Vision');
      }

      const generatedRemarks = `AI DIAGNOSTIC HIGHLIGHTS:\n- ${diagnosis}\n- Recommended Lens: ${lensRecom}\n- Optometrist advice: Wear corrective glasses during screen time or reading. Hydrate and run 20-20-20 breaks.`;
      setRemarks(generatedRemarks);
      setAiGenerating(false);
    }, 800);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setError('Please select a patient before saving checkup.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/prescriptions', {
        patientId: selectedPatientId,
        rightEye: { sph: reSph, cyl: reCyl, axis: reAxis, add: reAdd, pd: rePd, va: reVa },
        leftEye: { sph: leSph, cyl: leCyl, axis: leAxis, add: leAdd, pd: lePd, va: leVa },
        lensTypeRecommended,
        remarks,
        doctorSignature,
        checkupDate,
      });

      if (res.data.success) {
        let invoiceId = null;
        if (generateBill && Number(checkupFee) > 0) {
          try {
            const invoiceRes = await api.post('/billing/invoices', {
              patientId: selectedPatientId,
              items: [{
                description: 'Eye Checkup Fee',
                quantity: 1,
                price: Number(checkupFee),
              }],
              discount: 0,
              tax: 0,
              paymentMethod,
              status: paymentStatus,
              terms: store?.invoiceTerms || '',
              invoiceDate: checkupDate,
            });
            if (invoiceRes.data.success) {
              invoiceId = invoiceRes.data.invoice._id;
            }
          } catch (billingErr) {
            console.error('Error generating eye checkup invoice:', billingErr);
            alert('Prescription saved, but failed to generate the invoice: ' + (billingErr.response?.data?.message || billingErr.message));
          }
        }

        if (invoiceId) {
          navigate(`/invoices/${invoiceId}`);
        } else {
          navigate(`/patients/${selectedPatientId}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving prescription file.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearchQuery.toLowerCase()) ||
    p.phone.includes(patientSearchQuery) ||
    (p.email && p.email.toLowerCase().includes(patientSearchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Eye Examination Room</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Record diagnostic refraction parameters and lens specifications</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Patient Selection & Checkup Date Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250">Patient Identification & Checkup Date</h3>
          
          {loadingPatients ? (
            <p className="text-xs text-slate-400">Loading patients...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative" id="patient-search-container">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Choose Patient File</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Type name or phone to search..."
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl outline-none focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                    value={patientSearchQuery}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setSelectedPatientId(''); // Clear selection while typing
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {selectedPatientId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId('');
                        setPatientSearchQuery('');
                        setShowDropdown(true);
                      }}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Searchable Dropdown */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-darkbg-100 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPatients.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-500 italic">No patients match search</div>
                    ) : (
                      filteredPatients.map(p => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(p._id);
                            setPatientSearchQuery(`${p.name} (${p.phone})`);
                            setShowDropdown(false);
                            setError('');
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs hover:bg-slate-55/10 dark:hover:bg-slate-900/20 transition-colors flex flex-col ${
                            selectedPatientId === p._id ? 'bg-clinic-500/10 dark:bg-clinic-950/20 border-l-4 border-clinic-500' : ''
                          }`}
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{p.phone} {p.email ? `• ${p.email}` : ''}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Checkup / Prescription Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl outline-none focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                  value={checkupDate}
                  onChange={(e) => setCheckupDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Previous prescription banner alert */}
        {previousPrescription && (
          <div className="p-4 rounded-3xl bg-clinic-500/10 border border-clinic-500/20 text-clinic-700 dark:text-clinic-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 animate-fadeIn">
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-clinic-500 animate-pulse" />
                Previous checkup details found from {new Date(previousPrescription.checkupDate).toLocaleDateString()}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                OD: SPH {previousPrescription.rightEye.sph} / CYL {previousPrescription.rightEye.cyl} | OS: SPH {previousPrescription.leftEye.sph} / CYL {previousPrescription.leftEye.cyl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyPreviousRefraction}
              className="px-4 py-2 bg-clinic-500 hover:bg-clinic-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-clinic-500/15 cursor-pointer flex items-center gap-1 hover:scale-105 active:scale-95 shrink-0"
            >
              Use Previous Refraction Bounds
            </button>
          </div>
        )}

        {/* Refraction Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Right Eye (OD) */}
          <div className="p-6 rounded-3xl border border-clinic-150 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-clinic-500 text-white font-bold text-[10px] px-3 py-1 uppercase rounded-bl-xl tracking-widest">
              Right Eye (OD)
            </div>
            
            <h3 className="text-sm font-bold text-clinic-600 dark:text-clinic-400">Refraction Bounds</h3>
            
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Sphere (SPH)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={reSph} onChange={(e) => setReSph(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Cylinder (CYL)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={reCyl} onChange={(e) => setReCyl(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Axis</label>
                <input type="text" placeholder="e.g. 90" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={reAxis} onChange={(e) => setReAxis(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Addition (ADD)</label>
                <input type="text" placeholder="+1.50" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={reAdd} onChange={(e) => setReAdd(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">P.D.</label>
                <input type="text" placeholder="31.5" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={rePd} onChange={(e) => setRePd(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Acuity (V.A.)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={reVa} onChange={(e) => setReVa(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Left Eye (OS) */}
          <div className="p-6 rounded-3xl border border-cyan-150 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500 text-white font-bold text-[10px] px-3 py-1 uppercase rounded-bl-xl tracking-widest">
              Left Eye (OS)
            </div>

            <h3 className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Refraction Bounds</h3>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Sphere (SPH)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={leSph} onChange={(e) => setLeSph(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Cylinder (CYL)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={leCyl} onChange={(e) => setLeCyl(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Axis</label>
                <input type="text" placeholder="e.g. 180" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={leAxis} onChange={(e) => setLeAxis(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Addition (ADD)</label>
                <input type="text" placeholder="+1.50" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={leAdd} onChange={(e) => setLeAdd(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">P.D.</label>
                <input type="text" placeholder="31.5" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={lePd} onChange={(e) => setLePd(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Acuity (V.A.)</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg text-center dark:text-white" value={leVa} onChange={(e) => setLeVa(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator Button, Recommendations & Signature */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-250">Optometrist Recommendations</h3>
            
            {/* AI report generator trigger */}
            <button
              type="button"
              onClick={triggerAiSuggestions}
              disabled={aiGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-clinic-500 to-cyan-500 text-white rounded-lg text-[10px] font-bold shadow-md shadow-clinic-500/10 hover:opacity-90 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className={`w-3.5 h-3.5 ${aiGenerating ? 'animate-spin' : ''}`} />
              {aiGenerating ? 'Analyzing Vision Values...' : 'Generate AI Prescription Advice'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Recommended Lens Type</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                value={lensTypeRecommended}
                onChange={(e) => setLensTypeRecommended(e.target.value)}
              >
                <option value="Single Vision">Single Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
                <option value="Contact Lenses">Contact Lenses</option>
                <option value="Reading glasses">Reading glasses</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Doctor's Typed Signature</label>
              <input
                type="text"
                placeholder="Dr. Harshal (typed)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                value={doctorSignature}
                onChange={(e) => setDoctorSignature(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5">Diagnostic Remarks & Notes</label>
            <textarea
              rows={4}
              placeholder="e.g. Anti-glare glasses suggested. Run a review checkup in 6 months."
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white font-medium"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Eye Checkup Billing Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="generateBill"
                className="w-4.5 h-4.5 rounded border-slate-350 dark:border-slate-800 text-clinic-600 focus:ring-clinic-500 cursor-pointer"
                checked={generateBill}
                onChange={(e) => setGenerateBill(e.target.checked)}
              />
              <label htmlFor="generateBill" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-clinic-500" />
                Generate Eye Checkup Bill / Invoice
              </label>
            </div>

            {generateBill && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-850 animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1.5">Checkup Fee (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-xl text-xs dark:text-white font-bold animate-fadeIn"
                    value={checkupFee}
                    onChange={(e) => setCheckupFee(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1.5">Payment Method</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-xl text-xs dark:text-white"
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
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-1.5">Payment Status</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-xl text-xs dark:text-white font-bold"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ClipboardCheck className="w-4 h-4" />
              {isSubmitting ? 'Saving checkup record...' : 'Finalize & Save Diagnosis'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckupPage;
