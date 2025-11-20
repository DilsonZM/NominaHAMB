import React from 'react';

interface ResultCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  type: 'info' | 'income' | 'deduction' | 'net' | 'subtotal' | 'warning';
  icon?: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, subtitle, amount, type, icon }) => {
  const getStyles = () => {
    switch (type) {
      case 'income':
        // Estilo azul oscuro para ingresos
        return 'bg-[#1e293b] border border-slate-700 text-white';
      case 'subtotal':
         // Estilo específico para TOTAL INGRESOS
        return 'bg-[#1e293b] border border-brand-900 shadow-[0_0_15px_rgba(59,130,246,0.1)] text-white';
      case 'deduction':
        // Estilo rojizo oscuro para deducciones
        return 'bg-[#2D1A1A] border border-rose-900/30 text-rose-200';
      case 'net':
        // Estilo verde destacado para el neto
        return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-none';
      case 'warning':
        // Estilo ámbar para incapacidades
        return 'bg-amber-950/30 border border-amber-900/50 text-amber-100';
      default:
        return 'bg-[#1e293b] border border-slate-700 text-slate-300';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div className={`p-4 rounded-xl mb-3 flex items-center justify-between ${getStyles()} transition-all`}>
      <div className="flex items-center gap-3">
        {icon && <div className="opacity-80">{icon}</div>}
        <div>
          <h4 className={`font-bold text-sm ${type === 'net' ? 'text-emerald-50' : ''}`}>{title}</h4>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg tracking-wide ${type === 'deduction' ? 'text-rose-400' : ''} ${type === 'subtotal' ? 'text-blue-400' : ''} ${type === 'warning' ? 'text-amber-400' : ''}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
};