import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[200] space-y-4 max-w-md w-full">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-4 p-4 rounded-3xl border shadow-xl animate-in slide-in-from-right duration-300
                            ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                toast.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
                                    'bg-primary/10 border-primary/20 text-primary'}
                            backdrop-blur-md
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}

                        <p className="flex-1 font-bold text-sm tracking-tight">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);
