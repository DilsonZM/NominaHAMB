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
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {daysValue !== undefined && (
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-20 text-center">
            Días
          </label>
        )}
      </div>
      
      <div className="flex gap-3 group">
        {/* Input de Moneda */}
        <div className="relative flex-1 rounded-xl shadow-sm transition-all duration-200">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <span className="text-slate-400 dark:text-slate-500 font-semibold">$</span>
          </div>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={`block w-full rounded-xl border-0 py-3 pl-8 text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 font-bold transition-all
              ${disabled ? 'bg-slate-100 dark:bg-slate-800/50 opacity-70 cursor-not-allowed' : 'bg-white dark:bg-[#151B28] hover:ring-brand-400/50'}
            `}
            placeholder="0"
          />
        </div>

        {/* Input de Días (Opcional) */}
        {daysValue !== undefined && onDaysChange && (
          <div className="w-24">
            <input
              type="number"
              min="0"
              max="30"
              value={daysValue}
              onChange={(e) => onDaysChange(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-xl border-0 py-3 text-center text-slate-900 dark:text-white ring-1 ring-inset ring-slate-200 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 font-bold bg-white dark:bg-[#151B28]"
            />
          </div>
        )}
      </div>
    </div>
  );
};