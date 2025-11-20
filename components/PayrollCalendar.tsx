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
  
  // Herramienta seleccionada actualmente
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
    { id: DayType.VACATION, label: 'Vacaciones', color: 'bg-emerald-600', ring: 'ring-emerald-500' },
    { id: DayType.DISABILITY, label: 'Incapacidad', color: 'bg-amber-600', ring: 'ring-amber-500' },
    { id: DayType.PAID_LEAVE, label: 'Licencia Remun.', color: 'bg-blue-600', ring: 'ring-blue-500' },
    { id: DayType.UNPAID_LEAVE, label: 'No Remunerado', color: 'bg-rose-900', ring: 'ring-rose-500' },
    { id: DayType.WORK, label: 'Borrar', color: 'bg-slate-700', ring: 'ring-slate-500' },
  ];

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
    }

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const status = dayStatuses[dateStr] || DayType.WORK;

      let bgClass = 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 border border-slate-800'; 
      
      if (status === DayType.VACATION) {
        bgClass = 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 border-emerald-500';
      } else if (status === DayType.DISABILITY) {
        bgClass = 'bg-amber-600 text-white shadow-md shadow-amber-900/50 border-amber-500';
      } else if (status === DayType.PAID_LEAVE) {
        bgClass = 'bg-blue-600 text-white shadow-md shadow-blue-900/50 border-blue-500';
      } else if (status === DayType.UNPAID_LEAVE) {
        bgClass = 'bg-rose-950 text-rose-200 shadow-md shadow-rose-900/20 border-rose-800 border-dashed';
      }

      days.push(
        <button
          key={d}
          onClick={() => onToggleDay(dateStr, selectedTool)}
          className={`h-10 w-full rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-100 ${bgClass}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-dark-card border border-slate-800 rounded-2xl p-5 shadow-xl">
      
      {/* Toolbar de Herramientas */}
      <div className="mb-6">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">Selecciona qué quieres marcar:</p>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
             <button
               key={tool.id}
               onClick={() => setSelectedTool(tool.id)}
               className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                 selectedTool === tool.id 
                 ? `${tool.color} text-white ring-2 ring-offset-2 ring-offset-dark-card ${tool.ring}` 
                 : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
               }`}
             >
               <div className={`w-2 h-2 rounded-full ${selectedTool === tool.id ? 'bg-white' : tool.color}`}></div>
               {tool.label}
             </button>
          ))}
        </div>
      </div>

      {/* Header del Calendario (Navegación) */}
      <div className="flex items-center justify-between mb-4 border-t border-slate-800 pt-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Calendario de Novedades</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-sm font-bold text-slate-200 w-28 text-center select-none">
            {MONTHS[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Grid de Días */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest py-1">
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