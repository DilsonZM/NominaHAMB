import React from 'react';

interface ResultCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  type: 'info' | 'income' | 'deduction' | 'net' | 'subtotal' | 'warning';
  icon?: React.ReactNode;
  days?: number; // Nuevo prop para mostrar los días
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, subtitle, amount, type, icon, days }) => {
  
  // Estilos dinámicos basados en el tipo y el tema (dark/light classes)
  const getContainerStyles = () => {
    switch (type) {
      case 'income':
        return 'bg-white dark:bg-[#151B28] border-l-4 border-l-blue-500 dark:border-l-blue-500 border-y border-r border-slate-200 dark:border-slate-800';
      case 'subtotal':
        return 'bg-slate-50 dark:bg-[#1e293b] border border-blue-200 dark:border-blue-900/50 shadow-sm';
      case 'deduction':
        return 'bg-white dark:bg-[#151B28] border-l-4 border-l-rose-500 dark:border-l-rose-500 border-y border-r border-slate-200 dark:border-slate-800';
      case 'net':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 border-none';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50';
      default:
        return 'bg-white dark:bg-[#151B28] border border-slate-200 dark:border-slate-800';
    }
  };

  const getTextColors = () => {
    if (type === 'net') return { title: 'text-emerald-50', amount: 'text-white', subtitle: 'text-emerald-100' };
    if (type === 'warning') return { title: 'text-amber-700 dark:text-amber-400', amount: 'text-amber-700 dark:text-amber-400', subtitle: 'text-amber-600/70' };
    if (type === 'deduction') return { title: 'text-slate-700 dark:text-slate-300', amount: 'text-rose-600 dark:text-rose-400', subtitle: 'text-slate-400' };
    if (type === 'subtotal') return { title: 'text-slate-800 dark:text-white', amount: 'text-blue-600 dark:text-blue-400', subtitle: 'text-slate-400' };
    
    return { title: 'text-slate-700 dark:text-slate-200', amount: 'text-slate-900 dark:text-white', subtitle: 'text-slate-500 dark:text-slate-400' };
  };

  const colors = getTextColors();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  return (
    <div className={`p-4 rounded-xl mb-3 flex items-center justify-between transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md ${getContainerStyles()}`}>
      <div className="flex items-center gap-3">
        {icon && <div className={`p-2 rounded-lg ${type === 'net' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'} ${type === 'net' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>{icon}</div>}
        <div>
          <div className="flex items-center gap-2">
            <h4 className={`font-bold text-sm ${colors.title}`}>{title}</h4>
            {/* Badge de días */}
            {days !== undefined && days > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                type === 'net' 
                  ? 'bg-white/20 border-white/30 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {days} días
              </span>
            )}
          </div>
          {subtitle && <p className={`text-xs mt-0.5 ${colors.subtitle}`}>{subtitle}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold text-lg tracking-wide ${colors.amount}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
};