'use client';

import { useState, useEffect } from 'react';
import { getStore } from '@/lib/store';
import { Company, Contact } from '@/lib/types';
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
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
      />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-1">Компании не найдены</h3>
    <p className="text-gray-500 text-sm">Начните с добавления первой компании</p>
  </div>
);

interface CompanyFormData {
  name: string;
  industry: string;
  website: string;
  phone: string;
  address: string;
  notes: string;
}

interface ConfirmDeleteState {
  isOpen: boolean;
  companyId: string | null;
  companyName: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    isOpen: false,
    companyId: null,
    companyName: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
    website: '',
    phone: '',
    address: '',
    notes: '',
  });

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const store = getStore();
        const loadedCompanies = store.getCompanies();
        setCompanies(loadedCompanies);
        setFilteredCompanies(loadedCompanies);
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter companies based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCompanies(companies);
    } else {
      const store = getStore();
      const results = store.searchCompanies(searchQuery);
      setFilteredCompanies(results);
    }
  }, [searchQuery, companies]);

  // Show success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getAssociatedContactsCount = (companyId: string) => {
    const store = getStore();
    return store.getContactsByCompany(companyId).length;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      website: '',
      phone: '',
      address: '',
      notes: '',
    });
  };

  const handleAddCompany = () => {
    resetForm();
    setEditingCompanyId(null);
    setIsCreateModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setFormData({
      name: company.name,
      industry: company.industry,
      website: company.website,
      phone: company.phone,
      address: company.address,
      notes: company.notes,
    });
    setEditingCompanyId(company.id);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (company: Company) => {
    setConfirmDelete({
      isOpen: true,
      companyId: company.id,
      companyName: company.name,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.companyId) {
      try {
        const store = getStore();
        store.deleteCompany(confirmDelete.companyId);
        setCompanies(store.getCompanies());
        setSuccessMessage('Компания удалена успешно');
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
    setConfirmDelete({ isOpen: false, companyId: null, companyName: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Пожалуйста, заполните название компании');
      return;
    }

    try {
      const store = getStore();

      if (editingCompanyId) {
        // Update company
        store.updateCompany(editingCompanyId, {
          name: formData.name.trim(),
          industry: formData.industry.trim(),
          website: formData.website.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          notes: formData.notes.trim(),
        });
        setSuccessMessage('Компания обновлена успешно');
        setIsEditModalOpen(false);
      } else {
        // Create company
        store.createCompany({
          name: formData.name.trim(),
          industry: formData.industry.trim(),
          website: formData.website.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          notes: formData.notes.trim(),
        });
        setSuccessMessage('Компания добавлена успешно');
        setIsCreateModalOpen(false);
      }

      setCompanies(store.getCompanies());
      resetForm();
    } catch (error) {
      console.error('Failed to save company:', error);
      alert('Ошибка при сохранении компании');
    }
  };

  const isValidUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Компании</h1>
          <p className="text-gray-600">Управление корпоративными клиентами и партнерами</p>
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
              placeholder="Поиск по названию, отрасли..."
            />
          </div>
          <button
            onClick={handleAddCompany}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <span>+</span>
            <span>Добавить компанию</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {loading ? (
            <LoadingSpinner />
          ) : filteredCompanies.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Название</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Отрасль</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Телефон</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Сайт</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Адрес</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Контакты</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditCompany(company)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{company.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.industry}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{company.phone}</td>
                      <td className="px-6 py-4 text-sm">
                        {isValidUrl(company.website) ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Перейти
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">{company.address}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getAssociatedContactsCount(company.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            Изменить
                          </button>
                          <button
                            onClick={() => handleDeleteClick(company)}
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
        title="Добавить компанию"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название компании"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отрасль
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Информационные технологии"
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
              placeholder="+7 (495) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сайт
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адрес
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Москва, ул. Тверская, д. 10"
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
        title="Изменить компанию"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название компании"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отрасль
            </label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Информационные технологии"
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
              placeholder="+7 (495) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сайт
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адрес
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Москва, ул. Тверская, д. 10"
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
        onClose={() => setConfirmDelete({ isOpen: false, companyId: null, companyName: '' })}
        title="Удалить компанию"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Вы уверены, что хотите удалить компанию <strong>{confirmDelete.companyName}</strong>? Это действие невозможно отменить.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setConfirmDelete({ isOpen: false, companyId: null, companyName: '' })}
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
