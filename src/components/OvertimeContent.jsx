import React from 'react';
import { Icons } from './Icons';
import { formatMoney } from '../utils/formatMoney';
import { RATES } from '../constants/rates';

export const OvertimeContent = ({ salary, hours, onChange }) => {
  const hourlyRate = salary / 240; 

  const totalOvertime = Object.entries(hours).reduce((acc, [key, val]) => {
    if (!RATES[key]) return acc;
    return acc + (val * hourlyRate * RATES[key].factor);
  }, 0);

  const handleInput = (key, val) => {
    const num = parseFloat(val) || 0;
    onChange(prev => ({ ...prev, [key]: num }));
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between mb-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <Icons.Clock />
                </div>
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Total Extras</h2>
                    <p className="text-xs text-slate-500">Valor calculado</p>
                </div>
            </div>
            <p className="text-xl font-black text-amber-500">{formatMoney(totalOvertime)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {Object.entries(RATES).map(([key, config]) => (
                <div key={key} className="bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <label className={`text-[10px] font-bold uppercase mb-1 block ${config.color}`}>{config.label}</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            value={hours[key] || ''}
                            onChange={(e) => handleInput(key, e.target.value)}
                            placeholder="0"
                            className="w-full bg-transparent text-xl font-bold text-slate-700 dark:text-white outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">Hrs</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                        {formatMoney(hours[key] * hourlyRate * config.factor)}
                    </p>
                </div>
            ))}
        </div>
    </div>
  );
};
