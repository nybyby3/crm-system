export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string | null;
  position: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  contactId: string | null;
  companyId: string | null;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  contactId: string | null;
  dealId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalDealValue: number;
  wonDealsValue: number;
  openTasks: number;
  dealsByStage: Record<DealStage, number>;
  dealValueByStage: Record<DealStage, number>;
  recentActivity: ActivityItem[];
  monthlyDeals: { month: string; value: number; count: number }[];
}

export interface ActivityItem {
  id: string;
  type: 'contact' | 'company' | 'deal' | 'task';
  action: string;
  name: string;
  date: string;
}
