// src/shared/utils/validation.ts

export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function isEmail(value: string): boolean {
  if (!value) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(value.trim());
}

export function isNumeric(value: any): boolean {
  if (value === null || value === undefined) return false;
  return !Number.isNaN(Number(value));
}

export function minLength(value: string, min: number): boolean {
  if (!value) return false;
  return value.trim().length >= min;
}

export function maxLength(value: string, max: number): boolean {
  if (!value) return false;
  return value.trim().length <= max;
}

// Generic helper to build error map from rules
export type ValidationRule = {
  field: string;
  label?: string;
  required?: boolean;
  numeric?: boolean;
  email?: boolean;
  minLength?: number;
  maxLength?: number;
};

export function validateObject(
  values: Record<string, any>,
  rules: ValidationRule[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const rule of rules) {
    const value = values[rule.field];
    const label = rule.label || rule.field;

    if (rule.required && !isRequired(value)) {
      errors[rule.field] = `${label} is required`;
      continue;
    }

    if (rule.numeric && value !== undefined && value !== null && value !== '') {
      if (!isNumeric(value)) {
        errors[rule.field] = `${label} must be numeric`;
        continue;
      }
    }

    if (rule.email && value) {
      if (!isEmail(value)) {
        errors[rule.field] = `Invalid ${label}`;
        continue;
      }
    }

    if (rule.minLength && typeof value === 'string') {
      if (!minLength(value, rule.minLength)) {
        errors[rule.field] = `${label} must be at least ${rule.minLength} characters`;
        continue;
      }
    }

    if (rule.maxLength && typeof value === 'string') {
      if (!maxLength(value, rule.maxLength)) {
        errors[rule.field] = `${label} must be at most ${rule.maxLength} characters`;
        continue;
      }
    }
  }

  return errors;
}
