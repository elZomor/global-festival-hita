'use client';
import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Info, LogIn } from 'lucide-react';
import { useT } from '../i18n/useT';
import { useAuth } from '../contexts/AuthContext';
import { useFormSchema, useSubmitFormResponse } from '../api/hooks';
import type { ApiError } from '../api/reactQueryClient';
import { getLongFormattedDate } from '../utils/dateUtils';
import { Button, Card, LoadingState, Snackbar } from '../components/common';
import type { FormAnswer, FormAnswers, FormSchema } from '../types';
import { FormFieldInput } from './dynamic-form/FormFieldInput';
import { pickText } from './dynamic-form/localize';
import {
  buildFormData,
  type FormErrors,
  initialAnswers,
  mapServerErrors,
  validateAnswer,
  validateAnswers,
} from './dynamic-form/validation';

// Reads `navigator` at module scope, so keep it out of the server render.
const GoogleLoginButton = dynamic(
  () => import('../components/auth/GoogleLoginButton').then(m => m.GoogleLoginButton),
  { ssr: false },
);

const SERVER_MESSAGE_CODES = ['FORM_CLOSED', 'ALREADY_SUBMITTED', 'LOGIN_REQUIRED', 'VALIDATION_ERROR'];

const Page = ({ children }: { children: ReactNode }) => (
  <div className="container mx-auto px-4 py-8 max-w-3xl">{children}</div>
);

const Header = ({ form }: { form: FormSchema }) => {
  const locale = useLocale();
  const description = pickText(locale, form.description, form.descriptionEn);
  return (
    <div className="mb-10">
      <h1 dir="auto" className="brush fired-text fired-live animate-fire text-[clamp(2.25rem,6vw,4rem)]">
        {pickText(locale, form.title, form.titleEn)}
      </h1>
      <span className="ember-swipe w-40 mt-3 mb-5" aria-hidden="true" />
      {description && (
        <p dir="auto" className="text-lg text-primary-600 dark:text-primary-300 whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );
};

/** `warning` is something the user must act on (ember); `info` is context (neutral). */
const Note = ({ tone, children }: { tone: 'warning' | 'info'; children: ReactNode }) => {
  const Icon = tone === 'warning' ? AlertTriangle : Info;
  return (
    <div
      role="note"
      className={`flex items-start gap-3 p-4 rounded-[3px] border text-primary-950 dark:text-primary-50 ${
        tone === 'warning'
          ? 'border-ember-500 bg-ember-500/[0.07]'
          : 'border-primary-300 dark:border-primary-700 bg-primary-100/60 dark:bg-primary-900/60'
      }`}
    >
      <Icon
        className={`w-5 h-5 shrink-0 mt-0.5 ${
          tone === 'warning' ? 'text-ember-600 dark:text-ember-400' : 'text-primary-500 dark:text-primary-400'
        }`}
        strokeWidth={1.5}
      />
      <p dir="auto" className={tone === 'warning' ? 'font-medium' : ''}>
        {children}
      </p>
    </div>
  );
};

export const DynamicForm = ({ slug }: { slug: string }) => {
  const t = useT();
  const locale = useLocale();
  const { user, isAuthenticated, loginWithGoogleCredential } = useAuth();
  const { data: form, isLoading, isError, error } = useFormSchema(slug, user?.email);
  const submitMutation = useSubmitFormResponse(slug);

  const [answers, setAnswers] = useState<FormAnswers>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const closeSnackbar = useCallback(() => setSnackbar(null), []);

  // Start with empty answers once the schema arrives (keeps anything already typed).
  useEffect(() => {
    if (!form) return;
    setAnswers(prev => ({ ...initialAnswers(form.fields), ...prev }));
  }, [form]);

  if (isLoading) return <LoadingState />;

  if (isError || !form) {
    const notFound = (error as ApiError | null)?.status === 404;
    return (
      <Page>
        <Card hover={false} className="text-center">
          <p className="text-lg">{notFound ? t('forms.notFound') : t('forms.errors.loadFailed')}</p>
        </Card>
      </Page>
    );
  }

  const fields = form.fields;
  const fieldByKey = (key: string) => fields.find(f => f.key === key);

  const setAnswer = (key: string, value: FormAnswer) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    // Re-validate a field that already shows an error so it clears as the user fixes it.
    const field = fieldByKey(key);
    if (field && errors[key]) setErrors(prev => ({ ...prev, [key]: validateAnswer(field, value) }));
  };

  const touch = (key: string) => () => {
    const field = fieldByKey(key);
    if (field) setErrors(prev => ({ ...prev, [key]: validateAnswer(field, answers[key]) }));
  };

  const errorText = (key: string) => {
    const code = errors[key];
    return code ? t(`forms.errors.${code}`) : undefined;
  };

  const scrollToFirstError = (formErrors: FormErrors) => {
    const first = fields.find(field => formErrors[field.key]);
    if (!first) return;
    const element = document.querySelector<HTMLElement>(`[data-field="${CSS.escape(first.key)}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.querySelector<HTMLElement>('input, select, textarea, button')?.focus({ preventScroll: true });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAnswers(fields, answers);
    setErrors(formErrors);
    if (Object.values(formErrors).some(Boolean)) {
      setSnackbar(t('forms.errors.fixErrors'));
      scrollToFirstError(formErrors);
      return;
    }

    try {
      await submitMutation.mutateAsync(buildFormData(fields, answers));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const apiError = err as ApiError;
      const serverErrors = mapServerErrors(fields, apiError.details);
      setErrors(serverErrors);
      scrollToFirstError(serverErrors);
      setSnackbar(
        SERVER_MESSAGE_CODES.includes(apiError.message)
          ? t(`forms.errors.codes.${apiError.message}`)
          : t('forms.errors.generic'),
      );
    }
  };

  if (submitted) {
    return (
      <Page>
        <Card hover={false} className="text-center space-y-4 py-10">
          <CheckCircle2 className="w-16 h-16 mx-auto text-ember-500" strokeWidth={1.25} />
          <h1 className="brush text-4xl text-primary-950 dark:text-primary-50">{t('forms.success.title')}</h1>
          <p dir="auto" className="text-primary-600 dark:text-primary-300 whitespace-pre-line">
            {pickText(locale, form.successMessage, form.successMessageEn) || t('forms.success.message')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center min-h-12 px-7 rounded-[3px] font-semibold bg-ember-500 hover:bg-ember-400 text-primary-950 transition-colors"
          >
            {t('forms.success.backHome')}
          </Link>
        </Card>
      </Page>
    );
  }

  if (!form.open) {
    const reason = form.closedReason ?? 'CLOSED';
    const opensAt = form.opensAt ? getLongFormattedDate(locale, new Date(form.opensAt)) : null;
    return (
      <Page>
        <Header form={form} />
        <Card hover={false} className="text-center">
          <p className="text-lg">
            {reason === 'NOT_OPEN_YET' && opensAt
              ? t('forms.closed.NOT_OPEN_YET_ON', { date: opensAt })
              : t(`forms.closed.${reason}`)}
          </p>
        </Card>
      </Page>
    );
  }

  if (form.myResponse) {
    return (
      <Page>
        <Header form={form} />
        <Card hover={false} className="text-center space-y-4 py-10">
          <ClipboardCheck className="w-16 h-16 mx-auto text-primary-500 dark:text-primary-400" strokeWidth={1.25} />
          <h2 className="text-2xl font-bold">{t('forms.alreadySubmitted.title')}</h2>
          <p className="text-primary-600 dark:text-primary-300">
            {t('forms.alreadySubmitted.submittedOn', {
              date: getLongFormattedDate(locale, new Date(form.myResponse.createdAt)),
            })}
          </p>
        </Card>
      </Page>
    );
  }

  if (form.requiresLogin && !isAuthenticated) {
    return (
      <Page>
        <Header form={form} />
        <Card hover={false} className="text-center space-y-5 py-10">
          <LogIn className="w-12 h-12 mx-auto text-primary-500 dark:text-primary-400" strokeWidth={1.25} />
          <p className="text-lg">{t('forms.loginRequired')}</p>
          <div className="flex justify-center">
            <GoogleLoginButton
              onSuccess={async credential => {
                try {
                  await loginWithGoogleCredential(credential);
                } catch {
                  setSnackbar(t('forms.errors.loginFailed'));
                }
              }}
            />
          </div>
        </Card>
        <Snackbar message={snackbar ?? ''} isOpen={Boolean(snackbar)} onClose={closeSnackbar} variant="error" />
      </Page>
    );
  }

  return (
    <Page>
      <Header form={form} />

      {(form.warning || form.notice) && (
        <div className="space-y-3 mb-8">
          {form.warning && <Note tone="warning">{pickText(locale, form.warning, form.warningEn)}</Note>}
          {form.notice && <Note tone="info">{pickText(locale, form.notice, form.noticeEn)}</Note>}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <Card hover={false} className="space-y-6">
          {fields.map(field => (
            <FormFieldInput
              key={field.key}
              field={field}
              value={answers[field.key] ?? initialAnswers([field])[field.key]}
              error={errorText(field.key)}
              onChange={value => setAnswer(field.key, value)}
              onBlur={touch(field.key)}
            />
          ))}

          <Button
            type="submit"
            variant={submitMutation.isPending ? 'disabled' : 'primary'}
            disabled={submitMutation.isPending}
            className="w-full justify-center"
          >
            {submitMutation.isPending ? t('forms.submitting') : t('forms.submit')}
          </Button>
        </Card>
      </form>

      <Snackbar message={snackbar ?? ''} isOpen={Boolean(snackbar)} onClose={closeSnackbar} variant="error" />
    </Page>
  );
};
