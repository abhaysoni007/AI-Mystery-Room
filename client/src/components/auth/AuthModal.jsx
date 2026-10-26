import React, { useState, useEffect } from 'react';
import { X, Lock, User as UserIcon, ShieldAlert, LogIn, ArrowRight, BadgeCheck } from 'lucide-react';
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
  } = useAuth();

  const [mode, setMode] = useState(authModalMode || 'login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync mode when authModalMode changes externally
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
      setError('');
    }
  }, [authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setError('');
    closeAuthModal();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login({ username: username.trim(), password });
      handleClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signup({ name: name.trim(), username: username.trim(), password });
      handleClose();
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-paper-light border-3 border-ink rounded-2xl p-6 shadow-hard-lg relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-lg border-2 border-transparent hover:border-ink hover:bg-neoYellow transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5 text-ink stroke-[2.5]" />
        </button>

        {/* Bureau Header Badge */}
        <div className="flex items-center gap-2 border-b-2 border-ink pb-2.5 mb-4">
          <span className="font-mono text-[10px] font-bold bg-neoYellow border border-ink px-2 py-0.5 rounded shadow-hard-xs uppercase">
            BUREAU PORTAL
          </span>
          <span className="font-mono text-[10px] font-bold text-muted uppercase">
            {mode === 'login' ? 'IDENTITY VERIFICATION' : 'NEW RECRUIT ENROLLMENT'}
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex border-2 border-ink rounded-lg p-1 bg-paper mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setAuthModalMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 font-display font-extrabold text-xs uppercase rounded transition-colors ${
              mode === 'login'
                ? 'bg-neoYellow border-2 border-ink shadow-hard-xs text-ink'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setAuthModalMode('signup');
              setError('');
            }}
            className={`flex-1 py-1.5 font-display font-extrabold text-xs uppercase rounded transition-colors ${
              mode === 'signup'
                ? 'bg-neoYellow border-2 border-ink shadow-hard-xs text-ink'
                : 'text-ink/70 hover:text-ink'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-3.5 p-2 bg-neoPink/20 border-2 border-ink rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-ink">
            <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label htmlFor="modal-login-username" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                Detective ID / Username
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                <input
                  id="modal-login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. agent_vance"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-login-password" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                <input
                  id="modal-login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-extrabold justify-center mt-2"
            >
              <LogIn className="w-4 h-4 mr-2 stroke-[2.5]" />
              {isLoading ? 'AUTHENTICATING...' : 'ACCESS DOSSIER'}
            </Button>

            <div className="pt-2 text-center font-mono text-xs text-muted">
              <span>New investigator? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setAuthModalMode('signup');
                  setError('');
                }}
                className="font-bold text-ink underline hover:text-neoPurple"
              >
                Create credentials
              </button>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label htmlFor="modal-signup-name" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                Detective Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                <input
                  id="modal-signup-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Detective Vance"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-signup-username" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                Detective ID / Username
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                <input
                  id="modal-signup-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. agent_vance"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="modal-signup-password" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                <input
                  id="modal-signup-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-9 pr-3 py-2 bg-white border-2 border-ink rounded-lg font-sans text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-neoYellow shadow-hard-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-extrabold justify-center mt-2"
            >
              <ArrowRight className="w-4 h-4 mr-2 stroke-[2.5]" />
              {isLoading ? 'ENROLLING AGENT...' : 'REGISTER & ENTER BUREAU'}
            </Button>

            <div className="pt-2 text-center font-mono text-xs text-muted">
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthModalMode('login');
                  setError('');
                }}
                className="font-bold text-ink underline hover:text-neoPurple"
              >
                Sign in to dossier
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
