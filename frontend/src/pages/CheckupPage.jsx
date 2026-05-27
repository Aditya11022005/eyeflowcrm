import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, ShieldAlert, Sparkles, ClipboardCheck } from 'lucide-react';
import api from '../utils/api.js';

const CheckupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdFromQuery = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdFromQuery);
  const [loadingPatients, setLoadingPatients] = useState(true);

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

  // AI suggestion indicator
  const [aiGenerating, setAiGenerating] = useState(false);

  useEffect(() => {
    const loadPatientsList = async () => {
      try {
        const res = await api.get('/patients?limit=100');
        if (res.data.success) {
          setPatients(res.data.patients || []);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatientsList();
  }, []);

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
      });

      if (res.data.success) {
        navigate(`/patients/${selectedPatientId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving prescription file.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Patient Selection Card */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250">Patient Identification</h3>
          
          {loadingPatients ? (
            <p className="text-xs text-slate-400">Loading patients...</p>
          ) : (
            <div className="max-w-md">
              <select
                required
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl outline-none focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white dark:bg-darkbg-100 font-bold"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Choose Patient File --</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>
          )}
        </div>

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
