import type { ApplicationFormValues } from '../../types';
import { isArabicText, isEgyptianMobile, isValidEmail, isValidWhatsapp } from '../../utils/arabic';

export const SCRIPT_EXTENSIONS = ['.pdf', '.doc', '.docx'];
export const SCRIPT_MAX_MB = 20;
export const NATIONAL_ID_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
export const NATIONAL_ID_MAX_MB = 10;

/** Translation keys under `apply.errors`. */
export type ErrorKey =
  | 'required'
  | 'arabicOnly'
  | 'email'
  | 'mobile'
  | 'whatsapp'
  | 'actorsRequired'
  | 'fileType'
  | 'fileSize'
  | 'invalid'
  | 'alreadyApplied';

export type FieldName = Exclude<keyof ApplicationFormValues, 'whatsappSameAsMobile'>;

export type FormErrors = Partial<Record<FieldName, ErrorKey>>;

/** Display order — used to scroll to the first invalid field. */
export const FIELD_ORDER: FieldName[] = [
  'email',
  'mobile',
  'whatsapp',
  'showName',
  'department',
  'studyType',
  'directorName',
  'author',
  'dramaturgy',
  'actors',
  'directorialVision',
  'showSummary',
  'script',
  'nationalId',
];

export const initialValues: ApplicationFormValues = {
  email: '',
  showName: '',
  directorName: '',
  department: '',
  studyType: '',
  author: '',
  dramaturgy: '',
  mobile: '',
  whatsapp: '',
  whatsappSameAsMobile: false,
  actors: [''],
  script: null,
  directorialVision: '',
  showSummary: '',
  nationalId: null,
};

const requiredArabic = (value: string): ErrorKey | undefined => {
  if (!value.trim()) return 'required';
  if (!isArabicText(value)) return 'arabicOnly';
  return undefined;
};

const mobileError = (value: string): ErrorKey | undefined => {
  if (!value.trim()) return 'required';
  if (!isEgyptianMobile(value)) return 'mobile';
  return undefined;
};

const fileError = (file: File | null, extensions: string[], maxMb: number): ErrorKey | undefined => {
  if (!file) return 'required';
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!extensions.includes(ext)) return 'fileType';
  if (file.size > maxMb * 1024 * 1024) return 'fileSize';
  return undefined;
};

export const validateField = (
  field: FieldName,
  values: ApplicationFormValues,
): ErrorKey | undefined => {
  switch (field) {
    case 'email':
      if (!values.email.trim()) return 'required';
      return isValidEmail(values.email) ? undefined : 'email';
    case 'showName':
    case 'directorName':
    case 'author':
    case 'directorialVision':
    case 'showSummary':
      return requiredArabic(values[field]);
    case 'dramaturgy':
      return values.dramaturgy.trim() && !isArabicText(values.dramaturgy) ? 'arabicOnly' : undefined;
    case 'department':
    case 'studyType':
      return values[field] ? undefined : 'required';
    case 'mobile':
      return mobileError(values.mobile);
    case 'whatsapp': {
      const whatsapp = values.whatsappSameAsMobile ? values.mobile : values.whatsapp;
      if (!whatsapp.trim()) return 'required';
      return isValidWhatsapp(whatsapp) ? undefined : 'whatsapp';
    }
    case 'actors': {
      const filled = values.actors.map(a => a.trim()).filter(Boolean);
      if (!filled.length) return 'actorsRequired';
      return filled.every(isArabicText) ? undefined : 'arabicOnly';
    }
    case 'script':
      return fileError(values.script, SCRIPT_EXTENSIONS, SCRIPT_MAX_MB);
    case 'nationalId':
      return fileError(values.nationalId, NATIONAL_ID_EXTENSIONS, NATIONAL_ID_MAX_MB);
  }
};

export const validateAll = (values: ApplicationFormValues): FormErrors => {
  const errors: FormErrors = {};
  FIELD_ORDER.forEach(field => {
    const error = validateField(field, values);
    if (error) errors[field] = error;
  });
  return errors;
};

export const buildFormData = (values: ApplicationFormValues): FormData => {
  const formData = new FormData();
  const whatsapp = values.whatsappSameAsMobile ? values.mobile : values.whatsapp;
  // Backend expects snake_case keys; the API client leaves FormData untouched.
  formData.append('email', values.email.trim());
  formData.append('show_name', values.showName.trim());
  formData.append('director_name', values.directorName.trim());
  formData.append('department', values.department);
  formData.append('study_type', values.studyType);
  formData.append('author', values.author.trim());
  formData.append('dramaturgy', values.dramaturgy.trim());
  formData.append('mobile', values.mobile.trim());
  formData.append('whatsapp', whatsapp.trim());
  formData.append('actors', JSON.stringify(values.actors.map(a => a.trim()).filter(Boolean)));
  formData.append('directorial_vision', values.directorialVision.trim());
  formData.append('show_summary', values.showSummary.trim());
  if (values.script) formData.append('script', values.script);
  if (values.nationalId) formData.append('national_id', values.nationalId);
  return formData;
};

const SERVER_CODE_TO_ERROR: Record<string, ErrorKey> = {
  ARABIC_ONLY: 'arabicOnly',
  INVALID_MOBILE: 'mobile',
  INVALID_WHATSAPP: 'whatsapp',
  INVALID_ACTORS: 'actorsRequired',
  INVALID_FILE_TYPE: 'fileType',
  FILE_TOO_LARGE: 'fileSize',
  required: 'required',
  blank: 'required',
  null: 'required',
  empty: 'required',
  invalid: 'invalid',
  invalid_choice: 'invalid',
};

/** Map backend `{data: {fieldName: [code]}}` (already camelCased by the client) to form errors. */
export const mapServerErrors = (details: unknown): FormErrors => {
  const data = (details as { data?: unknown } | undefined)?.data;
  if (!data || typeof data !== 'object') return {};
  const errors: FormErrors = {};
  Object.entries(data as Record<string, unknown>).forEach(([field, codes]) => {
    if (!FIELD_ORDER.includes(field as FieldName)) return;
    const code = Array.isArray(codes) ? String(codes[0]) : String(codes);
    let error = SERVER_CODE_TO_ERROR[code] ?? 'invalid';
    if (field === 'email' && error === 'invalid') error = 'email';
    errors[field as FieldName] = error;
  });
  return errors;
};
