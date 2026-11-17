import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'reservation' | 'waiting' | 'complete' | 'disabled';
  children: ReactNode;
}

// Raku buttons: ember = live action, glaze = secondary, hairline = quiet.
// No scale-on-hover; heat is shown by colour and the glow under the surface.
export const Button = ({ variant = 'primary', children, className = '', ...props }: ButtonProps) => {
  const base =
    'inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-[3px] text-sm font-semibold uppercase tracking-label rtl:tracking-normal rtl:normal-case rtl:text-base transition-[background-color,color,box-shadow,border-color] duration-200 ease-out disabled:cursor-not-allowed';

  const ember =
    'bg-ember-500 text-primary-950 hover:bg-ember-400 hover:shadow-[0_10px_30px_-10px] hover:shadow-ember-500/70 active:bg-ember-600';

  const variants = {
    primary: ember,
    reservation: ember,
    secondary:
      'glaze text-primary-950 dark:text-primary-50 border border-primary-300 dark:border-primary-600 hover:border-ember-500 dark:hover:border-ember-500',
    ghost:
      'bg-transparent border border-primary-400 text-primary-900 hover:border-ember-500 hover:text-ember-600 dark:border-primary-500 dark:text-primary-100 dark:hover:text-ember-400',
    waiting:
      'bg-primary-700 text-primary-50 hover:bg-primary-600 dark:bg-primary-200 dark:text-primary-950 dark:hover:bg-primary-100',
    complete:
      'bg-transparent border border-dashed border-primary-400 text-primary-500 dark:border-primary-600 dark:text-primary-400 cursor-not-allowed',
    disabled:
      'bg-transparent border border-dashed border-primary-400 text-primary-500 dark:border-primary-600 dark:text-primary-400 cursor-not-allowed',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
