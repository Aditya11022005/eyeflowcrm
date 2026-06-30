import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authSuccess } from '../store/authSlice.js';
import api from '../utils/api.js';
import eyelitzLogo from '../assets/eyelitz_logo.png';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const codeFromUrl = searchParams.get('code') || '';
  const isNewSignup = searchParams.get('newSignup') === 'true';

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Cooldown countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Handle auto-verification if code is in the URL query string
  useEffect(() => {
    if (codeFromUrl && emailFromUrl) {
      // Split the code and set it in input fields
      const digits = codeFromUrl.split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((digit, idx) => {
        newOtp[idx] = digit;
      });
      setOtp(newOtp);
      
      // Auto-submit the verification
      handleVerify(emailFromUrl, codeFromUrl);
    }
  }, [codeFromUrl, emailFromUrl]);

  const handleVerify = async (targetEmail, targetCode) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-email', {
        email: targetEmail,
        code: targetCode,
      });

      if (res.data.success) {
        setSuccess(true);
        // Store authentication token
        dispatch(authSuccess({
          user: res.data.user,
          store: res.data.store,
          token: res.data.token,
        }));
        
        // Wait 2 seconds showing success animation, then redirect
        setTimeout(() => {
          if (res.data.user.role === 'superadmin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace to focus previous input
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (pastedData.length === 6 && !isNaN(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      // Auto-focus last input
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    if (!email) {
      setError('Please provide your email address.');
      return;
    }
    handleVerify(email, code);
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email to resend the code.');
      return;
    }
    setResendLoading(true);
    setResendMessage('');
    setError('');
    try {
      const res = await api.post('/auth/resend-verification', { email });
      if (res.data.success) {
        setResendMessage(res.data.message || 'Verification email resent!');
        setResendTimer(60); // 60 seconds cooldown
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 px-6 py-12 selection:bg-clinic-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-clinic-500/10 dark:bg-clinic-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-darkbg-100/80 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <img src={eyelitzLogo} alt="Eyelitz Logo" className="w-20 h-20 mx-auto object-contain mb-4" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white">
            Verify Email Address
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {isNewSignup 
              ? 'Thank you for registering! Let\'s verify your account.' 
              : 'Please verify your ownership credentials to login.'}
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Verification Successful!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading your clinic dashboard...</p>
            <Loader2 className="w-6 h-6 animate-spin text-clinic-500 mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Registered Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={!!emailFromUrl}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white disabled:opacity-60"
                  placeholder="e.g. business@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Enter 6-digit OTP code
              </label>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:ring-2 focus:ring-clinic-500 focus:border-transparent outline-none transition-all dark:text-white"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {resendMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                {resendMessage}
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
                  Verifying Account...
                </>
              ) : (
                'Verify & Log In'
              )}
            </button>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || resendLoading}
                className="text-clinic-600 dark:text-clinic-400 font-bold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
              >
                {resendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                ) : null}
                {resendTimer > 0 
                  ? `Resend Code in ${resendTimer}s` 
                  : 'Resend Verification Code'}
              </button>

              <Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-semibold">
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

export default VerifyEmailPage;
