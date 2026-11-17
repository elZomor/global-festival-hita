'use client';
import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'success' | 'error';
}

export const Snackbar = ({ message, isOpen, onClose, variant = 'success' }: SnackbarProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const variantStyles: Record<typeof variant, string> = {
    success: 'glaze text-primary-950 dark:text-primary-50 border-primary-400 dark:border-primary-600',
    error: 'bg-primary-950 text-primary-50 border-ember-500 dark:bg-primary-900',
  };

  return (
    <div className="fixed inset-x-0 bottom-4 flex justify-center z-50 px-4" role="status" aria-live="polite">
      <div className={`w-full max-w-md rounded-[3px] border px-5 py-3 shadow-glow-dark animate-smoke ${variantStyles[variant]}`}>
        <p className="text-center text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};
