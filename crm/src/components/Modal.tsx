'use client';

import { useEffect, ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    onSubmit?: () => void;
    submitText?: string;
    submitClassName?: string;
}

const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>svg>
  );

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
              return 'max-w-sm';
      case 'md':
              return 'max-w-md';
      case 'lg':
              return 'max-w-lg';
      default:
              return 'max-w-md';
    }
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    onSubmit,
    submitText,
    submitClassName,
}: ModalProps) {
    useEffect(() => {
          const handleEscape = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') {
                            onClose();
                  }
          };
      
          if (isOpen) {
                  document.addEventListener('keydown', handleEscape);
                  document.body.style.overflow = 'hidden';
          }
      
          return () => {
                  document.removeEventListener('keydown', handleEscape);
                  document.body.style.overflow = 'auto';
          };
    }, [isOpen, onClose]);
  
    if (!isOpen) return null;
  
    return (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
                <div
                          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-200"
                          onClick={onClose}
                        />
          
            {/* Modal Content */}
                <div
                          className={`relative bg-white rounded-lg shadow-xl w-full mx-4 ${getSizeClasses(
                                      size
                                    )} animate-in fade-in zoom-in duration-200`}
                          onClick={(e) => e.stopPropagation()}
                        >
                  {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                  <h2 className="text-xl font-semibold text-gray-900">{title}</h2>h2>
                                  <button
                                                onClick={onClose}
                                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                                aria-label="Close modal"
                                              >
                                              <CloseIcon />
                                  </button>button>
                        </div>div>
                
                  {/* Body */}
                        <div className="px-6 py-4">{children}</div>div>
                
                  {/* Footer */}
                  {onSubmit && (
                                    <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-200">
                                                <button
                                                                onClick={onClose}
                                                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                                              >
                                                              Отменить
                                                </button>button>
                                                <button
                                                                onClick={onSubmit}
                                                                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${submitClassName || 'bg-blue-600 hover:bg-blue-700'}`}
                                                              >
                                                  {submitText || 'Сохранить'}
                                                </button>button>
                                    </div>div>
                        )}
                </div>div>
          </div>div>
        );
}</svg>
