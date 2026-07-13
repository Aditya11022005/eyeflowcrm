import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, UserPlus, Eye, Phone, Calendar, ArrowRight, X, Users } from 'lucide-react';
import api from '../utils/api.js';
import { TableSkeleton } from '../components/SkeletonLoader.jsx';

const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/patients?page=${page}&search=${search}`);
      if (res.data.success) {
        setPatients(res.data.patients);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchPatients();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setSubmitError('');

    try {
      const res = await api.post('/patients', {
        name,
        phone,
        email,
        gender,
        dob: dob || null,
        address,
        notes,
      });

      if (res.data.success) {
        setShowAddModal(false);
        // Reset form
        setName('');
        setPhone('');
        setEmail('');
        setGender('unspecified');
        setDob('');
        setAddress('');
        setNotes('');
        // Reload list
        fetchPatients();
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error onboarding patient.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Patient Database</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Search and manage client profiles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors flex items-center gap-2 cursor-pointer text-xs"
        >
          <UserPlus className="w-4 h-4" />
          Onboard Patient
        </button>
      </div>

      {/* Filters */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 outline-none focus:ring-2 focus:ring-clinic-500 focus:border-transparent text-sm transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Database list Table */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : patients.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 rounded-3xl">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No patients found</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try refining your search or add a new patient profile.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-250 dark:border-slate-800 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Age / DOB</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {patients.map((p) => {
                  const age = p.dob 
                    ? new Date().getFullYear() - new Date(p.dob).getFullYear()
                    : 'N/A';
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{p.name}</td>
                      <td className="px-6 py-4 font-medium">{p.phone}</td>
                      <td className="px-6 py-4 capitalize">{p.gender}</td>
                      <td className="px-6 py-4">
                        {p.dob ? `${new Date(p.dob).toLocaleDateString()} (${age} yrs)` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/patients/${p._id}`}
                          className="inline-flex items-center gap-1 text-clinic-600 hover:text-clinic-700 font-bold hover:underline"
                        >
                          View File
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-darkbg-100 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-darkbg-100 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-darkbg-100 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6">Onboard Patient Record</h3>

            {submitError && (
              <div className="mb-4 p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {submitError}
              </div>
            )}

            <form onSubmit={handleAddPatient} className="space-y-4">
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

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street and house number"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none text-xs dark:text-white"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
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
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs"
                >
                  Add Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;
