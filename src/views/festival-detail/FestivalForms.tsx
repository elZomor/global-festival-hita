import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarClock } from 'lucide-react';
import type { FestivalFormSummary } from '../../types';
import { pickText } from '../dynamic-form/localize';

type Labels = {
  register: string;
  /** e.g. "Registration open until {date}". */
  closesOn: (date: string) => string;
  /** Badge per status, e.g. CLOSED → "Registration closed". */
  status: Record<FestivalFormSummary['status'], string>;
};

type CardsProps = {
  forms: FestivalFormSummary[];
  locale: string;
  labels: Labels;
};

const formatClose = (iso: string, locale: string) => {
  const localeTag = locale === 'ar' ? 'ar-EG' : 'en-GB';
  const dayOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' } as const;
  const date = new Date(iso);
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Africa/Cairo',
  }).format(date);
  // A close at Cairo midnight reads as "until <previous day>"; any other time is shown with the hour.
  if (time === '00:00') return new Date(date.getTime() - 1000).toLocaleDateString(localeTag, dayOptions);
  return date.toLocaleString(localeTag, { ...dayOptions, hour: 'numeric', minute: '2-digit' });
};

/** Workshop / masterclass cards linking to their registration forms. */
export const FestivalFormCards = ({ forms, locale, labels }: CardsProps) => {
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {forms.map(form => {
        const open = form.status === 'OPEN';
        const description = pickText(locale, form.description, form.descriptionEn);
        return (
          <li key={form.slug}>
            <Link
              href={`/forms/${encodeURIComponent(form.slug)}`}
              className="group kiln-frame h-full p-5 flex flex-col gap-3 hover:border-ember-500 transition-colors"
            >
              {!open && (
                <span className="self-start text-xs px-2 py-0.5 rounded-[2px] border border-primary-300 text-primary-500 dark:border-primary-700 dark:text-primary-400">
                  {labels.status[form.status]}
                </span>
              )}
              <span dir="auto" className="text-xl font-semibold text-primary-950 dark:text-primary-50">
                {pickText(locale, form.title, form.titleEn)}
              </span>
              {description && (
                <span dir="auto" className="text-primary-600 dark:text-primary-300 leading-relaxed line-clamp-3">
                  {description}
                </span>
              )}
              {open && (
                <span className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                  {form.closesAt ? (
                    <span className="flex items-center gap-1.5 text-sm text-primary-500 dark:text-primary-400">
                      <CalendarClock className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                      {labels.closesOn(formatClose(form.closesAt, locale))}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span className="inline-flex items-center gap-2 min-h-11 px-5 rounded-[3px] font-semibold bg-ember-500 group-hover:bg-ember-400 text-primary-950 transition-colors">
                    {labels.register}
                    <Arrow className="w-4 h-4" aria-hidden="true" />
                  </span>
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

/** "Registration open" section above the festival tabs: only forms that accept responses now. */
export const FestivalForms = ({ forms, locale, labels, title }: CardsProps & { title: string }) => {
  const openForms = forms.filter(form => form.status === 'OPEN');
  if (!openForms.length) return null;
  return (
    <section aria-labelledby="festival-forms-title" className="space-y-4">
      <h2 id="festival-forms-title" className="flex items-center gap-2 label">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-ember-500 shadow-[0_0_12px] shadow-ember-500"
          aria-hidden="true"
        />
        {title}
      </h2>
      <FestivalFormCards forms={openForms} locale={locale} labels={labels} />
    </section>
  );
};
