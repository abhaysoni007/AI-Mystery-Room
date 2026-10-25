import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Compass, FolderArchive } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  const navigate = useNavigate();

  return (
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

        <nav className="hidden md:flex items-center gap-6 font-display font-bold text-sm">
          <Link to="/#how-it-works" className="hover:text-neoPurple transition-colors">HOW IT WORKS</Link>
          <Link to="/dashboard" className="hover:text-neoPurple transition-colors flex items-center gap-1.5">
            <FolderArchive className="w-4 h-4 stroke-[2.5]" />
            DASHBOARD
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/create')}
          >
            <Compass className="w-4 h-4 mr-2 stroke-[2.5]" />
            START INVESTIGATING
          </Button>
        </nav>
      </div>
    </header>
  );
}
