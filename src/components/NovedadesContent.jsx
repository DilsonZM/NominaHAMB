import React from 'react';
import { Icons } from './Icons';
import { TOOLS } from '../constants/tools';
import { isHoliday } from '../utils/holidays';

export const NovedadesContent = ({
  startDayInput, setStartDayInput, handleDayInput,
  endDayInput, setEndDayInput,
  currentTool, setCurrentTool,
  isToolOpen, setIsToolOpen,
  viewDate, handleMonthChange, hasEventsInCurrentMonth, handleClearMonth,
  events, handleDayClick,
  counters
}) => {
  
  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  return (
    <div className="space-y-4">
      {/* PERIODO LABORADO COMPACTO */}
      <div className="px-1 pt-2 pb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Periodo Laborado:</span>
        <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-50 dark:bg-[#0B1120] rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 mr-2">Del</span>
              <input 
                type="text" 
                value={startDayInput} 
                onChange={handleDayInput(setStartDayInput)}
                className="w-6 bg-transparent text-center font-bold text-sm text-slate-700 dark:text-white outline-none"
                placeholder="1"
              />
            </div>
            <span className="text-slate-400">-</span>
            <div className="flex items-center bg-slate-50 dark:bg-[#0B1120] rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 mr-2">Al</span>
              <input 
                type="text" 
                value={endDayInput} 
                onChange={handleDayInput(setEndDayInput)}
                className="w-6 bg-transparent text-center font-bold text-sm text-slate-700 dark:text-white outline-none"
                placeholder="30"
              />
            </div>
        </div>
      </div>

      <div className="py-1">
        {/* SELECTOR DE NOVEDAD (DROPDOWN) */}
        <div className="relative mb-4 z-20">
          <button 
            onClick={() => setIsToolOpen(!isToolOpen)}
            className="w-full flex items-center justify-between p-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:border-cyan-500/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${TOOLS[currentTool].color} shadow-sm ring-2 ring-white dark:ring-[#0B1120]`}></div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-wide">{TOOLS[currentTool].label}</span>
            </div>
            <div className={`text-slate-400 transition-transform duration-300 ${isToolOpen ? 'rotate-180' : ''}`}>
              <Icons.ChevronDown />
            </div>
          </button>

          {isToolOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161E2E] border border-slate-100 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-200 z-30">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {Object.entries(TOOLS).map(([key, tool]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentTool(key);
                      setIsToolOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors ${currentTool === key ? 'bg-slate-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${tool.color}`}></div>
                    <span className={`text-xs font-bold uppercase tracking-wide ${currentTool === key ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {tool.label}
                    </span>
                    {currentTool === key && <span className="ml-auto text-cyan-500"><Icons.Check /></span>} 
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
          <div className="relative flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
              <button onClick={() => handleMonthChange(-1)} className="absolute left-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"><Icons.ChevronLeft /></button>
              <span className="font-bold text-sm uppercase tracking-widest">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
              <div className="absolute right-0 flex items-center gap-1">
                <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"><Icons.ChevronRight /></button>
                {hasEventsInCurrentMonth && (
                    <button onClick={handleClearMonth} className="p-1 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors ml-1" title="Limpiar Mes"><Icons.Trash /></button>
                )}
              </div>
          </div>
          <div className="grid grid-cols-7 text-center mb-2">{['D','L','M','M','J','V','S'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400 dark:text-slate-600">{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">
              {[...Array(getFirstDay(viewDate))].map((_, i) => <div key={`empty-${i}`} />)}
              {[...Array(getDaysInMonth(viewDate))].map((_, i) => {
                const day = i + 1;
                const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const event = events.find(e => e.date === dateStr);
                const tool = event ? Object.values(TOOLS).find(t => t.id === event.type) : null;
                
                const sDay = parseInt(startDayInput) || 1;
                const eDay = parseInt(endDayInput) || 30;
                const isInactive = day < sDay || day > eDay;

                const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const isSun = dateObj.getDay() === 0;
                const isSat = dateObj.getDay() === 6;
                const isHol = isHoliday(dateObj);

                let dayClass = 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700';
                
                if (isInactive) {
                    dayClass = 'bg-slate-100 dark:bg-[#111827] text-slate-300 dark:text-slate-700 cursor-not-allowed';
                } else if (tool) {
                    dayClass = `${tool.color} text-white shadow-md transform scale-95`;
                } else if (isHol) {
                    dayClass = 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
                } else if (isSun) {
                    dayClass = 'bg-slate-50 dark:bg-slate-800/50 text-rose-400 dark:text-rose-400/70';
                } else if (isSat) {
                    dayClass = 'bg-slate-50 dark:bg-slate-800/50 text-blue-400 dark:text-blue-400/70';
                }

                return (
                  <button 
                    key={day} 
                    onClick={() => handleDayClick(day)} 
                    disabled={isInactive}
                    className={`
                      aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-200 relative
                      ${dayClass}
                    `}
                  >
                    {day}
                    {/* Festivo: Punto rojo siempre visible (con borde blanco si hay tool para contraste) */}
                    {isHol && !isInactive && (
                      <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 ${tool ? 'ring-1 ring-white dark:ring-slate-900' : ''}`}></span>
                    )}

                    {/* Indicadores de Fin de Semana cuando hay Novedad (Puntos abajo) */}
                    {tool && !isInactive && (
                      <>
                        {isSat && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-200/80"></span>}
                        {isSun && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-rose-200/80"></span>}
                      </>
                    )}
                  </button>
                )
              })}
          </div>
        </div>
      </div>

      <div className="py-2 border-t border-slate-100 dark:border-slate-800/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">Resumen de Días</p>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(counters).map(([key, val]) => {
              if (val === 0) return null;
              
              let label = '';
              let colorText = '';
              
              if (key === 'VAC_REST') {
                  label = 'VAC. (NO HÁBILES)';
                  colorText = 'text-emerald-400/70';
              } else {
                  const tool = Object.values(TOOLS).find(t => t.id === key);
                  if (!tool) return null;
                  label = tool.label;
                  colorText = tool.text;
              }

              return (
                <div key={key} className="bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <div>
                    <p className={`text-[10px] font-bold ${colorText} uppercase`}>{label}</p>
                    <span className="bg-transparent w-full text-xl font-bold text-slate-700 dark:text-white mt-1 block">{val}</span>
                  </div>
                </div>
              )
          })}
        </div>
      </div>
    </div>
  );
};
