'use client';

import { useState, useEffect } from 'react';
import { getStore } from '@/lib/store';
import { Contact, Company } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import Modal from '@/components/Modal';
import SearchInput from '@/components/SearchInput';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
        <svg
          className="w-5 h-5 text-blue-600 animate-spin"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
      <p className="text-gray-600 font-medium text-sm">Загрузка...</p>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <svg
      className="w-16 h-16 text-gray-300 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a6 6 0 0112 0v2H6v-2z"
      />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-1">Контакты не найдены</h3>
    <p className="text-gray-500 text-sm">Начните с добавления первого контакта</p>
  </div>
);

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string;
  position: string;
  notes: string;
}

interface ConfirmDeleteState {
  isOpen: boolean;
  contactId: string | null;
  contactName: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    isOpen: false,
    contactId: null,
    contactName: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyId: '',
    position: '',
    notes: '',
  });

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const store = getStore();
        const loadedContacts = store.getContacts();
        const loadedCompanies = store.getCompanies();
        setContacts(loadedContacts);
        setCompanies(loadedCompanies);
        setFilteredContacts(loadedContacts);
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter contacts based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const store = getStore();
      const results = store.searchContacts(searchQuery);
      setFilteredContacts(results);
    }
  }, [searchQuery, contacts]);

  // Show success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return '-';
    const company = companies.find((c) => c.id === companyId);
    return company?.name || '-';
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyId: '',
      position: '',
      notes: '',
    });
  };

  const handleAddContact = () => {
    resetForm();
    setEditingContactId(null);
    setIsCreateModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setFormData({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      companyId: contact.companyId || '',
      position: contact.position,
      notes: contact.notes,
    });
    setEditingContactId(contact.id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (contact: Contact) => {
    setConfirmDelete({
      isOpen: true,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.contactId) {
      try {
        const store = getStore();
        store.deleteContact(confirmDelete.contactId);
        setContacts(store.getContacts());
        setSuccessMessage('Контакт удален успешно');
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
    setConfirmDelete({ isOpen: false, contactId: null, contactName: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Пожалуйста, заполните обязательные поля');
      return;
    }

    try {
      const store = getStore();

      if (editingContactId) {
        // Update contact
        store.updateContact(editingContactId, {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          companyId: formData.companyId || null,
          position: formData.position.trim(),
          notes: formData.notes.trim(),
        });
        setSuccessMessage('Контакт обновлен успешно');
        setIsEditModalOpen(false);
      } else {
        // Create contact
        store.createContact({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          companyId: formData.companyId || null,
          position: formData.position.trim(),
          notes: formData.notes.trim(),
        });
        setSuccessMessage('Контакт добавлен успешно');
        setIsCreateModalOpen(false);
      }

      setContacts(store.getContacts());
      resetForm();
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Ошибка при сохранении контакта');
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Контакты</h1>
          <p className="text-gray-600">Управление контактами и коммуникациями</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 w-full md:max-w-xs">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по имени, email, телефону..."
            />
          </div>
          <button
            onClick={handleAddContact}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <span>+</span>
            <span>Добавить контакт</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <LoadingSpinner />
          ) : filteredContacts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Имя</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Телефон</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Компания</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Должность</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditContact(contact)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCompanyName(contact.companyId)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{contact.position}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteClick(contact)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Добавить контакт"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Фамилия"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Компания
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не выбрана</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Должность
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Должность"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Добавьте примечания..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Добавить
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Изменить контакт"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Имя"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Фамилия"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Компания
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Не выбрана</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Должность
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Должность"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Примечания
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Добавьте примечания..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Сохранить
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, contactId: null, contactName: '' })}
        title="Удалить контакт"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Вы уверены, что хотите удалить контакт <strong>{confirmDelete.contactName}</strong>? Это действие невозможно отменить.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDelete({ isOpen: false, contactId: null, contactName: '' })}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      </Modal>
    </AuthGuard>
  );
}
