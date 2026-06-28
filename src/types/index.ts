export type AppSection =
  | 'dashboard' | 'crm' | 'hr' | 'finance' | 'projects'
  | 'inventory' | 'support' | 'assets' | 'announcements'
  | 'documents' | 'settings' | 'chat' | 'calendar' | 'selfservice'
  | 'analytics' | 'communication' | 'automation';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  endTime?: string;
  type: 'holiday' | 'leave' | 'deadline' | 'event' | 'meeting';
  description?: string;
  createdBy: string;
  allDay: boolean;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'Super Admin' | 'Admin' | 'Manager' | 'Employee';
  department: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  sectionOverrides?: AppSection[];
  managerId?: string;
  linkedEmployeeId?: string;
  mustChangePassword?: boolean;
  hasLoggedIn?: boolean;
}

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  annualLeaves: number;
}

export interface Department {
  id: string;
  name: string;
  head: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  notes: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  notes: string;
  createdAt: string;
}

export interface CRMCompany {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  size: string;
  notes: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  contact: string;
  value: number;
  stage: 'Prospect' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  probability: number;
  expectedClose: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
  contractType: 'Full-time' | 'Part-time' | 'Contract';
  managerId?: string;
  linkedUserId?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  dateOfBirth?: string;
  nationality?: string;
  createdAt: string;
}

export interface HiringJob {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

export interface HiringCandidate {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';
  notes: string;
  appliedDate: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  task: string;
  completed: boolean;
  dueDate: string;
  completedAt?: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'Annual' | 'Sick' | 'Emergency' | 'Unpaid';
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending Manager' | 'Pending HR' | 'Approved' | 'Rejected';
  appliedAt: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'WFH' | 'Leave';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'Draft' | 'Processed' | 'Paid';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  goals: string;
  rating: number;
  managerComments: string;
  selfAssessment: string;
  status: 'Draft' | 'Submitted' | 'Reviewed';
  createdAt: string;
}

export interface HRDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  name: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  issueDate: string;
  dueDate: string;
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paidBy: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  department: string;
  year: number;
  totalBudget: number;
  spent: number;
  category: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  health: 'On Track' | 'At Risk' | 'Delayed';
  team: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'To Do' | 'In Progress' | 'Review' | 'Done';
  dueDate: string;
  createdAt: string;
  dependsOn?: string[];
}

export interface Timesheet {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  description: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'In' | 'Out' | 'Adjustment';
  quantity: number;
  reason: string;
  date: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  paymentTerms: string;
  address: string;
  rating: number;
  notes: string;
  createdAt: string;
}

export interface POItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  items: POItem[];
  total: number;
  status: 'Draft' | 'Sent' | 'Received' | 'Cancelled';
  orderDate: string;
  expectedDelivery: string;
  notes: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'On Hold' | 'Resolved' | 'Closed';
  assignedTo: string;
  submittedBy: string;
  notes: string;
  createdAt: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: 'Draft' | 'Published';
  author: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  purchaseDate: string;
  cost: number;
  assignedTo: string;
  location: string;
  status: 'Available' | 'Assigned' | 'Under Maintenance' | 'Retired';
  notes: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  department: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  pinned: boolean;
  createdBy: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[];
}

export type AutomationTrigger =
  | 'employee_added'
  | 'leave_approved'
  | 'leave_rejected'
  | 'deal_won'
  | 'deal_lost'
  | 'deal_stage_changed'
  | 'ticket_created'
  | 'ticket_resolved'
  | 'candidate_hired'
  | 'invoice_overdue'
  | 'task_overdue';

export type AutomationAction =
  | 'send_notification'
  | 'create_task'
  | 'create_announcement'
  | 'escalate_ticket'
  | 'send_notification_to_manager';

export interface AutomationRule {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  actionPayload: Record<string, string>;
  conditions: { field: string; operator: 'equals' | 'not_equals'; value: string }[];
  enabled: boolean;
  runCount: number;
  lastRun?: string;
  createdAt: string;
  isBuiltIn: boolean;
}

export interface AutomationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  trigger: string;
  action: string;
  detail: string;
  ranAt: string;
  success: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdBy: string;
  createdAt: string;
  endsAt?: string;
  status: 'Active' | 'Closed';
  allowMultiple: boolean;
  department: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  attendees: string[];
  videoLink?: string;
  platform: 'Google Meet' | 'Zoom' | 'Teams' | 'Other';
  createdBy: string;
  createdAt: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'delete';
  module: string;
  entityId: string;
  description: string;
  timestamp: string;
}

