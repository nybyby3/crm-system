import {
  User,
  Contact,
  Company,
  Deal,
  Task,
  DealStage,
  DashboardStats,
  ActivityItem,
} from './types';

const STORE_KEYS = {
  CONTACTS: 'crm_contacts',
  COMPANIES: 'crm_companies',
  DEALS: 'crm_deals',
  TASKS: 'crm_tasks',
  USERS: 'crm_users',
} as const;

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function generateSeedContacts(): Contact[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan.petrov@example.com',
      phone: '+7 (999) 123-45-67',
      companyId: null,
      position: 'Генеральный директор',
      notes: 'Ключевой контакт для проектов по внедрению CRM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      firstName: 'Мария',
      lastName: 'Смирнова',
      email: 'maria.smirnova@example.com',
      phone: '+7 (999) 234-56-78',
      companyId: null,
      position: 'Руководитель отдела продаж',
      notes: 'Заинтересована в автоматизации процессов продаж',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      firstName: 'Сергей',
      lastName: 'Иванов',
      email: 'sergey.ivanov@example.com',
      phone: '+7 (999) 345-67-89',
      companyId: null,
      position: 'IT-директор',
      notes: 'Отвечает за внедрение новых систем',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      firstName: 'Александр',
      lastName: 'Волков',
      email: 'alex.volkov@example.com',
      phone: '+7 (999) 456-78-90',
      companyId: null,
      position: 'Менеджер проектов',
      notes: 'Опытный специалист в области управления проектами',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function generateSeedCompanies(): Company[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      name: 'ТехноСофт',
      industry: 'Информационные технологии',
      website: 'https://technosoft.example.com',
      phone: '+7 (495) 123-45-67',
      address: 'Москва, ул. Тверская, д. 10',
      notes: 'Компания специализируется на разработке ПО для ERP систем',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Гравер Торговля',
      industry: 'Розничная торговля',
      website: 'https://graver.example.com',
      phone: '+7 (495) 234-56-78',
      address: 'Санкт-Петербург, пр. Невский, д. 25',
      notes: 'Сеть розничных магазинов с потенциалом расширения',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'Логистика Плюс',
      industry: 'Логистика и транспорт',
      website: 'https://logisticaplus.example.com',
      phone: '+7 (495) 345-67-89',
      address: 'Екатеринбург, ул. Малышева, д. 42',
      notes: 'Крупная логистическая компания ищет решение для управления складом',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      name: 'МедиаГруп Консалтинг',
      industry: 'Консалтинг и услуги',
      website: 'https://mediagrp.example.com',
      phone: '+7 (495) 456-78-90',
      address: 'Москва, Красная площадь, д. 1',
      notes: 'Консультационная компания со средним бюджетом на IT',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function generateSeedDeals(companies: Company[]): Deal[] {
  const now = new Date().toISOString();
  const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  
  return [
    {
      id: generateId(),
      title: 'Внедрение CRM системы',
      value: 500000,
      stage: 'proposal',
      contactId: null,
      companyId: companies[0]?.id || null,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Планируется внедрение на 3 месяца с обучением сотрудников',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Модернизация системы управления складом',
      value: 750000,
      stage: 'negotiation',
      contactId: null,
      companyId: companies[2]?.id || null,
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Интеграция с существующей системой учета',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Система управления клиентами для розничной сети',
      value: 300000,
      stage: 'qualified',
      contactId: null,
      companyId: companies[1]?.id || null,
      expectedCloseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Требуется с готовыми отчетами по продажам',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Консультация по IT стратегии',
      value: 150000,
      stage: 'closed_won',
      contactId: null,
      companyId: companies[3]?.id || null,
      expectedCloseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Успешно завершено в апреле 2026',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: now,
    },
  ];
}

function generateSeedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      title: 'Подготовить презентацию для клиента ТехноСофт',
      description: 'Создать детальную презентацию с расчетом ROI',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      contactId: null,
      dealId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Обсудить условия договора с юристом',
      description: 'Согласовать основные условия договора обслуживания',
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      contactId: null,
      dealId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Провести демонстрацию для команды Логистика Плюс',
      description: 'Показать ключевые функции системы управления складом',
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      contactId: null,
      dealId: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: 'Отправить счет МедиаГруп Консалтинг',
      description: 'Счет за консультационные услуги',
      priority: 'medium',
      status: 'done',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      contactId: null,
      dealId: null,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

function generateSeedUsers(): User[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      email: 'admin@example.com',
      name: 'Администратор',
      passwordHash: 'base64hash:admin123salt',
      createdAt: now,
    },
  ];
}

export class CRMStore {
  private contactsKey = STORE_KEYS.CONTACTS;
  private companiesKey = STORE_KEYS.COMPANIES;
  private dealsKey = STORE_KEYS.DEALS;
  private tasksKey = STORE_KEYS.TASKS;
  private usersKey = STORE_KEYS.USERS;

  constructor() {
    this.initializeStore();
  }

  private initializeStore(): void {
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      if (!storage.getItem(this.contactsKey)) {
        storage.setItem(this.contactsKey, JSON.stringify(generateSeedContacts()));
      }
      if (!storage.getItem(this.companiesKey)) {
        storage.setItem(this.companiesKey, JSON.stringify(generateSeedCompanies()));
      }
      if (!storage.getItem(this.dealsKey)) {
        const companies = this.getAll<Company>(this.companiesKey);
        storage.setItem(this.dealsKey, JSON.stringify(generateSeedDeals(companies)));
      }
      if (!storage.getItem(this.tasksKey)) {
        storage.setItem(this.tasksKey, JSON.stringify(generateSeedTasks()));
      }
      if (!storage.getItem(this.usersKey)) {
        storage.setItem(this.usersKey, JSON.stringify(generateSeedUsers()));
      }
    } catch (error) {
      console.warn('Failed to initialize store:', error);
    }
  }

  private getAll<T>(key: string): T[] {
    const storage = getLocalStorage();
    if (!storage) return [];

    try {
      const data = storage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn(`Failed to get all items from ${key}:`, error);
      return [];
    }
  }

  private getById<T extends { id: string }>(key: string, id: string): T | null {
    const items = this.getAll<T>(key);
    return items.find((item) => item.id === id) || null;
  }

  private create<T extends { id?: string }>(key: string, item: Omit<T, 'id'>): T {
    const storage = getLocalStorage();
    if (!storage) throw new Error('localStorage not available');

    try {
      const items = this.getAll<T>(key);
      const newItem = { ...item, id: generateId() } as T;
      items.push(newItem);
      storage.setItem(key, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error(`Failed to create item in ${key}:`, error);
      throw error;
    }
  }

  private update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
    const storage = getLocalStorage();
    if (!storage) throw new Error('localStorage not available');

    try {
      const items = this.getAll<T>(key);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return null;

      const updated = { ...items[index], ...updates };
      items[index] = updated;
      storage.setItem(key, JSON.stringify(items));
      return updated;
    } catch (error) {
      console.error(`Failed to update item in ${key}:`, error);
      throw error;
    }
  }

  private delete(key: string, id: string): boolean {
    const storage = getLocalStorage();
    if (!storage) throw new Error('localStorage not available');

    try {
      const items = this.getAll<{ id: string }>(key);
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;

      storage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error(`Failed to delete item from ${key}:`, error);
      throw error;
    }
  }

  // Contacts
  getContacts(): Contact[] {
    return this.getAll<Contact>(this.contactsKey);
  }

  getContact(id: string): Contact | null {
    return this.getById<Contact>(this.contactsKey, id);
  }

  createContact(data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact {
    const now = new Date().toISOString();
    return this.create<Contact>(this.contactsKey, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateContact(id: string, data: Partial<Omit<Contact, 'id' | 'createdAt'>>): Contact | null {
    const now = new Date().toISOString();
    return this.update<Contact>(this.contactsKey, id, {
      ...data,
      updatedAt: now,
    });
  }

  deleteContact(id: string): boolean {
    return this.delete(this.contactsKey, id);
  }

  searchContacts(query: string): Contact[] {
    const contacts = this.getContacts();
    const lowerQuery = query.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(lowerQuery) ||
        contact.lastName.toLowerCase().includes(lowerQuery) ||
        contact.email.toLowerCase().includes(lowerQuery) ||
        contact.phone.includes(query)
    );
  }

  getContactsByCompany(companyId: string): Contact[] {
    const contacts = this.getContacts();
    return contacts.filter((contact) => contact.companyId === companyId);
  }

  // Companies
  getCompanies(): Company[] {
    return this.getAll<Company>(this.companiesKey);
  }

  getCompany(id: string): Company | null {
    return this.getById<Company>(this.companiesKey, id);
  }

  createCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company {
    const now = new Date().toISOString();
    return this.create<Company>(this.companiesKey, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateCompany(id: string, data: Partial<Omit<Company, 'id' | 'createdAt'>>): Company | null {
    const now = new Date().toISOString();
    return this.update<Company>(this.companiesKey, id, {
      ...data,
      updatedAt: now,
    });
  }

  deleteCompany(id: string): boolean {
    return this.delete(this.companiesKey, id);
  }

  searchCompanies(query: string): Company[] {
    const companies = this.getCompanies();
    const lowerQuery = query.toLowerCase();
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(lowerQuery) ||
        company.industry.toLowerCase().includes(lowerQuery) ||
        company.phone.includes(query)
    );
  }

  // Deals
  getDeals(): Deal[] {
    return this.getAll<Deal>(this.dealsKey);
  }

  getDeal(id: string): Deal | null {
    return this.getById<Deal>(this.dealsKey, id);
  }

  createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal {
    const now = new Date().toISOString();
    return this.create<Deal>(this.dealsKey, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateDeal(id: string, data: Partial<Omit<Deal, 'id' | 'createdAt'>>): Deal | null {
    const now = new Date().toISOString();
    return this.update<Deal>(this.dealsKey, id, {
      ...data,
      updatedAt: now,
    });
  }

  deleteDeal(id: string): boolean {
    return this.delete(this.dealsKey, id);
  }

  getDealsByCompany(companyId: string): Deal[] {
    const deals = this.getDeals();
    return deals.filter((deal) => deal.companyId === companyId);
  }

  getDealsByContact(contactId: string): Deal[] {
    const deals = this.getDeals();
    return deals.filter((deal) => deal.contactId === contactId);
  }

  getDealsByStage(stage: DealStage): Deal[] {
    const deals = this.getDeals();
    return deals.filter((deal) => deal.stage === stage);
  }

  // Tasks
  getTasks(): Task[] {
    return this.getAll<Task>(this.tasksKey);
  }

  getTask(id: string): Task | null {
    return this.getById<Task>(this.tasksKey, id);
  }

  createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    return this.create<Task>(this.tasksKey, {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    const now = new Date().toISOString();
    return this.update<Task>(this.tasksKey, id, {
      ...data,
      updatedAt: now,
    });
  }

  deleteTask(id: string): boolean {
    return this.delete(this.tasksKey, id);
  }

  getTasksByContact(contactId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.contactId === contactId);
  }

  getTasksByDeal(dealId: string): Task[] {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.dealId === dealId);
  }

  // Users
  getUsers(): User[] {
    return this.getAll<User>(this.usersKey);
  }

  getUser(id: string): User | null {
    return this.getById<User>(this.usersKey, id);
  }

  createUser(data: Omit<User, 'id' | 'createdAt'>): User {
    const now = new Date().toISOString();
    return this.create<User>(this.usersKey, {
      ...data,
      createdAt: now,
    });
  }

  updateUser(id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
    return this.update<User>(this.usersKey, id, data);
  }

  deleteUser(id: string): boolean {
    return this.delete(this.usersKey, id);
  }

  // Dashboard Stats
  getDashboardStats(): DashboardStats {
    const contacts = this.getContacts();
    const companies = this.getCompanies();
    const deals = this.getDeals();
    const tasks = this.getTasks();

    // Calculate deal stats
    const dealsByStage: Record<DealStage, number> = {
      lead: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    const dealValueByStage: Record<DealStage, number> = {
      lead: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      closed_won: 0,
      closed_lost: 0,
    };

    let totalDealValue = 0;
    let wonDealsValue = 0;

    deals.forEach((deal) => {
      dealsByStage[deal.stage]++;
      dealValueByStage[deal.stage] += deal.value;
      totalDealValue += deal.value;
      if (deal.stage === 'closed_won') {
        wonDealsValue += deal.value;
      }
    });

    // Calculate monthly deals for last 6 months
    const monthlyDeals: { month: string; value: number; count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toLocaleString('ru-RU', { month: 'short', year: '2-digit' });
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthDeals = deals.filter((deal) => {
        const dealDate = new Date(deal.createdAt);
        return dealDate >= startOfMonth && dealDate <= endOfMonth;
      });

      const value = monthDeals.reduce((sum, deal) => sum + deal.value, 0);
      monthlyDeals.push({
        month: monthStr,
        value,
        count: monthDeals.length,
      });
    }

    // Get recent activity (last 10 items)
    const allActivity: ActivityItem[] = [];

    contacts.forEach((contact) => {
      allActivity.push({
        id: contact.id,
        type: 'contact',
        action: 'создан',
        name: `${contact.firstName} ${contact.lastName}`,
        date: contact.updatedAt,
      });
    });

    companies.forEach((company) => {
      allActivity.push({
        id: company.id,
        type: 'company',
        action: 'создана',
        name: company.name,
        date: company.updatedAt,
      });
    });

    deals.forEach((deal) => {
      allActivity.push({
        id: deal.id,
        type: 'deal',
        action: 'создана',
        name: deal.title,
        date: deal.updatedAt,
      });
    });

    tasks.forEach((task) => {
      allActivity.push({
        id: task.id,
        type: 'task',
        action: 'создана',
        name: task.title,
        date: task.updatedAt,
      });
    });

    const recentActivity = allActivity
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const openTasks = tasks.filter((task) => task.status !== 'done').length;

    return {
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      totalDeals: deals.length,
      totalDealValue,
      wonDealsValue,
      openTasks,
      dealsByStage,
      dealValueByStage,
      recentActivity,
      monthlyDeals,
    };
  }

  // Utility: clear all data (for testing)
  clearAll(): void {
    const storage = getLocalStorage();
    if (!storage) return;

    try {
      storage.removeItem(this.contactsKey);
      storage.removeItem(this.companiesKey);
      storage.removeItem(this.dealsKey);
      storage.removeItem(this.tasksKey);
      storage.removeItem(this.usersKey);
      this.initializeStore();
    } catch (error) {
      console.warn('Failed to clear store:', error);
    }
  }
}

// Singleton instance
let storeInstance: CRMStore | null = null;

export function getStore(): CRMStore {
  if (!storeInstance) {
    storeInstance = new CRMStore();
  }
  return storeInstance;
}
