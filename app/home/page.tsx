'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { SAMPLE_LEADS, STATUS_COLORS, STATUS_ORDER } from '@/lib/constants';
import { useModalOutside, useDropdownOutside } from '@/lib/hooks/useClickOutside';
import { useKeyboard } from '@/lib/hooks/useKeyboard';
import SettingsModal from '@/components/SettingsModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [name, setName] = useState('Taher'); // This would come from user authentication
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>(SAMPLE_LEADS);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const router = useRouter();

  const modalRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLead(null);
  }, []);

  useKeyboard('Escape', closeModal);

  useModalOutside(modalRef, () => {
    if (isModalOpen) closeModal();
  });

  useDropdownOutside(filterRef, () => {
    setIsFilterOpen(false);
  });

  const openModal = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsEditingEmail(false);
    setEditedEmail(lead.draftedEmail);
    setIsModalOpen(true);
  }, []);

  const handleEditEmail = useCallback(() => {
    setIsEditingEmail(true);
  }, []);

  const handleSaveEmail = useCallback(() => {
    if (selectedLead) {
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, draftedEmail: editedEmail }
          : lead
      ));
      setSelectedLead({ ...selectedLead, draftedEmail: editedEmail });
      setIsEditingEmail(false);
    }
  }, [selectedLead, editedEmail]);

  const handleCancelEditEmail = useCallback(() => {
    if (selectedLead) {
      setEditedEmail(selectedLead.draftedEmail);
      setIsEditingEmail(false);
    }
  }, [selectedLead]);

  const getStatusColor = useCallback((status: string) => {
    return STATUS_COLORS[status as LeadStatus] || 'bg-gray-200 text-gray-900';
  }, []);

  const handleProfileUpdate = useCallback((data: { name: string; email: string; company: string; portfolio: string; location: string; industry: string }) => {
    setName(data.name);
    // In a real app, you would save this to your backend
    console.log('Profile updated:', data);
    setIsSettingsOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    // In a real app, you would clear authentication tokens and redirect
    console.log('Logging out...');
    router.push('/');
  }, [router]);

  const handleDeleteAccount = useCallback(() => {
    // In a real app, you would send a delete request to your backend
    console.log('Account deletion requested');
    alert('Account deletion is not implemented in this demo.');
    // router.push('/');
  }, []);

  const filteredLeads = useMemo(() => {
    return leads
      .filter(lead => {
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        const matchesSearch = searchQuery === '' ||
          lead.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      });
  }, [leads, filterStatus, searchQuery]);

  const handleFilterChange = useCallback((status: string) => {
    setFilterStatus(status);
    setIsFilterOpen(false);
  }, []);

  const newLeadsCount = useMemo(() => 
    leads.filter(lead => lead.status === 'new').length, [leads]);
  
  const contactedCount = useMemo(() => 
    leads.filter(lead => lead.status === 'contacted').length, [leads]);

  return (
    <div className="min-h-screen bg-white font-playfair">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-black">
              Hey {name}!
            </h1>
          </div>
          <nav className="flex items-center space-x-3" aria-label="User actions">
            <button 
              className="p-3 text-gray-400 hover:text-black transition-all duration-200 hover:rotate-360 cursor-pointer"
              aria-label="View calendar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 text-gray-400 hover:text-black transition-all duration-200 hover:rotate-180 cursor-pointer"
              aria-label="Open settings"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pb-12">
        {/* Compact Stats Overview */}
        <section className="flex justify-center mb-8" aria-label="Lead statistics">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center min-w-[80px]">
              <div className="text-xl font-semibold text-black mb-1">
                {newLeadsCount}
              </div>
              <div className="text-xs text-gray-600">New Leads</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center min-w-[80px]">
              <div className="text-xl font-semibold text-black mb-1">
                {contactedCount}
              </div>
              <div className="text-xs text-gray-600">Contacted</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center min-w-[80px]">
              <div className="text-xl font-semibold text-black mb-1">{leads.length}</div>
              <div className="text-xs text-gray-600">Total Leads</div>
            </div>
          </div>
        </section>

        {/* Leads List */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-black">Recent Leads</h2>
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white transition-all duration-200"
                aria-label="Search leads"
              />
            </div>

            {/* Filter Button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors text-gray-700 hover:text-black cursor-pointer"
                aria-label="Filter leads"
                aria-expanded={isFilterOpen}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">Filter</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isFilterOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10 animate-fade-in"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-2">
                    {(['all', 'new', 'contacted', 'responded', 'converted'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange(status)}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${filterStatus === status ? 'text-black bg-gray-50' : 'text-gray-600'}`}
                        role="menuitem"
                      >
                        {status === 'all' ? 'All Leads' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <div className="divide-y divide-gray-100">
            {filteredLeads.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">No leads found matching your criteria.</p>
              </div>
            ) : (
              filteredLeads.map((lead, index) => (
                <article
                  key={lead.id}
                  className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => openModal(lead)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openModal(lead);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                </article>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && selectedLead && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
              ref={modalRef}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 id="modal-title" className="text-2xl font-semibold text-black">{selectedLead.businessName}</h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                    aria-label="Close modal"
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

                  <div>
                    <h3 className="text-lg font-semibold text-black mb-3">Prototype</h3>
                    <div className="flex items-center space-x-4">
                      <a
                        href={`https://prototype.example.com/${selectedLead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-sm font-medium">View Prototype</span>
                      </a>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-sm font-medium">Redo</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-black">Drafted Email</h3>
                      {!isEditingEmail && (
                        <button
                          onClick={handleEditEmail}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="text-sm font-medium">Edit</span>
                        </button>
                      )}
                    </div>
                    {isEditingEmail ? (
                      <div className="space-y-3">
                        <textarea
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-mono text-sm leading-relaxed focus:outline-none focus:border-black focus:bg-white transition-all duration-200 resize-none min-h-[200px]"
                          rows={10}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={handleSaveEmail}
                            className="flex-1 px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEditEmail}
                            className="flex-1 px-6 py-3 bg-gray-100 text-black font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <pre className="text-gray-700 text-sm whitespace-pre-wrap font-mono leading-relaxed">{selectedLead.draftedEmail}</pre>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center pt-4">
                    <button className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentName={name}
          onUpdate={handleProfileUpdate}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      </main>
    </div>
  );
}
