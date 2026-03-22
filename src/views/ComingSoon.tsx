'use client';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock } from 'lucide-react';
import { Button, Card } from '../components/common';

export const ComingSoon = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-3xl text-center bg-gradient-to-br from-primary-900 via-accent-600 to-primary-900 dark:from-primary-950 dark:via-accent-700 dark:to-primary-950 text-primary-50 shadow-2xl">
        <div className="space-y-6 py-16 px-8">
          <div className="flex justify-center gap-3 text-secondary-500">
            <Sparkles size={40} className="animate-pulse" />
            <Clock size={40} className="animate-spin" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wide">
            {t('common.comingSoon')}
          </h1>
          <p className="text-lg text-secondary-50/90 max-w-2xl mx-auto leading-relaxed">
            {t('common.comingSoonMessage')}
          </p>

          <Button variant="secondary"
                  className="border border-secondary-500 text-primary-900 dark:text-theatre-black-950 bg-primary-50 dark:bg-secondary-500/20 hover:bg-secondary-500/10 dark:hover:bg-secondary-500/40"
                  onClick={() => window.location.href = '/'}
          >
            {t('common.backHome')}
          </Button>
        </div>
      </Card>
    </div>
  );
};
