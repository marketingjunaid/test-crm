import type {
  AppUser, CompanySettings, Department, Lead, Contact, CRMCompany, Deal,
  Employee, HiringJob, HiringCandidate, OnboardingTask, LeaveApplication,
  AttendanceRecord, PayrollRecord, PerformanceReview, HRDocument,
  Invoice, InvoiceItem, Expense, Budget, Project, Task, Timesheet,
  Product, StockMovement, Vendor, PurchaseOrder, Ticket, KBArticle,
  Asset, Announcement, AppNotification, CalendarEvent
} from '../types';

const K = {
  users: 'orgos_users', company: 'orgos_company', departments: 'orgos_departments',
  leads: 'orgos_leads', contacts: 'orgos_contacts', crmCompanies: 'orgos_crm_companies', deals: 'orgos_deals',
  employees: 'orgos_employees', jobs: 'orgos_jobs', candidates: 'orgos_candidates',
  onboarding: 'orgos_onboarding', leaves: 'orgos_leaves', attendance: 'orgos_attendance',
  payroll: 'orgos_payroll', performance: 'orgos_performance', hrDocs: 'orgos_hr_docs',
  invoices: 'orgos_invoices', expenses: 'orgos_expenses', budgets: 'orgos_budgets',
  projects: 'orgos_projects', tasks: 'orgos_tasks', timesheets: 'orgos_timesheets',
  products: 'orgos_products', stock: 'orgos_stock', vendors: 'orgos_vendors', pos: 'orgos_pos',
  tickets: 'orgos_tickets', kb: 'orgos_kb', assets: 'orgos_assets',
  announcements: 'orgos_announcements', notifications: 'orgos_notifications',
  calendarEvents: 'orgos_calendar_events',
  initialized: 'orgos_initialized',
};

function get<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function set<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}
function getObj<T>(key: string, def: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}

export const getUsers = () => get<AppUser>(K.users);
export const saveUsers = (d: AppUser[]) => set(K.users, d);
export const getCompany = () => getObj<CompanySettings>(K.company, { name: 'Acme Corp', email: 'info@acme.com', phone: '+1-555-0100', address: '123 Business Ave, NY 10001', website: 'www.acme.com', currency: 'USD', annualLeaves: 22 });
export const saveCompany = (d: CompanySettings) => localStorage.setItem(K.company, JSON.stringify(d));
export const getDepartments = () => get<Department>(K.departments);
export const saveDepartments = (d: Department[]) => set(K.departments, d);

export const getLeads = () => get<Lead>(K.leads);
export const saveLeads = (d: Lead[]) => set(K.leads, d);
export const getContacts = () => get<Contact>(K.contacts);
export const saveContacts = (d: Contact[]) => set(K.contacts, d);
export const getCRMCompanies = () => get<CRMCompany>(K.crmCompanies);
export const saveCRMCompanies = (d: CRMCompany[]) => set(K.crmCompanies, d);
export const getDeals = () => get<Deal>(K.deals);
export const saveDeals = (d: Deal[]) => set(K.deals, d);

export const getCalendarEvents = () => get<CalendarEvent>(K.calendarEvents);
export const saveCalendarEvents = (d: CalendarEvent[]) => set(K.calendarEvents, d);

export const getEmployees = () => get<Employee>(K.employees);
export const saveEmployees = (d: Employee[]) => set(K.employees, d);
export const getJobs = () => get<HiringJob>(K.jobs);
export const saveJobs = (d: HiringJob[]) => set(K.jobs, d);
export const getCandidates = () => get<HiringCandidate>(K.candidates);
export const saveCandidates = (d: HiringCandidate[]) => set(K.candidates, d);
export const getOnboarding = () => get<OnboardingTask>(K.onboarding);
export const saveOnboarding = (d: OnboardingTask[]) => set(K.onboarding, d);
export const getLeaves = () => get<LeaveApplication>(K.leaves);
export const saveLeaves = (d: LeaveApplication[]) => set(K.leaves, d);
export const getAttendance = () => get<AttendanceRecord>(K.attendance);
export const saveAttendance = (d: AttendanceRecord[]) => set(K.attendance, d);
export const getPayroll = () => get<PayrollRecord>(K.payroll);
export const savePayroll = (d: PayrollRecord[]) => set(K.payroll, d);
export const getPerformance = () => get<PerformanceReview>(K.performance);
export const savePerformance = (d: PerformanceReview[]) => set(K.performance, d);
export const getHRDocs = () => get<HRDocument>(K.hrDocs);
export const saveHRDocs = (d: HRDocument[]) => set(K.hrDocs, d);

export const getInvoices = () => get<Invoice>(K.invoices);
export const saveInvoices = (d: Invoice[]) => set(K.invoices, d);
export const getExpenses = () => get<Expense>(K.expenses);
export const saveExpenses = (d: Expense[]) => set(K.expenses, d);
export const getBudgets = () => get<Budget>(K.budgets);
export const saveBudgets = (d: Budget[]) => set(K.budgets, d);

export const getProjects = () => get<Project>(K.projects);
export const saveProjects = (d: Project[]) => set(K.projects, d);
export const getTasks = () => get<Task>(K.tasks);
export const saveTasks = (d: Task[]) => set(K.tasks, d);
export const getTimesheets = () => get<Timesheet>(K.timesheets);
export const saveTimesheets = (d: Timesheet[]) => set(K.timesheets, d);

export const getProducts = () => get<Product>(K.products);
export const saveProducts = (d: Product[]) => set(K.products, d);
export const getStock = () => get<StockMovement>(K.stock);
export const saveStock = (d: StockMovement[]) => set(K.stock, d);
export const getVendors = () => get<Vendor>(K.vendors);
export const saveVendors = (d: Vendor[]) => set(K.vendors, d);
export const getPOs = () => get<PurchaseOrder>(K.pos);
export const savePOs = (d: PurchaseOrder[]) => set(K.pos, d);

export const getTickets = () => get<Ticket>(K.tickets);
export const saveTickets = (d: Ticket[]) => set(K.tickets, d);
export const getKB = () => get<KBArticle>(K.kb);
export const saveKB = (d: KBArticle[]) => set(K.kb, d);
export const getAssets = () => get<Asset>(K.assets);
export const saveAssets = (d: Asset[]) => set(K.assets, d);
export const getAnnouncements = () => get<Announcement>(K.announcements);
export const saveAnnouncements = (d: Announcement[]) => set(K.announcements, d);
export const getNotifications = () => get<AppNotification>(K.notifications);
export const saveNotifications = (d: AppNotification[]) => set(K.notifications, d);

export function migrateData() {
  const raw = localStorage.getItem(K.users);
  if (!raw) return;
  try {
    let users: AppUser[] = JSON.parse(raw);
    let changed = false;

    // Remap legacy 'Viewer' role
    users = users.map(u => {
      const role = u.role as string;
      if (role === 'Viewer' || role === 'viewer') { changed = true; return { ...u, role: 'Employee' as const }; }
      return u;
    });

    // Ensure a Super Admin always exists
    const hasSuperAdmin = users.some(u => u.role === 'Super Admin');
    if (!hasSuperAdmin) {
      users = [
        { id: 'superadmin', name: 'Super Admin', email: 'superadmin@acme.com', password: 'super123', role: 'Super Admin', department: 'Management', status: 'Active', createdAt: '2024-01-01' },
        ...users,
      ];
      changed = true;
    }

    if (changed) localStorage.setItem(K.users, JSON.stringify(users));
  } catch { /* ignore */ }
}

export function initializeData() {
  migrateData();
  if (localStorage.getItem(K.initialized)) return;

  const users: AppUser[] = [
    { id: '0', name: 'Super Admin', email: 'superadmin@acme.com', password: 'super123', role: 'Super Admin', department: 'Management', status: 'Active', createdAt: '2024-01-01' },
    { id: '1', name: 'Admin User', email: 'admin@acme.com', password: 'admin123', role: 'Admin', department: 'Management', status: 'Active', createdAt: '2024-01-01' },
    { id: '2', name: 'Sarah Manager', email: 'manager@acme.com', password: 'manager123', role: 'Manager', department: 'Sales', status: 'Active', createdAt: '2024-01-15' },
    { id: '3', name: 'John Employee', email: 'employee@acme.com', password: 'employee123', role: 'Employee', department: 'Engineering', status: 'Active', createdAt: '2024-02-01' },
  ];
  set(K.users, users);

  const company: CompanySettings = { name: 'Acme Corp', email: 'info@acme.com', phone: '+1-555-0100', address: '123 Business Ave, New York, NY 10001', website: 'www.acme.com', currency: 'USD', annualLeaves: 22 };
  localStorage.setItem(K.company, JSON.stringify(company));

  const departments: Department[] = [
    { id: '1', name: 'Management', head: 'Admin User' },
    { id: '2', name: 'Engineering', head: 'John Employee' },
    { id: '3', name: 'Sales', head: 'Sarah Manager' },
    { id: '4', name: 'Marketing', head: 'Emily Clark' },
    { id: '5', name: 'Finance', head: 'Michael Brown' },
    { id: '6', name: 'HR', head: 'Lisa White' },
  ];
  set(K.departments, departments);

  const leads: Lead[] = [
    { id: '1', name: 'James Wilson', email: 'james@techcorp.com', phone: '+1-555-0201', company: 'TechCorp', source: 'Website', status: 'New', priority: 'High', assignedTo: 'Sarah Manager', notes: 'Interested in enterprise plan', createdAt: '2025-01-10' },
    { id: '2', name: 'Maria Garcia', email: 'maria@designco.com', phone: '+1-555-0202', company: 'DesignCo', source: 'Referral', status: 'Contacted', priority: 'Medium', assignedTo: 'Sarah Manager', notes: 'Scheduled a demo call', createdAt: '2025-01-12' },
    { id: '3', name: 'David Kim', email: 'david@fintech.io', phone: '+1-555-0203', company: 'FinTech IO', source: 'LinkedIn', status: 'Qualified', priority: 'High', assignedTo: 'Sarah Manager', notes: 'Budget confirmed $50k', createdAt: '2025-01-15' },
    { id: '4', name: 'Anna Lee', email: 'anna@startup.co', phone: '+1-555-0204', company: 'Startup Co', source: 'Cold Email', status: 'Lost', priority: 'Low', assignedTo: 'John Employee', notes: 'Went with competitor', createdAt: '2025-01-08' },
    { id: '5', name: 'Robert Chen', email: 'robert@bigcorp.com', phone: '+1-555-0205', company: 'BigCorp', source: 'Trade Show', status: 'New', priority: 'High', assignedTo: 'Sarah Manager', notes: 'Met at TechConf 2025', createdAt: '2025-01-18' },
  ];
  set(K.leads, leads);

  const contacts: Contact[] = [
    { id: '1', name: 'Emily Clark', email: 'emily@acme.com', phone: '+1-555-0301', company: 'Acme Corp', title: 'Marketing Director', notes: '', createdAt: '2024-06-01' },
    { id: '2', name: 'Michael Brown', email: 'michael@techcorp.com', phone: '+1-555-0302', company: 'TechCorp', title: 'CTO', notes: 'Key decision maker', createdAt: '2024-07-15' },
    { id: '3', name: 'Sophie Turner', email: 'sophie@designco.com', phone: '+1-555-0303', company: 'DesignCo', title: 'CEO', notes: '', createdAt: '2024-08-20' },
    { id: '4', name: 'Alex Johnson', email: 'alex@fintech.io', phone: '+1-555-0304', company: 'FinTech IO', title: 'VP Sales', notes: 'Prefers email communication', createdAt: '2024-09-10' },
  ];
  set(K.contacts, contacts);

  const crmCompanies: CRMCompany[] = [
    { id: '1', name: 'TechCorp', industry: 'Technology', website: 'techcorp.com', phone: '+1-555-0401', email: 'info@techcorp.com', size: '201-500', notes: 'Top prospect', createdAt: '2024-05-01' },
    { id: '2', name: 'DesignCo', industry: 'Design', website: 'designco.com', phone: '+1-555-0402', email: 'hello@designco.com', size: '11-50', notes: '', createdAt: '2024-06-10' },
    { id: '3', name: 'FinTech IO', industry: 'Finance', website: 'fintech.io', phone: '+1-555-0403', email: 'contact@fintech.io', size: '51-200', notes: 'Fast-growing', createdAt: '2024-07-20' },
  ];
  set(K.crmCompanies, crmCompanies);

  const deals: Deal[] = [
    { id: '1', title: 'TechCorp Enterprise License', company: 'TechCorp', contact: 'Michael Brown', value: 48000, stage: 'Proposal', probability: 60, expectedClose: '2025-02-28', assignedTo: 'Sarah Manager', notes: 'Proposal sent', createdAt: '2025-01-05' },
    { id: '2', title: 'DesignCo Starter Package', company: 'DesignCo', contact: 'Sophie Turner', value: 12000, stage: 'Qualified', probability: 40, expectedClose: '2025-03-15', assignedTo: 'Sarah Manager', notes: '', createdAt: '2025-01-10' },
    { id: '3', title: 'FinTech IO Platform', company: 'FinTech IO', contact: 'Alex Johnson', value: 85000, stage: 'Negotiation', probability: 75, expectedClose: '2025-02-15', assignedTo: 'Sarah Manager', notes: 'Final pricing discussion', createdAt: '2024-12-20' },
    { id: '4', title: 'BigCorp Annual Contract', company: 'BigCorp', contact: 'Robert Chen', value: 120000, stage: 'Won', probability: 100, expectedClose: '2025-01-30', assignedTo: 'Sarah Manager', notes: 'Signed!', createdAt: '2024-12-01' },
  ];
  set(K.deals, deals);

  const employees: Employee[] = [
    { id: '1', name: 'Admin User', email: 'admin@acme.com', phone: '+1-555-1001', role: 'CEO', department: 'Management', salary: 150000, joinDate: '2020-01-01', status: 'Active', contractType: 'Full-time', createdAt: '2020-01-01' },
    { id: '2', name: 'Sarah Manager', email: 'manager@acme.com', phone: '+1-555-1002', role: 'Sales Manager', department: 'Sales', salary: 95000, joinDate: '2021-03-15', status: 'Active', contractType: 'Full-time', createdAt: '2021-03-15' },
    { id: '3', name: 'John Employee', email: 'employee@acme.com', phone: '+1-555-1003', role: 'Senior Engineer', department: 'Engineering', salary: 110000, joinDate: '2022-06-01', status: 'Active', contractType: 'Full-time', createdAt: '2022-06-01' },
    { id: '4', name: 'Emily Clark', email: 'emily@acme.com', phone: '+1-555-1004', role: 'Marketing Manager', department: 'Marketing', salary: 85000, joinDate: '2022-09-01', status: 'Active', contractType: 'Full-time', createdAt: '2022-09-01' },
    { id: '5', name: 'Michael Brown', email: 'michael@acme.com', phone: '+1-555-1005', role: 'Finance Analyst', department: 'Finance', salary: 80000, joinDate: '2023-02-01', status: 'Active', contractType: 'Full-time', createdAt: '2023-02-01' },
    { id: '6', name: 'Lisa White', email: 'lisa@acme.com', phone: '+1-555-1006', role: 'HR Specialist', department: 'HR', salary: 75000, joinDate: '2023-08-01', status: 'Active', contractType: 'Full-time', createdAt: '2023-08-01' },
  ];
  set(K.employees, employees);

  const jobs: HiringJob[] = [
    { id: '1', title: 'Senior React Developer', department: 'Engineering', description: 'Looking for an experienced React developer to join our team.', requirements: '5+ years React, TypeScript, Node.js', status: 'Open', createdAt: '2025-01-05' },
    { id: '2', title: 'Sales Representative', department: 'Sales', description: 'Drive revenue growth by acquiring new clients.', requirements: '2+ years B2B sales experience', status: 'Open', createdAt: '2025-01-10' },
  ];
  set(K.jobs, jobs);

  const candidates: HiringCandidate[] = [
    { id: '1', jobId: '1', jobTitle: 'Senior React Developer', name: 'Tom Richards', email: 'tom@email.com', phone: '+1-555-2001', stage: 'Interview', notes: 'Strong portfolio', appliedDate: '2025-01-08' },
    { id: '2', jobId: '1', jobTitle: 'Senior React Developer', name: 'Nancy Drew', email: 'nancy@email.com', phone: '+1-555-2002', stage: 'Applied', notes: '', appliedDate: '2025-01-12' },
    { id: '3', jobId: '2', jobTitle: 'Sales Representative', name: 'Mike Scott', email: 'mike@email.com', phone: '+1-555-2003', stage: 'Offer', notes: 'Excellent closer', appliedDate: '2025-01-09' },
    { id: '4', jobId: '2', jobTitle: 'Sales Representative', name: 'Pam Beesly', email: 'pam@email.com', phone: '+1-555-2004', stage: 'Screening', notes: 'Good communication skills', appliedDate: '2025-01-14' },
  ];
  set(K.candidates, candidates);

  const onboarding: OnboardingTask[] = [
    { id: '1', employeeId: '6', task: 'Send welcome email and first day instructions', completed: true, dueDate: '2023-08-01', completedAt: '2023-08-01' },
    { id: '2', employeeId: '6', task: 'Set up workstation and equipment', completed: true, dueDate: '2023-08-01', completedAt: '2023-08-01' },
    { id: '3', employeeId: '6', task: 'Create email and system accounts', completed: true, dueDate: '2023-08-02', completedAt: '2023-08-02' },
    { id: '4', employeeId: '6', task: 'Complete HR policy orientation', completed: false, dueDate: '2023-08-07' },
    { id: '5', employeeId: '6', task: 'Sign NDA and employment contract', completed: false, dueDate: '2023-08-05' },
  ];
  set(K.onboarding, onboarding);

  const leaves: LeaveApplication[] = [
    { id: '1', employeeId: '2', employeeName: 'Sarah Manager', type: 'Annual', fromDate: '2025-01-20', toDate: '2025-01-22', days: 3, reason: 'Family vacation', status: 'Approved', appliedAt: '2025-01-10' },
    { id: '2', employeeId: '3', employeeName: 'John Employee', type: 'Sick', fromDate: '2025-01-15', toDate: '2025-01-15', days: 1, reason: 'Fever', status: 'Approved', appliedAt: '2025-01-15' },
    { id: '3', employeeId: '4', employeeName: 'Emily Clark', type: 'Annual', fromDate: '2025-02-03', toDate: '2025-02-07', days: 5, reason: 'Holiday trip', status: 'Pending', appliedAt: '2025-01-18' },
    { id: '4', employeeId: '5', employeeName: 'Michael Brown', type: 'Emergency', fromDate: '2025-01-17', toDate: '2025-01-17', days: 1, reason: 'Family emergency', status: 'Approved', appliedAt: '2025-01-17' },
  ];
  set(K.leaves, leaves);

  const today = new Date();
  const attendance: AttendanceRecord[] = [];
  employees.forEach(emp => {
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        attendance.push({ id: `${emp.id}-${i}`, employeeId: emp.id, employeeName: emp.name, date: d.toISOString().split('T')[0], status: i === 1 ? 'WFH' : 'Present' });
      }
    }
  });
  set(K.attendance, attendance);

  const payroll: PayrollRecord[] = employees.map(emp => ({
    id: emp.id, employeeId: emp.id, employeeName: emp.name,
    month: 'January', year: 2025,
    basicSalary: emp.salary / 12,
    allowances: (emp.salary / 12) * 0.1,
    deductions: (emp.salary / 12) * 0.15,
    netSalary: (emp.salary / 12) * 0.95,
    status: 'Processed' as const,
  }));
  set(K.payroll, payroll);

  const performance: PerformanceReview[] = [
    { id: '1', employeeId: '2', employeeName: 'Sarah Manager', period: 'Q4 2024', goals: 'Exceed sales quota by 20%, onboard 3 new enterprise clients', rating: 5, managerComments: 'Exceptional performance, exceeded all targets', selfAssessment: 'Had a great quarter, built strong client relationships', status: 'Reviewed', createdAt: '2025-01-05' },
    { id: '2', employeeId: '3', employeeName: 'John Employee', period: 'Q4 2024', goals: 'Deliver new dashboard feature, reduce bug count by 30%', rating: 4, managerComments: 'Good work, shipped on time with quality code', selfAssessment: 'Learned a lot this quarter, delivered ahead of schedule', status: 'Reviewed', createdAt: '2025-01-06' },
  ];
  set(K.performance, performance);

  const hrDocs: HRDocument[] = [
    { id: '1', employeeId: '2', employeeName: 'Sarah Manager', name: 'Employment Contract', type: 'Contract', fileName: 'sarah_contract.pdf', uploadedAt: '2021-03-15' },
    { id: '2', employeeId: '3', employeeName: 'John Employee', name: 'NDA Agreement', type: 'NDA', fileName: 'john_nda.pdf', uploadedAt: '2022-06-01' },
  ];
  set(K.hrDocs, hrDocs);

  const makeItem = (desc: string, qty: number, rate: number): InvoiceItem => ({ id: crypto.randomUUID(), description: desc, quantity: qty, rate, amount: qty * rate });
  const invoices: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-001', clientName: 'TechCorp', clientEmail: 'billing@techcorp.com', items: [makeItem('Enterprise License Q1', 1, 12000), makeItem('Setup & Onboarding', 5, 200)], subtotal: 13000, tax: 10, discount: 0, total: 14300, status: 'Paid', issueDate: '2025-01-01', dueDate: '2025-01-31', notes: 'Thank you for your business', createdAt: '2025-01-01' },
    { id: '2', invoiceNumber: 'INV-002', clientName: 'DesignCo', clientEmail: 'finance@designco.com', items: [makeItem('Starter Package', 1, 3000)], subtotal: 3000, tax: 10, discount: 5, total: 3135, status: 'Sent', issueDate: '2025-01-10', dueDate: '2025-02-10', notes: '', createdAt: '2025-01-10' },
    { id: '3', invoiceNumber: 'INV-003', clientName: 'FinTech IO', clientEmail: 'ap@fintech.io', items: [makeItem('Platform License', 1, 21250), makeItem('API Calls - Jan', 1000, 0.01)], subtotal: 21260, tax: 10, discount: 0, total: 23386, status: 'Overdue', issueDate: '2024-12-15', dueDate: '2025-01-15', notes: 'Payment overdue', createdAt: '2024-12-15' },
    { id: '4', invoiceNumber: 'INV-004', clientName: 'BigCorp', clientEmail: 'payments@bigcorp.com', items: [makeItem('Annual Contract', 1, 120000)], subtotal: 120000, tax: 10, discount: 10, total: 120000, status: 'Draft', issueDate: '2025-01-20', dueDate: '2025-02-20', notes: 'Draft for review', createdAt: '2025-01-20' },
  ];
  set(K.invoices, invoices);

  const expenses: Expense[] = [
    { id: '1', title: 'AWS Cloud Services', category: 'Software', amount: 2450, date: '2025-01-05', paidBy: 'Company Card', description: 'Monthly AWS bill', status: 'Approved', submittedBy: 'John Employee', createdAt: '2025-01-05' },
    { id: '2', title: 'Sales Conference Flights', category: 'Travel', amount: 1800, date: '2025-01-10', paidBy: 'Sarah Manager', description: 'Flights to NY conference', status: 'Approved', submittedBy: 'Sarah Manager', createdAt: '2025-01-10' },
    { id: '3', title: 'Office Supplies', category: 'Office', amount: 350, date: '2025-01-12', paidBy: 'Company Card', description: 'Stationery and printer cartridges', status: 'Pending', submittedBy: 'Lisa White', createdAt: '2025-01-12' },
    { id: '4', title: 'Team Lunch', category: 'Meals', amount: 420, date: '2025-01-15', paidBy: 'Emily Clark', description: 'Monthly team lunch', status: 'Pending', submittedBy: 'Emily Clark', createdAt: '2025-01-15' },
    { id: '5', title: 'Marketing Tools', category: 'Software', amount: 890, date: '2025-01-08', paidBy: 'Company Card', description: 'HubSpot, Canva, Buffer subscriptions', status: 'Approved', submittedBy: 'Emily Clark', createdAt: '2025-01-08' },
  ];
  set(K.expenses, expenses);

  const budgets: Budget[] = [
    { id: '1', department: 'Engineering', year: 2025, totalBudget: 500000, spent: 180000, category: 'Operations', notes: 'Includes salaries and tools' },
    { id: '2', department: 'Sales', year: 2025, totalBudget: 200000, spent: 145000, category: 'Revenue', notes: 'Sales team budget' },
    { id: '3', department: 'Marketing', year: 2025, totalBudget: 150000, spent: 42000, category: 'Growth', notes: 'Campaigns and events' },
    { id: '4', department: 'HR', year: 2025, totalBudget: 80000, spent: 18000, category: 'People', notes: 'Recruitment and training' },
  ];
  set(K.budgets, budgets);

  const projects: Project[] = [
    { id: '1', name: 'Customer Portal v2', client: 'TechCorp', description: 'Rebuild customer portal with new design system', startDate: '2025-01-01', endDate: '2025-03-31', budget: 80000, status: 'Active', health: 'On Track', team: ['John Employee', 'Emily Clark'], createdAt: '2024-12-15' },
    { id: '2', name: 'Marketing Campaign Q1', client: 'Internal', description: 'Q1 2025 product launch campaign', startDate: '2025-01-15', endDate: '2025-03-15', budget: 45000, status: 'Active', health: 'At Risk', team: ['Emily Clark', 'Sarah Manager'], createdAt: '2025-01-10' },
    { id: '3', name: 'ERP Integration', client: 'FinTech IO', description: 'Integrate our platform with client ERP system', startDate: '2024-11-01', endDate: '2025-01-31', budget: 60000, status: 'On Hold', health: 'Delayed', team: ['John Employee'], createdAt: '2024-10-20' },
  ];
  set(K.projects, projects);

  const tasks: Task[] = [
    { id: '1', projectId: '1', title: 'Design new dashboard UI', description: 'Create Figma mockups for the new dashboard', assignedTo: 'Emily Clark', priority: 'High', status: 'Done', dueDate: '2025-01-15', createdAt: '2025-01-02' },
    { id: '2', projectId: '1', title: 'Implement authentication', description: 'Set up JWT auth with refresh tokens', assignedTo: 'John Employee', priority: 'High', status: 'In Progress', dueDate: '2025-01-25', createdAt: '2025-01-05' },
    { id: '3', projectId: '1', title: 'API integration', description: 'Connect frontend to backend APIs', assignedTo: 'John Employee', priority: 'Medium', status: 'To Do', dueDate: '2025-02-05', createdAt: '2025-01-05' },
    { id: '4', projectId: '2', title: 'Write campaign copy', description: 'Draft all ad copy and email sequences', assignedTo: 'Emily Clark', priority: 'Urgent', status: 'In Progress', dueDate: '2025-01-22', createdAt: '2025-01-15' },
    { id: '5', projectId: '2', title: 'Set up ad campaigns', description: 'Launch Google and LinkedIn ad campaigns', assignedTo: 'Emily Clark', priority: 'High', status: 'To Do', dueDate: '2025-01-28', createdAt: '2025-01-15' },
    { id: '6', title: 'Quarterly board report', description: 'Prepare Q4 2024 board presentation', assignedTo: 'Admin User', priority: 'High', status: 'Review', dueDate: '2025-01-25', createdAt: '2025-01-15' },
    { id: '7', title: 'Update employee handbook', description: 'Review and update HR policies', assignedTo: 'Lisa White', priority: 'Low', status: 'To Do', dueDate: '2025-02-28', createdAt: '2025-01-10' },
    { id: '8', title: 'Process January payroll', description: 'Run payroll for all employees', assignedTo: 'Michael Brown', priority: 'Urgent', status: 'Done', dueDate: '2025-01-31', createdAt: '2025-01-25' },
  ];
  set(K.tasks, tasks);

  const timesheets: Timesheet[] = [
    { id: '1', employeeId: '3', employeeName: 'John Employee', projectId: '1', projectName: 'Customer Portal v2', date: '2025-01-20', hours: 8, description: 'Implemented auth module', billable: true },
    { id: '2', employeeId: '4', employeeName: 'Emily Clark', projectId: '2', projectName: 'Marketing Campaign Q1', date: '2025-01-20', hours: 6, description: 'Wrote ad copy variations', billable: true },
    { id: '3', employeeId: '3', employeeName: 'John Employee', projectId: '1', projectName: 'Customer Portal v2', date: '2025-01-21', hours: 7, description: 'API endpoint development', billable: true },
  ];
  set(K.timesheets, timesheets);

  const products: Product[] = [
    { id: '1', name: 'Laptop Dell XPS 15', sku: 'LAP-001', category: 'Electronics', unit: 'Unit', costPrice: 1200, sellingPrice: 1500, currentStock: 15, reorderLevel: 5, description: 'High-performance laptop', createdAt: '2024-01-01' },
    { id: '2', name: 'Office Chair Ergonomic', sku: 'FUR-001', category: 'Furniture', unit: 'Unit', costPrice: 300, sellingPrice: 450, currentStock: 8, reorderLevel: 3, description: 'Ergonomic office chair', createdAt: '2024-01-01' },
    { id: '3', name: 'A4 Paper Ream', sku: 'SUP-001', category: 'Supplies', unit: 'Ream', costPrice: 5, sellingPrice: 8, currentStock: 3, reorderLevel: 20, description: '500 sheets per ream', createdAt: '2024-01-01' },
    { id: '4', name: 'Wireless Mouse', sku: 'ACC-001', category: 'Electronics', unit: 'Unit', costPrice: 25, sellingPrice: 45, currentStock: 30, reorderLevel: 10, description: 'Bluetooth wireless mouse', createdAt: '2024-01-01' },
    { id: '5', name: 'Monitor 27" 4K', sku: 'MON-001', category: 'Electronics', unit: 'Unit', costPrice: 400, sellingPrice: 600, currentStock: 7, reorderLevel: 5, description: '27 inch 4K display', createdAt: '2024-01-01' },
  ];
  set(K.products, products);

  const stock: StockMovement[] = [
    { id: '1', productId: '1', productName: 'Laptop Dell XPS 15', type: 'In', quantity: 10, reason: 'Purchase Order PO-001', date: '2025-01-05', createdAt: '2025-01-05' },
    { id: '2', productId: '3', productName: 'A4 Paper Ream', type: 'Out', quantity: 17, reason: 'Office usage', date: '2025-01-10', createdAt: '2025-01-10' },
    { id: '3', productId: '4', productName: 'Wireless Mouse', type: 'In', quantity: 20, reason: 'Purchase Order PO-002', date: '2025-01-12', createdAt: '2025-01-12' },
    { id: '4', productId: '2', productName: 'Office Chair Ergonomic', type: 'Out', quantity: 2, reason: 'New hires', date: '2025-01-15', createdAt: '2025-01-15' },
  ];
  set(K.stock, stock);

  const vendors: Vendor[] = [
    { id: '1', name: 'Dell Technologies', email: 'sales@dell.com', phone: '+1-800-999-3355', category: 'Electronics', paymentTerms: 'Net 30', address: 'Round Rock, TX', rating: 5, notes: 'Primary hardware supplier', createdAt: '2023-01-01' },
    { id: '2', name: 'Office Depot', email: 'business@officedepot.com', phone: '+1-800-463-3768', category: 'Office Supplies', paymentTerms: 'Net 15', address: 'Boca Raton, FL', rating: 4, notes: 'Office supplies vendor', createdAt: '2023-01-01' },
    { id: '3', name: 'Amazon Business', email: 'business@amazon.com', phone: '+1-888-280-4331', category: 'General', paymentTerms: 'Net 30', address: 'Seattle, WA', rating: 4, notes: 'General procurement', createdAt: '2023-06-01' },
  ];
  set(K.vendors, vendors);

  const pos: PurchaseOrder[] = [
    { id: '1', poNumber: 'PO-001', vendorId: '1', vendorName: 'Dell Technologies', items: [{ id: '1', productName: 'Laptop Dell XPS 15', quantity: 10, unitPrice: 1200, total: 12000 }], total: 12000, status: 'Received', orderDate: '2025-01-03', expectedDelivery: '2025-01-10', notes: 'Urgent order for new hires', createdAt: '2025-01-03' },
    { id: '2', poNumber: 'PO-002', vendorId: '2', vendorName: 'Office Depot', items: [{ id: '1', productName: 'Wireless Mouse', quantity: 20, unitPrice: 25, total: 500 }, { id: '2', productName: 'A4 Paper Ream', quantity: 50, unitPrice: 5, total: 250 }], total: 750, status: 'Sent', orderDate: '2025-01-10', expectedDelivery: '2025-01-17', notes: '', createdAt: '2025-01-10' },
  ];
  set(K.pos, pos);

  const tickets: Ticket[] = [
    { id: '1', ticketNumber: 'TKT-001', subject: 'Cannot login to portal', description: 'Getting 401 error when trying to login', category: 'Technical', priority: 'High', status: 'Resolved', assignedTo: 'John Employee', submittedBy: 'Michael Brown', notes: 'Fixed - password reset required', createdAt: '2025-01-10' },
    { id: '2', ticketNumber: 'TKT-002', subject: 'Invoice not received', description: 'Invoice INV-002 was not received by client', category: 'Billing', priority: 'Medium', status: 'Open', assignedTo: 'Sarah Manager', submittedBy: 'Emily Clark', notes: '', createdAt: '2025-01-15' },
    { id: '3', ticketNumber: 'TKT-003', subject: 'Feature request: dark mode', description: 'Would love a dark mode option in the app', category: 'Feature Request', priority: 'Low', status: 'On Hold', assignedTo: 'John Employee', submittedBy: 'Lisa White', notes: 'Backlogged for Q2', createdAt: '2025-01-12' },
    { id: '4', ticketNumber: 'TKT-004', subject: 'Slow dashboard loading', description: 'Dashboard takes 10+ seconds to load', category: 'Technical', priority: 'High', status: 'In Progress', assignedTo: 'John Employee', submittedBy: 'Sarah Manager', notes: 'Investigating database queries', createdAt: '2025-01-18' },
    { id: '5', ticketNumber: 'TKT-005', subject: 'Export to CSV not working', description: 'CSV export button does nothing when clicked', category: 'Bug', priority: 'Medium', status: 'Open', assignedTo: 'John Employee', submittedBy: 'Michael Brown', notes: '', createdAt: '2025-01-19' },
  ];
  set(K.tickets, tickets);

  const kb: KBArticle[] = [
    { id: '1', title: 'Getting Started with OrgOS', category: 'General', content: 'Welcome to OrgOS! This guide will help you get started with our platform.\n\n## First Steps\n1. Log in with your credentials\n2. Complete your profile\n3. Explore the dashboard\n\n## Key Features\n- CRM for managing clients\n- HR module for employee management\n- Finance tools for invoicing', status: 'Published', author: 'Admin User', createdAt: '2024-12-01' },
    { id: '2', title: 'How to Create an Invoice', category: 'Finance', content: 'Creating invoices in OrgOS is simple.\n\n## Steps\n1. Go to Finance → Invoices\n2. Click "New Invoice"\n3. Fill in client details\n4. Add line items\n5. Set tax and discount\n6. Save as Draft or send immediately', status: 'Published', author: 'Admin User', createdAt: '2024-12-15' },
    { id: '3', title: 'Leave Application Process', category: 'HR', content: 'How to apply for leave:\n\n1. Go to HR → Leave Management\n2. Click "Apply for Leave"\n3. Select leave type, dates, and provide reason\n4. Submit for manager approval\n\nYou will be notified when your leave is approved or rejected.', status: 'Published', author: 'Lisa White', createdAt: '2025-01-05' },
  ];
  set(K.kb, kb);

  const assets: Asset[] = [
    { id: '1', name: 'MacBook Pro 16"', type: 'Laptop', serialNumber: 'C02ZM1JXMD6T', purchaseDate: '2023-01-15', cost: 2499, assignedTo: 'John Employee', location: 'Office Floor 2', status: 'Assigned', notes: 'M2 Pro chip', createdAt: '2023-01-15' },
    { id: '2', name: 'Dell Monitor 27"', type: 'Monitor', serialNumber: 'DL27M4K-2023', purchaseDate: '2023-01-15', cost: 599, assignedTo: 'Sarah Manager', location: 'Office Floor 1', status: 'Assigned', notes: '4K display', createdAt: '2023-01-15' },
    { id: '3', name: 'HP LaserJet Pro', type: 'Printer', serialNumber: 'HP-LJ-2022-001', purchaseDate: '2022-06-01', cost: 450, assignedTo: '', location: 'Office Common Area', status: 'Available', notes: 'Shared printer', createdAt: '2022-06-01' },
    { id: '4', name: 'Company Van', type: 'Vehicle', serialNumber: 'VIN1234567890', purchaseDate: '2021-03-01', cost: 35000, assignedTo: '', location: 'Parking Lot B', status: 'Under Maintenance', notes: 'Annual service due', createdAt: '2021-03-01' },
  ];
  set(K.assets, assets);

  const announcements: Announcement[] = [
    { id: '1', title: 'Office Closed - Public Holiday', content: 'The office will be closed on January 26th for Republic Day. Enjoy the long weekend!', department: 'All', priority: 'Important', pinned: true, createdBy: 'Admin User', createdAt: '2025-01-20' },
    { id: '2', title: 'Q1 All-Hands Meeting', content: 'Our quarterly all-hands meeting is scheduled for February 5th at 10 AM. All employees must attend. Agenda will be shared separately.', department: 'All', priority: 'Normal', pinned: false, createdBy: 'Admin User', createdAt: '2025-01-18' },
    { id: '3', title: 'New HR Policy Update', content: 'We have updated our remote work policy. Please review the updated Employee Handbook in the Documents section. Changes effective February 1st.', department: 'All', priority: 'Important', pinned: false, createdBy: 'Lisa White', createdAt: '2025-01-15' },
  ];
  set(K.announcements, announcements);

  const notifications: AppNotification[] = [
    { id: '1', title: 'Leave Request Pending', message: 'Emily Clark has submitted a leave request for Feb 3-7', type: 'warning', read: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Invoice Overdue', message: 'Invoice INV-003 for FinTech IO is overdue by 7 days', type: 'error', read: false, createdAt: new Date().toISOString() },
    { id: '3', title: 'New Lead Added', message: 'Robert Chen from BigCorp added as new lead', type: 'info', read: true, createdAt: new Date().toISOString() },
  ];
  set(K.notifications, notifications);

  localStorage.setItem(K.initialized, 'true');
}
