'use client';

import { useState } from 'react';
import { addLead, getAllLeads, updateLeadStatus, deleteLead, getDashboardStats, Lead } from '@/src/database';

export default function TestPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<any>(null);

  const testFirebase = async () => {
    setLoading(true);
    setResult('Testing Firebase connection...');

    try {
      // Test 1: Add a lead
      console.log('📝 Test 1: Adding test lead...');
      const addResult = await addLead('Test Coffee Shop', {
        description: 'Small coffee shop with outdated website',
        currentWebsite: 'https://testcoffee.com',
        websiteScore: 35,
        contactInfo: 'test@testcoffee.com',
        draftedEmail: 'Hi! Your website needs an upgrade...',
        demoWebsite: 'https://v0.dev/demo-testcoffee'
      });

      if (!addResult.success) {
        setResult('❌ Failed to add lead: ' + addResult.error);
        setLoading(false);
        return;
      }
      console.log('✅ Lead added successfully!');

      // Test 2: Get all leads
      console.log('📥 Test 2: Getting all leads...');
      const allLeads = await getAllLeads();

      if (!allLeads.success || !allLeads.data) {
        setResult('❌ Failed to get leads: ' + allLeads.error);
        setLoading(false);
        return;
      }
      console.log('✅ Found leads:', allLeads.data);

      // Test 3: Get dashboard stats
      console.log('📊 Test 3: Getting dashboard stats...');
      const statsResult = await getDashboardStats();
      
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        console.log('✅ Stats retrieved:', statsResult.data);
      }

      setLeads(allLeads.data);
      setResult(`✅ All tests passed! Found ${allLeads.data.length} leads in database.`);

    } catch (error: any) {
      setResult('❌ Error: ' + error.message);
      console.error('Full error:', error);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (businessName: string, newStatus: Lead['status']) => {
    const result = await updateLeadStatus(businessName, newStatus);
    if (result.success) {
      // Refresh leads
      const allLeads = await getAllLeads();
      if (allLeads.success && allLeads.data) {
        setLeads(allLeads.data);
      }
      alert(`Status updated to ${newStatus}!`);
    } else {
      alert('Failed to update status: ' + result.error);
    }
  };

  const handleDelete = async (businessName: string) => {
    if (confirm(`Delete ${businessName}?`)) {
      const result = await deleteLead(businessName);
      if (result.success) {
        // Refresh leads
        const allLeads = await getAllLeads();
        if (allLeads.success && allLeads.data) {
          setLeads(allLeads.data);
        }
        alert('Lead deleted!');
      } else {
        alert('Failed to delete: ' + result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-black mb-2">
            Firebase Backend Test
          </h1>
          <p className="text-gray-600">
            Test your database connection and CRUD operations
          </p>
        </div>

        {/* Test Button */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-black mb-4">
            Run Tests
          </h2>
          <p className="text-gray-600 mb-6">
            This will test: Adding a lead, retrieving all leads, and getting stats.
          </p>

          <button
            onClick={testFirebase}
            disabled={loading}
            className="px-8 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 disabled:bg-gray-300 transition-all duration-200"
          >
            {loading ? 'Testing...' : 'Run All Tests'}
          </button>

          {result && (
            <div className={`mt-6 p-4 rounded-xl border ${
              result.includes('✅') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className="text-sm font-medium text-gray-900">
                {result}
              </p>
            </div>
          )}
        </div>

        {/* Stats Display */}
        {stats && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Dashboard Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-3xl font-semibold text-black">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Leads</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="text-3xl font-semibold text-blue-900">{stats.new}</div>
                <div className="text-sm text-blue-700">New</div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="text-3xl font-semibold text-yellow-900">{stats.contacted}</div>
                <div className="text-sm text-yellow-700">Contacted</div>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-semibold text-green-900">{stats.responded}</div>
                <div className="text-sm text-green-700">Responded</div>
              </div>
            </div>
          </div>
        )}

        {/* Leads Display */}
        {leads.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Leads in Database ({leads.length})
            </h2>
            <div className="space-y-4">
              {leads.map((lead, index) => (
                <div 
                  key={index}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-black mb-1">
                        {lead.businessName}
                      </h3>
                      <p className="text-sm text-gray-600">{lead.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-900' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-900' :
                      lead.status === 'responded' ? 'bg-green-100 text-green-900' :
                      'bg-purple-100 text-purple-900'
                    }`}>
                      {lead.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Website:</span>
                      <a href={lead.currentWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        {lead.currentWebsite}
                      </a>
                    </div>
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <span className="ml-2 font-medium text-black">{lead.websiteScore}/100</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Contact:</span>
                      <span className="ml-2 text-black">{lead.contactInfo}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Demo:</span>
                      <a href={lead.demoWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        View Demo
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(lead.businessName, 'contacted')}
                      className="px-4 py-2 text-sm bg-yellow-100 text-yellow-900 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      Mark Contacted
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(lead.businessName, 'responded')}
                      className="px-4 py-2 text-sm bg-green-100 text-green-900 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Mark Responded
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(lead.businessName, 'closed')}
                      className="px-4 py-2 text-sm bg-purple-100 text-purple-900 rounded-lg hover:bg-purple-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleDelete(lead.businessName)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-900 rounded-lg hover:bg-red-200 transition-colors ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}