import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Icon, Card, Button } from '../components/UI';
import { formatCurrency } from '../utils/currency';

export const ReportsView = ({ transactions }) => { 
    const generatePDF = () => { 
        const doc = new jsPDF();
        
        // Cabeçalho Bonito
        doc.setFillColor(79, 70, 229); // Indigo 600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Relatório Financeiro", 14, 20);
        doc.setFontSize(12);
        doc.text("ZenFinance - Extrato Detalhado", 14, 30);
        
        doc.setTextColor(0, 0, 0);
        
        const tableColumn = ["Data", "Categoria", "Descrição", "Tipo", "Valor"];
        const tableRows = [];

        transactions.forEach(t => {
            const ticketData = [
                new Date(t.date).toLocaleDateString(),
                t.category,
                t.note || '-',
                t.type === 'income' ? 'Receita' : 'Despesa',
                formatCurrency(parseFloat(t.amount), t.currency || 'BRL')
            ];
            tableRows.push(ticketData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        doc.save(`relatorio_zenfinance_${new Date().toISOString().slice(0,10)}.pdf`);
    }; 

    return (
        <div className="animate-fade-in space-y-8 pb-24">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Icon name="file"/> Central de Relatórios
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:border-indigo-500 transition-colors cursor-pointer group" onClick={generatePDF}>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="file" size={32}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Extrato em PDF</h3>
                            <p className="text-slate-500 text-sm mt-1">Baixar histórico completo para impressão.</p>
                        </div>
                    </div>
                </Card>
                
                <Card className="opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-500 flex items-center justify-center">
                            <Icon name="sheet" size={32}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white">Exportar Excel</h3>
                            <p className="text-slate-500 text-sm mt-1">Em breve (Versão 2.1)</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    ); 
};