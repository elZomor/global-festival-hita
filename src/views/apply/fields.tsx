'use client';
import { ReactNode, useId, useRef } from 'react';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';

export const inputClass = (hasError: boolean, disabled = false) =>
  `w-full px-4 py-3 rounded-lg border bg-primary-50 dark:bg-primary-800 text-primary-900 dark:text-primary-50 placeholder:text-primary-400 dark:placeholder:text-primary-500 focus:outline-none focus:ring-2 focus:ring-secondary-500 dark:focus:ring-secondary-400 transition-colors ${
    hasError ? 'border-red-500 dark:border-red-400' : 'border-primary-300 dark:border-primary-700'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`;

type FieldShellProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  badge?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

/** Label, hint and error wrapper. `data-field` is used to scroll to the first invalid field. */
export const FieldShell = ({ id, name, label, required, badge, hint, error, children }: FieldShellProps) => (
  <div data-field={name} className="space-y-2">
    <label htmlFor={id} className="flex flex-wrap items-center gap-2 font-medium text-primary-900 dark:text-primary-50">
      <span>
        {label}
        {required && <span className="text-red-600 dark:text-red-400 ms-1" aria-hidden="true">*</span>}
      </span>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-800 dark:bg-secondary-900/40 dark:text-secondary-300">
          {badge}
        </span>
      )}
    </label>
    {children}
    {hint && !error && <p className="text-sm text-primary-500 dark:text-primary-400">{hint}</p>}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
        {error}
      </p>
    )}
  </div>
);

type TextFieldProps = Omit<FieldShellProps, 'id' | 'children'> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'tel';
  dir?: 'rtl' | 'ltr';
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  autoComplete?: string;
};

export const TextField = ({
  value,
  onChange,
  onBlur,
  type = 'text',
  dir,
  placeholder,
  disabled,
  multiline,
  autoComplete,
  ...shell
}: TextFieldProps) => {
  const id = useId();
  const common = {
    id,
    name: shell.name,
    value,
    dir,
    placeholder,
    disabled,
    onBlur,
    'aria-invalid': Boolean(shell.error),
    'aria-describedby': shell.error ? `${id}-error` : undefined,
    className: inputClass(Boolean(shell.error), disabled),
  };
  return (
    <FieldShell id={id} {...shell}>
      {multiline ? (
        <textarea {...common} rows={6} onChange={e => onChange(e.target.value)} className={`${common.className} resize-y`} />
      ) : (
        <input {...common} type={type} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} />
      )}
    </FieldShell>
  );
};

type SelectFieldProps = Omit<FieldShellProps, 'id' | 'children'> & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder: string;
  options: { value: string; label: string }[];
};

export const SelectField = ({ value, onChange, onBlur, placeholder, options, ...shell }: SelectFieldProps) => {
  const id = useId();
  return (
    <FieldShell id={id} {...shell}>
      <select
        id={id}
        name={shell.name}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(shell.error)}
        className={inputClass(Boolean(shell.error))}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};

type RadioGroupProps = Omit<FieldShellProps, 'id' | 'children'> & {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export const RadioGroupField = ({ value, onChange, options, ...shell }: RadioGroupProps) => {
  const id = useId();
  return (
    <FieldShell id={id} {...shell}>
      <div id={id} role="radiogroup" className="flex flex-wrap gap-3">
        {options.map(option => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30'
                  : shell.error
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-primary-300 dark:border-primary-700 hover:border-secondary-400'
              }`}
            >
              <input
                type="radio"
                name={shell.name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="accent-secondary-500"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </FieldShell>
  );
};

type FileFieldProps = Omit<FieldShellProps, 'id' | 'children'> & {
  file: File | null;
  accept: string;
  onChange: (file: File | null) => void;
  chooseLabel: string;
  changeLabel: string;
};

export const FileField = ({ file, accept, onChange, chooseLabel, changeLabel, ...shell }: FileFieldProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <FieldShell id={id} {...shell}>
      <input
        ref={inputRef}
        id={id}
        name={shell.name}
        type="file"
        accept={accept}
        className="sr-only"
        aria-invalid={Boolean(shell.error)}
        onChange={e => onChange(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center gap-3 px-4 py-4 rounded-lg border-2 border-dashed text-start transition-colors hover:border-secondary-500 ${
          shell.error ? 'border-red-500 dark:border-red-400' : 'border-primary-300 dark:border-primary-700'
        }`}
      >
        {file ? (
          <FileText className="w-5 h-5 shrink-0 text-secondary-600 dark:text-secondary-400" />
        ) : (
          <Upload className="w-5 h-5 shrink-0 text-primary-500" />
        )}
        <span className="flex-1 min-w-0 truncate" dir="auto">
          {file ? file.name : chooseLabel}
        </span>
        {file && <span className="text-sm text-secondary-600 dark:text-secondary-400 shrink-0">{changeLabel}</span>}
      </button>
    </FieldShell>
  );
};

type ListFieldProps = Omit<FieldShellProps, 'id' | 'children'> & {
  values: string[];
  onChange: (values: string[]) => void;
  onBlur?: () => void;
  itemPlaceholder: (index: number) => string;
  addLabel: string;
  removeLabel: string;
  max?: number;
};

export const ListField = ({
  values,
  onChange,
  onBlur,
  itemPlaceholder,
  addLabel,
  removeLabel,
  max = 50,
  ...shell
}: ListFieldProps) => {
  const id = useId();
  const update = (index: number, value: string) => onChange(values.map((v, i) => (i === index ? value : v)));
  const remove = (index: number) => onChange(values.length === 1 ? [''] : values.filter((_, i) => i !== index));
  return (
    <FieldShell id={id} {...shell}>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex gap-2">
            <input
              id={index === 0 ? id : undefined}
              name={`${shell.name}-${index}`}
              value={value}
              dir="rtl"
              placeholder={itemPlaceholder(index)}
              onChange={e => update(index, e.target.value)}
              onBlur={onBlur}
              aria-invalid={Boolean(shell.error)}
              className={inputClass(Boolean(shell.error))}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={removeLabel}
              title={removeLabel}
              className="shrink-0 px-3 rounded-lg border border-primary-300 dark:border-primary-700 text-primary-500 hover:text-red-600 hover:border-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {values.length < max && (
          <button
            type="button"
            onClick={() => onChange([...values, ''])}
            className="flex items-center gap-2 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:underline"
          >
            <Plus className="w-4 h-4" />
            {addLabel}
          </button>
        )}
      </div>
    </FieldShell>
  );
};
