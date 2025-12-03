import React from 'react';
import { Icon, Card } from '../components/UI';

export const GamificationView = ({ transactions, investments, goals, recurring, mentalLogs }) => { 
    // Lógica de Níveis (XP)
    const stats = { 
        saved: transactions.reduce((acc, t) => acc + (t.type==='income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0), 
        invested: investments.length, 
        goals: goals.length, 
        recurring: recurring.length, 
        mental: mentalLogs.length 
    }; 

    // Sistema de Pontos (XP)
    const xp = (stats.invested * 500) + (goals.length * 300) + (stats.mental * 50) + (stats.saved > 0 ? 100 : 0);
    const level = Math.floor(xp / 1000) + 1;
    const nextLevelXp = level * 1000;
    const progress = ((xp % 1000) / 1000) * 100;

    const badges = [ 
        { id: 1, name: 'Iniciante', desc: 'Crie sua conta e faça um lançamento', unlocked: transactions.length > 0, icon: 'star', color: 'text-yellow-500', bg: 'bg-yellow-100' }, 
        { id: 2, name: 'Poupador', desc: 'Tenha saldo positivo no total', unlocked: stats.saved > 0, icon: 'wallet', color: 'text-emerald-500', bg: 'bg-emerald-100' }, 
        { id: 3, name: 'Investidor', desc: 'Adicione seu primeiro investimento', unlocked: stats.invested > 0, icon: 'trendUp', color: 'text-blue-500', bg: 'bg-blue-100' }, 
        { id: 4, name: 'Visionário', desc: 'Crie uma meta financeira', unlocked: stats.goals > 0, icon: 'target', color: 'text-purple-500', bg: 'bg-purple-100' }, 
        { id: 5, name: 'Organizado', desc: 'Cadastre 3 contas fixas', unlocked: stats.recurring >= 3, icon: 'list', color: 'text-indigo-500', bg: 'bg-indigo-100' }, 
        { id: 6, name: 'Zen Master', desc: 'Faça 5 check-ins mentais', unlocked: stats.mental >= 5, icon: 'brain', color: 'text-rose-500', bg: 'bg-rose-100' }, 
    ]; 

    return (
        <div className="animate-fade-in pb-24 space-y-8">
            {/* Header com Nível */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 opacity-50"></div>
                <div className="relative z-10 w-full max-w-lg">
                    <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl font-black mb-4 mx-auto border-4 border-white/20 shadow-glow">
                        {level}
                    </div>
                    <h2 className="text-3xl font-black mb-1">Nível {level}</h2>
                    <p className="text-indigo-200 text-sm mb-6 font-medium tracking-wide uppercase">Mestre das Finanças</p>
                    
                    <div className="flex justify-between text-xs font-bold mb-2 text-indigo-300">
                        <span>{xp} XP</span>
                        <span>{nextLevelXp} XP</span>
                    </div>
                    <div className="w-full bg-black/30 h-4 rounded-full overflow-hidden border border-white/10">
                        <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-1000" style={{width: `${progress}%`}}></div>
                    </div>
                    <p className="mt-4 text-sm text-indigo-200">Faltam {nextLevelXp - xp} XP para o próximo nível.</p>
                </div>
            </div>

            {/* Grid de Conquistas */}
            <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2"><Icon name="award"/> Galeria de Troféus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {badges.map(b => (
                        <Card key={b.id} className={`relative overflow-hidden transition-all duration-500 ${!b.unlocked ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
                            <div className="flex items-start gap-5 relative z-10">
                                <div className={`w-16 h-16 rounded-2xl ${b.unlocked ? b.bg : 'bg-slate-200 dark:bg-slate-700'} flex items-center justify-center shadow-inner ${b.color}`}>
                                    <Icon name={b.icon} size={32}/>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{b.name}</h3>
                                    <p className="text-xs text-slate-500 leading-snug mt-1">{b.desc}</p>
                                    {b.unlocked ? (
                                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-600 px-2 py-1 rounded-md">Desbloqueado</span>
                                    ) : (
                                        <span className="inline-block mt-3 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-400 px-2 py-1 rounded-md flex items-center gap-1"><Icon name="lock" size={10}/> Bloqueado</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    ); 
};