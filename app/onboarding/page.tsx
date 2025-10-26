'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { validateOnboardingForm } from '@/lib/utils/validation';
import { useDropdownOutside } from '@/lib/hooks/useClickOutside';
import type { OnboardingFormData, FormErrors } from '@/types';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    email: '',
    company: '',
    portfolio: '',
    location: '',
    industry: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useDropdownOutside(industryRef, () => {
    setIsIndustryOpen(false);
  });

  const updateField = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Close industry dropdown when selection is made
    if (field === 'industry') {
      setIsIndustryOpen(false);
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
    } else if (step === 4) {
      if (!formData.location) {
        newErrors.location = 'Location is required';
      }
      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }
    }

    setErrors(newErrors);
    
    // Check if current step has any errors
    const hasErrors = Object.values(newErrors).some(error => error !== undefined);
    return !hasErrors;
  };

  const handleNext = () => {
    if (currentStep < 5) {
      // Validate before proceeding
      if (currentStep === 2 || currentStep === 3 || currentStep === 4) {
        if (!validateStep(currentStep)) {
          return; // Don't proceed if validation fails
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      // Save user data to localStorage when onboarding is completed
      localStorage.setItem('userData', JSON.stringify(formData));
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
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 5" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 2 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 3 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 5 of 5" role="status"></div>
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
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 5" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 3 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 5 of 5" role="status"></div>
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
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 3 of 5" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 4 of 5" role="status"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 5 of 5" role="status"></div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center animate-slide-up">
              <h2 className="text-2xl font-semibold text-black mb-2">Additional Information</h2>
              <p className="text-gray-600">Help us understand your market better</p>
            </div>
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] ${
                    errors.location ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Enter your location"
                  aria-required="true"
                  aria-invalid={errors.location ? 'true' : 'false'}
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
                {errors.location && (
                  <p id="location-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.location}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry *
                </label>
                <div className="relative" ref={industryRef}>
                  <button
                    type="button"
                    onClick={() => setIsIndustryOpen(!isIndustryOpen)}
                    className={`flex items-center justify-between w-full px-4 py-3 bg-gray-100 border rounded-xl text-left hover:bg-gray-200 transition-colors text-gray-700 hover:text-black cursor-pointer ${
                      errors.industry ? 'border-red-300' : 'border-gray-200'
                    } ${formData.industry ? 'text-black' : ''}`}
                    aria-required="true"
                    aria-invalid={errors.industry ? 'true' : 'false'}
                    aria-describedby={errors.industry ? 'industry-error' : undefined}
                    aria-expanded={isIndustryOpen}
                  >
                    <span className="text-sm font-medium">
                      {formData.industry 
                        ? formData.industry.charAt(0).toUpperCase() + formData.industry.slice(1).replace(/-/g, ' ')
                        : 'Select your industry'}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isIndustryOpen && (
                    <div 
                      className="absolute right-0 left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fade-in max-h-60 overflow-y-auto"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="py-2">
                        {['technology', 'healthcare', 'finance', 'retail', 'real-estate', 'education', 'manufacturing', 'hospitality', 'consulting', 'marketing', 'legal', 'other'].map((industry) => (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => updateField('industry', industry)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${
                              formData.industry === industry ? 'text-black bg-gray-50' : 'text-gray-600'
                            }`}
                            role="menuitem"
                          >
                            {industry === 'real-estate' ? 'Real Estate' : 
                             industry === 'retail' ? 'Retail & E-commerce' :
                             industry === 'finance' ? 'Finance & Banking' :
                             industry === 'hospitality' ? 'Hospitality & Tourism' :
                             industry === 'marketing' ? 'Marketing & Advertising' :
                             industry === 'legal' ? 'Legal Services' :
                             industry === 'technology' ? 'Technology' :
                             industry === 'healthcare' ? 'Healthcare' :
                             industry === 'education' ? 'Education' :
                             industry === 'manufacturing' ? 'Manufacturing' :
                             industry === 'consulting' ? 'Consulting' :
                             industry.charAt(0).toUpperCase() + industry.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {errors.industry && (
                  <p id="industry-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.industry}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 3 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 4 of 5" role="status" aria-current="step"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full" aria-label="Step 5 of 5" role="status"></div>
            </div>
          </div>
        );

      case 5:
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
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 1 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 2 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 3 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 4 of 5" role="status"></div>
              <div className="w-2 h-2 bg-black rounded-full" aria-label="Step 5 of 5" role="status" aria-current="step"></div>
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
              aria-label={currentStep === 5 ? 'Complete onboarding' : 'Go to next step'}
            >
              {currentStep === 5 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
