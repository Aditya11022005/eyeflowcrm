import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { authStart, authSuccess, authFailure, clearError } from '../store/authSlice.js';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  // Check if redirect notice is present
  const isSessionExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(authStart());
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        dispatch(authSuccess({
          user: res.data.user,
          store: res.data.store,
          token: res.data.token,
        }));
        
        // Redirect depending on user roles
        if (res.data.user.role === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      dispatch(authFailure(err.response?.data?.message || 'Invalid username or password.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 px-6 py-12 selection:bg-clinic-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinic-500/10 dark:bg-clinic-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-darkbg-100/80 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-24 h-24 mx-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
            Welcome to Eyelitz
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Sign in to your clinic work suite</p>
        </div>

        {/* Warning notification banner */}
        {isSessionExpired && (
          <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Session expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Clinic Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="e.g. owner@clinic.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) dispatch(clearError());
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Security Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearError());
              }}
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-850 pt-6">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have a registered clinic?{' '}
            <Link to="/signup" className="text-clinic-600 dark:text-clinic-400 font-bold hover:underline">
              Create a Store
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
