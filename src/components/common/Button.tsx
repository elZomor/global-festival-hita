import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'reservation' | 'waiting' | 'complete' | 'disabled';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className = '', ...props }: ButtonProps) => {
  const baseStyles = 'px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500 dark:focus-visible:ring-secondary-400';

  const variants = {
    primary: 'bg-accent-500 hover:bg-accent-600 text-primary-50 dark:bg-accent-600 dark:hover:bg-accent-700 dark:text-primary-50 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-500 hover:bg-secondary-400 text-primary-950 dark:text-primary-950 shadow-lg hover:shadow-xl',
    reservation: 'bg-reservation-500 hover:bg-reservation-600 text-primary-50 dark:bg-reservation-500 dark:hover:bg-reservation-600 shadow-lg hover:shadow-xl',
    waiting: 'bg-waiting-500 hover:bg-waiting-600 text-primary-50 dark:text-primary-50 shadow-lg hover:shadow-xl',
    complete: 'bg-primary-200 text-primary-500 dark:bg-primary-700 dark:text-primary-300 cursor-not-allowed opacity-70 shadow-none',
    ghost: 'bg-transparent border-2 border-secondary-500 text-secondary-600 hover:bg-secondary-500 hover:text-primary-950 dark:border-secondary-400 dark:text-secondary-400 dark:hover:bg-secondary-400 dark:hover:text-theatre-black-950',
    disabled: 'bg-primary-200 text-primary-500 dark:bg-primary-700 dark:text-primary-300 cursor-not-allowed opacity-70 shadow-none',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
