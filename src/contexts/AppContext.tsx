import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppData, Lead, Contact, Company, Deal, Task, Note } from '../types';
import { loadData, saveData, generateId, now } from '../store/storage';

interface AppContextType {
  data: AppData;
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, lead: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  // Contacts
  addContact: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, c: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  // Companies
  addCompany: (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCompany: (id: string, c: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  // Deals
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, d: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  // Tasks
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  // Notes
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, n: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [searchQuery, setSearchQuery] = useState('');

  const update = useCallback((updater: (d: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, leads: [...d.leads, { ...lead, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateLead = (id: string, lead: Partial<Lead>) =>
    update(d => ({ ...d, leads: d.leads.map(l => l.id === id ? { ...l, ...lead, updatedAt: now() } : l) }));
  const deleteLead = (id: string) =>
    update(d => ({ ...d, leads: d.leads.filter(l => l.id !== id) }));

  const addContact = (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, contacts: [...d.contacts, { ...c, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateContact = (id: string, c: Partial<Contact>) =>
    update(d => ({ ...d, contacts: d.contacts.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x) }));
  const deleteContact = (id: string) =>
    update(d => ({ ...d, contacts: d.contacts.filter(x => x.id !== id) }));

  const addCompany = (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, companies: [...d.companies, { ...c, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateCompany = (id: string, c: Partial<Company>) =>
    update(d => ({ ...d, companies: d.companies.map(x => x.id === id ? { ...x, ...c, updatedAt: now() } : x) }));
  const deleteCompany = (id: string) =>
    update(d => ({ ...d, companies: d.companies.filter(x => x.id !== id) }));

  const addDeal = (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, deals: [...d.deals, { ...deal, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateDeal = (id: string, deal: Partial<Deal>) =>
    update(d => ({ ...d, deals: d.deals.map(x => x.id === id ? { ...x, ...deal, updatedAt: now() } : x) }));
  const deleteDeal = (id: string) =>
    update(d => ({ ...d, deals: d.deals.filter(x => x.id !== id) }));

  const addTask = (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, tasks: [...d.tasks, { ...t, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateTask = (id: string, t: Partial<Task>) =>
    update(d => ({ ...d, tasks: d.tasks.map(x => x.id === id ? { ...x, ...t, updatedAt: now() } : x) }));
  const deleteTask = (id: string) =>
    update(d => ({ ...d, tasks: d.tasks.filter(x => x.id !== id) }));

  const addNote = (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
    update(d => ({ ...d, notes: [...d.notes, { ...n, id: generateId(), createdAt: now(), updatedAt: now() }] }));
  const updateNote = (id: string, n: Partial<Note>) =>
    update(d => ({ ...d, notes: d.notes.map(x => x.id === id ? { ...x, ...n, updatedAt: now() } : x) }));
  const deleteNote = (id: string) =>
    update(d => ({ ...d, notes: d.notes.filter(x => x.id !== id) }));

  return (
    <AppContext.Provider value={{
      data, searchQuery, setSearchQuery,
      addLead, updateLead, deleteLead,
      addContact, updateContact, deleteContact,
      addCompany, updateCompany, deleteCompany,
      addDeal, updateDeal, deleteDeal,
      addTask, updateTask, deleteTask,
      addNote, updateNote, deleteNote,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
