'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type BackButtonProps = {
    label: string;
    isRTL?: boolean;
};

export const BackButton = ({ label, isRTL }: BackButtonProps) => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 min-h-11 text-sm font-medium text-primary-600 hover:text-ember-600 dark:text-primary-300 dark:hover:text-ember-400 transition-colors"
        >
            <ArrowLeft size={18} strokeWidth={1.5} className={isRTL ? 'rotate-180' : ''}/>
            {label}
        </button>
    );
};
