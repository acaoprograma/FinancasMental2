import React, { useState } from 'react';
import { Icon, Card, Button, Input, Select, PrivacyMask, useToast, TagInput } from '../components/UI';
import { CURRENCIES, formatCurrency } from '../utils/currency';
import { parseMagicInput } from '../utils/ai'; 

export const FinancesView = ({ transactions, categories, cards, onAdd, privacy }) => {
    const [formType, setFormType] = useState('expense'); const [search, setSearch] = useState(''); const [currency, setCurrency] = useState('BRL'); 
    const [magicText, setMagicText] = useState(''); const [tags, setTags] = useState([]);
    const showToast = useToast();
    
    // Ordena por data (mais recente primeiro) para o histórico
    const filteredList = transactions.slice().sort((a,b) => new Date(b.date) - new Date(a.date)).filter(t => t.note?.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))));
    const totalIn = transactions.filter(t => t.type === 'income').reduce((a,b) => a + parseFloat(b.amount), 0);
    const totalOut = transactions.filter(t => t.type === 'expense').reduce((a,b) => a + parseFloat(b.amount), 0);

    const handleMagicAdd = (e) => {
        e.preventDefault();
        if(!magicText.trim()) return;
        
        // AQUI ESTÁ A MÁGICA DO NÍVEL 3: Passamos 'transactions' como histórico
        const result = parseMagicInput(magicText, transactions);
        
        if(result.amount) {
            onAdd({ amount: result.amount, category: result.category, note: result.note, type: result.type, date: new Date().toISOString().slice(0,10), paymentMethod: 'Outros', installments: 1, currency: 'BRL', tags: result.tags || [] });
            setMagicText('');
            showToast(`Lançado em ${result.category}`, 'success');
        } else { showToast('Não entendi. Tente "Pizza 50 #lazer"', 'danger'); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in pb-24">
            <div className="lg:col-span-1 space-y-6">
                <Card className="bg-gradient-to-r from-brand-600 to-purple-600 border-none text-white shadow-lg shadow-purple-500/30 relative overflow-hidden">
                    <div className="relative z-10"><h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Icon name="sparkles" /> Zen Genius</h3><form onSubmit={handleMagicAdd} className="relative"><input type="text" value={magicText} onChange={e => setMagicText(e.target.value)} placeholder="Ex: Jantar 150 #niver" className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/20 border border-white/30 placeholder-white/50 text-white font-medium focus:ring-2 focus:ring-white focus:bg-white/30 transition-all backdrop-blur-md" /><button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white text-brand-600 rounded-lg hover:scale-105 transition-transform shadow-md"><Icon name="plus" size={18}/></button></form></div>
                </Card>
                <Card className={`sticky top-6 border-t-4 ${formType === 'expense' ? 'border-rose-500' : 'border-emerald-500'}`}>
                    <div className="flex flex-col mb-6 gap-4"><div className="flex justify-between items-center"><h2 className="text-xl font-black flex items-center gap-2 text-slate-800 dark:text-white"><Icon name="plus" className={formType==='expense'?'text-rose-500':'text-emerald-500'}/> Novo</h2><div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1"><button onClick={() => setFormType('expense')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formType==='expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}>Despesa</button><button onClick={() => setFormType('income')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${formType==='income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Receita</button></div></div></div>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); onAdd({...Object.fromEntries(fd), type: formType, currency, tags}); setTags([]); e.target.reset(); }} className="space-y-6">
                        <div className="py-4 border-b-2 border-slate-100 dark:border-slate-700">
                            <div className="flex items-baseline justify-center gap-1">
                                <select value={currency} onChange={e => setCurrency(e.target.value)} className="bg-transparent border-none text-slate-400 font-bold text-xl cursor-pointer p-0 focus:ring-0 w-auto text-right pr-1">{Object.keys(CURRENCIES).map(c => <option key={c} value={c}>{c}</option>)}</select>
                                <input name="amount" type="number" step="0.01" required placeholder="0,00" className={`big-input w-48 text-left p-0 m-0 ${formType==='expense' ? 'text-rose-600 placeholder-rose-200' : 'text-emerald-600 placeholder-emerald-200'}`} />
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider">Valor da Transação</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Input name="date" type="date" defaultValue={new Date().toISOString().slice(0,10)} required label="Data" /><Select name="category" label="Categoria">{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}<option value="Outros">Outros</option></Select></div>
                        <Input name="note" placeholder="Ex: Padaria" label="Descrição"/>
                        <TagInput tags={tags} setTags={setTags} />
                        <div className="grid grid-cols-2 gap-4"><Select name="paymentMethod" label="Pagamento"><option>Pix</option><option>Cartão</option><option>Dinheiro</option>{cards.map(c=><option key={c.id} value={c.name}>💳 {c.name}</option>)}</Select><Input name="installments" type="number" min="1" max="60" defaultValue="1" label="Parcelas"/></div>
                        <Button type="submit" className="w-full py-4 text-lg shadow-lg" variant={formType === 'expense' ? 'danger' : 'success'} icon="plus">Confirmar Lançamento</Button>
                    </form>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4"><div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50"><p className="text-xs font-bold text-emerald-600/70 uppercase">Entradas</p><p className="text-xl font-black text-emerald-600"><PrivacyMask value={formatCurrency(totalIn, 'BRL')} privacyMode={privacy}/></p></div><div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/50"><p className="text-xs font-bold text-rose-600/70 uppercase">Saídas</p><p className="text-xl font-black text-rose-600"><PrivacyMask value={formatCurrency(totalOut, 'BRL')} privacyMode={privacy}/></p></div></div>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4"><h2 className="text-xl font-black flex items-center gap-2 text-slate-800 dark:text-white"><Icon name="list"/> Histórico</h2><div className="relative w-full sm:w-64"><Icon name="search" size={16} className="absolute left-3 top-3.5 text-slate-400"/><input type="text" placeholder="Buscar (Nome ou #Tag)..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none text-sm"/></div></div>
                <div className="space-y-3">{filteredList.map(t => (<Card key={t.id} className="flex justify-between items-center group hover:border-brand-500/30 !p-4 transition-all"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${t.type==='income'?'bg-emerald-100 text-emerald-600':'bg-rose-100 text-rose-600'}`}>{t.currency === 'BRL' || !t.currency ? t.category.substring(0, 2) : t.currency}</div><div><h3 className="font-bold text-slate-700 dark:text-white text-lg">{t.note||t.category}</h3><div className="flex flex-wrap gap-2 mt-1">{t.tags && t.tags.map(tag => <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">#{tag}</span>)}</div><div className="flex gap-3 text-xs font-semibold text-slate-400 mt-1"><span className="flex items-center gap-1"><Icon name="calendar" size={12}/> {new Date(t.date).toLocaleDateString()}</span><span className="flex items-center gap-1"><Icon name="credit" size={12}/> {t.paymentMethod}</span>{t.isInstallment && <span className="text-brand-500 bg-brand-50 px-1.5 rounded">Parc. {t.installmentCurrent}/{t.installmentTotal}</span>}</div></div></div><div className="text-right"><p className={`font-black text-lg ${t.type==='income'?'text-emerald-600':'text-rose-600'}`}>{t.type==='expense'?'-':'+'}<PrivacyMask value={formatCurrency(parseFloat(t.amount), t.currency || 'BRL')} privacyMode={privacy}/></p></div></Card>))}</div>
            </div>
        </div>
    );
};