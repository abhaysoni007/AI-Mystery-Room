import React from 'react';
import { Search, Compass } from 'lucide-react';
import { Button } from '../ui/Button';

export function Navbar() {
  return (
    <header className="border-b-2 border-ink bg-paper sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neoYellow border-2 border-ink rounded-lg flex items-center justify-center shadow-hard-sm">
            <Search className="w-6 h-6 text-ink stroke-[2.5]" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-ink uppercase">
            AI Mystery Room
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 font-display font-bold text-sm">
          <a href="#how-it-works" className="hover:text-neoPurple transition-colors">HOW IT WORKS</a>
          <a href="#sample-case" className="hover:text-neoPurple transition-colors">SAMPLE CASE</a>
          <Button variant="primary" size="sm">
            <Compass className="w-4 h-4 mr-2 stroke-[2.5]" />
            START INVESTIGATING
          </Button>
        </nav>
      </div>
    </header>
  );
}
