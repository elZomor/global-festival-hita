'use client';
import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useT } from '../i18n/useT';
import { useAuth } from '../contexts/AuthContext';
import { useApplicationStatus, useSubmitApplication } from '../api/hooks';
import { getLongFormattedDate } from '../utils/dateUtils';
import type { ApiError } from '../api/reactQueryClient';
import { festivalConfig } from '../config/festival';
import { Button, Card, LoadingState, Snackbar } from '../components/common';
import type { ApplicationFormValues, Department, StudyPhase, StudyType } from '../types';
import { FileField, ListField, RadioGroupField, SelectField, TextField } from './apply/fields';
import {
  buildFormData,
  FIELD_ORDER,
  type FieldName,
  type FormErrors,
  initialValues,
  mapServerErrors,
  NATIONAL_ID_EXTENSIONS,
  SCRIPT_EXTENSIONS,
  validateAll,
  validateField,
} from './apply/validation';

const DEPARTMENTS: Department[] = ['ACTING_DIRECTING', 'DRAMA_CRITICISM', 'DECOR'];
const STUDY_TYPES: StudyType[] = ['CREDIT_HOURS', 'PARALLEL'];
const STUDY_PHASES: StudyPhase[] = ['POSTGRAD', 'UNDERGRAD'];
const SERVER_MESSAGE_CODES = ['APPLICATIONS_CLOSED', 'ALREADY_APPLIED', 'VALIDATION_ERROR'];

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="space-y-5">
    <legend className="w-full font-display text-2xl text-primary-950 dark:text-primary-50 mb-5 pb-3 border-b border-primary-300 dark:border-primary-700">{title}</legend>
    {children}
  </fieldset>
);

export const Apply = () => {
  const t = useT();
  const locale = useLocale();
  const { user } = useAuth();
  const { data: status, isLoading: statusLoading, isError: statusError } = useApplicationStatus(user?.email);
  const submitMutation = useSubmitApplication();

  const [values, setValues] = useState<ApplicationFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [emailPrefilled, setEmailPrefilled] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const closeSnackbar = useCallback(() => setSnackbar(null), []);

  // Auth user is restored from localStorage after the first render, so prefill when it arrives.
  useEffect(() => {
    if (!user?.email) return;
    if (values.email) return;
    setValues(prev => ({ ...prev, email: user.email }));
    setEmailPrefilled(true);
    // Only react to the login state arriving, not to the user editing the email.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const setField = <K extends keyof ApplicationFormValues>(field: K, value: ApplicationFormValues[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    // Re-validate fields that already show an error so the message clears as the user fixes it.
    const affected: FieldName[] =
      field === 'mobile' || field === 'whatsappSameAsMobile' ? ['mobile', 'whatsapp'] : [field as FieldName];
    setErrors(prev => {
      const updated = { ...prev };
      affected.forEach(name => {
        if (updated[name]) updated[name] = validateField(name, next);
      });
      return updated;
    });
  };

  const touch = (field: FieldName) => () =>
    setErrors(prev => ({ ...prev, [field]: validateField(field, values) }));

  const errorText = (field: FieldName) => {
    const key = errors[field];
    return key ? t(`apply.errors.${key}`) : undefined;
  };

  const scrollToFirstError = (formErrors: FormErrors) => {
    const first = FIELD_ORDER.find(field => formErrors[field]);
    if (!first) return;
    const element = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.querySelector<HTMLElement>('input, select, textarea, button')?.focus({ preventScroll: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(values);
    setErrors(formErrors);
    if (Object.values(formErrors).some(Boolean)) {
      setSnackbar(t('apply.errors.fixErrors'));
      scrollToFirstError(formErrors);
      return;
    }

    try {
      await submitMutation.mutateAsync(buildFormData(values));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const apiError = err as ApiError;
      const serverErrors = mapServerErrors(apiError.details);
      if (apiError.message === 'ALREADY_APPLIED') serverErrors.email = 'alreadyApplied';
      setErrors(serverErrors);
      scrollToFirstError(serverErrors);
      setSnackbar(
        SERVER_MESSAGE_CODES.includes(apiError.message)
          ? t(`apply.errors.codes.${apiError.message}`)
          : t('apply.errors.generic'),
      );
    }
  };

  if (statusLoading) return <LoadingState />;

  const header = (
    <div className="mb-10">
      <h1 dir="auto" className="brush fired-text fired-live animate-fire text-[clamp(2.5rem,7vw,4.5rem)]">{t('apply.title')}</h1>
      <span className="ember-swipe w-40 mt-3 mb-5" aria-hidden="true" />
      <p className="text-lg text-primary-600 dark:text-primary-300">
        {t('apply.subtitle', {
          festival: status?.festivalName || (locale === 'ar' ? festivalConfig.titleAr : festivalConfig.titleEn),
        })}
      </p>
    </div>
  );

  if (statusError || !status?.open) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {header}
        <Card hover={false} className="text-center">
          <p className="text-lg">{statusError ? t('apply.errors.generic') : t('apply.closed')}</p>
        </Card>
      </div>
    );
  }

  const myApplication = status.myApplication;
  if (myApplication && !submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {header}
        <Card hover={false} className="text-center space-y-4 py-10">
          <ClipboardCheck className="w-16 h-16 mx-auto text-primary-500 dark:text-primary-400" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold">{t('apply.alreadyApplied.title')}</h2>
          <p className="text-primary-600 dark:text-primary-300">{t('apply.alreadyApplied.message')}</p>
          <dl className="inline-grid grid-cols-[auto_auto] gap-x-6 gap-y-2 text-start pt-2">
            <dt className="text-primary-500 dark:text-primary-400">{t('apply.fields.showName')}</dt>
            <dd className="font-medium">{myApplication.showName}</dd>
            <dt className="text-primary-500 dark:text-primary-400">{t('apply.alreadyApplied.submittedOn')}</dt>
            <dd className="font-medium">{getLongFormattedDate(locale, new Date(myApplication.createdAt))}</dd>
            <dt className="text-primary-500 dark:text-primary-400">{t('apply.alreadyApplied.status')}</dt>
            <dd className="font-medium">{t(`apply.alreadyApplied.statuses.${myApplication.status}`)}</dd>
          </dl>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card hover={false} className="text-center space-y-4 py-10">
          <CheckCircle2 className="w-16 h-16 mx-auto text-ember-500" strokeWidth={1.25} />
          <h1 className="brush text-4xl text-primary-950 dark:text-primary-50">{t('apply.success.title')}</h1>
          <p className="text-primary-600 dark:text-primary-300">{t('apply.success.message')}</p>
          <Link
            href="/"
            className="inline-flex items-center min-h-12 px-7 rounded-[3px] font-semibold bg-ember-500 hover:bg-ember-400 text-primary-950 transition-colors"
          >
            {t('apply.success.backHome')}
          </Link>
        </Card>
      </div>
    );
  }

  const whatsappValue = values.whatsappSameAsMobile ? values.mobile : values.whatsapp;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {header}

      <div
        role="note"
        className="flex items-start gap-3 p-4 mb-8 rounded-[3px] border border-ember-500 bg-ember-500/[0.07] text-primary-950 dark:text-primary-50"
      >
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-ember-600 dark:text-ember-400" strokeWidth={1.5} />
        <p className="font-medium">{t('apply.arabicNotice')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <Card hover={false} className="space-y-10">
          <Section title={t('apply.sections.contact')}>
            <TextField
              name="email"
              type="email"
              dir="ltr"
              autoComplete="email"
              label={t('apply.fields.email')}
              required
              value={values.email}
              onChange={v => setField('email', v)}
              onBlur={touch('email')}
              hint={emailPrefilled ? t('apply.loggedInPrefill') : undefined}
              error={errorText('email')}
            />
            <TextField
              name="mobile"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              label={t('apply.fields.mobile')}
              required
              placeholder={t('apply.fields.mobilePlaceholder')}
              value={values.mobile}
              onChange={v => setField('mobile', v)}
              onBlur={touch('mobile')}
              error={errorText('mobile')}
            />
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-primary-700 dark:text-primary-200">
                <input
                  type="checkbox"
                  checked={values.whatsappSameAsMobile}
                  onChange={e => setField('whatsappSameAsMobile', e.target.checked)}
                  className="w-4 h-4 accent-ember-500"
                />
                {t('apply.fields.whatsappSameAsMobile')}
              </label>
              <TextField
                name="whatsapp"
                type="tel"
                dir="ltr"
                label={t('apply.fields.whatsapp')}
                required
                placeholder={t('apply.fields.mobilePlaceholder')}
                value={whatsappValue}
                disabled={values.whatsappSameAsMobile}
                onChange={v => setField('whatsapp', v)}
                onBlur={touch('whatsapp')}
                error={errorText('whatsapp')}
              />
            </div>
          </Section>

          <Section title={t('apply.sections.show')}>
            <TextField
              name="showName"
              dir="rtl"
              label={t('apply.fields.showName')}
              required
              value={values.showName}
              onChange={v => setField('showName', v)}
              onBlur={touch('showName')}
              error={errorText('showName')}
            />
            <SelectField
              name="department"
              label={t('apply.fields.department')}
              required
              placeholder={t('apply.fields.departmentPlaceholder')}
              value={values.department}
              options={DEPARTMENTS.map(d => ({ value: d, label: t(`apply.departments.${d}`) }))}
              onChange={v => setField('department', v as Department)}
              onBlur={touch('department')}
              error={errorText('department')}
            />
            <RadioGroupField
              name="studyType"
              label={t('apply.fields.studyType')}
              required
              value={values.studyType}
              options={STUDY_TYPES.map(s => ({ value: s, label: t(`apply.studyTypes.${s}`) }))}
              onChange={v => setField('studyType', v as StudyType)}
              error={errorText('studyType')}
            />
            <RadioGroupField
              name="studyPhase"
              label={t('apply.fields.studyPhase')}
              required
              value={values.studyPhase}
              options={STUDY_PHASES.map(s => ({ value: s, label: t(`apply.studyPhases.${s}`) }))}
              onChange={v => setField('studyPhase', v as StudyPhase)}
              error={errorText('studyPhase')}
            />
          </Section>

          <Section title={t('apply.sections.team')}>
            <TextField
              name="directorName"
              dir="rtl"
              label={t('apply.fields.directorName')}
              required
              value={values.directorName}
              onChange={v => setField('directorName', v)}
              onBlur={touch('directorName')}
              error={errorText('directorName')}
            />
            <TextField
              name="author"
              dir="rtl"
              label={t('apply.fields.author')}
              required
              value={values.author}
              onChange={v => setField('author', v)}
              onBlur={touch('author')}
              error={errorText('author')}
            />
            <TextField
              name="dramaturgy"
              dir="rtl"
              label={t('apply.fields.dramaturgy')}
              badge={t('apply.optional')}
              value={values.dramaturgy}
              onChange={v => setField('dramaturgy', v)}
              onBlur={touch('dramaturgy')}
              error={errorText('dramaturgy')}
            />
            <ListField
              name="actors"
              label={t('apply.fields.actors')}
              required
              values={values.actors}
              onChange={v => setField('actors', v)}
              onBlur={touch('actors')}
              itemPlaceholder={index => t('apply.fields.actorPlaceholder', { number: index + 1 })}
              addLabel={t('apply.fields.addActor')}
              removeLabel={t('apply.fields.removeActor')}
              error={errorText('actors')}
            />
          </Section>

          <Section title={t('apply.sections.details')}>
            <TextField
              name="directorialVision"
              dir="rtl"
              multiline
              label={t('apply.fields.directorialVision')}
              required
              value={values.directorialVision}
              onChange={v => setField('directorialVision', v)}
              onBlur={touch('directorialVision')}
              error={errorText('directorialVision')}
            />
            <TextField
              name="showSummary"
              dir="rtl"
              multiline
              label={t('apply.fields.showSummary')}
              required
              value={values.showSummary}
              onChange={v => setField('showSummary', v)}
              onBlur={touch('showSummary')}
              error={errorText('showSummary')}
            />
          </Section>

          <Section title={t('apply.sections.attachments')}>
            <FileField
              name="script"
              label={t('apply.fields.script')}
              required
              hint={t('apply.fields.scriptHint')}
              accept={SCRIPT_EXTENSIONS.join(',')}
              file={values.script}
              onChange={file => setField('script', file)}
              chooseLabel={t('apply.fields.chooseFile')}
              changeLabel={t('apply.fields.changeFile')}
              error={errorText('script')}
            />
            <FileField
              name="nationalId"
              label={t('apply.fields.nationalId')}
              required
              hint={t('apply.fields.nationalIdHint')}
              accept={NATIONAL_ID_EXTENSIONS.join(',')}
              file={values.nationalId}
              onChange={file => setField('nationalId', file)}
              chooseLabel={t('apply.fields.chooseFile')}
              changeLabel={t('apply.fields.changeFile')}
              error={errorText('nationalId')}
            />
          </Section>

          <Button
            type="submit"
            variant={submitMutation.isPending ? 'disabled' : 'primary'}
            disabled={submitMutation.isPending}
            className="w-full justify-center"
          >
            {submitMutation.isPending ? t('apply.submitting') : t('apply.submit')}
          </Button>
        </Card>
      </form>

      <Snackbar message={snackbar ?? ''} isOpen={Boolean(snackbar)} onClose={closeSnackbar} variant="error" />
    </div>
  );
};
