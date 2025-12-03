import React, { useState, useEffect } from 'react';
import { 
    Dashboard, FinancesView, CardsView, CalendarView, AssetsView, 
    InvestmentsView, WishlistView, ToolsView, ImporterView, ReportsView, 
    MentalView, GoalsView, BudgetsView, RecurringView, DebtsView, SettingsView,
    SubscriptionsView, GamificationView, ShoppingView, LoginView, TravelView
} from './views'; 
import { ToastProvider, Modal, Input, Button, Select, Icon } from './components/UI';
import { useAuth } from './hooks/useAuth';
import { useZenData } from './hooks/useZenData';

const AppContent = () => {
    const { user, profiles, login, register, logout } = useAuth();
    const [tab, setTab] = useState('dashboard');
    const [date, setDate] = useState(new Date());
    const [darkMode, setDarkMode] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [modal, setModal] = useState({ open: false, type: null, data: null });

    // Hook Poderoso que controla todos os dados
    const { data, rates, notifications, actions } = useZenData(user, tab);

    // Tema Escuro
    useEffect(() => { 
        if(localStorage.getItem('theme')==='dark') setDarkMode(true); 
    }, []);
    useEffect(() => { 
        if(darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
        else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
    }, [darkMode]);

    // Handlers de UI
    const openLogin = (p) => setModal({ open: true, type: 'auth_login', data: p });
    const handleProfileSelect = (id) => { const p = profiles.find(x => x.id === id); if(p) openLogin(p); };
    const createProfileStart = () => setModal({ open: true, type: 'auth_register' });
    
    const handleLoginSubmit = (e) => { 
        e.preventDefault(); 
        const pin = new FormData(e.target).get('pin'); 
        if(login(modal.data, pin)) setModal({ open: false });
    };
    
    const handleRegisterSubmit = async (e) => { 
        e.preventDefault(); 
        const fd = new FormData(e.target); 
        if(await register(fd.get('name'), fd.get('pin'))) setModal({ open: false });
    };

    // Renderização dos Modais
    const renderModal = () => {
        if (!modal.open) return null;
        const close = () => setModal({ ...modal, open: false });
        switch(modal.type) {
            case 'auth_register': return ( <form onSubmit={handleRegisterSubmit} className="space-y-6"><div className="text-center"><div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 animate-bounce"><Icon name="plus" size={40}/></div><p className="text-slate-500">Seus dados ficam salvos apenas neste dispositivo.</p></div><Input name="name" label="Seu Nome" placeholder="Ex: João Silva" required autoFocus /><Input name="pin" type="password" label="Crie um PIN" placeholder="****" required /><Button type="submit" className="w-full py-4 text-lg shadow-xl shadow-indigo-500/20">Criar Perfil Seguro</Button></form> );
            case 'auth_login': return ( <form onSubmit={handleLoginSubmit} className="space-y-6"><div className="text-center"><div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white font-black text-4xl shadow-2xl shadow-indigo-500/40 transform rotate-3 hover:rotate-0 transition-transform duration-500">{modal.data.name[0].toUpperCase()}</div><h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">Olá, {modal.data.name}</h3><p className="text-slate-400 text-sm font-medium">Digite seu PIN.</p></div><Input name="pin" type="password" placeholder="• • • •" required autoFocus className="text-center text-4xl tracking-[1rem] font-black py-4" /><Button type="submit" className="w-full py-4 text-lg font-bold tracking-wide">Entrar</Button></form> );
            
            // Modais de Ação (Delegam para 'actions' do hook useZenData)
            case 'newSub': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addSub({ name: fd.get('name'), price: parseFloat(fd.get('price')), currency: fd.get('currency'), billingCycle: fd.get('cycle'), category: fd.get('category') }); close(); }}><Input name="name" label="Serviço" required autoFocus /><div className="grid grid-cols-2 gap-4"><Select name="currency" label="Moeda"><option value="BRL">BRL (R$)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option></Select><Input name="price" type="number" step="0.01" label="Valor" required /></div><Select name="cycle" label="Ciclo"><option value="monthly">Mensal</option><option value="yearly">Anual</option></Select><Select name="category" label="Categoria"><option>Streaming</option><option>Música</option><option>Software</option><option>Outros</option></Select><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newGoal': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addGoal({ name: fd.get('name'), target: parseFloat(fd.get('target')), current: 0, color: 'brand' }); close(); }}><Input name="name" label="Nome" required /><Input name="target" type="number" label="Alvo" required /><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'depositGoal': return <form onSubmit={e => { e.preventDefault(); actions.updateGoal(modal.data.id, modal.data.current + parseFloat(new FormData(e.target).get('amount'))); close(); }}><p className="mb-4 font-bold text-center">{modal.data.name}</p><Input name="amount" type="number" label="Valor do Depósito" required autoFocus /><Button type="submit" className="w-full">Confirmar</Button></form>;
            case 'newCategory': return <form onSubmit={e => { e.preventDefault(); actions.addCat({ name: new FormData(e.target).get('name'), icon: 'tag', type: 'expense' }); close(); }}><Input name="name" label="Nome" required autoFocus /><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newCard': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addCard({ name: fd.get('name'), limit: parseFloat(fd.get('limit')), closingDay: parseInt(fd.get('closing')), dueDay: parseInt(fd.get('due')) }); close(); }}><Input name="name" label="Nome do Cartão" required /><Input name="limit" type="number" label="Limite" required /><div className="grid grid-cols-2 gap-4"><Input name="closing" type="number" label="Fecha dia" required /><Input name="due" type="number" label="Vence dia" required /></div><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'editBudget': return <form onSubmit={e => { e.preventDefault(); actions.saveBudget({ category: modal.data.category, limit: parseFloat(new FormData(e.target).get('limit')) }); close(); }}><p className="mb-4 font-bold text-center">{modal.data.category}</p><Input name="limit" type="number" defaultValue={modal.data.limit} label="Limite Mensal" required /><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newRecurring': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addRecurring({ name: fd.get('name'), amount: parseFloat(fd.get('amount')), day: parseInt(fd.get('day')), category: 'Outros', lastPaid: '' }); close(); }}><Input name="name" label="Nome" required /><Input name="amount" type="number" label="Valor" required /><Input name="day" type="number" label="Dia Vencimento" required /><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newAsset': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addAsset({ name: fd.get('name'), value: parseFloat(fd.get('value')), type: fd.get('type') }); close(); }}><Input name="name" label="Nome" required /><Input name="value" type="number" label="Valor" required /><Select name="type" label="Tipo"><option value="asset">Ativo (Bem)</option><option value="liability">Passivo (Dívida)</option></Select><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newInvestment': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addInvestment({ name: fd.get('name'), type: fd.get('type'), quantity: parseFloat(fd.get('quantity')), buyPrice: parseFloat(fd.get('buyPrice')), currentPrice: parseFloat(fd.get('currentPrice')) }); close(); }}><Input name="name" label="Ativo (ex: PETR4)" required /><Select name="type" label="Tipo"><option value="Ação">Ação</option><option value="FII">FII</option><option value="Cripto">Cripto</option><option value="Renda Fixa">Renda Fixa</option></Select><div className="grid grid-cols-3 gap-2"><Input name="quantity" type="number" label="Qtd" required /><Input name="buyPrice" type="number" label="Preço Médio" required /><Input name="currentPrice" type="number" label="Preço Atual" required /></div><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newWish': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addWish({ name: fd.get('name'), price: parseFloat(fd.get('price')), priority: fd.get('priority') }); close(); }}><Input name="name" label="Desejo" required /><Input name="price" type="number" label="Preço" required /><Select name="priority" label="Prioridade"><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></Select><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'buyWish': return <div className="text-center"><p className="mb-4">Comprar "<strong>{modal.data.name}</strong>"?</p><Button onClick={() => { actions.buyWish(modal.data); close(); }} className="w-full">Sim, Comprar!</Button></div>;
            case 'mentalCheckin': return <form onSubmit={e => { e.preventDefault(); actions.addMental({ intensity: modal.data.l, score: modal.data.s, trigger: new FormData(e.target).get('trigger'), date: new Date().toISOString() }); close(); }}><p className="mb-4 text-center">Sentindo-se: <strong>{modal.data.l}</strong></p><Input name="trigger" label="Motivo" required /><Button type="submit" className="w-full">Salvar</Button></form>;
            case 'newShopItem': return <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target); actions.addShopItem({ name: fd.get('name'), price: parseFloat(fd.get('price')), quantity: parseFloat(fd.get('quantity')), checked: false }); close(); }}><Input name="name" label="Item" required autoFocus /><div className="grid grid-cols-2 gap-4"><Input name="price" type="number" step="0.01" label="Preço Unit." required /><Input name="quantity" type="number" defaultValue="1" label="Qtd" required /></div><Button type="submit" className="w-full">Adicionar</Button></form>;
            default: return null;
        }
    };

    if(!user) return (
        <>
            <LoginView profiles={profiles} onSelectProfile={handleProfileSelect} onCreateProfile={createProfileStart} />
            <Modal isOpen={modal.open} onClose={()=>setModal({...modal, open:false})} title={modal.type==='auth_login' ? 'Bem-vindo' : modal.type==='auth_register' ? 'Novo Perfil' : 'Ação'}>{renderModal()}</Modal>
        </>
    );

    const menu = [
        {id:'dashboard', label:'Geral', icon:'home'}, {id:'finances', label:'Finanças', icon:'wallet'}, {id:'travel', label:'Modo Viagem', icon:'globe'}, {id:'shopping', label:'Compras', icon:'cart'}, {id:'gamification', label:'Conquistas', icon:'award'}, {id:'subscriptions', label:'Assinaturas', icon:'tv'}, {id:'calendar', label:'Calendário', icon:'calendar'}, {id:'goals', label:'Metas', icon:'target'}, {id:'budgets', label:'Orçamentos', icon:'pie'}, {id:'recurring', label:'Contas Fixas', icon:'list'}, {id:'investments', label:'Investimentos', icon:'trendUp'}, {id:'assets', label:'Patrimônio', icon:'diamond'}, {id:'wishlist', label:'Desejos', icon:'gift'}, {id:'cards', label:'Cartões', icon:'credit'}, {id:'debts', label:'Parcelamentos', icon:'list'}, {id:'tools', label:'Ferramentas', icon:'tool'}, {id:'importer', label:'Importar', icon:'download'}, {id:'reports', label:'Relatórios', icon:'file'}, {id:'mental', label:'Mental', icon:'brain'}, {id:'settings', label:'Ajustes', icon:'settings'}
    ];

    const renderView = () => {
        switch(tab) {
            case 'finances': return <FinancesView transactions={data.txs} categories={data.cats} cards={data.cards} onAdd={actions.addTx} privacy={privacy}/>;
            case 'travel': return <TravelView transactions={data.txs} onAdd={actions.addTx} rates={rates} privacy={privacy}/>;
            case 'shopping': return <ShoppingView items={data.shopping || []} onAdd={actions.addShopItem} onCheck={actions.checkShopItem} onLaunch={actions.launchShopExpense} openModal={(t,d)=>setModal({open:true,type:t,data:d})} />;
            case 'gamification': return <GamificationView transactions={data.txs} investments={data.investments} goals={data.goals} recurring={data.recurring} mentalLogs={data.logs} privacy={privacy} />;
            case 'subscriptions': return <SubscriptionsView subscriptions={data.subscriptions} onAdd={actions.addSub} onDelete={actions.deleteSub} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'settings': return <SettingsView categories={data.cats} rates={rates} onUpdateRates={actions.updateRate} onImport={actions.importImport} onExport={actions.exportData} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'cards': return <CardsView cards={data.cards} transactions={data.txs} onDeleteCard={actions.deleteCard} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'calendar': return <CalendarView transactions={data.txs} recurring={data.recurring}/>;
            case 'assets': return <AssetsView assets={data.assets} onDelete={actions.deleteAsset} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'investments': return <InvestmentsView investments={data.investments} onDelete={actions.deleteInvestment} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'wishlist': return <WishlistView wishlist={data.wishlist} onDelete={actions.deleteWish} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'tools': return <ToolsView/>;
            case 'importer': return <ImporterView onImport={actions.importTxs}/>;
            case 'reports': return <ReportsView transactions={data.txs}/>;
            case 'mental': return <MentalView logs={data.logs} onAdd={actions.addMental} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'goals': return <GoalsView goals={data.goals} onUpdate={actions.updateGoal} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'budgets': return <BudgetsView transactions={data.txs} budgets={data.budgets} categories={data.cats} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'recurring': return <RecurringView recurring={data.recurring} onAdd={actions.addRecurring} onPay={actions.payRecurring} privacy={privacy} openModal={(t,d)=>setModal({open:true,type:t,data:d})}/>;
            case 'debts': return <DebtsView transactions={data.txs} privacy={privacy}/>;
            default: return <Dashboard transactions={data.txs} mentalLogs={data.logs} date={date} setDate={setDate} privacy={privacy} notifications={notifications} rates={rates}/>;
        }
    };

    return (
        <div className="flex min-h-screen">
            <aside className="hidden md:flex flex-col w-72 h-screen fixed p-6 z-20 glass overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 mb-8 px-2"><div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center text-white shadow-lg"><Icon name="chart" size={20}/></div><div><h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">ControlCash</h1><p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Pro</p></div></div>
                <nav className="space-y-1 flex-1">{menu.map(m => (<button key={m.id} onClick={()=>setTab(m.id)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${tab===m.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}><Icon name={m.icon} size={20}/> {m.label}</button>))}</nav>
                <div className="flex justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={()=>setPrivacy(!privacy)} className={`p-3 rounded-xl transition-colors ${privacy ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500'}`} title="Modo Privacidade"><Icon name={privacy ? 'eyeOff' : 'eye'}/></button>
                    <button onClick={()=>setDarkMode(!darkMode)} className="p-3 rounded-xl text-slate-400 hover:text-brand-500 transition-colors"><Icon name="moon"/></button>
                    <button onClick={()=>logout()} className="p-3 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"><Icon name="logOut"/></button>
                </div>
            </aside>
            <main className="md:ml-72 flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full z-10 relative">{renderView()}</main>
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/95 backdrop-blur-lg p-2 border-t border-slate-200 dark:border-slate-800 flex justify-around z-50 overflow-x-auto pb-safe">{menu.map(m => <button key={m.id} onClick={()=>setTab(m.id)} className={`p-3 rounded-xl shrink-0 flex flex-col items-center gap-1 ${tab===m.id?'text-brand-600':'text-slate-400'}`}><Icon name={m.icon} size={24}/><span className="text-[10px] font-bold">{m.label}</span></button>)}</div>
            <Modal isOpen={modal.open} onClose={()=>setModal({...modal, open:false})} title={modal.type==='auth_login' ? 'Bem-vindo' : modal.type==='auth_register' ? 'Novo Perfil' : 'Ação'}>{renderModal()}</Modal>
        </div>
    );
};

const App = () => <ToastProvider><AppContent/></ToastProvider>;
export default App;