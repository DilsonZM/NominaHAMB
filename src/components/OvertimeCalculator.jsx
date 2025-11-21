import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { formatMoney } from '../utils/formatMoney';

const RATES = {
  HED: { label: 'Extra Diurna', factor: 1.25, color: 'text-orange-500' },
  HEN: { label: 'Extra Nocturna', factor: 1.75, color: 'text-blue-500' },
  RN:  { label: 'Recargo Nocturno', factor: 0.35, color: 'text-indigo-400' },
  DD:  { label: 'Dom/Festivo', factor: 1.75, color: 'text-rose-500' },
  HEDF:{ label: 'Extra Dom. Diurna', factor: 2.00, color: 'text-orange-600' },
  HENF:{ label: 'Extra Dom. Nocturna', factor: 2.50, color: 'text-purple-500' },
};

export const OvertimeCalculator = ({ salary, isOpen, onClose, onChange }) => {
  const [hours, setHours] = useState({ HED: 0, HEN: 0, RN: 0, DD: 0, HEDF: 0, HENF: 0 });
  
  // Cargar desde localStorage si existe (opcional, por ahora local)
  // Calcular valor hora (Usando 230 horas promedio por reducción jornada o 240 estándar)
  // Para simplificar y ser estándar: Salario / 30 / 8
  const hourlyRate = salary / 240; 

  const totalOvertime = Object.entries(hours).reduce((acc, [key, val]) => {
    return acc + (val * hourlyRate * RATES[key].factor);
  }, 0);

  useEffect(() => {
    onChange(totalOvertime);
  }, [totalOvertime]);

  const handleInput = (key, val) => {
    const num = parseFloat(val) || 0;
    setHours(prev => ({ ...prev, [key]: num }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      
      {/* Modal / Sheet */}
      <div className="bg-white dark:bg-[#161E2E] w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto animate-in slide-in-from-bottom-10">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
        
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                <Icons.Clock />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Horas Extras</h2>
                <p className="text-xs text-slate-500">Calculadora de Recargos</p>
            </div>
            <div className="ml-auto text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Extras</p>
                <p className="text-lg font-black text-amber-500">{formatMoney(totalOvertime)}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar pb-4">
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
    </div>
  );
};
