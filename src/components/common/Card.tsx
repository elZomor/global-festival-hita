import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Interactive cards warm their frame toward ember on hover. */
  hover?: boolean;
}

// A fired panel: hairline kiln frame on a slightly raised clay surface.
export const Card = ({ children, className = '', hover = true }: CardProps) => {
  const hoverStyles = hover
    ? 'hover:border-ember-500/70 dark:hover:border-ember-500/70 hover:shadow-kiln'
    : '';

  return (
    <div
      className={`
        relative bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-100
        rounded-[3px] border border-primary-200 dark:border-primary-800
        p-6 transition-[border-color,box-shadow] duration-300
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
