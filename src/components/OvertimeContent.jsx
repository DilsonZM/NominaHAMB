import React, { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { formatMoney } from '../utils/formatMoney';
import { RATES } from '../constants/rates';
import { isHoliday } from '../utils/holidays';

export const OvertimeContent = ({ salary, entries = [], onChange }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  
  const [form, setForm] = useState({
    type: 'HED',
    start: '',
    end: ''
  });

  const hourlyRate = salary / 240;

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const getBgColor = (textClass) => textClass ? textClass.replace('text-', 'bg-') : 'bg-slate-400';
  
  const handleMonthChange = (delta) => {
    setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + delta)));
  };

  // --- LOGIC ---
  const calculateHours = (start, end) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // Crosses midnight
    return parseFloat((diff / 60).toFixed(2));
  };

  const handleAdd = () => {
    if (!form.start || !form.end) return;
    const hours = calculateHours(form.start, form.end);
    if (hours <= 0) return;

    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      type: form.type,
      start: form.start,
      end: form.end,
      hours: hours
    };

    onChange([...entries, newEntry]);
    setForm({ ...form, start: '', end: '' }); // Reset times but keep type
  };

  const handleRemove = (id) => {
    onChange(entries.filter(e => e.id !== id));
  };

  // --- DERIVED DATA ---
  const selectedDateEntries = entries.filter(e => e.date === selectedDate);
  
  const totalOvertimeValue = useMemo(() => {
    return entries.reduce((acc, entry) => {
      if (!RATES[entry.type]) return acc;
      return acc + (entry.hours * hourlyRate * RATES[entry.type].factor);
    }, 0);
  }, [entries, hourlyRate]);

  const calculatedHours = useMemo(() => calculateHours(form.start, form.end), [form.start, form.end]);

  return (
    <div className="space-y-6 pb-20">
        {/* TOTAL HEADER */}
        <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <Icons.Clock />
                </div>
                <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">Total Extras</h2>
                    <p className="text-xs text-slate-500">Valor acumulado</p>
                </div>
            </div>
            <p className="text-xl font-black text-amber-500">{formatMoney(totalOvertimeValue)}</p>
        </div>

        {/* TYPE SELECTOR (NEW) */}
        <div className="relative z-20">
             <button 
                onClick={() => setIsTypeSelectorOpen(!isTypeSelectorOpen)}
                className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#161E2E] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-amber-500/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getBgColor(RATES[form.type]?.color)} shadow-sm ring-2 ring-white dark:ring-[#0B1120]`}></div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">{RATES[form.type]?.label}</span>
                </div>
                <div className={`text-slate-400 transition-transform duration-300 ${isTypeSelectorOpen ? 'rotate-180' : ''}`}>
                  <Icons.ChevronDown />
                </div>
              </button>

              {isTypeSelectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161E2E] border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-200 z-30">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {Object.entries(RATES).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setForm({ ...form, type: key });
                          setIsTypeSelectorOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${form.type === key ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${getBgColor(config.color)}`}></div>
                        <span className={`text-xs font-bold uppercase tracking-wide ${form.type === key ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {config.label}
                        </span>
                        {form.type === key && <span className="ml-auto text-amber-500"><Icons.Check /></span>} 
                      </button>
                    ))}
                  </div>
                </div>
              )}
        </div>

        {/* CALENDAR */}
        <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4 px-2">
              <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500"><Icons.ChevronLeft /></button>
              <span className="font-bold text-sm uppercase tracking-widest text-slate-700 dark:text-slate-300">
                {viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500"><Icons.ChevronRight /></button>
          </div>
          
          <div className="grid grid-cols-7 text-center mb-2">
            {['D','L','M','M','J','V','S'].map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-600">{d}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
              {[...Array(getFirstDay(viewDate))].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(getDaysInMonth(viewDate))].map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isSelected = dateStr === selectedDate;
                const hasEntry = entries.some(e => e.date === dateStr);
                
                const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const isHol = isHoliday(dateObj);
                const isSun = dateObj.getDay() === 0;

                let dayClass = 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700';
                
                if (isSelected) {
                    dayClass = 'bg-amber-500 text-white shadow-md transform scale-105 z-10';
                } else if (hasEntry) {
                    dayClass = 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
                } else if (isHol || isSun) {
                    dayClass = 'bg-slate-50 dark:bg-slate-800/50 text-rose-400 dark:text-rose-400/70';
                }

                return (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-200 relative ${dayClass}`}
                  >
                    {day}
                    {hasEntry && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500"></span>
                    )}
                  </button>
                )
              })}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white dark:bg-[#161E2E] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${getBgColor(RATES[form.type]?.color)}`}></span>
                Agregar {RATES[form.type]?.label}: {selectedDate}
            </h3>
            
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Inicio</label>
                        <input 
                            type="time" 
                            value={form.start}
                            onChange={(e) => setForm({ ...form, start: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Fin</label>
                        <input 
                            type="time" 
                            value={form.end}
                            onChange={(e) => setForm({ ...form, end: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-sm font-bold text-slate-700 dark:text-white outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Duración</p>
                        <p className="text-lg font-black text-slate-800 dark:text-white">
                            {calculatedHours > 0 ? calculatedHours : '0'} <span className="text-xs text-slate-400 font-normal">hrs</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleAdd}
                        disabled={!form.start || !form.end || calculatedHours <= 0}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>

        {/* LISTA DE ENTRADAS */}
        {selectedDateEntries.length > 0 && (
            <div className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Registros del día</h3>
                {selectedDateEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#161E2E] border border-slate-100 dark:border-slate-800 rounded-xl animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3">
                            <div className={`w-1 h-8 rounded-full ${RATES[entry.type]?.color.replace('text-', 'bg-') || 'bg-slate-400'}`}></div>
                            <div>
                                <p className={`text-xs font-bold ${RATES[entry.type]?.color}`}>{RATES[entry.type]?.label}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                    {entry.start} - {entry.end}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-sm font-bold text-slate-700 dark:text-white">{entry.hours}h</p>
                                <p className="text-[10px] text-slate-400">
                                    {formatMoney(entry.hours * hourlyRate * (RATES[entry.type]?.factor || 0))}
                                </p>
                            </div>
                            <button 
                                onClick={() => handleRemove(entry.id)}
                                className="p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            >
                                <Icons.Trash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
