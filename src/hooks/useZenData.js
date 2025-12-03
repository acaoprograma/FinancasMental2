import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import { DEFAULT_RATES } from '../utils/currency';
import { useToast } from '../components/Feedback'; // Atualizado para importar do Feedback

export const useZenData = (user, tab) => {
    const [data, setData] = useState({
        txs: [], logs: [], goals: [], cats: [], budgets: [], 
        recurring: [], assets: [], cards: [], investments: [], 
        wishlist: [], subscriptions: [], settings: [], shopping: []
    });
    const [rates, setRates] = useState(DEFAULT_RATES);
    const [notifications, setNotifications] = useState([]);
    const showToast = useToast();

    // --- CARREGAMENTO INTELIGENTE (LAZY LOADING) ---
    const refreshData = useCallback(async () => {
        if(!user) return;

        try {
            const [settings, cats] = await Promise.all([
                db.settings.where({profileId: user.id}).toArray(),
                db.categories.where({profileId: user.id}).toArray()
            ]);

            const savedRates = {};
            settings.forEach(s => { if(s.key.startsWith('rate_')) savedRates[s.key.replace('rate_','')] = parseFloat(s.value); });
            setRates({ ...DEFAULT_RATES, ...savedRates });

            let finalCats = cats;
            if(cats.length === 0) {
                const defaults = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Salário', 'Investimentos', 'Outros'];
                await db.categories.bulkAdd(defaults.map(n => ({profileId:user.id, name:n, icon:'tag', type:'expense'})));
                finalCats = await db.categories.where({profileId:user.id}).toArray();
            }

            let updates = { settings, cats: finalCats };

            // Switch de Carregamento (Otimizado)
            switch (tab) {
                case 'dashboard':
                    const [d_txs, d_logs, d_rec] = await Promise.all([
                        db.transactions.where({profileId: user.id}).toArray(),
                        db.mentalLogs.where({profileId: user.id}).toArray(),
                        db.recurring.where({profileId: user.id}).toArray()
                    ]);
                    updates = { ...updates, txs: d_txs, logs: d_logs, recurring: d_rec };
                    const notifs = []; const today = new Date().getDate(); 
                    d_rec.forEach(r => { if(r.day - today <= 3 && r.day >= today) notifs.push(`Conta "${r.name}" vence dia ${r.day}`); });
                    setNotifications(notifs);
                    break;

                case 'finances': 
                case 'reports':
                case 'calendar':
                case 'travel':
                    const [f_txs, f_cards] = await Promise.all([
                        db.transactions.where({profileId: user.id}).toArray(),
                        db.cards.where({profileId: user.id}).toArray()
                    ]);
                    updates = { ...updates, txs: f_txs, cards: f_cards };
                    break;

                case 'investments':
                    const invs = await db.investments.where({profileId: user.id}).toArray();
                    updates = { ...updates, investments: invs };
                    break;
                
                case 'shopping':
                    const shop = await db.shopping.where({profileId: user.id}).toArray();
                    updates = { ...updates, shopping: shop };
                    break;

                case 'goals':
                    const goals = await db.goals.where({profileId: user.id}).toArray();
                    updates = { ...updates, goals };
                    break;

                case 'assets':
                    const assets = await db.assets.where({profileId: user.id}).toArray();
                    updates = { ...updates, assets };
                    break;

                case 'cards':
                    const [c_cards, c_txs] = await Promise.all([
                        db.cards.where({profileId: user.id}).toArray(),
                        db.transactions.where({profileId: user.id}).toArray()
                    ]);
                    updates = { ...updates, cards: c_cards, txs: c_txs };
                    break;

                case 'wishlist':
                    const wishes = await db.wishlist.where({profileId: user.id}).toArray();
                    updates = { ...updates, wishlist: wishes };
                    break;
                
                case 'subscriptions':
                    const subs = await db.subscriptions.where({profileId: user.id}).toArray();
                    updates = { ...updates, subscriptions: subs };
                    break;

                case 'budgets':
                    const [b_budgets, b_txs] = await Promise.all([
                        db.budgets.where({profileId: user.id}).toArray(),
                        db.transactions.where({profileId: user.id}).toArray()
                    ]);
                    updates = { ...updates, budgets: b_budgets, txs: b_txs };
                    break;
                
                case 'recurring':
                    const recs = await db.recurring.where({profileId: user.id}).toArray();
                    updates = { ...updates, recurring: recs };
                    break;

                case 'mental':
                    const m_logs = await db.mentalLogs.where({profileId: user.id}).toArray();
                    updates = { ...updates, logs: m_logs };
                    break;
                    
                case 'debts':
                case 'gamification':
                    const [g_txs, g_inv, g_goals, g_rec, g_logs] = await Promise.all([
                        db.transactions.where({profileId: user.id}).toArray(),
                        db.investments.where({profileId: user.id}).toArray(),
                        db.goals.where({profileId: user.id}).toArray(),
                        db.recurring.where({profileId: user.id}).toArray(),
                        db.mentalLogs.where({profileId: user.id}).toArray()
                    ]);
                    updates = {...updates, txs: g_txs, investments: g_inv, goals: g_goals, recurring: g_rec, logs: g_logs};
                    break;
            }
            setData(prev => ({ ...prev, ...updates }));
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            showToast("Erro ao carregar dados. Tente recarregar.", "danger");
        }
    }, [user, tab, showToast]);

    useEffect(() => { refreshData(); }, [refreshData]);

    // --- WRAPPER DE SEGURANÇA (TRY/CATCH AUTOMÁTICO) ---
    const safeAction = async (actionFn, successMsg = 'Salvo!') => {
        try {
            await actionFn();
            refreshData();
            if (successMsg) showToast(successMsg, 'success');
            return true;
        } catch (error) {
            console.error("Erro na ação:", error);
            // Mensagens de erro amigáveis
            let msg = 'Ocorreu um erro. Tente novamente.';
            if (error.name === 'QuotaExceededError') msg = 'Armazenamento cheio! Libere espaço no dispositivo.';
            if (error.name === 'DatabaseClosedError') msg = 'Banco de dados fechado. Recarregue a página.';
            
            showToast(msg, 'danger');
            return false;
        }
    };

    // --- AÇÕES DO SISTEMA (BLINDADAS) ---
    const actions = {
        updateRate: (currency, value) => safeAction(async () => {
            const val = parseFloat(value);
            setRates(prev => ({ ...prev, [currency]: val }));
            const key = `rate_${currency}`;
            const existing = await db.settings.where({profileId: user.id, key}).first();
            if (existing) await db.settings.update(existing.id, { value: val });
            else await db.settings.add({ profileId: user.id, key, value: val });
        }, null), // Sem toast para update de taxa (seria chato)

        addTx: (fd) => safeAction(async () => {
            const batch=[]; const inst=parseInt(fd.installments); const amt=parseFloat(fd.amount)/inst; const gid=Date.now(); const bd=new Date(fd.date); 
            const card=data.cards.find(c=>c.name===fd.paymentMethod.replace('💳 ','')); const cardId=card?card.id:null; 
            for(let i=0;i<inst;i++){ const d=new Date(bd); d.setMonth(bd.getMonth()+i); batch.push({...fd, profileId:user.id, amount:amt.toFixed(2), date:d.toISOString().slice(0,10), isInstallment:inst>1, installmentGroup:gid, installmentCurrent:i+1, installmentTotal:inst, cardId}); } 
            await db.transactions.bulkAdd(batch);
        }, 'Transação salva!'),

        addSub: (s) => safeAction(async () => db.subscriptions.add({...s, profileId: user.id}), 'Assinatura salva!'),
        deleteSub: (id) => safeAction(async () => db.subscriptions.delete(id), 'Assinatura removida'),
        
        addMental: (ld) => safeAction(async () => db.mentalLogs.add({...ld, profileId:user.id}), 'Check-in salvo!'),
        
        addGoal: (g) => safeAction(async () => db.goals.add({...g, profileId:user.id}), 'Meta criada!'),
        updateGoal: (id, val, del=false) => safeAction(async () => {
            if(del) await db.goals.delete(id); 
            else await db.goals.update(id, {current:val});
        }, del ? 'Meta removida' : 'Depósito realizado!'),

        addCat: (c) => safeAction(async () => db.categories.add({...c, profileId:user.id}), 'Categoria criada!'),
        
        addCard: (c) => safeAction(async () => db.cards.add({...c, profileId:user.id}), 'Cartão criado!'),
        deleteCard: (id) => safeAction(async () => db.cards.delete(id), 'Cartão removido'),
        
        saveBudget: (b) => safeAction(async () => {
            const existing = data.budgets.find(x => x.category === b.category);
            if(existing) await db.budgets.update(existing.id, {limit: b.limit});
            else await db.budgets.add({...b, profileId: user.id});
        }, 'Orçamento salvo!'),

        addRecurring: (r) => safeAction(async () => db.recurring.add({...r, profileId: user.id}), 'Conta fixa criada!'),
        payRecurring: (r) => safeAction(async () => {
            const today = new Date();
            await db.transactions.add({ profileId:user.id, type: 'expense', amount: r.amount, category: r.category, date: today.toISOString().slice(0,10), paymentMethod: 'Conta Fixa', installments: 1, note: `Pgto: ${r.name}` });
            await db.recurring.update(r.id, { lastPaid: today.toISOString().slice(0, 7) });
        }, 'Conta paga com sucesso!'),

        addAsset: (a) => safeAction(async () => db.assets.add({...a, profileId: user.id}), 'Bem/Dívida salvo!'),
        deleteAsset: (id) => safeAction(async () => db.assets.delete(id), 'Item removido'),

        importTxs: (txs) => safeAction(async () => db.transactions.bulkAdd(txs.map(t => ({...t, profileId:user.id}))), `${txs.length} itens importados!`),
        
        importImport: (e) => { // Este é síncrono no wrapper, mas a leitura é callback. Tratamos dentro.
            const fr = new FileReader();
            fr.onload = async (ev) => {
                try {
                    const d = JSON.parse(ev.target.result);
                    if(confirm('Restaurar backup? Isso irá mesclar com os dados atuais.')) {
                        if(d.txs) await db.transactions.bulkAdd(d.txs.map(x => ({...x, id: undefined, profileId: user.id})));
                        refreshData();
                        showToast('Backup restaurado!', 'success');
                    }
                } catch (err) {
                    console.error(err);
                    showToast('Arquivo de backup inválido', 'danger');
                }
            };
            fr.readAsText(e.target.files[0]);
        },

        exportData: () => {
            try {
                const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `zenfinance_backup_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
            } catch (err) {
                showToast('Erro ao exportar', 'danger');
            }
        },

        addInvestment: (inv) => safeAction(async () => db.investments.add({...inv, profileId: user.id}), 'Investimento salvo!'),
        deleteInvestment: (id) => safeAction(async () => db.investments.delete(id), 'Investimento removido'),

        addWish: (w) => safeAction(async () => db.wishlist.add({...w, profileId: user.id}), 'Desejo salvo!'),
        deleteWish: (id) => safeAction(async () => db.wishlist.delete(id), 'Desejo removido'),
        buyWish: (w) => safeAction(async () => {
            const today = new Date();
            await db.transactions.add({ profileId:user.id, type: 'expense', amount: w.price, category: 'Lazer', date: today.toISOString().slice(0,10), paymentMethod: 'Outros', installments: 1, note: `Compra: ${w.name}` });
            await db.wishlist.delete(w.id);
        }, 'Parabéns pela conquista!'),

        addShopItem: (item) => safeAction(async () => db.shopping.add({...item, profileId: user.id}), null),
        checkShopItem: (id, checked) => safeAction(async () => db.shopping.update(id, {checked}), null),
        launchShopExpense: (total) => safeAction(async () => {
            const today = new Date().toISOString().slice(0,10);
            await db.transactions.add({ profileId:user.id, type: 'expense', amount: total, category: 'Alimentação', date: today, paymentMethod: 'Outros', installments: 1, note: 'Lista de Compras' });
            const checkedItems = data.shopping.filter(i => i.checked);
            await Promise.all(checkedItems.map(i => db.shopping.delete(i.id)));
        }, 'Despesa de compras lançada!')
    };

    return { data, rates, notifications, refreshData, actions };
};