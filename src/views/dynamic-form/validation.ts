// Client mirror of tickets-be dynamic_forms/validation.py — keep the rules in sync.
import type { FormAnswer, FormAnswers, FormFieldDef } from '../../types';
import { isArabicText, isEgyptianMobile, isValidEmail, normalizeDigits } from '../../utils/arabic';

/** Translation keys under `forms.errors`. */
export type FormErrorKey =
  | 'required'
  | 'email'
  | 'mobile'
  | 'arabicOnly'
  | 'number'
  | 'date'
  | 'pattern'
  | 'tooShort'
  | 'tooLong'
  | 'invalidOption'
  | 'fileType'
  | 'fileSize'
  | 'tooManyFiles'
  | 'invalid';

export type FormErrors = Record<string, FormErrorKey | undefined>;

const NUMBER_RE = /^-?\d+(?:\.\d+)?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const initialAnswer = (field: FormFieldDef): FormAnswer => {
  switch (field.type) {
    case 'CHECKBOXES':
      return [];
    case 'FILE':
      return [];
    case 'CONSENT':
      return false;
    default:
      return '';
  }
};

export const initialAnswers = (fields: FormFieldDef[]): FormAnswers =>
  Object.fromEntries(fields.map(field => [field.key, initialAnswer(field)]));

const fullMatch = (pattern: string, value: string) => {
  try {
    return new RegExp(`^(?:${pattern})$`).test(value);
  } catch {
    // An invalid regex is caught by the backend admin; don't block the user here.
    return true;
  }
};

const textError = (field: FormFieldDef, raw: string): FormErrorKey | undefined => {
  let value = raw.trim();
  if (!value) return field.required ? 'required' : undefined;

  switch (field.type) {
    case 'EMAIL':
      if (!isValidEmail(value)) return 'email';
      break;
    case 'NUMBER':
      if (!NUMBER_RE.test(normalizeDigits(value).replace(',', '.'))) return 'number';
      break;
    case 'DATE':
      if (!DATE_RE.test(value)) return 'date';
      break;
    case 'PHONE':
      value = normalizeDigits(value).replace(/\s+/g, '');
      break;
  }

  if (field.preset === 'EGYPT_MOBILE') {
    if (!isEgyptianMobile(value)) return 'mobile';
    // The backend checks length/pattern on the normalized 01XXXXXXXXX form.
    value = `0${normalizeDigits(value).replace(/[\s\-()]/g, '').slice(-10)}`;
  } else if (field.preset === 'ARABIC_ONLY' && !isArabicText(value)) {
    return 'arabicOnly';
  }

  if (field.minLength != null && value.length < field.minLength) return 'tooShort';
  if (field.maxLength != null && value.length > field.maxLength) return 'tooLong';
  if (field.pattern && !fullMatch(field.pattern, value)) return 'pattern';
  return undefined;
};

const fileError = (field: FormFieldDef, files: File[]): FormErrorKey | undefined => {
  if (!files.length) return field.required ? 'required' : undefined;
  if (files.length > (field.maxFiles ?? 1)) return 'tooManyFiles';
  const extensions = field.allowedExtensions ?? [];
  for (const file of files) {
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
    if (extensions.length && !extensions.includes(ext)) return 'fileType';
    if (file.size > (field.maxFileMb ?? 10) * 1024 * 1024) return 'fileSize';
  }
  return undefined;
};

export const validateAnswer = (field: FormFieldDef, answer: FormAnswer): FormErrorKey | undefined => {
  switch (field.type) {
    case 'FILE':
      return fileError(field, answer as File[]);
    case 'CONSENT':
      return field.required && answer !== true ? 'required' : undefined;
    case 'CHECKBOXES': {
      const values = answer as string[];
      if (!values.length) return field.required ? 'required' : undefined;
      return values.every(v => field.options?.includes(v)) ? undefined : 'invalidOption';
    }
    case 'SELECT':
    case 'RADIO': {
      const value = answer as string;
      if (!value) return field.required ? 'required' : undefined;
      return field.options?.includes(value) ? undefined : 'invalidOption';
    }
    default:
      return textError(field, answer as string);
  }
};

export const validateAnswers = (fields: FormFieldDef[], answers: FormAnswers): FormErrors => {
  const errors: FormErrors = {};
  fields.forEach(field => {
    const error = validateAnswer(field, answers[field.key]);
    if (error) errors[field.key] = error;
  });
  return errors;
};

/** Multipart body keyed by the field keys; multi-values and multiple files repeat the key. */
export const buildFormData = (fields: FormFieldDef[], answers: FormAnswers): FormData => {
  const formData = new FormData();
  fields.forEach(field => {
    const answer = answers[field.key];
    if (field.type === 'FILE') {
      (answer as File[]).forEach(file => formData.append(field.key, file));
    } else if (field.type === 'CHECKBOXES') {
      (answer as string[]).forEach(value => formData.append(field.key, value));
    } else if (field.type === 'CONSENT') {
      formData.append(field.key, answer ? 'true' : 'false');
    } else {
      formData.append(field.key, String(answer).trim());
    }
  });
  return formData;
};

const SERVER_CODE_TO_ERROR: Record<string, FormErrorKey> = {
  required: 'required',
  INVALID_EMAIL: 'email',
  INVALID_MOBILE: 'mobile',
  ARABIC_ONLY: 'arabicOnly',
  INVALID_NUMBER: 'number',
  INVALID_DATE: 'date',
  INVALID_PATTERN: 'pattern',
  TOO_SHORT: 'tooShort',
  TOO_LONG: 'tooLong',
  INVALID_OPTION: 'invalidOption',
  INVALID_FILE_TYPE: 'fileType',
  FILE_TOO_LARGE: 'fileSize',
  TOO_MANY_FILES: 'tooManyFiles',
};

// Same rule as the API client's snake_case → camelCase key conversion.
const toCamelCase = (key: string) => key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Map backend `{data: {fieldKey: [code]}}` to form errors. The API client camelCases
 * response keys, so match each field by its camelCased key as well.
 */
export const mapServerErrors = (fields: FormFieldDef[], details: unknown): FormErrors => {
  const data = (details as { data?: unknown } | undefined)?.data;
  if (!data || typeof data !== 'object') return {};
  const byKey = data as Record<string, unknown>;
  const errors: FormErrors = {};
  fields.forEach(field => {
    const codes = byKey[field.key] ?? byKey[toCamelCase(field.key)];
    if (codes === undefined) return;
    const code = Array.isArray(codes) ? String(codes[0]) : String(codes);
    errors[field.key] = SERVER_CODE_TO_ERROR[code] ?? 'invalid';
  });
  return errors;
};
