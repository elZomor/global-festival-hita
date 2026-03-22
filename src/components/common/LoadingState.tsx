'use client';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

type LoadingStateProps = {
    message?: string;
    fullscreen?: boolean;
};

export const LoadingState = ({ message, fullscreen = true }: LoadingStateProps) => {
    const { t } = useTranslation();
    const { theme } = useTheme();

    const finalMessage = message ?? t('common.loading');

    const containerClasses = useMemo(
        () =>
            [
                'flex flex-col items-center justify-center text-center space-y-6 px-6',
                fullscreen ? 'min-h-[60vh]' : 'py-16',
            ].join(' '),
        [fullscreen],
    );

    return (
        <div className={containerClasses} aria-live="polite" aria-busy={true}>
            {/* Loader */}
            <div className="relative">
                <div className="w-24 h-24 rounded-full border border-secondary-500/20 bg-primary-950/60 shadow-glow-dark flex items-center justify-center">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-2 border-secondary-500/30 border-t-secondary-500 animate-spin" />
                        <div className="absolute inset-3 rounded-full border border-accent-600/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs tracking-[0.2em] uppercase text-secondary-500">
                {theme === 'dark' ? 'ARF' : 'ARF'}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
                <p className="text-lg font-semibold tracking-wide text-secondary-500 dark:text-secondary-400">
                    {finalMessage}
                </p>

                <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-accent-600 dark:text-accent-500">
                    <span>Arab Festival</span>
                </div>

                <div className="flex items-center justify-center gap-1 mt-2 text-secondary-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:120ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:240ms]" />
                </div>
            </div>
        </div>
    );
};
