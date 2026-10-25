import React from 'react';

const variants = {
  primary: 'bg-neoYellow text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-hard-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  secondary: 'bg-white text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-hard-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  accent: 'bg-neoPurple text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-hard-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  danger: 'bg-neoCoral text-ink hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-hard-hover active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  ghost: 'bg-transparent text-ink border-transparent shadow-none hover:bg-black/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg font-bold',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-display font-bold border-2 border-ink rounded-lg shadow-hard-md transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
