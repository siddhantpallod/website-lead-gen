import { FormErrors, OnboardingFormData } from '@/types';

export function validateOnboardingForm(data: OnboardingFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.company.trim()) {
    errors.company = 'Company name is required';
  } else if (data.company.trim().length < 2) {
    errors.company = 'Company name must be at least 2 characters';
  }

  if (data.portfolio.trim() && !isValidUrl(data.portfolio)) {
    errors.portfolio = 'Please enter a valid URL';
  }

  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

