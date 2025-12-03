import Dexie from 'dexie';

export const db = new Dexie("ControlCashDB");

// Versões anteriores
db.version(1).stores({ profiles: '++id, name, pin, theme', transactions: '++id, profileId, type, amount, category, date, paymentMethod, isInstallment, installmentGroup, installmentCurrent, installmentTotal, note', mentalLogs: '++id, profileId, intensity, trigger, date, score' });
db.version(2).stores({ goals: '++id, profileId, name, target, current, deadline, color', categories: '++id, profileId, name, icon, type' });
db.version(3).stores({ budgets: '++id, profileId, category, limit', recurring: '++id, profileId, name, amount, day, category, lastPaid' });
db.version(4).stores({ assets: '++id, profileId, name, value, type' });
db.version(5).stores({ cards: '++id, profileId, name, limit, closingDay, dueDay, color', transactions: '++id, profileId, type, amount, category, date, paymentMethod, cardId, isInstallment, installmentGroup, installmentCurrent, installmentTotal, note' });
db.version(6).stores({ investments: '++id, profileId, name, type, quantity, buyPrice, currentPrice', wishlist: '++id, profileId, name, price, priority, link' });
db.version(7).stores({ shopping: '++id, profileId, name, price, quantity, checked', subscriptions: '++id, profileId, name, price, currency, billingCycle, category', settings: '++id, profileId, key, value' });

// V19: Adicionando suporte a Tags
// *tags indica que é um array multi-valor (indexado)
db.version(8).stores({
    transactions: '++id, profileId, type, amount, category, date, paymentMethod, cardId, isInstallment, installmentGroup, installmentCurrent, installmentTotal, note, currency, *tags',
    tags: '++id, profileId, name, color'
});