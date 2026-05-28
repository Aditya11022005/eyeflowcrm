import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, User, Building, ShieldAlert, Sparkles, Loader2, Save } from 'lucide-react';
import api from '../utils/api.js';
import { authSuccess, updateStoreInfo } from '../store/authSlice.js';

const SettingsPage = () => {
  const { user, store, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Profile forms state
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userPhone, setUserPhone] = useState(user?.phone || '');

  // Store forms state
  const [clinicName, setClinicName] = useState(store?.name || '');
  const [clinicEmail, setClinicEmail] = useState(store?.email || '');
  const [clinicPhone, setClinicPhone] = useState(store?.phone || '');
  const [clinicAddress, setClinicAddress] = useState(store?.address || '');
  const [clinicLogo, setClinicLogo] = useState(store?.logo || '');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingStore, setSavingStore] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [storeMsg, setStoreMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [storeError, setStoreError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg('');
    setProfileError('');

    try {
      const res = await api.put('/auth/profile', {
        name: userName,
        email: userEmail,
        phone: userPhone,
      });

      if (res.data.success) {
        dispatch(authSuccess({
          user: res.data.user,
          store,
          token,
        }));
        setProfileMsg('Personal profile settings updated successfully.');
      }
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStoreError('Logo file size must be less than 5MB.');
        return;
      }
      
      setUploadingLogo(true);
      setStoreError('');
      setStoreMsg('');

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data.success) {
          setClinicLogo(res.data.url);
          setStoreMsg('Logo uploaded to cloud storage successfully!');
        }
      } catch (err) {
        console.error(err);
        setStoreError(err.response?.data?.message || 'Error uploading logo to cloud storage.');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    setSavingStore(true);
    setStoreMsg('');
    setStoreError('');

    try {
      const res = await api.put('/auth/store', {
        name: clinicName,
        email: clinicEmail,
        phone: clinicPhone,
        address: clinicAddress,
        logo: clinicLogo,
      });

      if (res.data.success) {
        dispatch(updateStoreInfo(res.data.store));
        setStoreMsg('Clinic information updated successfully.');
      }
    } catch (err) {
      console.error(err);
      setStoreError(err.response?.data?.message || 'Error updating store details.');
    } finally {
      setSavingStore(false);
    }
  };

  const isOwner = user?.role === 'owner';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-clinic-600" />
          Settings Panel
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure your owner credentials and clinic letterhead layouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Profile Panel */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <User className="w-5 h-5 text-clinic-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Owner Credentials</h3>
            </div>

            {profileMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-semibold">
                {profileMsg}
              </div>
            )}
            {profileError && (
              <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {profileError}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 bg-clinic-500 text-white rounded-xl font-bold shadow-md shadow-clinic-500/10 hover:bg-clinic-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Store / Clinic Profile Panel (Only Owner can edit) */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkbg-100 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleUpdateStore} className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Clinic Information</h3>
            </div>

            {storeMsg && (
              <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs font-semibold">
                {storeMsg}
              </div>
            )}
            {storeError && (
              <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold">
                {storeError}
              </div>
            )}

            <div className="flex items-center gap-4 py-2">
              <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-900/60 relative group">
                {uploadingLogo ? (
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                ) : clinicLogo ? (
                  <img src={clinicLogo} alt="Clinic Logo" className="w-full h-full object-contain" />
                ) : (
                  <Building className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={!isOwner}
                  onChange={handleLogoChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-slate-800 dark:file:text-white cursor-pointer disabled:opacity-50"
                />
                {clinicLogo && (
                  <button
                    type="button"
                    onClick={() => setClinicLogo('')}
                    className="text-[10px] text-rose-500 hover:underline mt-1 font-semibold cursor-pointer"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Name</label>
              <input
                type="text"
                required
                disabled={!isOwner}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Phone</label>
                <input
                  type="text"
                  required
                  disabled={!isOwner}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Clinic Email</label>
                <input
                  type="email"
                  required
                  disabled={!isOwner}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50"
                  value={clinicEmail}
                  onChange={(e) => setClinicEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Residential Clinic Address</label>
              <textarea
                rows={2}
                disabled={!isOwner}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 text-xs dark:text-white disabled:opacity-50 text-sm font-medium"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              {isOwner ? (
                <button
                  type="submit"
                  disabled={savingStore}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {savingStore ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save Clinic Details
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 italic">Read-only (Owner configuration access)</span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
