import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, KeyRound, ShieldAlert, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    verifyOtp,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpPurpose, setOtpPurpose] = useState('signup');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Sync mode when authModalMode changes externally
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setError('');
      setSuccessMessage('');
    }
  }, [authModalMode]);

  // Handle resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError('');
    setSuccessMessage('');
    closeAuthModal();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      handleClose();
    } catch (err) {
      if (err.code === 'ACCOUNT_NOT_VERIFIED') {
        setPendingEmail(email.trim());
        setOtpPurpose('signup');
        setMode('otp');
        setCountdown(60);
        setError('Your account is not verified yet. A fresh OTP code was sent to your email.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      setPendingEmail(email.trim());
      setOtpPurpose('signup');
      setMode('otp');
      setCountdown(60);
      setSuccessMessage(`Verification code sent to ${email.trim()}`);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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
      await verifyOtp({ email: pendingEmail, otp: otp.trim(), purpose: otpPurpose });
      handleClose();
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setPendingEmail(email.trim());
      setMode('reset_password');
      setCountdown(60);
      setSuccessMessage(`If an account exists for ${email.trim()}, a reset code was sent.`);
    } catch (err) {
      setError(err.message || 'Failed to request reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email: pendingEmail, otp: otp.trim(), newPassword });
      handleClose();
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    try {
      if (otpPurpose === 'signup') {
        await signup({ name: name || 'Detective', email: pendingEmail, password: password || 'TempPass123' });
      } else {
        await forgotPassword({ email: pendingEmail });
      }
      setCountdown(60);
      setSuccessMessage('A fresh verification code has been dispatched.');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-paper border-3 border-ink shadow-hard-lg rounded-xl max-w-md w-full p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 border-2 border-ink bg-paper hover:bg-neoYellow rounded-lg shadow-hard-xs transition-colors"
        >
          <X className="w-5 h-5 text-ink stroke-[2.5]" />
        </button>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 bg-neoPink/20 border-2 border-ink rounded-lg flex items-center gap-2.5 text-xs font-mono font-bold text-ink">
            <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-neoGreen/20 border-2 border-ink rounded-lg flex items-center gap-2.5 text-xs font-mono font-bold text-ink">
            <CheckCircle2 className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <div className="space-y-6">
            <div className="flex border-2 border-ink rounded-lg p-1 bg-paper-light">
              <button
                type="button"
                className="flex-1 py-1.5 font-display font-extrabold text-xs uppercase bg-neoYellow border-2 border-ink rounded shadow-hard-xs text-ink"
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className="flex-1 py-1.5 font-display font-extrabold text-xs uppercase text-ink/70 hover:text-ink transition-colors"
              >
                REGISTER
              </button>
            </div>

            <div>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                DETECTIVE SIGN IN
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                Access your archived cases, evidence logs, and investigation profile.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="detective@agency.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="font-mono text-xs font-bold uppercase text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setError('');
                    }}
                    className="font-mono text-xs text-ink/80 hover:text-ink underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-3 text-sm font-extrabold justify-center"
              >
                {isLoading ? 'AUTHENTICATING...' : 'ACCESS DOSSIER'}
              </Button>
            </form>
          </div>
        )}

        {/* Mode: SIGNUP */}
        {mode === 'signup' && (
          <div className="space-y-6">
            <div className="flex border-2 border-ink rounded-lg p-1 bg-paper-light">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="flex-1 py-1.5 font-display font-extrabold text-xs uppercase text-ink/70 hover:text-ink transition-colors"
              >
                SIGN IN
              </button>
              <button
                type="button"
                className="flex-1 py-1.5 font-display font-extrabold text-xs uppercase bg-neoYellow border-2 border-ink rounded shadow-hard-xs text-ink"
              >
                REGISTER
              </button>
            </div>

            <div>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                CREATE INVESTIGATOR ACCOUNT
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                A 6-digit email OTP will be dispatched to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  Detective Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Detective Vance"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="detective@agency.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-3 text-sm font-extrabold justify-center"
              >
                {isLoading ? 'DISPATCHING OTP...' : 'SEND VERIFICATION OTP'}
              </Button>
            </form>
          </div>
        )}

        {/* Mode: OTP VERIFICATION */}
        {mode === 'otp' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-neoPurple transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              BACK TO REGISTRATION
            </button>

            <div>
              <div className="w-12 h-12 bg-neoYellow border-2 border-ink rounded-xl flex items-center justify-center mb-3 shadow-hard-sm">
                <KeyRound className="w-6 h-6 text-ink stroke-[2.5]" />
              </div>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                ENTER 6-DIGIT VERIFICATION CODE
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                We sent a single-use access code to <strong className="text-ink">{pendingEmail}</strong>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label htmlFor="otp-input" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
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
                  className="w-full text-center font-mono text-3xl font-extrabold tracking-[8px] py-3 bg-paper-light border-3 border-ink rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
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
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Did not receive code?'}
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

        {/* Mode: FORGOT PASSWORD */}
        {mode === 'forgot_password' && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-ink hover:text-neoPurple transition-colors"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              BACK TO SIGN IN
            </button>

            <div>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                RESET INVESTIGATOR PASSWORD
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                Enter your registered email and we will dispatch a reset code.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="detective@agency.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-3 text-sm font-extrabold justify-center"
              >
                {isLoading ? 'DISPATCHING...' : 'SEND RESET CODE'}
              </Button>
            </form>
          </div>
        )}

        {/* Mode: RESET PASSWORD */}
        {mode === 'reset_password' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                ENTER RESET CODE & NEW PASSWORD
              </h2>
              <p className="font-sans text-xs text-muted mt-1">
                Enter the OTP sent to <strong className="text-ink">{pendingEmail}</strong> and your new password.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-otp" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
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
                  className="w-full text-center font-mono text-2xl font-extrabold tracking-[6px] py-2 bg-paper-light border-2 border-ink rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>

              <div>
                <label htmlFor="reset-new-password" className="block font-mono text-xs font-bold uppercase text-ink mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3.5 stroke-[2.5]" />
                  <input
                    id="reset-new-password"
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-3 py-2.5 bg-paper-light border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full py-3 text-sm font-extrabold justify-center"
              >
                {isLoading ? 'UPDATING...' : 'RESET PASSWORD & SIGN IN'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
