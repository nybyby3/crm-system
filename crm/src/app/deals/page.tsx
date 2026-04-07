'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Modal from '@/components/Modal';
import { Deal, DealStage, Contact, Company } from '@/lib/types';
import { getStore } from '@/lib/store';

const STAGES: { key: DealStage; label: string; color: string; bgColor: string }[] = [
  { key: 'lead', label: 'Лид', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  { key: 'qualified', label: 'Квалификация', color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200' },
  { key: 'proposal', label: 'Предложение', color: 'text-yellow-700', bgColor: 'bg-yellow-50 border-yellow-200' },
  { key: 'negotiation', label: 'Переговоры', color: 'text-purple-700', bgColor: 'bg-purple-50 border-purple-200' },
  { key: 'closed_won', label: 'Выиграна', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  { key: 'closed_lost', label: 'Проиграна', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
];

interface FormData {
  title: string;
  value: string;
  stage: DealStage;
  contactId: string;
  companyId: string;
  expectedCloseDate: string;
  notes: string;
}

const initialFormData: FormData = {
  title: '',
  value: '',
  stage: 'lead',
  contactId: '',
  companyId: '',
  expectedCloseDate: '',
  notes: '',
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const store = getStore();
      setDeals(store.getDeals());
      setContacts(store.getContacts());
      setCompanies(store.getCompanies());
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const getContactName = (contactId: string | null): string => {
    if (!contactId) return '';
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : '';
  };

  const getCompanyName = (companyId: string | null): string => {
    if (!companyId) return '';
    const company = companies.find((c) => c.id === companyId);
    return company ? company.name : '';
  };

  const getStageConfig = (stage: DealStage) => {
    return STAGES.find((s) => s.key === stage);
  };

  const calculateStageTotals = (stage: DealStage) => {
    const stageDeals = deals.filter((d) => d.stage === stage);
    return {
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
    };
  };

  const handleCreateNew = () => {
    setSelectedDealId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDealId(deal.id);
    setFormData({
      title: deal.title,
      value: deal.value.toString(),
      stage: deal.stage,
      contactId: deal.contactId || '',
      companyId: deal.companyId || '',
      expectedCloseDate: deal.expectedCloseDate.split('T')[0],
      notes: deal.notes,
    });
    setIsModalOpen(true);
  };

  const handleSaveDeal = () => {
    try {
      const store = getStore();
      const value = parseFloat(formData.value);

      if (!formData.title || !formData.value || isNaN(value)) {
        alert('Заполните обязательные поля');
        return;
      }

      const dealData = {
        title: formData.title,
        value,
        stage: formData.stage,
        contactId: formData.contactId || null,
        companyId: formData.companyId || null,
        expectedCloseDate: formData.expectedCloseDate
          ? new Date(formData.expectedCloseDate).toISOString()
          : new Date().toISOString(),
        notes: formData.notes,
      };

      if (selectedDealId) {
        store.updateDeal(selectedDealId, dealData);
      } else {
        store.createDeal(dealData);
      }

      loadData();
      setIsModalOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to save deal:', error);
      alert('Ошибка при сохранении сделки');
    }
  };

  const handleDeleteClick = (dealId: string) => {
    setSelectedDealId(dealId);
    setIsDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    try {
      if (selectedDealId) {
        const store = getStore();
        store.deleteDeal(selectedDealId);
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete deal:', error);
      alert('Ошибка при удалении сделки');
    } finally {
      setIsDeleteConfirm(false);
      setSelectedDealId(null);
    }
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '0.5';
    e.currentTarget.style.borderColor = '#3b82f6';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.borderColor = 'transparent';
  };

  const handleDropOnStage = (stage: DealStage, e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.style.opacity = '1';
    e.currentTarget.style.borderColor = 'transparent';

    if (draggedDeal && draggedDeal.stage !== stage) {
      try {
        const store = getStore();
        store.updateDeal(draggedDeal.id, { stage });
        loadData();
      } catch (error) {
        console.error('Failed to update deal stage:', error);
      }
    }
    setDraggedDeal(null);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Сделки</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Таблица
              </button>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Добавить сделку
            </button>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'kanban' ? (
          <KanbanView
            deals={deals}
            stages={STAGES}
            calculateStageTotals={calculateStageTotals}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getContactName={getContactName}
            getCompanyName={getCompanyName}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDropOnStage={handleDropOnStage}
            handleEditDeal={handleEditDeal}
            handleDeleteClick={handleDeleteClick}
          />
        ) : (
          <TableView
            deals={deals}
            stages={STAGES}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getContactName={getContactName}
            getCompanyName={getCompanyName}
            handleEditDeal={handleEditDeal}
            handleDeleteClick={handleDeleteClick}
          />
        )}

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedDealId ? 'Редактировать сделку' : 'Новая сделка'}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название сделки *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название сделки"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма (руб) *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Этап
                </label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STAGES.map((stage) => (
                    <option key={stage.key} value={stage.key}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Контакт
                </label>
                <select
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите контакт</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName}
                    </option>
                  ))}
                </select>
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
                  <option value="">Выберите компанию</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ожидаемая дата закрытия
              </label>
              <input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Заметки
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Добавьте заметки к сделке"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Отменить
              </button>
              <button
                onClick={handleSaveDeal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Сохранить
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        {isDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteConfirm(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Удалить сделку?</h3>
              <p className="text-gray-600 mb-6">Это действие невозможно отменить.</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Отменить
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

interface KanbanViewProps {
  deals: Deal[];
  stages: typeof STAGES;
  calculateStageTotals: (stage: DealStage) => { count: number; value: number };
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  getContactName: (contactId: string | null) => string;
  getCompanyName: (companyId: string | null) => string;
  handleDragStart: (deal: Deal) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDropOnStage: (stage: DealStage, e: React.DragEvent) => void;
  handleEditDeal: (deal: Deal) => void;
  handleDeleteClick: (dealId: string) => void;
}

function KanbanView({
  deals,
  stages,
  calculateStageTotals,
  formatCurrency,
  formatDate,
  getContactName,
  getCompanyName,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDropOnStage,
  handleEditDeal,
  handleDeleteClick,
}: KanbanViewProps) {
  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 p-6 min-w-min">
        {stages.map((stage) => {
          const totals = calculateStageTotals(stage.key);
          const stageDeals = deals.filter((d) => d.stage === stage.key);

          return (
            <div
              key={stage.key}
              className="w-80 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-gray-200 ${stage.bgColor}`}>
                <h3 className={`font-semibold text-sm mb-1 ${stage.color}`}>{stage.label}</h3>
                <div className="text-xs text-gray-600">
                  <p>{totals.count} сделок</p>
                  <p className="font-medium">{formatCurrency(totals.value)}</p>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                className="flex-1 p-4 space-y-3 overflow-y-auto min-h-96"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnStage(stage.key, e)}
              >
                {stageDeals.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">Нет сделок</div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:shadow-md hover:border-gray-300 transition-all group"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 flex-1 leading-tight">
                          {deal.title}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditDeal(deal)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded text-xs"
                            title="Редактировать"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteClick(deal.id)}
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded text-xs"
                            title="Удалить"
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-blue-600 mb-2">
                        {formatCurrency(deal.value)}
                      </p>

                      {deal.companyId && (
                        <p className="text-xs text-gray-600 truncate">
                          <strong>Компания:</strong> {getCompanyName(deal.companyId)}
                        </p>
                      )}

                      {deal.contactId && (
                        <p className="text-xs text-gray-600 truncate">
                          <strong>Контакт:</strong> {getContactName(deal.contactId)}
                        </p>
                      )}

                      {deal.expectedCloseDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          Закрытие: {formatDate(deal.expectedCloseDate)}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TableViewProps {
  deals: Deal[];
  stages: typeof STAGES;
  formatCurrency: (value: number) => string;
  formatDate: (dateString: string) => string;
  getContactName: (contactId: string | null) => string;
  getCompanyName: (companyId: string | null) => string;
  handleEditDeal: (deal: Deal) => void;
  handleDeleteClick: (dealId: string) => void;
}

function TableView({
  deals,
  stages,
  formatCurrency,
  formatDate,
  getContactName,
  getCompanyName,
  handleEditDeal,
  handleDeleteClick,
}: TableViewProps) {
  const getStageConfig = (stage: DealStage) => {
    return stages.find((s) => s.key === stage);
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const stageOrder = stages.map((s) => s.key);
    return stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage);
  });

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Название</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Сумма</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Этап</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Контакт</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Компания</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Дата закрытия</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedDeals.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                Нет сделок
              </td>
            </tr>
          ) : (
            sortedDeals.map((deal) => {
              const stageConfig = getStageConfig(deal.stage);
              return (
                <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{deal.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {stageConfig && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${stageConfig.bgColor} ${stageConfig.color}`}
                      >
                        {stageConfig.label}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getContactName(deal.contactId) || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getCompanyName(deal.companyId) || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDeal(deal)}
                        className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteClick(deal.id)}
                        className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-xs font-medium transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
