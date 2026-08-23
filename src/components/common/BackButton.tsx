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
            className="inline-flex items-center gap-2 text-secondary-500 hover:text-secondary-400 transition-colors"
        >
            <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''}/>
            {label}
        </button>
    );
};
