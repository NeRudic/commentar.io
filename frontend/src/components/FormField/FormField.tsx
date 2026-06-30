import type { ReactNode, ComponentType } from 'react';
import styles from './FormField.module.css';

interface FieldState {
  name: string;
  state: {
    value: unknown;
    meta: {
      errors: Array<unknown>;
    };
  };
  handleBlur: () => void;
  handleChange: (value: string) => void;
}

export interface FormApiLike {
  Field: ComponentType<{ name: string; children: (field: FieldState) => ReactNode }>;
}

interface FormFieldProps {
  form: FormApiLike;
  name: string;
  label: string;
  placeholder?: string;
}

export default function FormField({
  form,
  name,
  label,
  placeholder,
}: FormFieldProps) {
  return (
    <form.Field name={name}>
      {(field) => (
        <label className={styles.field}>
          <span className={styles.label}>{label}</span>
          <input
            className={styles.input}
            name={field.name}
            value={field.state.value as string}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder={placeholder}
          />
          {field.state.meta.errors.length > 0 && (
            <span className={styles.error}>
              {field.state.meta.errors.join(', ')}
            </span>
          )}
        </label>
      )}
    </form.Field>
  );
}
