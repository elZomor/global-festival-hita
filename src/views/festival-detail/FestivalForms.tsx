import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarClock } from 'lucide-react';
import type { FestivalFormSummary } from '../../types';

type Props = {
  forms: FestivalFormSummary[];
  isRTL: boolean;
  labels: {
    title: string;
    register: string;
    /** e.g. "Registration open until {date}". */
    closesOn: (date: string) => string;
  };
};

/** Open workshops / masterclasses of a festival, each linking to its registration form. */
export const FestivalForms = ({ forms, isRTL, labels }: Props) => {
  if (!forms.length) return null;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const localeTag = isRTL ? 'ar-EG' : 'en-GB';
  const dayOptions = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Cairo' } as const;
  /** A close at Cairo midnight reads as "until <previous day>"; any other time is shown with the hour. */
  const formatClose = (iso: string) => {
    const date = new Date(iso);
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'Africa/Cairo',
    }).format(date);
    if (time === '00:00') return new Date(date.getTime() - 1000).toLocaleDateString(localeTag, dayOptions);
    return date.toLocaleString(localeTag, { ...dayOptions, hour: 'numeric', minute: '2-digit' });
  };

  return (
    <section aria-labelledby="festival-forms-title" className="space-y-4">
      <h2 id="festival-forms-title" className="flex items-center gap-2 label">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full bg-ember-500 shadow-[0_0_12px] shadow-ember-500"
          aria-hidden="true"
        />
        {labels.title}
      </h2>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map(form => (
          <li key={form.slug}>
            <Link
              href={`/forms/${encodeURIComponent(form.slug)}`}
              className="group kiln-frame h-full p-5 flex flex-col gap-3 hover:border-ember-500 transition-colors"
            >
              <span dir="auto" className="text-xl font-semibold text-primary-950 dark:text-primary-50">
                {form.title}
              </span>
              {form.description && (
                <span dir="auto" className="text-primary-600 dark:text-primary-300 leading-relaxed line-clamp-3">
                  {form.description}
                </span>
              )}
              <span className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                {form.closesAt ? (
                  <span className="flex items-center gap-1.5 text-sm text-primary-500 dark:text-primary-400">
                    <CalendarClock className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
                    {labels.closesOn(formatClose(form.closesAt))}
                  </span>
                ) : (
                  <span />
                )}
                <span className="inline-flex items-center gap-2 min-h-11 px-5 rounded-[3px] font-semibold bg-ember-500 group-hover:bg-ember-400 text-primary-950 transition-colors">
                  {labels.register}
                  <Arrow className="w-4 h-4" aria-hidden="true" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};
