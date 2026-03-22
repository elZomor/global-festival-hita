import {type ReactNode} from 'react';

type BadgeVariant = 'gold' | 'red' | 'green' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-100',
    gold: 'bg-theatre-gold-500 text-theatre-black-950 dark:bg-theatre-gold-400 dark:text-theatre-black-900',
    red: 'bg-accent-600 text-primary-50 dark:bg-accent-500 dark:text-primary-50',
    green: 'bg-secondary-500 text-theatre-black-950 dark:bg-secondary-400 dark:text-theatre-black-900',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
