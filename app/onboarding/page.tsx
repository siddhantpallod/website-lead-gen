'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to home
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
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl font-semibold text-black">Welcome to LeadGen AI</h1>
              <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
                Let's get you set up to start generating high-quality leads automatically. 
                Our AI will analyze websites, find opportunities, and help you reach out to potential clients.
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-semibold text-black mb-3">Tell us about yourself</h2>
              <p className="text-gray-600">This helps us personalize your experience</p>
            </div>
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 text-lg hover:scale-[1.02] focus:scale-[1.02]"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 text-lg hover:scale-[1.02] focus:scale-[1.02]"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center animate-slide-up">
              <h2 className="text-3xl font-semibold text-black mb-3">Your Business</h2>
              <p className="text-gray-600">Help us understand your business better</p>
            </div>
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 text-lg hover:scale-[1.02] focus:scale-[1.02]"
                  placeholder="Your company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Portfolio Website</label>
                <input
                  type="url"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200 text-lg hover:scale-[1.02] focus:scale-[1.02]"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
            <div className="flex justify-center space-x-2 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="w-16 h-16 bg-black rounded-2xl mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h1 className="text-4xl font-semibold text-black">You're all set!</h1>
              <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
                We're now analyzing websites and finding potential leads for you. 
                You'll start receiving high-quality leads within the next few hours.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-semibold text-black mb-6">What happens next?</h3>
              <ul className="text-gray-600 space-y-4 text-left">
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 animate-">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>AI scans websites for optimization opportunities</span>
                </li>
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Generates personalized outreach emails</span>
                </li>
                <li className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '1.0s' }}>
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span>Delivers leads directly to your dashboard</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center space-x-2 pt-6 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="bg-white rounded-3xl border border-gray-200 p-12 animate-fade-in shadow-sm">
          {renderStep()}
          
          <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentStep === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-black hover:bg-gray-200'
              }`}
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {currentStep === 4 ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
