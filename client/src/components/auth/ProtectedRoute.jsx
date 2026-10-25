import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-paper-light border-3 border-ink rounded-2xl p-8 shadow-hard-lg max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-neoYellow border-3 border-ink rounded-xl flex items-center justify-center shadow-hard-sm">
            <Loader2 className="w-7 h-7 text-ink animate-spin stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-xl uppercase tracking-tight text-ink">
              VERIFYING CLEARANCE...
            </h2>
            <p className="font-sans text-xs text-muted mt-1">
              Checking detective credentials with central bureau.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve requested route in location state so user returns here after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
