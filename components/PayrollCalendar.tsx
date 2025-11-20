import React, { useState } from 'react';
import { DayType } from '../types';

interface PayrollCalendarProps {
  month: number;
  year: number;
  dayStatuses: Record<string, DayType>;
  onToggleDay: (dateStr: string, type: DayType) => void;
  onMonthChange: (month: number, year: number) => void;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PayrollCalendar: React.FC<PayrollCalendarProps> = ({
  month,
  year,
  dayStatuses,
  onToggleDay,
  onMonthChange
}) => {
  
  const [selectedTool, setSelectedTool] = useState<DayType>(DayType.VACATION);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

  const handlePrevMonth = () => {
    if (month === 0) onMonthChange(11, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 11) onMonthChange(0, year + 1);
    else onMonthChange(month + 1, year);
  };

  const tools = [
    { id: DayType.VACATION, label: 'Vacaciones', color: 'bg-emerald-500', ring: 'ring-emerald-500', text: 'text-emerald-400' },
    { id: DayType.DISABILITY, label: 'Incapacidad', color: 'bg-amber-500', ring: 'ring-amber-500', text: 'text-amber-400' },
    { id: DayType.PAID_LEAVE, label: 'Lic. Remun.', color: 'bg-brand-500', ring: 'ring-brand-500', text: 'text-brand-400' },
    { id: DayType.UNPAID_LEAVE, label: 'No Remun.', color: 'bg-rose-500', ring: 'ring-rose-500', text: 'text-rose-400' },
    { id: DayType.WORK, label: 'Borrar', color: 'bg-slate-500', ring: 'ring-slate-500', text: 'text-slate-400' },
  ];

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = dayStatuses[dateStr] || DayType.WORK;

      let bgClass = 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'; 
      
      if (status === DayType.VACATION) {
        bgClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
      } else if (status === DayType.DISABILITY) {
        bgClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      } else if (status === DayType.PAID_LEAVE) {
        bgClass = 'bg-brand-500/20 text-brand-400 border border-brand-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]';
      } else if (status === DayType.UNPAID_LEAVE) {
        bgClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      }

      days.push(
        <button
          key={d}
          onClick={() => onToggleDay(dateStr, selectedTool)}
          className={`h-9 w-full rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${bgClass}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-[#0B0F17]/30 border border-white/5 rounded-2xl p-5">
      
      <div className="mb-6">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Seleccionar Herramienta:</p>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
             <button
               key={tool.id}
               onClick={() => setSelectedTool(tool.id)}
               className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-2 border ${
                 selectedTool === tool.id 
                 ? `${tool.color} text-white border-transparent shadow-lg` 
                 : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
               }`}
             >
               <div className={`w-1.5 h-1.5 rounded-full ${selectedTool === tool.id ? 'bg-white' : tool.color}`}></div>
               {tool.label}
             </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 border-t border-white/5 pt-4">
        <h3 className="text-white font-bold text-sm tracking-tight">Calendario</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-xs font-bold text-slate-300 w-24 text-center select-none uppercase tracking-wide">
            {MONTHS[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {renderDays()}
      </div>
    </div>
  );
};