import React, { useState } from 'react';
import { Icon } from './Icon';

export const Button = ({ children, onClick, variant="primary", className="", icon, type="button", disabled=false }) => {
    const variants = {
        primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/30",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700",
        ghost: "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
    };
    return <button type={type} onClick={onClick} disabled={disabled} className={`px-5 py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}>{icon && <Icon name={icon} size={18}/>} {children}</button>;
};

export const Input = ({ label, className="", ...props }) => (
    <div className={`mb-4 ${className}`}>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>}
        <input {...props} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold dark:text-white shadow-inner-light" />
    </div>
);

export const Select = ({ label, children, className="", ...props }) => (
    <div className={`mb-4 ${className}`}>
        {label && <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</label>}
        <select {...props} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold dark:text-white shadow-inner-light">{children}</select>
    </div>
);

export const TagInput = ({ tags, setTags }) => {
    const [input, setInput] = useState('');
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.trim().replace('#', '');
            if (val && !tags.includes(val)) setTags([...tags, val]);
            setInput('');
        }
    };
    const removeTag = (tToRemove) => setTags(tags.filter(t => t !== tToRemove));
    
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags (Opcional)</label>
            <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border-none shadow-inner-light">
                {tags.map(t => (
                    <span key={t} className="bg-brand-100 text-brand-600 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                        #{t} <button onClick={() => removeTag(t)} className="hover:text-brand-800">×</button>
                    </span>
                ))}
                <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? "Digite e dê Enter (ex: viagem)" : ""}
                    className="bg-transparent border-none outline-none flex-1 text-sm min-w-[100px] dark:text-white focus:ring-0" 
                />
            </div>
        </div>
    );
};