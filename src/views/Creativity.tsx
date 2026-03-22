'use client';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {Card, Badge, LoadingState, SectionHeader} from '../components/common';
import { useCreativityEntries } from '../api/hooks';
import { buildMediaUrl } from '../utils/mediaUtils';
import {FileText} from "lucide-react";

export const Creativity = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const {
    data: creativityEntries = [],
    isLoading,
    isError,
  } = useCreativityEntries();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText size={40} className="text-accent-600 dark:text-secondary-500"/>
          <SectionHeader className="mb-0">{t(`creativity.title`)}</SectionHeader>
        </div>
      </div>

      {isLoading && <LoadingState fullscreen={false} />}

      {isError && (
        <div className="text-center py-16">
          <p className="text-lg text-primary-600 dark:text-primary-300">{t('common.error')}</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {creativityEntries.map(item => {
              const localizedTitle = isRTL ? item.titleAr ?? item.title : item.titleEn ?? item.title;
              const preview = isRTL ? item.contentAr ?? item.content : item.contentEn ?? item.content;
              const attachmentUrl = item.attachments?.map(path => buildMediaUrl(path)).find(url => url && url.trim() !== '') ?? '';

              return (
                <Link key={item.id} href={`/creativity/${item.slug}`} className="block h-full">
                  <Card className="transition-all hover:shadow-2xl h-full">
                    <div className="flex flex-col md:flex-row gap-4 h-full">
                      {attachmentUrl && (
                        <div className="w-full md:w-1/3 lg:w-2/5 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={attachmentUrl}
                            alt={localizedTitle}
                            className="w-full h-48 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="gold">
                            {t(`creativity.types.${item.type}`)}
                          </Badge>
                          {item.editionYear && (
                            <Badge variant="default">
                              {item.editionYear}
                            </Badge>
                          )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold text-accent-600 dark:text-secondary-500">
                          {localizedTitle}
                        </h2>

                        <p className="text-primary-600 dark:text-primary-400 flex flex-wrap items-center gap-2">
                          <span>
                            {t('creativity.by')} <span className="font-medium">{item.author}</span>
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </p>

                        <p className="text-primary-700 dark:text-primary-300 leading-relaxed line-clamp-3">
                          {preview.substring(0, 250)}...
                        </p>

                        <p className="text-secondary-500 hover:text-secondary-400 font-medium">
                          {t('creativity.readMore')} →
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {creativityEntries.length === 0 && (
            <div className="text-center py-16">
              <p className="text-primary-600 dark:text-primary-400 text-lg">
                {t('common.noResults')}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
