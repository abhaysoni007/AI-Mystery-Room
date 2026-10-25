import React from 'react';

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center font-mono text-sm text-muted">
        <p className="font-display font-bold text-ink uppercase">AI Mystery Room &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">AI creates the mystery. The backend preserves the truth. You discover it.</p>
      </div>
    </footer>
  );
}
