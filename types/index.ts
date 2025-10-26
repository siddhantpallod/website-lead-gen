export interface Lead {
  id: string;
  businessName: string;
  website: string;
  description: string;
  issues: string[];
  status: LeadStatus;
  lastChecked: string;
  draftedEmail: string;
  prototypeLink: string;
}

export type LeadStatus = 'new' | 'contacted' | 'responded' | 'converted';

export interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  portfolio?: string;
  location?: string;
  industry?: string;
}

export interface OnboardingFormData {
  name: string;
  email: string;
  company: string;
  portfolio: string;
  location: string;
  industry: string;
}

