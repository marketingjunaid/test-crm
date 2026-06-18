export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  employees: number;
  revenue: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  company: string;
  contact: string;
  closeDate: string;
  probability: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Done';
  assignedTo: string;
  relatedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  relatedTo: string;
  relatedType: 'Lead' | 'Contact' | 'Company' | 'Deal';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface AppData {
  leads: Lead[];
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  tasks: Task[];
  notes: Note[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  salary: number;
  createdAt: string;
}

export interface HiringCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: 'Applied' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  notes: string;
  appliedDate: string;
  createdAt: string;
}

export interface HRDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  name: string;
  type: 'Offer Letter' | 'ID Proof' | 'Contract' | 'NDA' | 'Other';
  fileData: string;
  fileName: string;
  uploadedAt: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  employeeName: string;
  task: string;
  completed: boolean;
  dueDate: string;
  completedAt?: string;
}

export interface OfferLetter {
  id: string;
  candidateName: string;
  position: string;
  department: string;
  salary: number;
  startDate: string;
  createdAt: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface HRData {
  employees: Employee[];
  hiringCandidates: HiringCandidate[];
  documents: HRDocument[];
  onboardingTasks: OnboardingTask[];
  offerLetters: OfferLetter[];
  leaveApplications: LeaveApplication[];
}
