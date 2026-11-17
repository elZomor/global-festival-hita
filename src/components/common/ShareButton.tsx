'use client';
import { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useT } from '../../i18n/useT';

type ShareButtonProps = {
    title: string;
    className?: string;
};

export const ShareButton = ({ title, className }: ShareButtonProps) => {
    const t = useT();
    const [copied, setCopied] = useState(false);

    return (
        <button
            type="button"
            aria-label={copied ? t('link_copied') : 'Share'}
            title={copied ? t('link_copied') : undefined}
            onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                    navigator.share({ title, url }).catch(() => {});
                } else {
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                }
            }}
            className={className ?? 'inline-flex items-center justify-center w-11 h-11 rounded-[3px] border border-current/30 text-current hover:text-ember-400 hover:border-ember-500 transition-colors'}
        >
            {copied ? <Check size={20} strokeWidth={1.5}/> : <Share2 size={20} strokeWidth={1.5}/>}
        </button>
    );
};
