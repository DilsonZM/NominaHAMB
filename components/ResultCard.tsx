import React from 'react';

interface ResultCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  type: 'info' | 'income' | 'deduction' | 'net' | 'subtotal' | 'warning';
  icon?: React.ReactNode;
  days?: number; 
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, subtitle, amount, type, icon, days }) => {
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const getTextColor = () => {
    switch(type) {
      case 'deduction': return 'text-rose-500 dark:text-rose-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      case 'income': return 'text-slate-900 dark:text-white';
      case 'info': return 'text-brand-600 dark:text-brand-300';
      default: return 'text-slate-900 dark:text-slate-300';
    }
  }

  const getBgHover = () => {
    switch(type) {
      case 'deduction': return 'hover:bg-rose-50 dark:hover:bg-rose-500/5';
      case 'warning': return 'hover:bg-amber-50 dark:hover:bg-amber-500/5';
      default: return 'hover:bg-brand-50 dark:hover:bg-brand-500/5';
    }
  }

  return (
    <div className={`flex items-center justify-between py-3 px-3 -mx-3 rounded-xl transition-colors ${getBgHover()} group`}>
      <div className="flex items-center gap-3">
        {icon && <div className="text-amber-500 dark:text-amber-400">{icon}</div>}
        <div>
          <div className="flex items-center gap-2">
             <h4 className={`font-medium text-sm ${type === 'info' ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'}`}>{title}</h4>
             {days !== undefined && days > 0 && (
               <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                 {days}d
               </span>
             )}
          </div>
          {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-1 justify-end">
         {/* Dotted Line */}
         <div className="flex-1 border-b-2 border-dotted border-slate-200 dark:border-white/5 h-px opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></div>

         <div className={`font-mono font-bold text-sm tracking-tight ${getTextColor()}`}>
            {type === 'deduction' ? '-' : ''}{formatCurrency(amount)}
         </div>
      </div>
    </div>
  );
};