import React, { useState } from 'react';
import { Icon, Card, Button, Input, Select, PrivacyMask } from '../components/UI';
import { formatCurrency, convertToBRL } from '../utils/currency';

export const TravelView = ({ transactions, onAdd, rates, privacy }) => {
    const [tripMode, setTripMode] = useState(false);
    const [budget, setBudget] = useState(5000); // Orçamento da viagem em BRL
    const [localCurrency, setLocalCurrency] = useState('USD');

    // Filtra gastos feitos em outra moeda (viagem)
    const tripExpenses = transactions.filter(t => t.currency && t.currency !== 'BRL' && t.type === 'expense');
    const totalSpentBRL = tripExpenses.reduce((acc, t) => acc + convertToBRL(parseFloat(t.amount), t.currency, rates), 0);
    const progress = Math.min((totalSpentBRL / budget) * 100, 100);

    return (
        <div className="space-y-8 animate-fade-in pb-24">
            {/* Header da Viagem */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-black flex items-center gap-2"><Icon name="globe" /> Modo Viagem</h2>
                            <p className="text-blue-100 font-medium">Controle seus gastos internacionais em tempo real.</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                            1 {localCurrency} = {formatCurrency(rates[localCurrency], 'BRL')}
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <div className="flex justify-between text-sm font-bold mb-2 uppercase tracking-wider text-blue-100">
                            <span>Gasto: <PrivacyMask value={formatCurrency(totalSpentBRL)} privacyMode={privacy}/></span>
                            <span>Meta: <PrivacyMask value={formatCurrency(budget)} privacyMode={privacy}/></span>
                        </div>
                        <div className="w-full bg-black/20 h-4 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-1000 ease-out ${progress > 90 ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
                {/* Decorativo */}
                <Icon name="plane" size={120} className="absolute -right-6 -bottom-10 text-white/10 rotate-12" />
            </div>

            {/* Formulário Rápido de Viagem */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 border-t-4 border-cyan-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Icon name="plus" className="text-cyan-500"/> Novo Gasto</h3>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.target);
                        onAdd({
                            amount: parseFloat(fd.get('amount')),
                            category: 'Viagem',
                            note: fd.get('note'),
                            type: 'expense',
                            currency: localCurrency, // Salva na moeda local
                            date: new Date().toISOString().slice(0, 10),
                            paymentMethod: 'Outros',
                            installments: 1
                        });
                        e.target.reset();
                    }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Select value={localCurrency} onChange={e => setLocalCurrency(e.target.value)} label="Moeda">
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </Select>
                            <Input name="amount" type="number" step="0.01" label="Valor (Local)" required />
                        </div>
                        <Input name="note" label="Descrição (ex: Jantar, Táxi)" required />
                        <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">Lançar</Button>
                    </form>
                </Card>

                {/* Lista de Gastos Convertidos */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-xl text-slate-700 dark:text-white flex items-center gap-2"><Icon name="list"/> Histórico da Viagem</h3>
                    {tripExpenses.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
                            <Icon name="map" size={48} className="mx-auto mb-2 opacity-50"/>
                            <p>Nenhum gasto registrado nesta moeda.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {tripExpenses.slice().reverse().map(t => (
                                <div key={t.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center font-bold">
                                            {t.currency}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{t.note}</p>
                                            <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-slate-800 dark:text-white">{formatCurrency(parseFloat(t.amount), t.currency)}</p>
                                        <p className="text-xs font-bold text-cyan-600">≈ {formatCurrency(convertToBRL(parseFloat(t.amount), t.currency, rates), 'BRL')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};