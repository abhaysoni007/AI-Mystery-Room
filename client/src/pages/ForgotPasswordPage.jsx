import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, forgotPassword, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resending OTP
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const getDestination = () => {
    if (location.state?.from) {
      if (typeof location.state.from === 'string') return location.state.from;
      if (location.state.from.pathname) {
        return `${location.state.from.pathname}${location.state.from.search || ''}`;
      }
    }
    return '/dashboard';
  };

  // If already authenticated, redirect to destination
  if (isAuthenticated) {
    return <Navigate to={getDestination()} replace />;
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await forgotPassword({ email: email.trim() });
      setPendingEmail(email.trim());
      setIsOtpStep(true);
      setCountdown(60);
      setSuccessMessage(`If an account exists for ${email.trim()}, a reset code was sent.`);
    } catch (err) {
      setError(err.message || 'Failed to request reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit reset code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email: pendingEmail, otp: otp.trim(), newPassword });
      navigate(getDestination(), { replace: true });
    } catch (err) {
      setError(err.message || 'Password reset failed. Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      await forgotPassword({ email: pendingEmail });
      setCountdown(60);
      setSuccessMessage('A fresh reset code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 my-auto">
      <div className="w-full max-w-md">
        {/* Dossier Card Container */}
        <div className="bg-paper-light border-3 border-ink rounded-2xl p-5 sm:p-6 shadow-hard-lg relative">
          {/* Top Classification Stamp */}
          <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
            <span className="font-mono text-[11px] font-bold bg-neoPink border border-ink px-2 py-0.5 rounded shadow-hard-xs uppercase">
              SECURITY PROTOCOL
            </span>
            <span className="font-mono text-[11px] font-bold text-muted uppercase">
              PASSWORD RECOVERY
            </span>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div className="mb-2.5 p-2.5 bg-neoPink/20 border-2 border-ink rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-ink">
              <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-2.5 p-2.5 bg-neoGreen/20 border-2 border-ink rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-ink">
              <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Step 1: Request Reset Code via Email */}
          {!isOtpStep ? (
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-neoPurple transition-colors"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                BACK TO SIGN IN
              </Link>

              <div>
                <h1 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                  RESET INVESTIGATOR PASSWORD
                </h1>
                <p className="font-sans text-xs text-muted mt-0.5 leading-snug">
                  Enter your registered detective email to receive a 6-digit recovery code.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label htmlFor="forgot-email" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="detective@agency.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full py-2.5 text-sm font-extrabold justify-center mt-1"
                >
                  <ArrowRight className="w-4 h-4 mr-2 stroke-[2.5]" />
                  {isLoading ? 'DISPATCHING...' : 'SEND RESET CODE'}
                </Button>
              </form>

              <div className="pt-2.5 border-t-2 border-ink/30 text-center font-mono text-xs text-muted">
                <span>Remember your password? </span>
                <Link to="/login" className="font-bold text-ink underline hover:text-neoPurple">
                  Sign in
                </Link>
              </div>
            </div>
          ) : (
            /* Step 2: Enter 6-Digit OTP and New Password */
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setError('');
                }}
                className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-neoPurple transition-colors"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                CHANGE EMAIL
              </button>

              <div>
                <div className="w-10 h-10 bg-neoPink border-2 border-ink rounded-lg flex items-center justify-center mb-2 shadow-hard-xs">
                  <KeyRound className="w-5 h-5 text-ink stroke-[2.5]" />
                </div>
                <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-ink">
                  ENTER RESET CODE & NEW PASSWORD
                </h2>
                <p className="font-sans text-xs text-muted mt-0.5 leading-snug">
                  Enter the code sent to <strong className="text-ink">{pendingEmail}</strong> and your new password.
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-2.5">
                <div>
                  <label htmlFor="reset-otp" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    6-Digit Reset Code
                  </label>
                  <input
                    id="reset-otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center font-mono text-2xl font-extrabold tracking-[6px] py-2 bg-white border-2 border-ink rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>

                <div>
                  <label htmlFor="reset-new-password" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                    <input
                      id="reset-new-password"
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading || otp.length !== 6 || newPassword.length < 8}
                  className="w-full py-2.5 text-sm font-extrabold justify-center mt-1"
                >
                  {isLoading ? 'UPDATING...' : 'RESET PASSWORD & SIGN IN'}
                </Button>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-xs text-muted">
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Did not receive code?'}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleResendOtp}
                    className="font-mono text-xs font-bold text-ink underline disabled:text-muted disabled:no-underline"
                  >
                    Resend Code
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
