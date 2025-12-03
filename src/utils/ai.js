// --- CÉREBRO DE INTELIGÊNCIA LOCAL (ZEN GENIUS V3) ---

export const parseMagicInput = (text, history = []) => {
    if (!text) return { amount: 0, note: '', category: 'Outros', type: 'expense', tags: [] };
    
    const lower = text.toLowerCase();
    const result = {
        amount: null,
        category: null,
        note: '',
        type: 'expense',
        tags: [], 
        date: new Date().toISOString().slice(0, 10)
    };

    // 1. Detectar Tags (#exemplo)
    const tagMatch = text.match(/#[\w]+/g);
    if (tagMatch) {
        result.tags = tagMatch.map(t => t.replace('#', ''));
        text = text.replace(/#[\w]+/g, '');
    }

    // 2. Detectar Valor (R$)
    const valueMatch = text.match(/(\d+([.,]\d{1,2})?)/g);
    if (valueMatch) {
        // Pega o maior valor numérico encontrado (assume que é o preço)
        const values = valueMatch.map(v => parseFloat(v.replace(',', '.')));
        const likelyValue = values.reduce((max, v) => (v < 100000 && v > max ? v : max), 0); 
        if (likelyValue > 0) result.amount = likelyValue;
    }

    // 3. Detectar Tipo (Palavras-chave fortes)
    if (/(recebi|ganhei|salário|venda|lucro|depósito|pix recebido)/i.test(lower)) {
        result.type = 'income';
    }

    // 4. Limpeza inteligente da descrição
    // Remove o valor e palavras de ligação para sobrar só o nome (ex: "Padaria do Zé")
    let cleanText = text;
    if (result.amount) {
        const valueRegex = new RegExp(result.amount.toString().replace('.', '[.,]'), 'g');
        cleanText = cleanText.replace(valueRegex, '');
    }
    cleanText = cleanText.replace(/\b(reais|real|r\$|custou|foi|paguei|no|na|do|da|de|para|com)\b/gi, ' ').trim();
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    if (cleanText.length > 1) {
        result.note = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
    } else {
        result.note = 'Geral';
    }

    // 5. INTELIGÊNCIA HÍBRIDA (Dicionário + Memória)
    
    // A) Tenta Dicionário Fixo (Rápido e Padrão)
    const categoriesMap = {
        'Alimentação': ['comida', 'almoço', 'jantar', 'lanche', 'ifood', 'mercado', 'restaurante', 'pizza', 'café', 'padaria', 'burger', 'açaí', 'beber', 'cerveja'],
        'Transporte': ['uber', '99', 'táxi', 'ônibus', 'metrô', 'gasolina', 'combustível', 'estacionamento', 'pedágio', 'carro', 'moto', 'mecânico'],
        'Moradia': ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'net', 'claro', 'vivo', 'tim', 'gás', 'casa', 'apto', 'manutenção', 'faxina'],
        'Saúde': ['farmácia', 'médico', 'dentista', 'exame', 'remédio', 'consulta', 'hospital', 'terapia', 'psicólogo', 'academia'],
        'Lazer': ['cinema', 'filme', 'jogo', 'steam', 'netflix', 'spotify', 'viagem', 'passeio', 'bar', 'show', 'festa'],
        'Salário': ['salário', 'pagamento', 'freela', 'bônus', '13º', 'férias'],
        'Investimentos': ['aporte', 'ação', 'fii', 'bitcoin', 'cdb', 'tesouro', 'investimento', 'corretora'],
        'Educação': ['curso', 'livro', 'faculdade', 'escola', 'aula']
    };

    for (const [cat, keywords] of Object.entries(categoriesMap)) {
        if (keywords.some(k => lower.includes(k))) {
            result.category = cat;
            break;
        }
    }

    // B) Se falhou, usa a Memória (Histórico do Usuário)
    if (!result.category && history.length > 0) {
        // Procura transações passadas com descrição similar
        const similarTx = history.find(t => 
            t.note && t.note.toLowerCase().includes(cleanText.toLowerCase())
        );
        if (similarTx) {
            result.category = similarTx.category;
        }
    }
    
    // C) Fallback
    if (!result.category) result.category = 'Outros';

    return result;
};