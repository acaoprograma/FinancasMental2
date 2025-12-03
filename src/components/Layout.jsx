import React from 'react';
import { Icon } from './Icon';

export const Card = ({ children, className="", onClick, noPadding=false }) => (
    <div onClick={onClick} className={`bg-white dark:bg-slate-800 rounded-3xl shadow-card border border-white/50 dark:border-slate-700 ${noPadding?'':'p-6'} transition-transform duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.01]' : ''} ${className}`}>
        {children}
    </div>
);

export const PrivacyMask = ({ value, privacyMode }) => privacyMode ? <span className="blur-sm select-none bg-slate-200 dark:bg-slate-700 rounded px-1">####</span> : value;

export const StatCard = ({ title, value, type, privacy, subtext }) => {
    const styles = {
        balance: { bg: 'bg-gradient-to-br from-brand-500 to-brand-600', text: 'text-white', sub: 'text-brand-100', icon: 'wallet' },
        income: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', sub: 'text-emerald-600/70', icon: 'trendUp' },
        expense: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', sub: 'text-rose-600/70', icon: 'trendDown' }
    };
    const s = styles[type] || styles.balance;
    return (
        <Card className={`${s.bg} border-none shadow-lg relative overflow-hidden`} noPadding>
            <div className="p-6 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 rounded-xl ${type==='balance'?'bg-white/20':'bg-white dark:bg-slate-800'} shadow-sm`}>
                        <Icon name={s.icon} size={18} className={type==='balance'?'text-white':s.text} />
                    </div>
                    <span className={`text-sm font-semibold ${s.sub}`}>{title}</span>
                </div>
                <p className={`text-3xl font-black tracking-tight ${s.text}`}>
                    <PrivacyMask value={value} privacyMode={privacy} />
                </p>
                {subtext && <p className={`text-xs mt-2 font-bold ${s.sub}`}>{subtext}</p>}
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-current opacity-5 rounded-full blur-2xl pointer-events-none"></div>
        </Card>
    );
};