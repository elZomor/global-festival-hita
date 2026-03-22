import { ReactNode } from 'react';

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

export const SectionHeader = ({ children, className = '' }: SectionHeaderProps) => {
  return (
    <h2
      className={`
        text-3xl md:text-4xl font-bold
        text-accent-600 dark:text-secondary-500
        mb-8
        ${className}
      `}
    >
      {children}
    </h2>
  );
};
