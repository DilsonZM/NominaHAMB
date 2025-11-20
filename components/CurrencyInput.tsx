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
        <label className="text-sm font-medium text-slate-300">
          {label}
        </label>
        {daysValue !== undefined && (
          <label className="text-sm font-medium text-slate-300 w-20 text-center">
            Días
          </label>
        )}
      </div>
      
      <div className="flex gap-3">
        {/* Input de Moneda */}
        <div className="relative flex-1 rounded-md shadow-sm">
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className={`block w-full rounded-lg border-0 py-2.5 pl-4 text-slate-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 font-semibold ${disabled ? 'bg-gray-100 opacity-70' : 'bg-white'}`}
            placeholder="0"
          />
        </div>

        {/* Input de Días (Opcional) */}
        {daysValue !== undefined && onDaysChange && (
          <div className="w-20">
            <input
              type="number"
              min="0"
              max="30"
              value={daysValue}
              onChange={(e) => onDaysChange(parseFloat(e.target.value) || 0)}
              className="block w-full rounded-lg border-0 py-2.5 text-center text-slate-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-500 sm:text-sm sm:leading-6 font-semibold bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};