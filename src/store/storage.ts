import type { AppData, Lead, Contact, Company, Deal, Task, Note, HRData, Employee, HiringCandidate, HRDocument, OnboardingTask, OfferLetter, LeaveApplication } from '../types';

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

// HR Storage
const HR_STORAGE_KEY = 'crm_hr_data';

const initialHRData: HRData = {
  employees: [
    { id: 'e1', name: 'Sarah Mitchell', email: 'sarah@company.com', phone: '555-1001', role: 'Engineering Manager', department: 'Engineering', joinDate: '2022-03-15', status: 'Active', salary: 95000, createdAt: '2022-03-15T09:00:00Z' },
    { id: 'e2', name: 'James Patel', email: 'james@company.com', phone: '555-1002', role: 'Senior Developer', department: 'Engineering', joinDate: '2022-07-01', status: 'Active', salary: 85000, createdAt: '2022-07-01T09:00:00Z' },
    { id: 'e3', name: 'Olivia Chen', email: 'olivia@company.com', phone: '555-1003', role: 'Marketing Lead', department: 'Marketing', joinDate: '2023-01-10', status: 'Active', salary: 75000, createdAt: '2023-01-10T09:00:00Z' },
    { id: 'e4', name: 'Marcus Reed', email: 'marcus@company.com', phone: '555-1004', role: 'Sales Executive', department: 'Sales', joinDate: '2023-05-20', status: 'Active', salary: 70000, createdAt: '2023-05-20T09:00:00Z' },
    { id: 'e5', name: 'Priya Sharma', email: 'priya@company.com', phone: '555-1005', role: 'HR Specialist', department: 'HR', joinDate: '2024-01-08', status: 'Active', salary: 65000, createdAt: '2024-01-08T09:00:00Z' },
  ],
  hiringCandidates: [
    { id: 'h1', name: 'Tom Walker', email: 'tom@email.com', phone: '555-2001', position: 'Frontend Developer', stage: 'Interview', notes: 'Strong React skills', appliedDate: '2024-01-15', createdAt: '2024-01-15T09:00:00Z' },
    { id: 'h2', name: 'Nina Lopez', email: 'nina@email.com', phone: '555-2002', position: 'Product Manager', stage: 'Applied', notes: '5 years experience at SaaS companies', appliedDate: '2024-01-20', createdAt: '2024-01-20T09:00:00Z' },
    { id: 'h3', name: 'Ben Carter', email: 'ben@email.com', phone: '555-2003', position: 'Data Analyst', stage: 'Offer', notes: 'Excellent SQL and Python skills', appliedDate: '2024-01-08', createdAt: '2024-01-08T09:00:00Z' },
    { id: 'h4', name: 'Amy Zhang', email: 'amy@email.com', phone: '555-2004', position: 'UX Designer', stage: 'Hired', notes: 'Portfolio impressed the team', appliedDate: '2023-12-10', createdAt: '2023-12-10T09:00:00Z' },
  ],
  documents: [
    { id: 'd1', employeeId: 'e1', employeeName: 'Sarah Mitchell', name: 'Employment Contract', type: 'Contract', fileData: '', fileName: 'sarah_contract.pdf', uploadedAt: '2022-03-15T09:00:00Z' },
    { id: 'd2', employeeId: 'e2', employeeName: 'James Patel', name: 'Offer Letter', type: 'Offer Letter', fileData: '', fileName: 'james_offer.pdf', uploadedAt: '2022-06-25T09:00:00Z' },
  ],
  onboardingTasks: [
    { id: 'o1', employeeId: 'e5', employeeName: 'Priya Sharma', task: 'Setup company email', completed: true, dueDate: '2024-01-09', completedAt: '2024-01-09T10:00:00Z' },
    { id: 'o2', employeeId: 'e5', employeeName: 'Priya Sharma', task: 'Issue laptop and equipment', completed: true, dueDate: '2024-01-09', completedAt: '2024-01-09T11:00:00Z' },
    { id: 'o3', employeeId: 'e5', employeeName: 'Priya Sharma', task: 'Sign NDA', completed: false, dueDate: '2024-01-12' },
    { id: 'o4', employeeId: 'e5', employeeName: 'Priya Sharma', task: 'Complete HR orientation', completed: false, dueDate: '2024-01-15' },
    { id: 'o5', employeeId: 'e5', employeeName: 'Priya Sharma', task: 'Meet the team', completed: false, dueDate: '2024-01-10' },
    { id: 'o6', employeeId: 'e4', employeeName: 'Marcus Reed', task: 'Setup company email', completed: true, dueDate: '2023-05-21', completedAt: '2023-05-21T09:00:00Z' },
    { id: 'o7', employeeId: 'e4', employeeName: 'Marcus Reed', task: 'Sales tool training', completed: true, dueDate: '2023-05-25', completedAt: '2023-05-25T09:00:00Z' },
    { id: 'o8', employeeId: 'e4', employeeName: 'Marcus Reed', task: 'Sign NDA', completed: true, dueDate: '2023-05-22', completedAt: '2023-05-22T09:00:00Z' },
  ],
  offerLetters: [
    { id: 'ol1', candidateName: 'Ben Carter', position: 'Data Analyst', department: 'Analytics', salary: 72000, startDate: '2024-02-01', createdAt: '2024-01-22T09:00:00Z', status: 'Sent' },
    { id: 'ol2', candidateName: 'Amy Zhang', position: 'UX Designer', department: 'Design', salary: 78000, startDate: '2024-01-15', createdAt: '2023-12-20T09:00:00Z', status: 'Accepted' },
  ],
  leaveApplications: [
    { id: 'l1', employeeId: 'e1', employeeName: 'Sarah Mitchell', fromDate: '2024-01-22', toDate: '2024-01-24', days: 3, reason: 'Family vacation', status: 'Approved', appliedAt: '2024-01-10T09:00:00Z' },
    { id: 'l2', employeeId: 'e2', employeeName: 'James Patel', fromDate: '2024-02-05', toDate: '2024-02-07', days: 3, reason: 'Medical appointment', status: 'Pending', appliedAt: '2024-01-18T09:00:00Z' },
    { id: 'l3', employeeId: 'e3', employeeName: 'Olivia Chen', fromDate: '2024-01-29', toDate: '2024-01-31', days: 3, reason: 'Personal leave', status: 'Approved', appliedAt: '2024-01-15T09:00:00Z' },
    { id: 'l4', employeeId: 'e4', employeeName: 'Marcus Reed', fromDate: '2024-02-12', toDate: '2024-02-14', days: 3, reason: 'Travel', status: 'Pending', appliedAt: '2024-01-20T09:00:00Z' },
  ],
};

export function loadHRData(): HRData {
  const stored = localStorage.getItem(HR_STORAGE_KEY);
  if (stored) return JSON.parse(stored) as HRData;
  localStorage.setItem(HR_STORAGE_KEY, JSON.stringify(initialHRData));
  return initialHRData;
}

export function saveHRData(data: HRData): void {
  localStorage.setItem(HR_STORAGE_KEY, JSON.stringify(data));
}

export function getEmployees(): Employee[] { return loadHRData().employees; }
export function getHiringCandidates(): HiringCandidate[] { return loadHRData().hiringCandidates; }
export function getHRDocuments(): HRDocument[] { return loadHRData().documents; }
export function getOnboardingTasks(): OnboardingTask[] { return loadHRData().onboardingTasks; }
export function getOfferLetters(): OfferLetter[] { return loadHRData().offerLetters; }
export function getLeaveApplications(): LeaveApplication[] { return loadHRData().leaveApplications; }
