'use client';
import { useT } from '../../i18n/useT';
import { festivalConfig } from '../../config/festival';

type LoadingStateProps = {
    message?: string;
    fullscreen?: boolean;
};

// The kiln heating: a hairline frame whose ember bar fills and cools in a loop.
export const LoadingState = ({ message, fullscreen = true }: LoadingStateProps) => {
    const t = useT();
    const finalMessage = message ?? t('common.loading');

    return (
        <div
            className={`flex flex-col items-center justify-center text-center px-6 ${fullscreen ? 'min-h-[60vh]' : 'py-16'}`}
            aria-live="polite"
            aria-busy={true}
        >
            <div className="kiln-frame w-56 p-4 text-start">
                <p className="label">{festivalConfig.abbreviation}</p>
                <p className="mt-2 text-lg font-semibold text-primary-900 dark:text-primary-50">{finalMessage}</p>
                <div className="mt-4 h-0.5 w-full bg-primary-200 dark:bg-primary-800 overflow-hidden">
                    <div className="h-full w-1/3 bg-ember-500 animate-[kiln_1.4s_cubic-bezier(0.16,1,0.3,1)_infinite]" />
                </div>
            </div>
            <style>{`@keyframes kiln{0%{transform:translateX(-120%)}100%{transform:translateX(320%)}}[dir=rtl] .animate-\\[kiln_1\\.4s_cubic-bezier\\(0\\.16\\,1\\,0\\.3\\,1\\)_infinite\\]{animation-direction:reverse}`}</style>
        </div>
    );
};
