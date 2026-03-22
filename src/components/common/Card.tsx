import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = true }: CardProps) => {
  const hoverStyles = hover ? 'hover:scale-105 hover:shadow-2xl' : '';

  return (
    <div
      className={`
        bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-primary-50
        rounded-lg shadow-lg border border-primary-100 dark:border-primary-700
        p-6 transition-all duration-300
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
