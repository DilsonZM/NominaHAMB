import { useState, useMemo } from 'react';
import { Icons } from './Icons';
import { formatMoney } from '../utils/formatMoney';
import { RATES } from '../constants/rates';
import { isHoliday } from '../utils/holidays';

export const OvertimeContent = ({ salary, entries = [], onChange }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [form, setForm] = useState({
    start: '',
    end: ''
  });

  const hourlyRate = salary / 240;

  // --- CALENDAR HELPERS ---
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  
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

  const getOvertimeType = (dateStr, start) => {
    // Basic Colombian Logic (Simplified for this context)
    // Day: 06:00 - 21:00
    // Night: 21:00 - 06:00
    // Sunday/Holiday: All day is Festivo
    
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const isHol = isHoliday(dateObj);
    const isSun = dateObj.getDay() === 0;
    const isFestivo = isHol || isSun;

    const [h1] = start.split(':').map(Number);
    
    // Determine if start time is Night (19:00 - 06:00) based on 2025 rules
    // 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5
    const isNight = h1 >= 19 || h1 < 6;

    if (isFestivo) {
        return isNight ? 'HENF' : 'HEDF';
    } else {
        return isNight ? 'HEN' : 'HED';
    }
  };

  const handleAdd = () => {
    if (!form.start || !form.end) return;
    const hours = calculateHours(form.start, form.end);
    
    if (hours <= 0) {
        alert("La hora fin debe ser mayor a la hora inicio (o cruzar medianoche correctamente).");
        return;
    }
    if (hours > 6) {
        alert("No se permiten más de 6 horas extras continuas.");
        return;
    }

    // Auto-detect type
    const type = getOvertimeType(selectedDate, form.start, form.end);

    const newEntry = {
      id: Date.now(),
      date: selectedDate,
      type: type,
      start: form.start,
      end: form.end,
      hours: hours
    };

    onChange([...entries, newEntry]);
    setForm({ start: '', end: '' });
  };

  const handleRemove = (id) => {
    onChange(entries.filter(e => e.id !== id));
  };

  // --- DERIVED DATA ---
  const selectedDateEntries = entries.filter(e => e.date === selectedDate);
  const calculatedHours = useMemo(() => calculateHours(form.start, form.end), [form.start, form.end]);
  
  // Preview Type for UI
  const previewType = useMemo(() => {
      if(form.start && form.end) {
          return getOvertimeType(selectedDate, form.start, form.end);
      }
      return null;
  }, [selectedDate, form.start, form.end]);

  return (
    <div className="space-y-6 pb-20">
        
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

        {/* LISTA DE ENTRADAS (MOVED UP) */}
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

        {/* FORMULARIO */}
        <div className="bg-white dark:bg-[#161E2E] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${previewType ? RATES[previewType]?.color.replace('text-', 'bg-') : 'bg-slate-300'}`}></span>
                Agregar Extra: {selectedDate}
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
    </div>
  );
};
