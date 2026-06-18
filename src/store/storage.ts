import type { AppData, Lead, Contact, Company, Deal, Task, Note } from '../types';

const STORAGE_KEY = 'crm_data';

const initialData: AppData = {
  leads: [
    { id: '1', name: 'Alice Johnson', email: 'alice@acme.com', phone: '555-0101', company: 'Acme Corp', status: 'New', source: 'Website', createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-10T10:00:00Z' },
    { id: '2', name: 'Bob Smith', email: 'bob@globex.com', phone: '555-0102', company: 'Globex', status: 'Contacted', source: 'Referral', createdAt: '2024-01-12T10:00:00Z', updatedAt: '2024-01-12T10:00:00Z' },
    { id: '3', name: 'Carol White', email: 'carol@initech.com', phone: '555-0103', company: 'Initech', status: 'Qualified', source: 'Cold Call', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
    { id: '4', name: 'David Brown', email: 'david@umbrella.com', phone: '555-0104', company: 'Umbrella', status: 'Lost', source: 'Email', createdAt: '2024-01-18T10:00:00Z', updatedAt: '2024-01-18T10:00:00Z' },
    { id: '5', name: 'Eva Martinez', email: 'eva@stark.com', phone: '555-0105', company: 'Stark Industries', status: 'New', source: 'LinkedIn', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
  ],
  contacts: [
    { id: '1', firstName: 'James', lastName: 'Wilson', email: 'james@acme.com', phone: '555-0201', company: 'Acme Corp', title: 'CEO', createdAt: '2024-01-05T10:00:00Z', updatedAt: '2024-01-05T10:00:00Z' },
    { id: '2', firstName: 'Sarah', lastName: 'Connor', email: 'sarah@globex.com', phone: '555-0202', company: 'Globex', title: 'CTO', createdAt: '2024-01-07T10:00:00Z', updatedAt: '2024-01-07T10:00:00Z' },
    { id: '3', firstName: 'Mike', lastName: 'Davis', email: 'mike@initech.com', phone: '555-0203', company: 'Initech', title: 'VP Sales', createdAt: '2024-01-09T10:00:00Z', updatedAt: '2024-01-09T10:00:00Z' },
    { id: '4', firstName: 'Lisa', lastName: 'Chen', email: 'lisa@umbrella.com', phone: '555-0204', company: 'Umbrella', title: 'Director', createdAt: '2024-01-11T10:00:00Z', updatedAt: '2024-01-11T10:00:00Z' },
  ],
  companies: [
    { id: '1', name: 'Acme Corp', industry: 'Technology', website: 'https://acme.com', phone: '555-0301', employees: 500, revenue: '$50M', createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' },
    { id: '2', name: 'Globex', industry: 'Manufacturing', website: 'https://globex.com', phone: '555-0302', employees: 1200, revenue: '$120M', createdAt: '2024-01-02T10:00:00Z', updatedAt: '2024-01-02T10:00:00Z' },
    { id: '3', name: 'Initech', industry: 'Finance', website: 'https://initech.com', phone: '555-0303', employees: 300, revenue: '$30M', createdAt: '2024-01-03T10:00:00Z', updatedAt: '2024-01-03T10:00:00Z' },
    { id: '4', name: 'Umbrella Corp', industry: 'Healthcare', website: 'https://umbrella.com', phone: '555-0304', employees: 5000, revenue: '$500M', createdAt: '2024-01-04T10:00:00Z', updatedAt: '2024-01-04T10:00:00Z' },
  ],
  deals: [
    { id: '1', title: 'Acme Enterprise License', value: 50000, stage: 'Proposal', company: 'Acme Corp', contact: 'James Wilson', closeDate: '2024-03-31', probability: 60, createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-10T10:00:00Z' },
    { id: '2', title: 'Globex SaaS Contract', value: 24000, stage: 'Qualification', company: 'Globex', contact: 'Sarah Connor', closeDate: '2024-04-15', probability: 40, createdAt: '2024-01-12T10:00:00Z', updatedAt: '2024-01-12T10:00:00Z' },
    { id: '3', title: 'Initech Support Package', value: 12000, stage: 'Closed Won', company: 'Initech', contact: 'Mike Davis', closeDate: '2024-02-28', probability: 100, createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
    { id: '4', title: 'Umbrella Premium Plan', value: 80000, stage: 'Negotiation', company: 'Umbrella Corp', contact: 'Lisa Chen', closeDate: '2024-05-01', probability: 75, createdAt: '2024-01-18T10:00:00Z', updatedAt: '2024-01-18T10:00:00Z' },
    { id: '5', title: 'Stark Tech Suite', value: 35000, stage: 'Prospecting', company: 'Stark Industries', contact: '', closeDate: '2024-06-30', probability: 20, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
  ],
  tasks: [
    { id: '1', title: 'Follow up with Alice Johnson', description: 'Send proposal email', dueDate: '2024-02-05', priority: 'High', status: 'Open', assignedTo: 'Demo User', relatedTo: 'Alice Johnson', createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-01-20T10:00:00Z' },
    { id: '2', title: 'Prepare Acme demo', description: 'Set up sandbox environment', dueDate: '2024-02-10', priority: 'High', status: 'In Progress', assignedTo: 'Demo User', relatedTo: 'Acme Corp', createdAt: '2024-01-21T10:00:00Z', updatedAt: '2024-01-21T10:00:00Z' },
    { id: '3', title: 'Call Globex CTO', description: 'Discuss technical requirements', dueDate: '2024-02-08', priority: 'Medium', status: 'Open', assignedTo: 'Demo User', relatedTo: 'Sarah Connor', createdAt: '2024-01-22T10:00:00Z', updatedAt: '2024-01-22T10:00:00Z' },
    { id: '4', title: 'Send contract to Initech', description: 'Legal has approved', dueDate: '2024-02-01', priority: 'Low', status: 'Done', assignedTo: 'Demo User', relatedTo: 'Initech', createdAt: '2024-01-23T10:00:00Z', updatedAt: '2024-01-23T10:00:00Z' },
  ],
  notes: [
    { id: '1', title: 'Initial meeting notes', content: 'Alice is interested in our enterprise plan. Budget approved for Q1.', relatedTo: 'Alice Johnson', relatedType: 'Lead', createdAt: '2024-01-10T10:00:00Z', updatedAt: '2024-01-10T10:00:00Z' },
    { id: '2', title: 'Technical requirements', content: 'Globex needs API integration with their ERP system. Sarah will send specs.', relatedTo: 'Globex SaaS Contract', relatedType: 'Deal', createdAt: '2024-01-12T10:00:00Z', updatedAt: '2024-01-12T10:00:00Z' },
    { id: '3', title: 'Company overview', content: 'Acme Corp is expanding into APAC market. Good upsell opportunity.', relatedTo: 'Acme Corp', relatedType: 'Company', createdAt: '2024-01-15T10:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
  ],
};

export function loadData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as AppData;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function now(): string {
  return new Date().toISOString();
}

// Typed helpers
export function getLeads(): Lead[] { return loadData().leads; }
export function getContacts(): Contact[] { return loadData().contacts; }
export function getCompanies(): Company[] { return loadData().companies; }
export function getDeals(): Deal[] { return loadData().deals; }
export function getTasks(): Task[] { return loadData().tasks; }
export function getNotes(): Note[] { return loadData().notes; }
