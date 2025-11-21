import React, { useState, useMemo, useEffect } from 'react';
import { formatMoney } from './utils/formatMoney';
import { Icons } from './components/Icons';
import { TOOLS } from './constants/tools';

export default function App() {
  // --- TEMA ---
  const [isDark, setIsDark] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- ESTADOS DE DATOS ---
  // Usamos cadenas vacías '' o números para los inputs para evitar el "0" pegajoso
  const [salary, setSalary] = useState(1800000);
  const [bonus, setBonus] = useState(4550000);
  const [food, setFood] = useState(452000);

  const [showCalendar, setShowCalendar] = useState(false); 
  const [showDeductions, setShowDeductions] = useState(false); 

  const [otrosIngresos, setOtrosIngresos] = useState(0); 
  const [prestamos, setPrestamos] = useState(0); 
  const [funebres, setFunebres] = useState(0); 

  // FECHAS DE CONTRATO (Strings para manejar el input vacío)
  const [startDayInput, setStartDayInput] = useState('1');
  const [endDayInput, setEndDayInput] = useState('30');

  const [currentTool, setCurrentTool] = useState('VACACIONES');
  const [viewDate, setViewDate] = useState(new Date(2025, 10, 1));
  
  const [events, setEvents] = useState([]);

  const [counters, setCounters] = useState({ VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0 });

  // --- LÓGICA ---
  
  // Manejador de Inputs Numéricos Limpios
  const handleNumInput = (setter) => (e) => {
    const val = e.target.value;
    if (val === '') {
      setter(''); // Permite borrar todo
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) setter(num);
    }
  };

  // Manejador específico para días (enteros)
  const handleDayInput = (setter) => (e) => {
    const val = e.target.value;
    if (val === '') {
      setter('');
    } else {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) setter(num.toString());
    }
  };

  useEffect(() => {
    // Valores seguros para cálculo interno
    const sDay = parseInt(startDayInput) || 1;
    const eDay = parseInt(endDayInput) || 30;

    const newCounters = { VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0 };
    events.forEach(ev => {
      // Solo contar si el evento está dentro del rango de contrato
      const day = parseInt(ev.date.split('-')[2]);
      if (day >= sDay && day <= eDay) {
         if (newCounters[ev.type] !== undefined) newCounters[ev.type]++;
      }
    });
    setCounters(newCounters);
  }, [events, startDayInput, endDayInput]);

  // Controlar visibilidad de Novedades: Se mantiene abierto solo si hay eventos marcados
  useEffect(() => {
    setShowCalendar(events.length > 0);
  }, [events]);

  const payroll = useMemo(() => {
    // Convertimos inputs a números seguros para la matemática (0 si están vacíos)
    const safeSalary = Number(salary) || 0;
    const safeBonus = Number(bonus) || 0;
    const safeFood = Number(food) || 0;
    const safeOtros = Number(otrosIngresos) || 0;
    const safePrestamos = Number(prestamos) || 0;
    const safeFunebres = Number(funebres) || 0;
    const safeStart = parseInt(startDayInput) || 1;
    const safeEnd = parseInt(endDayInput) || 30;

    const valorDia = safeSalary / 30;

    // Días reales de contrato
    const diasContrato = Math.max(0, (safeEnd - safeStart) + 1);

    const diasVacaciones = counters.VAC;
    const diasIncapacidad = counters.INC;
    const diasNoRemun = counters.LNR;
    const diasLicRemun = counters.REM;
    const diasLeyMaria = counters.MAT;

    // Días Físicos
    const diasTrabajadosFisicos = Math.max(0, diasContrato - diasVacaciones - diasIncapacidad - diasNoRemun - diasLicRemun - diasLeyMaria);

    // Pagos
    const pagoBasico = diasTrabajadosFisicos * valorDia;
    const pagoVacaciones = diasVacaciones * valorDia; 
    const pagoIncapacidad = diasIncapacidad * valorDia; 
    const pagoLicRemun = diasLicRemun * valorDia;
    const pagoLeyMaria = diasLeyMaria * valorDia;

    const bonoReal = (safeBonus / 30) * diasTrabajadosFisicos;
    const auxAlimReal = (safeFood / 30) * diasTrabajadosFisicos;
    
    const totalDevengado = pagoBasico + pagoVacaciones + pagoIncapacidad + pagoLicRemun + pagoLeyMaria + bonoReal + auxAlimReal + safeOtros;

    // Deducciones
    const ibc = pagoBasico + pagoVacaciones + pagoIncapacidad + pagoLicRemun + pagoLeyMaria; 
    const salud = ibc * 0.04;
    const pension = ibc * 0.04;
    
    const totalDeducciones = salud + pension + safeFunebres + safePrestamos;

    return {
      neto: totalDevengado - totalDeducciones,
      devengado: totalDevengado,
      deducciones: totalDeducciones,
      salud,
      pension,
      pagoBasico,
      pagoVacaciones,
      pagoIncapacidad,
      pagoLeyMaria,
      bonoReal,
      auxAlimReal,
      diasTrabajadosFisicos,
      diasVacaciones,
      diasIncapacidad,
      diasLeyMaria,
      safeOtros,
      safePrestamos,
      safeFunebres,
      diasContrato
    };
  }, [salary, bonus, food, otrosIngresos, prestamos, funebres, counters, startDayInput, endDayInput]);

  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const handleMonthChange = (delta) => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + delta)));
  
  const handleDayClick = (day) => {
    // Validar Rango
    const sDay = parseInt(startDayInput) || 1;
    const eDay = parseInt(endDayInput) || 30;
    if(day < sDay || day > eDay) return; // No permitir marcar fuera de rango

    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    
    if (currentTool === 'DEL') {
      // Simplemente eliminamos el evento. El renderizado se encargará de mostrar el color por defecto.
      setEvents(events.filter(e => e.date !== dateStr));
    } else {
      const filtered = events.filter(e => e.date !== dateStr);
      setEvents([...filtered, { date: dateStr, type: TOOLS[currentTool].id }]);
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-500 pb-20">
        
        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-4 py-2 shadow-sm dark:shadow-2xl transition-all duration-300 relative">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20 shadow-sm">
                <Icons.Calc />
              </div>
              <div className="hidden md:block">
                 <h1 className="text-xl font-black tracking-tight">
                  <span className="text-slate-900 dark:text-white">Nómina HAMB</span> <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">Inteligente</span>
                </h1>
              </div>
              <div className="md:hidden">
                 <h1 className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">HAMB</span>
                </h1>
              </div>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#1E293B] border border-slate-200 dark:border-white/10 flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 dark:bg-emerald-400 animate-pulse' : 'bg-rose-500 dark:bg-rose-400'} `}></div>
               <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{isOnline ? 'En Línea' : 'Offline'}</span>
            </div>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
          {/* Mobile Only Total */}
          <div className="md:hidden text-center mt-2 pb-1">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide opacity-80">Neto a Pagar</p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatMoney(payroll.neto)}
            </h1>
          </div>
        </header>

        <main className="px-4 pt-4 pb-10 max-w-md md:max-w-7xl mx-auto animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* COLUMNA 1: INGRESOS BASE */}
            <div className="space-y-4 lg:sticky lg:top-4 order-1 lg:order-1">
              <section className="bg-white dark:bg-[#161E2E] rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-400"><Icons.Card /></div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-lg">Ingresos Base</h2>
                    <p className="text-xs text-slate-500">Salario y Bonificaciones</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "Salario Base Contrato", val: salary, set: setSalary },
                    { label: "Bono Extralegal", val: bonus, set: setBonus },
                    { label: "Aux. Alimentación", val: food, set: setFood },
                  ].map((field, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider px-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        <span>{field.label}</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 font-mono">$</span>
                            <input 
                              type="number" 
                              value={field.val}
                              onChange={handleNumInput(field.set)}
                              className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-8 pr-4 text-slate-700 dark:text-white font-bold focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300"
                            />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* INGRESOS ADICIONALES */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-blue-500 dark:text-blue-400"><Icons.Wallet /></div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase">Ingresos Adicionales</span>
                    </div>
                    <div className="group">
                      <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider px-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        <span>Otros (Reintegros/Comisiones)</span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500 font-mono">$</span>
                            <input 
                              type="number" 
                              value={otrosIngresos} 
                              onChange={handleNumInput(setOtrosIngresos)} 
                              className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-8 pr-4 text-slate-700 dark:text-white font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-300"
                            />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            </div>

            {/* COLUMNA 2: RESUMEN FINAL */}
            <div className="lg:sticky lg:top-4 order-3 lg:order-2">
              <section className="bg-white dark:bg-[#161E2E] rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl mb-8 transition-all hover:shadow-cyan-500/5 duration-500">
                <div className="text-center mb-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Neto a Pagar</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">{formatMoney(payroll.neto)}</h2>
                </div>

                <div className="space-y-4 text-sm">
                    {/* DEVENGADOS */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider flex items-center gap-2"><span className="w-4 h-[1px] bg-slate-300 dark:bg-slate-600"></span> Devengados</p>
                      
                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Salario Básico <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasTrabajadosFisicos}d</span></span>
                          <span className="font-bold text-slate-800 dark:text-white">{formatMoney(payroll.pagoBasico)}</span>
                      </div>
                      
                      {payroll.pagoVacaciones > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Vacaciones <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasVacaciones}d</span></span>
                            <span className="font-bold text-slate-800 dark:text-white">{formatMoney(payroll.pagoVacaciones)}</span>
                        </div>
                      )}

                      {payroll.pagoLeyMaria > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Ley María <span className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/50 rounded text-[9px] text-pink-600 dark:text-pink-300 font-mono">{payroll.diasLeyMaria}d</span></span>
                            <span className="font-bold text-pink-500 dark:text-pink-400">{formatMoney(payroll.pagoLeyMaria)}</span>
                        </div>
                      )}

                      {payroll.pagoIncapacidad > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Incapacidad <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded text-[9px] text-amber-600 dark:text-amber-300 font-mono">{payroll.diasIncapacidad}d</span></span>
                            <span className="font-bold text-amber-500 dark:text-amber-400">{formatMoney(payroll.pagoIncapacidad)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Bono Extralegal <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasTrabajadosFisicos}d</span></span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(payroll.bonoReal)}</span>
                      </div>

                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Aux. Alimentación <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasTrabajadosFisicos}d</span></span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(payroll.auxAlimReal)}</span>
                      </div>

                      {payroll.safeOtros > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Otros Ingresos</span>
                            <span className="font-bold text-blue-500 dark:text-blue-400">{formatMoney(payroll.safeOtros)}</span>
                          </div>
                      )}

                      <div className="flex justify-between pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 mt-2">
                          <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">Total Ingresos</span>
                          <span className="font-bold text-slate-900 dark:text-white text-lg">{formatMoney(payroll.devengado)}</span>
                      </div>
                    </div>

                    {/* DEDUCCIONES */}
                    <div className="pt-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-wider flex items-center gap-2"><span className="w-4 h-[1px] bg-slate-300 dark:bg-slate-600"></span> Deducciones</p>
                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300">Salud (4%)</span>
                          <span className="font-bold text-rose-500 dark:text-rose-400">- {formatMoney(payroll.salud)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300">Pensión (4%)</span>
                          <span className="font-bold text-rose-500 dark:text-rose-400">- {formatMoney(payroll.pension)}</span>
                      </div>
                      {payroll.safeFunebres > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300">Seguro Exequial</span>
                            <span className="font-bold text-rose-500 dark:text-rose-400">- {formatMoney(payroll.safeFunebres)}</span>
                          </div>
                      )}
                      {payroll.safePrestamos > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300">Préstamos / Deudas</span>
                            <span className="font-bold text-rose-500 dark:text-rose-400">- {formatMoney(payroll.safePrestamos)}</span>
                          </div>
                      )}
                      <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl flex justify-between items-center transition-colors hover:bg-rose-100 dark:hover:bg-rose-500/15">
                          <span className="text-rose-500 dark:text-rose-400 font-bold text-xs uppercase">Total Deducciones</span>
                          <span className="font-black text-rose-600 dark:text-rose-400 text-lg">- {formatMoney(payroll.deducciones)}</span>
                      </div>
                    </div>
                </div>
              </section>
            </div>

            {/* COLUMNA 3: NOVEDADES Y DEDUCCIONES */}
            <div className="space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 lg:pb-4 order-2 lg:order-3 custom-scrollbar">
              {/* 2. NOVEDADES (COLAPSABLE) */}
              <section className="bg-white dark:bg-[#161E2E] rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl overflow-hidden transition-all duration-500">
                <button 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full p-4 flex items-center justify-between bg-white dark:bg-[#161E2E] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-purple-500 dark:text-purple-400"><Icons.Calendar /></div>
                      <div className="text-left">
                        <h2 className="font-bold text-slate-800 dark:text-white text-lg">Novedades</h2>
                        <p className="text-xs text-slate-500">Calendario y Dinero Extra</p>
                      </div>
                  </div>
                  <div className={`text-slate-400 transform transition-transform duration-300 ${showCalendar ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showCalendar ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  
                  {/* PERIODO LABORADO COMPACTO */}
                  <div className="px-5 pt-2 pb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
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

                  <div className="px-5 py-3">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(TOOLS).map(([key, tool]) => (
                          <button
                            key={key}
                            onClick={() => setCurrentTool(key)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all border ${currentTool === key ? `${tool.color} text-white border-transparent shadow-md scale-105` : 'bg-slate-50 dark:bg-[#0B1120] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                          >
                            {tool.label}
                          </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 dark:bg-[#0B1120] rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4 text-slate-600 dark:text-slate-300">
                          <button onClick={() => handleMonthChange(-1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"><Icons.ChevronLeft /></button>
                          <span className="font-bold text-sm uppercase tracking-widest">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
                          <button onClick={() => handleMonthChange(1)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"><Icons.ChevronRight /></button>
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

                            return (
                              <button 
                                key={day} 
                                onClick={() => handleDayClick(day)} 
                                disabled={isInactive}
                                className={`
                                  aspect-square rounded-lg text-sm font-bold flex items-center justify-center transition-all duration-200 
                                  ${isInactive 
                                    ? 'bg-slate-100 dark:bg-[#111827] text-slate-300 dark:text-slate-700 cursor-not-allowed' // Gris inactivo
                                    : tool 
                                        ? `${tool.color} text-white shadow-md transform scale-95` 
                                        : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'} 
                                `}
                              >
                                {day}
                              </button>
                            )
                          })}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-wider">Resumen de Días</p>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(counters).map(([key, val]) => {
                          const tool = Object.values(TOOLS).find(t => t.id === key);
                          if(!tool || val === 0) return null;
                          return (
                            <div key={key} className="bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                              <div>
                                <p className={`text-[10px] font-bold ${tool.text} uppercase`}>{tool.label}</p>
                                <span className="bg-transparent w-full text-xl font-bold text-slate-700 dark:text-white mt-1 block">{val}</span>
                              </div>
                            </div>
                          )
                      })}
                    </div>
                  </div>

                </div>
              </section>

              {/* 3. DEDUCCIONES Y PRÉSTAMOS (COLAPSABLE) */}
              <section className="bg-white dark:bg-[#161E2E] rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm dark:shadow-xl overflow-hidden transition-all duration-500 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500/50"></div>

                <button 
                  onClick={() => setShowDeductions(!showDeductions)}
                  className="w-full p-4 flex items-center justify-between bg-white dark:bg-[#161E2E] hover:bg-rose-50 dark:hover:bg-slate-800/50 transition-colors pl-6"
                >
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-lg text-rose-500 dark:text-rose-400"><Icons.TrendingDown /></div>
                      <div className="text-left">
                        <h2 className="font-bold text-rose-600 dark:text-rose-100 text-lg">Deducciones</h2>
                        <p className="text-xs text-rose-400 dark:text-rose-300/50">Préstamos y Descuentos</p>
                      </div>
                  </div>
                  <div className={`text-rose-400 transform transition-transform duration-300 ${showDeductions ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                  </div>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out pl-6 pr-5 ${showDeductions ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 pt-2">
                      <div>
                        <div className="flex justify-between">
                          <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mb-1 uppercase">Préstamos / Deudas Empresa</p>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-rose-300 dark:text-rose-900/50 font-mono group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 transition-colors">$</span>
                            <input 
                              type="number" 
                              value={prestamos} 
                              onChange={handleNumInput(setPrestamos)} 
                              className="w-full bg-rose-50 dark:bg-[#0B1120] border border-rose-200 dark:border-rose-900/30 rounded-2xl py-3 pl-8 pr-4 text-rose-700 dark:text-rose-100 font-bold focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between">
                          <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mb-1 uppercase">Seguro Exequial / Funeraria</p>
                        </div>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-rose-300 dark:text-rose-900/50 font-mono group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 transition-colors">$</span>
                            <input 
                              type="number" 
                              value={funebres} 
                              onChange={handleNumInput(setFunebres)} 
                              className="w-full bg-rose-50 dark:bg-[#0B1120] border border-rose-200 dark:border-rose-900/30 rounded-2xl py-3 pl-8 pr-4 text-rose-700 dark:text-rose-100 font-bold focus:border-rose-500 outline-none transition-all"
                            />
                        </div>
                      </div>
                  </div>
                </div>
              </section>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
