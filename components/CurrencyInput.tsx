import React from 'react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  daysValue?: number;
  onDaysChange?: (days: number) => void;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({ 
  label, 
  value, 
  onChange, 
  daysValue,
  onDaysChange,
  disabled = false
}) => {
  return (
    <div className="group">
      <div className="flex justify-between mb-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-focus-within:text-brand-500 transition-colors">
          {label}
        </label>
        {daysValue !== undefined && (
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 w-16 text-center">
            Días
          </label>
        )}
      </div>
      
      <div className="flex gap-3">
        {/* Input de Moneda */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-slate-400 dark:text-slate-500 font-medium">$</span>
          </div>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={`block w-full rounded-xl border-0 py-3 pl-8 ring-1 ring-inset transition-all shadow-sm sm:text-sm sm:leading-6 font-bold
              ${disabled 
                ? 'bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed ring-slate-200 dark:ring-white/5' 
                : 'bg-white dark:bg-[#0B0F17]/50 text-slate-900 dark:text-white ring-slate-200 dark:ring-white/10 hover:ring-brand-400 focus:ring-2 focus:ring-inset focus:ring-brand-500'
              }
            `}
            placeholder="0"
          />
        </div>

        {/* Input de Días (Opcional) */}
        {daysValue !== undefined && onDaysChange && (
          <div className="w-16 relative">
             <input
              type="number"
              min="0"
              max="30"
              value={Math.round(daysValue * 10) / 10} // Round to 1 decimal
              onChange={(e) => onDaysChange(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-xl border-0 py-3 text-center ring-1 ring-inset transition-colors shadow-sm sm:text-sm sm:leading-6 font-bold
                bg-white dark:bg-[#0B0F17]/50 
                text-slate-900 dark:text-white
                ring-slate-200 dark:ring-white/10 
                hover:ring-brand-400 focus:ring-2 focus:ring-inset focus:ring-brand-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};