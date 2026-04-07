'use client';

import { useState, useEffect } from 'react';
import { getStore } from '@/lib/store';
import { Task, TaskStatus, TaskPriority, Contact, Deal } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import Modal from '@/components/Modal';

const PRIORITIES = [
  { key: 'high', label: 'Высокий', color: 'bg-red-100 text-red-700' },
  { key: 'medium', label: 'Средний', color: 'bg-yellow-100 text-yellow-700' },
  { key: 'low', label: 'Низкий', color: 'bg-green-100 text-green-700' },
] as const;

const STATUSES = [
  { key: 'todo', label: 'К выполнению', color: 'bg-gray-100 text-gray-700' },
  { key: 'in_progress', label: 'В работе', color: 'bg-blue-100 text-blue-700' },
  { key: 'done', label: 'Выполнено', color: 'bg-green-100 text-green-700' },
] as const;

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

const EmptyState = ({ filter }: { filter: TaskStatus | 'all' }) => {
  const filterLabels: Record<string, string> = {
    all: 'Задачи не найдены',
    todo: 'Нет задач к выполнению',
    in_progress: 'Нет задач в работе',
    done: 'Нет выполненных задач',
  };

  return (
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{filterLabels[filter] || 'Задачи не найдены'}</h3>
      <p className="text-gray-500 text-sm">Начните с добавления первой задачи</p>
    </div>
  );
};

interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  contactId: string;
  dealId: string;
}

interface ConfirmDeleteState {
  isOpen: boolean;
  taskId: string | null;
  taskTitle: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: '',
    contactId: '',
    dealId: '',
  });

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const store = getStore();
        setTasks(store.getTasks());
        setContacts(store.getContacts());
        setDeals(store.getDeals());
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter and sort tasks
  useEffect(() => {
    let result = tasks;

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter((task) => task.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Sort: overdue first, then by priority (high>medium>low), then by due date
    result.sort((a, b) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const aDate = new Date(a.dueDate);
      const bDate = new Date(b.dueDate);
      aDate.setHours(0, 0, 0, 0);
      bDate.setHours(0, 0, 0, 0);

      const aIsOverdue = aDate < today && a.status !== 'done';
      const bIsOverdue = bDate < today && b.status !== 'done';

      if (aIsOverdue !== bIsOverdue) {
        return aIsOverdue ? -1 : 1;
      }

      const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return aDate.getTime() - bDate.getTime();
    });

    setFilteredTasks(result);
  }, [tasks, activeFilter, searchQuery]);

  // Show success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : null;
  };

  const getDealName = (dealId: string | null) => {
    if (!dealId) return null;
    const deal = deals.find((d) => d.id === dealId);
    return deal?.title || null;
  };

  const getPriorityConfig = (priority: TaskPriority) => {
    return PRIORITIES.find((p) => p.key === priority) || PRIORITIES[1];
  };

  const getStatusConfig = (status: TaskStatus) => {
    return STATUSES.find((s) => s.key === status) || STATUSES[0];
  };

  const getDateStyle = (dueDate: string, status: TaskStatus) => {
    if (status === 'done') return 'text-gray-500';

    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();

    if (diffTime < 0) return 'text-red-600 font-medium'; // Overdue
    if (diffTime === 0) return 'text-yellow-600 font-medium'; // Today
    return 'text-gray-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      dueDate: '',
      contactId: '',
      dealId: '',
    });
  };

  const handleCreateTask = () => {
    if (!formData.title.trim()) return;

    try {
      const store = getStore();
      const newTask = store.createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        contactId: formData.contactId || null,
        dealId: formData.dealId || null,
      });

      setTasks([...tasks, newTask]);
      setIsCreateModalOpen(false);
      resetForm();
      setSuccessMessage('Задача создана');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditTask = () => {
    if (!formData.title.trim() || !editingTaskId) return;

    try {
      const store = getStore();
      const updated = store.updateTask(editingTaskId, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        dueDate: formData.dueDate,
        contactId: formData.contactId || null,
        dealId: formData.dealId || null,
      });

      if (updated) {
        setTasks(tasks.map((t) => (t.id === editingTaskId ? updated : t)));
        setIsEditModalOpen(false);
        setEditingTaskId(null);
        resetForm();
        setSuccessMessage('Задача обновлена');
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = () => {
    if (!confirmDelete.taskId) return;

    try {
      const store = getStore();
      store.deleteTask(confirmDelete.taskId);
      setTasks(tasks.filter((t) => t.id !== confirmDelete.taskId));
      setConfirmDelete({ isOpen: false, taskId: null, taskTitle: '' });
      setSuccessMessage('Задача удалена');
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const store = getStore();
      const updated = store.updateTask(task.id, { status: newStatus });
      if (updated) {
        setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      contactId: task.contactId || '',
      dealId: task.dealId || '',
    });
    setEditingTaskId(task.id);
    setIsEditModalOpen(true);
  };

  const countByStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status).length;

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <LoadingSpinner />
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-50">
            {successMessage}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
            <button
              onClick={() => {
                resetForm();
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Добавить задачу
            </button>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Все
              <span className="ml-2 text-sm">({tasks.length})</span>
            </button>
            <button
              onClick={() => setActiveFilter('todo')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'todo'
                  ? 'bg-gray-300 text-gray-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              К выполнению
              <span className="ml-2 text-sm">({countByStatus('todo')})</span>
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'in_progress'
                  ? 'bg-blue-200 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              В работе
              <span className="ml-2 text-sm">({countByStatus('in_progress')})</span>
            </button>
            <button
              onClick={() => setActiveFilter('done')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === 'done'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Выполнено
              <span className="ml-2 text-sm">({countByStatus('done')})</span>
            </button>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <EmptyState filter={activeFilter} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => {
                const priorityConfig = getPriorityConfig(task.priority);
                const statusConfig = getStatusConfig(task.status);
                const contactName = getContactName(task.contactId);
                const dealName = getDealName(task.dealId);

                return (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
                    onClick={() => openEditModal(task)}
                  >
                    {/* Header with checkbox and title */}
                    <div className="flex items-start gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={task.status === 'done'}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(task);
                        }}
                        className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                      />
                      <h3 className={`font-bold text-base flex-1 ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{task.description}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Due date */}
                    <div className={`text-sm mb-4 ${getDateStyle(task.dueDate, task.status)}`}>
                      {formatDate(task.dueDate)}
                    </div>

                    {/* Contact and Deal info */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      {contactName && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {contactName}
                        </div>
                      )}
                      {dealName && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 12a5 5 0 1110 0 5 5 0 01-10 0z" />
                          </svg>
                          {dealName}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(task);
                        }}
                        className="flex-1 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete({
                            isOpen: true,
                            taskId: task.id,
                            taskTitle: task.title,
                          });
                        }}
                        className="flex-1 text-red-600 hover:text-red-700 font-medium text-sm transition-colors"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isCreateModalOpen || isEditModalOpen}
          title={isEditModalOpen ? 'Редактировать задачу' : 'Новая задача'}
          onClose={() => {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setEditingTaskId(null);
            resetForm();
          }}
          onSubmit={isEditModalOpen ? handleEditTask : handleCreateTask}
          submitText={isEditModalOpen ? 'Сохранить' : 'Создать'}
        >
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Название *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите название задачи"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Описание задачи"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Приоритет</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">К выполнению</option>
                <option value="in_progress">В работе</option>
                <option value="done">Выполнено</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Срок выполнения</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Контакт</label>
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

            {/* Deal */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Сделка</label>
              <select
                value={formData.dealId}
                onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите сделку</option>
                {deals.map((deal) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={confirmDelete.isOpen}
          title="Удалить задачу"
          onClose={() => setConfirmDelete({ isOpen: false, taskId: null, taskTitle: '' })}
          onSubmit={handleDeleteTask}
          submitText="Удалить"
          submitClassName="bg-red-600 hover:bg-red-700"
        >
          <p className="text-gray-700">
            Вы уверены, что хотите удалить задачу "{confirmDelete.taskTitle}"? Это действие невозможно отменить.
          </p>
        </Modal>
      </div>
    </AuthGuard>
  );
}
