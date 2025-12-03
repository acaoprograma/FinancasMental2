import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Icon, Card, StatCard, PrivacyMask } from '../components/UI';
import { convertToBRL, formatCurrency } from '../utils/currency';

// --- CUSTOM TOOLTIP (UX Premium) ---
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-500 text-xs uppercase mb-2 tracking-wider">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm font-bold mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-slate-600 dark:text-slate-300">{entry.name}:</span>
                        <span style={{ color: entry.color }}>{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export const DashboardView = ({ transactions, mentalLogs, date, setDate, privacy, notifications, rates }) => {
    const [period, setPeriod] = useState('month'); 

    const filteredTxs = useMemo(() => {
        if (period === 'all') return transactions;
        if (period === 'year') return transactions.filter(t => t.date.startsWith(date.toISOString().slice(0, 4)));
        return transactions.filter(t => t.date.startsWith(date.toISOString().slice(0, 7))); 
    }, [transactions, date, period]);

    const income = filteredTxs.filter(t=>t.type==='income').reduce((a,b)=>a + convertToBRL(parseFloat(b.amount), b.currency || 'BRL', rates), 0);
    const expense = filteredTxs.filter(t=>t.type==='expense').reduce((a,b)=>a + convertToBRL(parseFloat(b.amount), b.currency || 'BRL', rates), 0);
    const balance = income - expense;
    
    const lastMonthDate = new Date(date); lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);
    const lastMonthExp = transactions.filter(t => t.type === 'expense' && t.date.startsWith(lastMonthStr)).reduce((a,b)=>a+parseFloat(b.amount),0);
    const expDiff = expense - lastMonthExp;
    const expPercent = lastMonthExp > 0 ? (expDiff / lastMonthExp) * 100 : 0;
    const expMessage = period === 'month' ? (expDiff > 0 ? `+${expPercent.toFixed(0)}% vs mês passado` : `${Math.abs(expPercent).toFixed(0)}% menos que mês passado`) : 'No período selecionado';

    const chartData = useMemo(() => { 
        const dataMap = {};
        filteredTxs.forEach(t => { 
            let key = period === 'month' ? parseInt(t.date.split('-')[2]) : t.date.slice(0, 7);
            if (!dataMap[key]) dataMap[key] = { name: key, Receita: 0, Despesa: 0 };
            const val = convertToBRL(parseFloat(t.amount), t.currency || 'BRL', rates);
            if(t.type === 'income') dataMap[key].Receita += val; else dataMap[key].Despesa += val;
        });
        if (period === 'month') {
            const dim = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate(); 
            const arr = [];
            for(let i=1; i<=dim; i++) arr.push(dataMap[i] || { name: i, Receita: 0, Despesa: 0 });
            return arr;
        }
        return Object.values(dataMap).sort((a,b) => a.name.localeCompare(b.name));
    }, [filteredTxs, date, rates, period]);

    const pieData = useMemo(() => {
        const catMap = {};
        filteredTxs.filter(t => t.type === 'expense').forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + convertToBRL(parseFloat(t.amount), t.currency || 'BRL', rates);
        });
        return Object.entries(catMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5); 
    }, [filteredTxs, rates]);

    const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];
    const recentTxs = [...filteredTxs].reverse().slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-2xl text-brand-600"><Icon name="chart" size={24}/></div>
                    <div><h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard</h2><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Visão Geral</p></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
                        {['month', 'year', 'all'].map(p => (
                            <button key={p} onClick={()=>setPeriod(p)} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${period===p?'bg-white dark:bg-slate-700 shadow text-brand-600':'text-slate-500 hover:text-slate-700'}`}>{p === 'month' ? 'Mês' : p === 'year' ? 'Ano' : 'Tudo'}</button>
                        ))}
                    </div>
                    {period !== 'all' && (
                        <div className="flex items-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                            <button onClick={() => setDate(new Date(date.setMonth(date.getMonth()-1)))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-l-xl transition-colors"><Icon name="left" size={16}/></button>
                            <span className="font-bold w-32 text-center text-sm capitalize text-slate-700 dark:text-white select-none">{period==='month' ? date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : date.getFullYear()}</span>
                            <button onClick={() => setDate(new Date(date.setMonth(date.getMonth()+1)))} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-r-xl transition-colors"><Icon name="right" size={16}/></button>
                        </div>
                    )}
                </div>
            </div>

            {notifications.length > 0 && (<div className="grid gap-2">{notifications.map((n, i) => (<div key={i} className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-center gap-3 text-amber-800 dark:text-amber-200 font-semibold text-sm shadow-sm"><Icon name="bell" size={18}/> {n}</div>))}</div>)}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Saldo em Conta" value={formatCurrency(balance, 'BRL')} type="balance" privacy={privacy} />
                <StatCard title="Entradas do Período" value={formatCurrency(income, 'BRL')} type="income" privacy={privacy} />
                <StatCard title="Gastos do Período" value={formatCurrency(expense, 'BRL')} type="expense" privacy={privacy} subtext={expMessage}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
                <Card className="lg:col-span-2 flex flex-col min-h-[300px]">
                    <h3 className="font-bold text-lg px-2 mb-6 flex items-center gap-2 text-slate-800 dark:text-white"><span className="w-2 h-6 bg-brand-500 rounded-full"></span> Fluxo de Caixa</h3>
                    <div className="flex-1 w-full min-h-0">
                        {chartData.some(d => d.Receita > 0 || d.Despesa > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5}/>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#94a3b8', fontSize: 12}} dy={10}/>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={3} fill="url(#colorInc)" activeDot={{r: 6}} />
                                    <Area type="monotone" dataKey="Despesa" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExp)" activeDot={{r: 6}} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (<div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60"><Icon name="chart" size={48} className="mb-2"/><p className="text-sm">Sem dados neste período</p></div>)}
                    </div>
                </Card>

                <Card className="flex flex-col min-h-[300px]">
                    <h3 className="font-bold text-lg px-2 mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><span className="w-2 h-6 bg-purple-500 rounded-full"></span> Top Gastos</h3>
                    <div className="flex-1 w-full relative">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 opacity-60"><div className="w-24 h-24 rounded-full border-4 border-slate-200 border-dashed mb-4 flex items-center justify-center"><Icon name="pie" size={24}/></div><p className="text-xs">Lance uma despesa para ver</p></div>)}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1">
                <h3 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-800 dark:text-white px-2"><Icon name="list" className="text-slate-400"/> Atividade Recente</h3>
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    {recentTxs.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {recentTxs.map(t => (
                                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type==='income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}><Icon name={t.type==='income' ? 'trending' : 'cart'} size={18}/></div>
                                        <div><p className="font-bold text-slate-800 dark:text-white text-sm">{t.note || t.category}</p><p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} • {t.category}</p></div>
                                    </div>
                                    <span className={`font-bold ${t.type==='income' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>{t.type==='expense' ? '-' : '+'}<PrivacyMask value={formatCurrency(parseFloat(t.amount), t.currency || 'BRL')} privacyMode={privacy}/></span>
                                </div>
                            ))}
                        </div>
                    ) : (<div className="p-8 text-center"><p className="text-slate-400 mb-2">Nada por aqui ainda.</p><p className="text-sm text-brand-500 font-bold">Vá em Finanças e adicione algo!</p></div>)}
                </div>
            </div>
        </div>
    );
};