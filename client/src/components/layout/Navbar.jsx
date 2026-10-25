import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Compass, FolderArchive, LogIn, LogOut, Sparkles, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from '../auth/AuthModal';

export function Navbar() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal, openWalkthrough } = useAuth();

  return (
    <>
      <header className="border-b-2 border-ink bg-paper sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-neoYellow border-2 border-ink rounded-lg flex items-center justify-center shadow-hard-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              <Search className="w-6 h-6 text-ink stroke-[2.5]" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tight text-ink uppercase">
              AI Mystery Room
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-5 font-display font-bold text-sm">
            <Link to="/#how-it-works" className="hidden lg:inline-block hover:text-neoPurple transition-colors">
              HOW IT WORKS
            </Link>
            <Link to="/dashboard" className="hidden sm:flex items-center gap-1.5 hover:text-neoPurple transition-colors">
              <FolderArchive className="w-4 h-4 stroke-[2.5]" />
              DASHBOARD
            </Link>

            <button
              type="button"
              onClick={openWalkthrough}
              title="Platform Feature Walkthrough"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-paper-light border-2 border-ink rounded-lg text-xs font-mono font-bold hover:bg-neoYellow transition-colors shadow-hard-xs"
            >
              <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">GUIDED</span> TOUR
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/create')}
              className="hidden sm:inline-flex"
            >
              <Compass className="w-4 h-4 mr-2 stroke-[2.5]" />
              START CASE
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l-2 border-ink/40">
                <div
                  title={user?.email}
                  className="w-8 h-8 rounded-lg bg-neoPink border-2 border-ink flex items-center justify-center font-display font-extrabold text-xs shadow-hard-xs text-ink"
                >
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 border-2 border-ink rounded-lg hover:bg-neoPink/30 transition-colors shadow-hard-xs"
                >
                  <LogOut className="w-4 h-4 text-ink stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
              >
                <LogIn className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                SIGN IN
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Auth Modal Provider */}
      <AuthModal />
    </>
  );
}
