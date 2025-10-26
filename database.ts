// src/database.ts
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

const LEADS_COLLECTION = 'leads';

// TypeScript interface for Lead data
export interface Lead {
  businessName: string;
  description: string;
  currentWebsite: string;
  draftedEmail: string;
  contactInfo: string;
  demoWebsite: string;
  websiteScore: number;
  createdAt: string;
  updatedAt: string;
  status: 'new' | 'contacted' | 'responded' | 'closed';
}

// API Response type
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Add a new lead to the database
 */
export async function addLead(
  businessName: string, 
  leadData: Partial<Lead>
): Promise<ApiResponse<Lead>> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, businessName);
    
    const lead: Lead = {
      businessName: businessName,
      description: leadData.description || '',
      currentWebsite: leadData.currentWebsite || '',
      draftedEmail: leadData.draftedEmail || '',
      contactInfo: leadData.contactInfo || '',
      demoWebsite: leadData.demoWebsite || '',
      websiteScore: leadData.websiteScore || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: leadData.status || 'new'
    };
    
    await setDoc(leadRef, lead);
    console.log('✅ Lead added:', businessName);
    return { success: true, data: lead };
  } catch (error: any) {
    console.error('❌ Error adding lead:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific lead by business name
 */
export async function getLead(businessName: string): Promise<ApiResponse<Lead>> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, businessName);
    const leadSnap = await getDoc(leadRef);
    
    if (leadSnap.exists()) {
      return { success: true, data: leadSnap.data() as Lead };
    } else {
      return { success: false, error: 'Lead not found' };
    }
  } catch (error: any) {
    console.error('❌ Error getting lead:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all leads
 */
export async function getAllLeads(): Promise<ApiResponse<Lead[]>> {
  try {
    const leadsRef = collection(db, LEADS_COLLECTION);
    const snapshot = await getDocs(leadsRef);
    
    const leads: Lead[] = [];
    snapshot.forEach((docSnap) => {
      leads.push(docSnap.data() as Lead);
    });
    
    console.log(`✅ Found ${leads.length} leads`);
    return { success: true, data: leads };
  } catch (error: any) {
    console.error('❌ Error getting leads:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a lead
 */
export async function updateLead(
  businessName: string, 
  updates: Partial<Lead>
): Promise<ApiResponse> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, businessName);
    
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(leadRef, updateData);
    console.log('✅ Lead updated:', businessName);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error updating lead:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Delete a lead
 */
export async function deleteLead(businessName: string): Promise<ApiResponse> {
  try {
    const leadRef = doc(db, LEADS_COLLECTION, businessName);
    await deleteDoc(leadRef);
    console.log('✅ Lead deleted:', businessName);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error deleting lead:', error);
    return { success: false, error: error.message };
  }
}


/**
 * Update lead status
 */
export async function updateLeadStatus(
  businessName: string, 
  status: Lead['status']
): Promise<ApiResponse> {
  return updateLead(businessName, { status });
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<ApiResponse<{
  total: number;
  new: number;
  contacted: number;
  responded: number;
  closed: number;
  averageScore: number;
  highPriority: number;
}>> {
  try {
    const allLeads = await getAllLeads();
    
    if (!allLeads.success || !allLeads.data) {
      return { success: false, error: allLeads.error };
    }
    
    const leads = allLeads.data;
    
    const stats = {
      total: leads.length,
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      responded: leads.filter(l => l.status === 'responded').length,
      closed: leads.filter(l => l.status === 'closed').length,
      averageScore: leads.length > 0 
        ? Math.round(leads.reduce((sum, l) => sum + l.websiteScore, 0) / leads.length)
        : 0,
      highPriority: leads.filter(l => l.websiteScore < 50).length
    };
    
    return { success: true, data: stats };
  } catch (error: any) {
    console.error('❌ Error getting dashboard stats:', error);
    return { success: false, error: error.message };
  }
}