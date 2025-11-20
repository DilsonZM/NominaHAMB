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
      case 'deduction': return 'text-rose-500';
      case 'warning': return 'text-amber-500';
      case 'income': return 'text-slate-900 dark:text-white';
      default: return 'text-slate-700 dark:text-slate-300';
    }
  }

  return (
    <div className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-3">
        {icon && <div className="text-slate-400">{icon}</div>}
        <div>
          <div className="flex items-center gap-2">
             <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">{title}</h4>
             {days !== undefined && days > 0 && (
               <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                 {days}d
               </span>
             )}
          </div>
          {subtitle && <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{subtitle}</p>}
        </div>
      </div>
      
      {/* Dotted Line for Receipt feel */}
      <div className="flex-1 mx-4 border-b-2 border-dotted border-slate-300 dark:border-white/10 h-1 relative top-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"></div>

      <div className={`font-mono font-bold text-sm tracking-tight ${getTextColor()}`}>
        {type === 'deduction' ? '-' : ''}{formatCurrency(amount)}
      </div>
    </div>
  );
};