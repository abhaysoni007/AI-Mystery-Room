import React from 'react';

export function Card({
  children,
  className = '',
  accent = 'white',
  interactive = false,
  ...props
}) {
  const accentBgs = {
    white: 'bg-white',
    paper: 'bg-paper',
    yellow: 'bg-neoYellow',
    purple: 'bg-neoPurple',
    blue: 'bg-neoBlue',
    pink: 'bg-neoPink',
    coral: 'bg-neoCoral',
  };

  return (
    <div
      className={`border-2 border-ink rounded-xl shadow-hard-md p-6 ${accentBgs[accent] || 'bg-white'} ${interactive ? 'transition-all duration-150 hover:-translate-y-0.5 hover:shadow-hard-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
