// components/ui/Button.tsx
import Link from 'next/link';
import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function Button({ children, href, onClick, className = '' }: ButtonProps) {
  const baseClasses =
    'inline-block px-8 py-3 rounded-lg font-bold text-black bg-primary hover:brightness-90 transition-all transform hover:scale-105';

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {children}
    </button>
  );
}