import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, Key, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';
import eyelitzLogoLight from '../assets/eyelitz_logo_light.png';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(codeFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // If email changes in URL, update state
  useEffect(() => {
    if (emailFromUrl) setEmail(emailFromUrl);
    if (codeFromUrl) setCode(codeFromUrl);
  }, [emailFromUrl, codeFromUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });

      if (res.data.success) {
        setSuccess(true);
        // Wait 3 seconds showing success screen, then redirect to login page
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP code.');
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
          <img src={localStorage.getItem('theme') === 'dark' ? eyelitzLogo : eyelitzLogoLight} alt="Eyelitz Logo" className="w-20 h-20 mx-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
            Reset Password
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Enter the 6-digit code sent to your email and your new password
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Password Reset Successful!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your password has been changed. Redirecting to Login...
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-clinic-500 mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Registered Email
              </label>
              <input
                type="email"
                required
                disabled={!!emailFromUrl}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-60"
                placeholder="owner@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                6-digit Reset OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength="6"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white font-mono tracking-widest text-sm"
                  placeholder="e.g. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Create New Password (min 6 chars)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
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
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
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

export default ResetPasswordPage;
