'use client';

import { useState } from 'react';

interface Lead {
  id: string;
  businessName: string;
  website: string;
  description: string;
  issues: string[];
  status: 'new' | 'contacted' | 'responded' | 'converted';
  lastChecked: string;
  draftedEmail: string;
}

export default function Home() {
  const [name] = useState('Taher'); // This would come from user authentication
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [leads] = useState<Lead[]>([
    {
      id: '1',
      businessName: 'TechStart Solutions',
      website: 'techstartsolutions.com',
      description: 'A growing tech startup providing innovative software solutions to small and medium businesses. They focus on digital transformation and cloud-based services.',
      issues: ['Outdated design', 'Slow loading', 'No mobile optimization'],
      status: 'new',
      lastChecked: '2 hours ago',
      draftedEmail: 'Hi there,\n\nI noticed your website at techstartsolutions.com and was impressed by your innovative approach to digital solutions. However, I spotted a few areas where we could significantly improve your online presence and user experience.\n\nYour current site has some performance issues that might be affecting your conversion rates. I\'ve created a quick prototype showing how we could modernize your design and boost your site speed by 3x.\n\nWould you be interested in a brief 15-minute call to discuss how we could help you attract more clients and grow your business?\n\nBest regards,\nTaher'
    },
    {
      id: '2',
      businessName: 'Local Bakery Co.',
      website: 'localbakeryco.com',
      description: 'A family-owned bakery serving fresh bread, pastries, and custom cakes to the local community for over 15 years. Known for their artisanal approach and quality ingredients.',
      issues: ['Broken contact form', 'Missing SSL certificate', 'Poor SEO'],
      status: 'contacted',
      lastChecked: '1 day ago',
      draftedEmail: 'Hello,\n\nI came across Local Bakery Co. and was delighted to see your commitment to artisanal baking! Your reputation in the community is excellent, but I noticed your website might not be doing justice to your amazing products.\n\nI found some technical issues that could be preventing customers from easily ordering or contacting you. I\'ve prepared a quick redesign that would make it much easier for customers to browse your menu and place orders online.\n\nWould you like to see how we could help you reach more customers in your area?\n\nWarm regards,\nTaher'
    },
    {
      id: '3',
      businessName: 'Fitness First Gym',
      website: 'fitnessfirstgym.com',
      description: 'A modern fitness center offering personal training, group classes, and state-of-the-art equipment. They focus on helping members achieve their health and fitness goals.',
      issues: ['Non-responsive design', 'Outdated content', 'No booking system'],
      status: 'responded',
      lastChecked: '3 days ago',
      draftedEmail: 'Hi,\n\nI was researching local gyms and found Fitness First Gym. Your facility looks amazing, but I noticed your website isn\'t showcasing your services as effectively as it could.\n\nYour current site has some usability issues that might be turning away potential members. I\'ve created a mobile-friendly version that would make it much easier for people to view your classes, book sessions, and sign up for memberships.\n\nInterested in seeing how we could help you attract more members?\n\nBest,\nTaher'
    },
    {
      id: '4',
      businessName: 'Green Earth Landscaping',
      website: 'greenearthlandscaping.com',
      description: 'A professional landscaping company specializing in residential and commercial design, maintenance, and eco-friendly solutions. They pride themselves on sustainable practices.',
      issues: ['Poor mobile experience', 'Missing portfolio', 'No online booking'],
      status: 'new',
      lastChecked: '4 hours ago',
      draftedEmail: 'Hello,\n\nI discovered Green Earth Landscaping and was impressed by your commitment to sustainable landscaping practices. Your work looks beautiful, but your website isn\'t effectively showcasing your portfolio and services.\n\nI noticed some issues that might be preventing potential clients from easily viewing your work and requesting quotes. I\'ve prepared a modern redesign that would better highlight your expertise and make it easier for customers to contact you.\n\nWould you be interested in seeing how we could help you win more landscaping projects?\n\nRegards,\nTaher'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-200 text-blue-900';
      case 'contacted': return 'bg-yellow-200 text-yellow-900';
      case 'responded': return 'bg-green-200 text-green-900';
      case 'converted': return 'bg-purple-200 text-purple-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  const openModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const filteredLeads = leads
    .filter(lead => filterStatus === 'all' || lead.status === filterStatus)
    .sort((a, b) => {
      // Sort by status priority: new first, then contacted, then responded, then converted
      const statusOrder = { 'new': 0, 'contacted': 1, 'responded': 2, 'converted': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-black">
              Hey {name}!
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-3 text-gray-400 hover:text-black transition-all duration-200 hover:rotate-360">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="p-3 text-gray-400 hover:text-black transition-all duration-200 hover:rotate-180">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 text-center">
            <div className="text-3xl font-semibold text-black mb-2">
              {leads.filter(lead => lead.status === 'new').length}
            </div>
            <div className="text-gray-600">New Leads</div>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 text-center">
            <div className="text-3xl font-semibold text-black mb-2">
              {leads.filter(lead => lead.status === 'contacted').length}
            </div>
            <div className="text-gray-600">Contacted</div>
          </div>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-200 text-center">
            <div className="text-3xl font-semibold text-black mb-2">{leads.length}</div>
            <div className="text-gray-600">Total Leads</div>
          </div>
        </div>

        {/* Leads List */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black">Recent Leads</h2>
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-gray-700 hover:text-black"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium">Filter</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fade-in">
                <div className="py-2">
                  <button 
                    onClick={() => { setFilterStatus('all'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterStatus === 'all' ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    All Leads
                  </button>
                  <button 
                    onClick={() => { setFilterStatus('new'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterStatus === 'new' ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    New
                  </button>
                  <button 
                    onClick={() => { setFilterStatus('contacted'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterStatus === 'contacted' ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    Contacted
                  </button>
                  <button 
                    onClick={() => { setFilterStatus('responded'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterStatus === 'responded' ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    Responded
                  </button>
                  <button 
                    onClick={() => { setFilterStatus('converted'); setIsFilterOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${filterStatus === 'converted' ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                  >
                    Converted
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <div className="divide-y divide-gray-100">
            {filteredLeads.map((lead, index) => (
              <div 
                key={lead.id} 
                className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => openModal(lead)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-black">
                        {lead.businessName}
                      </h3>
                      <p className="text-gray-500 text-sm">{lead.website}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedLead && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-semibold text-black">{selectedLead.businessName}</h2>
                  <button 
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Website</h3>
                    <p className="text-gray-600">{selectedLead.website}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Business Description</h3>
                    <p className="text-gray-600 leading-relaxed">{selectedLead.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Status</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Issues Found</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.issues.map((issue, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-black mb-3">Last Checked</h3>
                      <p className="text-gray-600">{selectedLead.lastChecked}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Drafted Email</h3>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <pre className="text-gray-700 text-sm whitespace-pre-wrap font-mono leading-relaxed">{selectedLead.draftedEmail}</pre>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
