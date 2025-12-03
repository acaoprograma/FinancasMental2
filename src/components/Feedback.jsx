import React, { useState, useContext, createContext } from 'react';
import { Icon } from './Icon';

// CONTEXTO
export const ToastContext = createContext();

// TOAST
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const addToast = (msg, type='success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map(t => (
                    <div key={t.id} className={`px-6 py-3 rounded-xl shadow-float text-white font-bold animate-slide-up ${t.type==='success'?'bg-emerald-500':'bg-rose-500'}`}>
                        <div className="flex items-center gap-2"><Icon name={t.type==='success'?'sparkles':'bulb'} size={18}/>{t.msg}</div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
export const useToast = () => useContext(ToastContext);

// MODAL
export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><Icon name="x" size={20}/></button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};