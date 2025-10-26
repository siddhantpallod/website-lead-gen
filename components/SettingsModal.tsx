'use client';

import { useState, useRef } from 'react';
import { useModalOutside, useDropdownOutside } from '@/lib/hooks/useClickOutside';
import { useKeyboard } from '@/lib/hooks/useKeyboard';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onUpdate: (data: { name: string; email: string; company: string; portfolio: string; location: string; industry: string }) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  currentName,
  onUpdate,
  onLogout,
  onDeleteAccount
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'danger'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    name: currentName,
    email: 'user@example.com',
    company: 'Your Company',
    portfolio: 'https://yourportfolio.com',
    location: '',
    industry: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [wasEditing, setWasEditing] = useState(false);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const industryRef = useRef<HTMLDivElement | null>(null);

  useDropdownOutside(industryRef, () => {
    if (wasEditing) {
      setIsIndustryOpen(false);
    }
  });

  useKeyboard('Escape', onClose);
  
  useModalOutside(modalRef, () => {
    if (isOpen) onClose();
  });

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (formData.portfolio.trim() && !isValidUrl(formData.portfolio)) {
      newErrors.portfolio = 'Please enter a valid URL';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      onUpdate(formData);
      setIsEditingProfile(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      onDeleteAccount();
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (field === 'industry') {
      setIsIndustryOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-white z-50 animate-fade-in overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      ref={modalRef}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <h2 id="settings-title" className="text-2xl font-semibold text-black">
            Settings
          </h2>
          <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
          aria-label="Close settings"
        >
          <svg
            className="w-6 h-6 transform transition-transform duration-300 hover:rotate-90"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 bg-white">
        <div className="max-w-4xl w-full mx-auto flex space-x-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-2 border-b-2 transition-colors font-medium cursor-pointer ${
              activeTab === 'profile'
                ? 'border-black text-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-4 px-2 border-b-2 transition-colors font-medium cursor-pointer ${
              activeTab === 'danger'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-red-600'
            }`}
          >
            Danger Zone
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-white max-w-4xl mx-auto">
        {activeTab === 'profile' ? (
          <div className="space-y-6">
            {!isEditingProfile ? (
              <>
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Profile Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">{formData.name}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">{formData.email}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">{formData.company}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Portfolio Website
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">{formData.portfolio}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">{formData.location || 'Not set'}</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Industry
                        </label>
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                          <span className="text-gray-900">
                            {formData.industry 
                              ? formData.industry.charAt(0).toUpperCase() + formData.industry.slice(1).replace(/-/g, ' ')
                              : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="mt-6 w-full px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Edit Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Name *
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 ${
                            errors.name ? 'border-red-300' : 'border-gray-200'
                          }`}
                          aria-required="true"
                          aria-invalid={errors.name ? 'true' : 'false'}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 ${
                            errors.email ? 'border-red-300' : 'border-gray-200'
                          }`}
                          aria-required="true"
                          aria-invalid={errors.email ? 'true' : 'false'}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                          id="company"
                          type="text"
                          value={formData.company}
                          onChange={(e) => updateField('company', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 ${
                            errors.company ? 'border-red-300' : 'border-gray-200'
                          }`}
                          aria-required="true"
                          aria-invalid={errors.company ? 'true' : 'false'}
                        />
                        {errors.company && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
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
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 ${
                            errors.portfolio ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="https://yourportfolio.com"
                          aria-invalid={errors.portfolio ? 'true' : 'false'}
                        />
                        {errors.portfolio && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
                            {errors.portfolio}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={formData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 ${
                            errors.location ? 'border-red-300' : 'border-gray-200'
                          }`}
                          placeholder="Enter your location"
                          aria-required="true"
                          aria-invalid={errors.location ? 'true' : 'false'}
                        />
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600" role="alert">
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
                            onClick={() => {
                              setWasEditing(true);
                              setIsIndustryOpen(!isIndustryOpen);
                            }}
                            className={`flex items-center justify-between w-full px-4 py-3 bg-gray-100 border rounded-xl text-left hover:bg-gray-200 transition-colors cursor-pointer ${
                              errors.industry ? 'border-red-300' : 'border-gray-200'
                            } ${formData.industry ? 'text-black' : 'text-gray-700 hover:text-black'}`}
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
                              className="absolute right-0 left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in max-h-60 overflow-y-auto"
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
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setFormData({ 
                            name: currentName, 
                            email: 'user@example.com', 
                            company: 'Your Company',
                            portfolio: 'https://yourportfolio.com',
                            location: '',
                            industry: ''
                          });
                          setErrors({});
                        }}
                        className="flex-1 px-6 py-3 bg-gray-100 text-black font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">Log Out</h3>
                <p className="text-gray-600 mb-4">Sign out of your account. You can always log back in later.</p>
                <button
                  onClick={onLogout}
                  className="px-6 py-3 bg-gray-100 text-gray-900 border border-gray-300 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                >
                  Log Out
                </button>
              </div>

              <div className="pt-6 border-t border-red-200">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
                <p className="text-gray-600 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-300 font-medium rounded-xl hover:bg-red-100 transition-all duration-200 cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

