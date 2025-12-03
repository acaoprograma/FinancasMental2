export const CURRENCIES = {
    BRL: { symbol: 'R$', name: 'Real Brasileiro', locale: 'pt-BR' },
    USD: { symbol: 'US$', name: 'Dólar Americano', locale: 'en-US' },
    EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
    GBP: { symbol: '£', name: 'Libra Esterlina', locale: 'en-GB' }
};

// Taxas padrão (o usuário poderá alterar depois)
export const DEFAULT_RATES = {
    BRL: 1,
    USD: 5.00,
    EUR: 5.40,
    GBP: 6.30
};

export const formatCurrency = (value, currency = 'BRL') => {
    const conf = CURRENCIES[currency] || CURRENCIES.BRL;
    return new Intl.NumberFormat(conf.locale, {
        style: 'currency',
        currency: currency
    }).format(value);
};

export const convertToBRL = (amount, currency, rates) => {
    if (currency === 'BRL') return amount;
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1;
    return amount * rate;
};