import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Loader2, Mail, ArrowLeft } from 'lucide-react';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        // Wait 2 seconds showing success message, then redirect to reset page
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 px-6 py-12 selection:bg-clinic-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinic-500/10 dark:bg-clinic-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-darkbg-100/80 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-clinic-100 dark:bg-clinic-950/40 text-clinic-600 dark:text-clinic-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
            Forgot Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Enter your email address to recover your account credentials
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm font-semibold text-center space-y-2">
            <p>Verification Code Sent!</p>
            <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Please check your registered inbox. Redirecting to Password Reset...
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-clinic-500 mx-auto mt-2" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Your Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="e.g. owner@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-clinic-600 to-clinic-500 text-white rounded-xl font-bold shadow-lg shadow-clinic-500/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Reset Code'
              )}
            </button>

            <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-850">
              <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1 font-semibold text-xs">
                <ArrowLeft className="w-3 h-3" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
