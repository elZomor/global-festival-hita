'use client';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { useT } from '../../i18n/useT';

type ShareButtonProps = {
    title: string;
    className?: string;
};

export const ShareButton = ({ title, className }: ShareButtonProps) => {
    const t = useT();

    return (
        <motion.button
            onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                    navigator.share({ title, url });
                } else {
                    navigator.clipboard.writeText(url);
                    alert(t('link_copied'));
                }
            }}
            className={className ?? 'text-sm mx-2 hover:text-accent-500 text-secondary-500 font-medium underline text-center md:text-left'}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
        >
            <Share2 size={30}/>
        </motion.button>
    );
};
