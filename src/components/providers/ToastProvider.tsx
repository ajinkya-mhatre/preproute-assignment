import React, { useState, useRef, useCallback, createContext } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' && <i className="fas fa-check-circle mr-2"></i>}
          {toast.type === 'error' && <i className="fas fa-exclamation-circle mr-2"></i>}
          {toast.type === 'info' && <i className="fas fa-info-circle mr-2"></i>}
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};
