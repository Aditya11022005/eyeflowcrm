import React, { useState, useEffect } from 'react';
import { Calendar, Search, Plus, CalendarDays, CheckCircle, Clock, X, Eye } from 'lucide-react';
import api from '../utils/api.js';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeSlot, setTimeSlot] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/appointments?date=${dateFilter}`);
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [dateFilter]);

  // Load patient list and doctors list when scheduling modal opens
  useEffect(() => {
    const loadModalData = async () => {
      try {
        const patientsRes = await api.get('/patients?limit=100');
        const staffRes = await api.get('/auth/staff');
        if (patientsRes.data.success) setPatients(patientsRes.data.patients || []);
        if (staffRes.data.success) {
          const docs = (staffRes.data.staff || []).filter(s => s.role === 'doctor' || s.role === 'owner');
          setDoctors(docs);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadModalData();
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/appointments', {
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        appointmentDate,
        timeSlot,
        notes,
      });

      if (res.data.success) {
        setShowAddModal(false);
        // Reset states
        setSelectedPatientId('');
        setSelectedDoctorId('');
        setNotes('');
        setTimeSlot('10:00 AM');
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error booking appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/appointments/${id}`, { status });
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Appointment Schedules</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track doctor agendas and patient checkup timings</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <CalendarDays className="w-4 h-4" />
          Book Visit
        </button>
      </div>

      {/* Date select bar */}
      <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
        <span>Target Date:</span>
        <input 
          type="date"
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl outline-none focus:ring-2 focus:ring-clinic-500 text-slate-700 dark:text-white"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {/* Agenda list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4.5 bg-slate-200 dark:bg-slate-850 rounded-lg w-28" />
                <div className="h-6 bg-slate-200 dark:bg-slate-850 rounded-full w-16" />
              </div>
              <div className="space-y-2.5 pt-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-850 rounded-lg w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded-lg w-3/4" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-slate-200 dark:bg-slate-850 rounded-xl flex-1" />
                <div className="h-8 bg-slate-200 dark:bg-slate-850 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-3xl">
          <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No appointments scheduled</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">There are no checkups booked for this date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((a) => (
            <div key={a._id} className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-bold text-clinic-650 dark:text-clinic-400 bg-clinic-50 dark:bg-clinic-950/20 px-2.5 py-0.5 rounded-full inline-block">
                      {a.timeSlot}
                    </span>
                    <h3 className="font-extrabold text-slate-805 dark:text-slate-100 text-sm mt-2">{a.patientId?.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider capitalize ${
                    a.status === 'completed' 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                      : a.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                        : 'bg-slate-100 text-slate-550'
                  }`}>
                    {a.status}
                  </span>
                </div>

                <div className="text-[10px] space-y-2 border-t border-slate-50 dark:border-slate-850 pt-3">
                  <p><span className="text-slate-400 font-semibold uppercase">Doctor Assigned:</span> Dr. {a.doctorId?.name}</p>
                  <p><span className="text-slate-400 font-semibold uppercase">Phone:</span> {a.patientId?.phone}</p>
                  {a.notes && (
                    <p className="text-slate-500 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed mt-2 italic">
                      "{a.notes}"
                    </p>
                  )}
                </div>
              </div>

              {a.status === 'scheduled' && (
                <div className="mt-6 pt-3 border-t border-slate-50 dark:border-slate-850 flex gap-2 justify-end">
                  <button 
                    onClick={() => updateStatus(a._id, 'cancelled')}
                    className="px-2.5 py-1 text-[9px] font-bold border border-rose-100 text-rose-500 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => updateStatus(a._id, 'completed')}
                    className="px-2.5 py-1 text-[9px] font-extrabold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 cursor-pointer"
                  >
                    Mark Done
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Book Visit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Book Eye Examination</h3>

            {error && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select Patient</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Select Doctor</label>
                <select
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white dark:bg-darkbg-100 font-bold"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="">-- Select Optometrist --</option>
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>Dr. {d.name} ({d.role === 'owner' ? 'Store Owner' : 'Doctor'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Time Slot</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 dark:text-white"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Purpose / Examination Notes</label>
                <textarea
                  rows={3}
                  placeholder="Routine vision checkup, contact lens fitting..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 bg-transparent rounded-xl focus:ring-2 focus:ring-clinic-500 dark:text-white text-xs"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold hover:bg-clinic-600 transition-colors shadow-md shadow-clinic-500/10 cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
