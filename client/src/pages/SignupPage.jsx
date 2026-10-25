import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { User, Mail, Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signup, verifyOtp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resending OTP
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      setPendingEmail(email.trim());
      setIsOtpStep(true);
      setCountdown(60);
      setSuccessMessage(`Verification code sent to ${email.trim()}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
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
      await verifyOtp({ email: pendingEmail, otp: otp.trim(), purpose: 'signup' });
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
      await signup({ name: name.trim() || 'Detective', email: pendingEmail, password: password || 'TempPass123' });
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
              AGENT ENROLLMENT
            </span>
          </div>

          {/* Navigation Tabs between Login and Signup */}
          <div className="flex border-2 border-ink rounded-lg p-1 bg-paper mb-6">
            <Link
              to="/login"
              className="flex-1 text-center py-2 font-display font-extrabold text-xs uppercase text-ink/70 hover:text-ink transition-colors"
            >
              SIGN IN
            </Link>
            <Link
              to="/signup"
              className="flex-1 text-center py-2 font-display font-extrabold text-xs uppercase bg-neoYellow border-2 border-ink rounded shadow-hard-xs text-ink"
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

          {/* Step 1: Registration Form */}
          {!isOtpStep ? (
            <div className="space-y-6">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-ink">
                  CREATE INVESTIGATOR ACCOUNT
                </h1>
                <p className="font-sans text-xs text-muted mt-1.5 leading-relaxed">
                  Join the investigative bureau to build cases, interrogate suspects, and inspect forensic clues.
                </p>
              </div>

              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label htmlFor="signup-name" className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Detective Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-muted absolute left-3.5 top-3.5 stroke-[2.5]" />
                    <input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Detective Vance"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3.5 stroke-[2.5]" />
                    <input
                      id="signup-email"
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
                  <label htmlFor="signup-password" className="block font-mono text-xs font-bold uppercase text-ink mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3.5 stroke-[2.5]" />
                    <input
                      id="signup-password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
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
                  <ArrowRight className="w-4 h-4 mr-2 stroke-[2.5]" />
                  {isLoading ? 'DISPATCHING OTP...' : 'SEND VERIFICATION OTP'}
                </Button>
              </form>

              <div className="pt-4 border-t-2 border-ink/30 text-center font-mono text-xs text-muted">
                <span>Already registered? </span>
                <Link to="/login" className="font-bold text-ink underline hover:text-neoPurple">
                  Sign in to dossier
                </Link>
              </div>
            </div>
          ) : (
            /* Step 2: 6-Digit OTP Verification Card */
            <div className="space-y-6">
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setError('');
                }}
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
                <p className="font-sans text-xs text-muted mt-1 leading-relaxed">
                  We sent a single-use access code to <strong className="text-ink">{pendingEmail}</strong>.
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
        </div>
      </div>
    </div>
  );
}
