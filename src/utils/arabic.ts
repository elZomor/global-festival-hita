// Keep in sync with tickets-be utils/validators.py

const ARABIC_LETTER_RE = /[ء-يٮ-ۓۺ-ۼݐ-ݿ]/;
const LATIN_LETTER_RE = /[A-Za-z]/;
const ALLOWED_ARABIC_TEXT_RE = /^[؀-ۿݐ-ݿ\s0-9.,:;!?()[\]"'\-_/«»…–—%&+#*]+$/;
const EGYPTIAN_MOBILE_RE = /^(?:\+20|0020|20|0)?(1[0125]\d{8})$/;
const INTERNATIONAL_PHONE_RE = /^(?:\+|00)[1-9]\d{7,14}$/;

/** True when text has at least one Arabic letter, no Latin letters, and only allowed symbols. */
export const isArabicText = (value: string): boolean => {
  const text = value.trim();
  if (!text) return false;
  if (LATIN_LETTER_RE.test(text)) return false;
  if (!ARABIC_LETTER_RE.test(text)) return false;
  return ALLOWED_ARABIC_TEXT_RE.test(text);
};

/** Convert Arabic-Indic / Persian digits to Western digits. */
export const normalizeDigits = (value: string): string =>
  value
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0));

export const isEgyptianMobile = (value: string): boolean =>
  EGYPTIAN_MOBILE_RE.test(normalizeDigits(value).replace(/[\s\-()]/g, ''));

/** Egyptian mobile (local or +20), or any other number in international format (+ or 00 prefix). */
export const isValidWhatsapp = (value: string): boolean => {
  if (isEgyptianMobile(value)) return true;
  return INTERNATIONAL_PHONE_RE.test(normalizeDigits(value).replace(/[\s\-()]/g, ''));
};

export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
