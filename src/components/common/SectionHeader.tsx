import { ReactNode } from 'react';

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

// Brushed section title with a short dry-brush swipe beneath it.
export const SectionHeader = ({ children, className = '' }: SectionHeaderProps) => {
  return (
    <div className={`mb-10 ${className}`}>
      <h2 className="brush text-4xl md:text-5xl text-primary-950 dark:text-primary-50">
        {children}
      </h2>
      <span className="ember-swipe swipe-cool mt-3 w-28" aria-hidden="true" />
    </div>
  );
};
