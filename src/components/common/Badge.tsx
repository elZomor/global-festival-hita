import {type ReactNode} from 'react';

type BadgeVariant = 'gold' | 'red' | 'green' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Engraved tags. `red`/`gold` = live (ember), `green` = glaze, default = soot.
export const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
  const variants: Record<BadgeVariant, string> = {
    default: 'border border-primary-300 text-primary-600 dark:border-primary-700 dark:text-primary-300',
    gold: 'border border-ember-500 text-ember-700 dark:text-ember-300',
    red: 'bg-ember-500 text-primary-950',
    green: 'glaze text-primary-900 dark:text-primary-100 border border-primary-300 dark:border-primary-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-medium uppercase tracking-label rtl:tracking-normal rtl:normal-case rtl:text-[0.8125rem] ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
