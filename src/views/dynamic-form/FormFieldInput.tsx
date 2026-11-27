'use client';
import { useLocale } from 'next-intl';
import { useT } from '../../i18n/useT';
import type { FormAnswer, FormFieldDef } from '../../types';
import {
  CheckboxGroupField,
  ConsentField,
  MultiFileField,
  RadioGroupField,
  SelectField,
  TextField,
} from '../apply/fields';
import { pickText } from './localize';

type Props = {
  field: FormFieldDef;
  value: FormAnswer;
  error?: string;
  onChange: (value: FormAnswer) => void;
  onBlur: () => void;
};

/** Values stay the stored (Arabic) option; labels use the English text when shown in English. */
const asOptions = (locale: string, options: string[] = [], optionsEn: string[] = []) =>
  options.map((option, index) => ({ value: option, label: pickText(locale, option, optionsEn[index]) }));

const fileHint = (field: FormFieldDef, t: ReturnType<typeof useT>, helpText: string) => {
  const parts = [helpText];
  const extensions = field.allowedExtensions ?? [];
  if (extensions.length) parts.push(t('forms.fileTypes', { types: extensions.map(ext => ext.replace(/^\./, '').toUpperCase()).join('، ') }));
  parts.push(t('forms.fileMaxSize', { mb: field.maxFileMb ?? 10 }));
  if ((field.maxFiles ?? 1) > 1) parts.push(t('forms.fileMaxCount', { count: field.maxFiles ?? 1 }));
  return parts.filter(Boolean).join(' · ');
};

/** Renders one configured field with the shared form components from `apply/fields`. */
export const FormFieldInput = ({ field, value, error, onChange, onBlur }: Props) => {
  const t = useT();
  const locale = useLocale();
  const label = pickText(locale, field.label, field.labelEn);
  const helpText = pickText(locale, field.helpText, field.helpTextEn);
  const placeholder = pickText(locale, field.placeholder, field.placeholderEn);
  const options = asOptions(locale, field.options, field.optionsEn);
  const shell = {
    name: field.key,
    label,
    required: field.required,
    badge: field.required ? undefined : t('forms.optional'),
    hint: helpText || undefined,
    error,
  };

  switch (field.type) {
    case 'SELECT':
      return (
        <SelectField
          {...shell}
          placeholder={placeholder || t('forms.choose')}
          value={value as string}
          options={options}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    case 'RADIO':
      return <RadioGroupField {...shell} value={value as string} options={options} onChange={onChange} />;
    case 'CHECKBOXES':
      return (
        <CheckboxGroupField {...shell} values={value as string[]} options={options} onChange={onChange} />
      );
    case 'CONSENT':
      // `label` is the rule being confirmed; `placeholder` (when set) is the text beside the checkbox.
      return (
        <ConsentField
          name={field.key}
          title={placeholder ? label : undefined}
          label={placeholder || label}
          required={field.required}
          hint={helpText || undefined}
          error={error}
          checked={value === true}
          onChange={onChange}
        />
      );
    case 'FILE': {
      const maxFiles = field.maxFiles ?? 1;
      return (
        <MultiFileField
          {...shell}
          hint={fileHint(field, t, helpText)}
          files={value as File[]}
          maxFiles={maxFiles}
          accept={(field.allowedExtensions ?? []).join(',')}
          onChange={onChange}
          chooseLabel={t('forms.chooseFile')}
          addLabel={maxFiles > 1 ? t('forms.addFile') : t('forms.changeFile')}
          removeLabel={t('forms.removeFile')}
        />
      );
    }
    default: {
      const ltr = ['EMAIL', 'PHONE', 'NUMBER', 'DATE'].includes(field.type);
      const inputType =
        field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : field.type === 'DATE' ? 'date' : 'text';
      return (
        <TextField
          {...shell}
          type={inputType}
          inputMode={field.type === 'NUMBER' ? 'decimal' : undefined}
          dir={ltr ? 'ltr' : 'auto'}
          multiline={field.type === 'TEXTAREA'}
          placeholder={placeholder || (field.preset === 'EGYPT_MOBILE' ? '01xxxxxxxxx' : undefined)}
          autoComplete={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : undefined}
          value={value as string}
          onChange={onChange}
          onBlur={onBlur}
        />
      );
    }
  }
};
