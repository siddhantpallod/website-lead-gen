'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateOnboardingForm } from '@/lib/utils/validation';
import type { OnboardingFormData, FormErrors } from '@/types';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    email: '',
    company: '',
    portfolio: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const updateField = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors = { ...errors };
    
    if (step === 2) {
      const stepErrors = validateOnboardingForm(formData);
      newErrors.name = stepErrors.name;
      newErrors.email = stepErrors.email;
    } else if (step === 3) {
      const stepErrors = validateOnboardingForm(formData);
      newErrors.company = stepErrors.company;
      newErrors.portfolio = stepErrors.portfolio;
    }

    setErrors(newErrors);
    
    // Check if current step has any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined);
    return !hasErrors;
  };

  const handleNext = () => {
    if (currentStep < 4) {
      // Validate before proceeding
      if (currentStep === 2 || currentStep === 3) {
        if (!validateStep(currentStep)) {
          return; // Don't proceed if validation fails
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/home');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 bg-black rounded-xl mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-3xl font-semibold text-black">Welcome to LeadGen AI</h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                Let&apos;s get you set up to start generating high-quality leads automatically. 
                Our AI will analyze websites, find opportunities, and help you reach out to potential clients.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 4" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 2 of 4" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 3 of 4" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 4" role="status"></div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center animate-slide-up">
              <h2 className="text-2xl font-semibold text-black mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">This helps us personalize your experience</p>
            </div>
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${
                    errors.name ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your full name"
                  aria-required="true"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${
                    errors.email ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="your@email.com"
                  aria-required="true"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 4" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 3 of 4" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 4" role="status"></div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center animate-slide-up">
              <h2 className="text-2xl font-semibold text-black mb-2">Your Business</h2>
              <p className="text-gray-600">Help us understand your business better</p>
            </div>
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *</label>
                <input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${
                    errors.company ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Your company name"
                  aria-required="true"
                  aria-invalid={errors.company ? 'true' : 'false'}
                  aria-describedby={errors.company ? 'company-error' : undefined}
                />
                {errors.company && (
                  <p id="company-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.company}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                  Portfolio Website
                </label>
                <input
                  id="portfolio"
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => updateField('portfolio', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${
                    errors.portfolio ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="https://yourportfolio.com"
                  aria-invalid={errors.portfolio ? 'true' : 'false'}
                  aria-describedby={errors.portfolio ? 'portfolio-error' : undefined}
                />
                {errors.portfolio && (
                  <p id="portfolio-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.portfolio}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 3 of 4" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 4" role="status"></div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-12 h-12 bg-black rounded-xl mx-auto flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-3xl font-semibold text-black">You&apos;re all set!</h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                We&apos;re now analyzing websites and finding potential leads for you. 
                You&apos;ll start receiving high-quality leads within the next few hours.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-base font-semibold text-black mb-4">What happens next?</h3>
              <ul className="text-gray-600 space-y-3 text-left" role="list">
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">AI scans websites for optimization opportunities</span>
                </li>
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Generates personalized outreach emails</span>
                </li>
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '1.0s' }}>
                  <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm">Delivers leads directly to your dashboard</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center space-x-2 pt-4 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 3 of 4" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 4 of 4" role="status" aria-current="step"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden flex items-center justify-center font-playfair">
      <div className="max-w-xl mx-auto px-6 w-full">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 animate-fade-in shadow-sm">
          {renderStep()}
          
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
              aria-label={currentStep === 1 ? 'Cannot go back' : 'Go to previous step'}
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={currentStep === 4 ? 'Complete onboarding' : 'Go to next step'}
            >
              {currentStep === 4 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
