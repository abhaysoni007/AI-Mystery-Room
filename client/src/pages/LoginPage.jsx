import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, LogIn, ShieldAlert, BadgeCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username: username.trim(), password });
      navigate(getDestination(), { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 my-auto">
      <div className="w-full max-w-md">
        {/* Dossier Card Container */}
        <div className="bg-paper-light border-3 border-ink rounded-2xl p-5 sm:p-6 shadow-hard-lg relative">
          {/* Top Classification Stamp */}
          <div className="flex items-center justify-between border-b-2 border-ink pb-2 mb-3">
            <span className="font-mono text-[11px] font-bold bg-neoYellow border border-ink px-2 py-0.5 rounded shadow-hard-xs uppercase">
              BUREAU OF INVESTIGATION
            </span>
            <span className="font-mono text-[11px] font-bold text-muted uppercase">
              PERSONNEL DOSSIER
            </span>
          </div>

          {/* Navigation Tabs between Login and Signup */}
          <div className="flex border-2 border-ink rounded-lg p-1 bg-paper mb-3">
            <Link
              to="/login"
              state={location.state}
              className="flex-1 text-center py-1.5 font-display font-extrabold text-xs uppercase bg-neoYellow border-2 border-ink rounded shadow-hard-xs text-ink"
            >
              SIGN IN
            </Link>
            <Link
              to="/signup"
              state={location.state}
              className="flex-1 text-center py-1.5 font-display font-extrabold text-xs uppercase text-ink/70 hover:text-ink transition-colors"
            >
              REGISTER
            </Link>
          </div>

          {/* Clearance Required Notice (if redirected from a protected route) */}
          {location.state?.from && !error && (
            <div className="mb-2.5 p-2 bg-neoYellow/30 border-2 border-ink rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-ink">
              <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>CLEARANCE REQUIRED: You must be signed in to access that restricted area.</span>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="mb-3 p-2.5 bg-neoPink/20 border-2 border-ink rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-ink">
              <ShieldAlert className="w-4 h-4 text-ink shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-3.5">
            <div>
              <h1 className="font-display font-extrabold text-2xl uppercase tracking-tight text-ink">
                DETECTIVE SIGN IN
              </h1>
              <p className="font-sans text-xs text-muted mt-0.5 leading-snug">
                Enter your credentials to access active crime scenes, evidence lockers, and archived cases.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label htmlFor="login-username" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Detective ID / Username
                </label>
                <div className="relative">
                  <BadgeCheck className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                  <input
                    id="login-username"
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
                <label htmlFor="login-password" className="block font-mono text-[11px] font-bold uppercase text-ink mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-2.5 stroke-[2.5]" />
                  <input
                    id="login-password"
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
            </form>

            <div className="pt-2.5 border-t-2 border-ink/30 text-center font-mono text-xs text-muted">
              <span>New investigator? </span>
              <Link to="/signup" state={location.state} className="font-bold text-ink underline hover:text-neoPurple">
                Register credentials
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

