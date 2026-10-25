import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldAlert, CheckCircle2, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, verifyOtp, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Fallback state if account is not yet verified
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // If already authenticated, redirect to dashboard or intended target
  if (isAuthenticated) {
    const destination = location.state?.from || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      const destination = location.state?.from || '/dashboard';
      navigate(destination);
    } catch (err) {
      if (err.code === 'ACCOUNT_NOT_VERIFIED') {
        setIsOtpStep(true);
        setCountdown(60);
        setError('Your account is not verified yet. A fresh OTP code was sent to your email.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email: email.trim(), otp: otp.trim(), purpose: 'signup' });
      const destination = location.state?.from || '/dashboard';
      navigate(destination);
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      await signup({ name: 'Detective', email: email.trim(), password: password || 'TempPass123' });
      setCountdown(60);
      setSuccessMessage('A fresh verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Dossier Card Container */}
        <div className="bg-paper-light border-3 border-ink rounded-2xl p-6 sm:p-8 shadow-hard-lg relative">
          {/* Top Classification Stamp */}
          <div className="flex items-center justify-between border-b-2 border-ink pb-3 mb-6">
            <span className="font-mono text-xs font-bold bg-neoYellow border border-ink px-2 py-0.5 rounded shadow-hard-xs uppercase">
              BUREAU OF INVESTIGATION
            </span>
            <span className="font-mono text-xs font-bold text-muted uppercase">
              PERSONNEL DOSSIER
            </span>
          </div>

          {/* Navigation Tabs between Login and Signup */}
          <div className="flex border-2 border-ink rounded-lg p-1 bg-paper mb-6">
            <Link
              to="/login"
              className="flex-1 text-center py-2 font-display font-extrabold text-xs uppercase bg-neoYellow border-2 border-ink rounded shadow-hard-xs text-ink"
            >
              SIGN IN
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center py-2 font-display font-extrabold text-xs uppercase text-ink/70 hover:text-ink transition-colors"
            >
              REGISTER
            </Link>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-5 p-3.5 bg-neoPink/20 border-2 border-ink rounded-lg flex items-center gap-2.5 text-xs font-mono font-bold text-ink">
              <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 bg-neoGreen/20 border-2 border-ink rounded-lg flex items-center gap-2.5 text-xs font-mono font-bold text-ink">
              <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Normal Login Form */}
          {!isOtpStep ? (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-ink">
                  DETECTIVE SIGN IN
                </h1>
                <p className="font-sans text-xs text-muted mt-1.5 leading-relaxed">
                  Enter your credentials to access active crime scenes, evidence lockers, and archived cases.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3.5 stroke-[2.5]" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="detective@agency.com"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="font-mono text-xs font-bold uppercase text-ink">
                      Password
                    </label>
                    <Link
                      to="/forget"
                      className="font-mono text-xs font-bold text-ink hover:text-neoPurple underline decoration-ink/60"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3.5 stroke-[2.5]" />
                    <input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full py-3 text-sm font-extrabold justify-center mt-2"
                >
                  <LogIn className="w-4 h-4 mr-2 stroke-[2.5]" />
                  {isLoading ? 'AUTHENTICATING...' : 'ACCESS DOSSIER'}
                </Button>
              </form>

              <div className="pt-4 border-t-2 border-ink/30 text-center font-mono text-xs text-muted">
                <span>New investigator? </span>
                <Link to="/signup" className="font-bold text-ink underline hover:text-neoPurple">
                  Register credentials
                </Link>
              </div>
            </div>
          ) : (
            /* OTP Verification Sub-Flow for Unverified Accounts */
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => setIsOtpStep(false)}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-neoPurple transition-colors"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                BACK TO SIGN IN
              </button>

              <div>
                <div className="w-12 h-12 bg-neoYellow border-2 border-ink rounded-xl flex items-center justify-center mb-3 shadow-hard-sm">
                  <KeyRound className="w-6 h-6 text-ink stroke-[2.5]" />
                </div>
                <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                  ACTIVATE YOUR BADGE
                </h2>
                <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                  Enter the 6-digit access code dispatched to <strong className="text-ink">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp-input" className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Verification Code
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center font-mono text-3xl font-extrabold tracking-[8px] py-3 bg-white border-3 border-ink rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full py-3 text-sm font-extrabold justify-center"
                >
                  {isLoading ? 'VERIFYING...' : 'CONFIRM & ACTIVATE ACCOUNT'}
                </Button>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-mono text-xs text-muted">
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Did not receive code?'}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleResendOtp}
                    className="font-mono text-xs font-bold text-ink underline disabled:text-muted disabled:no-underline"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
