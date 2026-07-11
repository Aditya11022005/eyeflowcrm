import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice.js';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';
import eyelitzLogoLight from '../assets/eyelitz_logo_light.png';

const SignupPage = () => {
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Auto-generate slug from store name
  const handleStoreNameChange = (val) => {
    setStoreName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setStoreSlug(slug);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName || !storeSlug || !ownerName || !email || !password || !phone) return;

    dispatch(authStart());
    try {
      const res = await api.post('/auth/signup', {
        storeName,
        storeSlug,
        ownerName,
        email,
        phone,
        password,
        address,
      });

      if (res.data.success) {
        if (res.data.needsVerification) {
          navigate(`/verify-email?email=${encodeURIComponent(email)}&newSignup=true`);
        } else {
          dispatch(authSuccess({
            user: res.data.user,
            store: res.data.store,
            token: res.data.token,
          }));
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      dispatch(authFailure(err.response?.data?.message || 'Error creating store registration.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 px-6 py-16 selection:bg-clinic-500 selection:text-white">
      {/* Background blur decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinic-500/10 dark:bg-clinic-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-darkbg-100/80 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <img src={localStorage.getItem('theme') === 'dark' ? eyelitzLogo : eyelitzLogoLight} alt="Eyelitz Logo" className="w-24 h-24 mx-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
            Register your Clinic / Store
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Launch your 30-day Free Trial instantly</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic/Shop Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="e.g. Vision Care Center"
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">URL URL-Slug</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white font-mono text-xs"
                placeholder="slug-identifier"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Owner Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="Dr. Harshal"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Owner Phone Number</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="+91 9988776655"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Login Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="e.g. business@clinic.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) dispatch(clearError());
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Create Password (min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearError());
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic Address (Optional)</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
              placeholder="123 Care Street, City Complex"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-clinic-600 to-clinic-500 text-white rounded-xl font-bold shadow-lg shadow-clinic-500/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up tenant store...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-850 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-clinic-600 dark:text-clinic-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
