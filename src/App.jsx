import React, { useState, useMemo, useEffect } from 'react';
import { formatMoney } from './utils/formatMoney';
import { Icons } from './components/Icons';
import { TOOLS } from './constants/tools';
import { isHoliday, isBusinessDay } from './utils/holidays';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PayrollPDF } from './components/PayrollPDF';
import { BottomNav } from './components/BottomNav';
import { OvertimeCalculator } from './components/OvertimeCalculator';
import { SheetModal } from './components/SheetModal';
import { NovedadesContent } from './components/NovedadesContent';
import { DeductionsContent } from './components/DeductionsContent';

// Hook personalizado para persistencia en localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage key:", key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error writing localStorage key:", key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

const APP_VERSION = "v1.3.11";

export default function App() {
  // --- TEMA ---
  const [isDark, setIsDark] = useLocalStorage('hamb_isDark', true);
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
  const [salary, setSalary] = useLocalStorage('hamb_salary', 1800000);
  const [bonus, setBonus] = useLocalStorage('hamb_bonus', 4550000);
  const [food, setFood] = useLocalStorage('hamb_food', 452000);
  const [showCalendar, setShowCalendar] = useLocalStorage('hamb_showCalendar', false); 
  const [showDeductions, setShowDeductions] = useLocalStorage('hamb_showDeductions', false); 
  const [activeTab, setActiveTab] = useState('home');
  const [showOvertime, setShowOvertime] = useState(false);
  const [overtimeValue, setOvertimeValue] = useLocalStorage('hamb_overtimeValue', 0);

  const [otrosIngresos, setOtrosIngresos] = useLocalStorage('hamb_otrosIngresos', 0); 
  const [prestamos, setPrestamos] = useLocalStorage('hamb_prestamos', 0); 
  const [funebres, setFunebres] = useLocalStorage('hamb_funebres', 0); 

  // FECHAS DE CONTRATO (Strings para manejar el input vacío)
  const [startDayInput, setStartDayInput] = useLocalStorage('hamb_startDayInput', '1');
  const [endDayInput, setEndDayInput] = useLocalStorage('hamb_endDayInput', '30');

  const [currentTool, setCurrentTool] = useLocalStorage('hamb_currentTool', 'REMOTO');
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2025, 10, 1));
  
  const [events, setEvents] = useLocalStorage('hamb_events', []);

  const [counters, setCounters] = useState({ VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0, VAC_REST: 0, RMT: 0, MED: 0, PRM: 0, PNR: 0 });

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

    // Obtener mes y año de la vista actual del calendario
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const newCounters = { VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0, VAC_REST: 0, RMT: 0, MED: 0, PRM: 0, PNR: 0 };
    
    events.forEach(ev => {
      const [y, m, d] = ev.date.split('-').map(Number);
      
      // FILTRO CLAVE: Solo procesar eventos que pertenezcan al mes y año que se está viendo en el calendario
      if (y === currentYear && (m - 1) === currentMonth) {
          // Solo contar si el día está dentro del rango de contrato (ej: 1 al 30)
          if (d >= sDay && d <= eDay) {
             // Lógica especial para VACACIONES: Solo contar días hábiles (No Domingos, No Festivos)
             // Asumimos Sábado como hábil.
             if (ev.type === 'VAC') {
                const dateObj = new Date(y, m - 1, d);
                if (isBusinessDay(dateObj)) {
                   if (newCounters[ev.type] !== undefined) newCounters[ev.type]++;
                } else {
                   newCounters.VAC_REST++;
                }
             } else {
                if (newCounters[ev.type] !== undefined) newCounters[ev.type]++;
             }
          }
      }
    });
    setCounters(newCounters);
  }, [events, startDayInput, endDayInput, viewDate]);

  // Controlar visibilidad de Novedades: Se mantiene abierto solo si hay eventos marcados
  // ELIMINADO: useEffect(() => { setShowCalendar(events.length > 0); }, [events]);
  // Ahora el usuario controla manualmente si quiere ver el calendario o no, y se guarda en localStorage.

  const hasEventsInCurrentMonth = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    return events.some(ev => {
      const [y, m] = ev.date.split('-').map(Number);
      return y === currentYear && (m - 1) === currentMonth;
    });
  }, [events, viewDate]);

  const payroll = useMemo(() => {
    // Convertimos inputs a números seguros para la matemática (0 si están vacíos)
    const safeSalary = Number(salary) || 0;
    const safeBonus = Number(bonus) || 0;
    const safeFood = Number(food) || 0;
    const safeOtros = Number(otrosIngresos) || 0;
    const safeOvertime = Number(overtimeValue) || 0;
    const safePrestamos = Number(prestamos) || 0;
    const safeFunebres = Number(funebres) || 0;
    const safeStart = parseInt(startDayInput) || 1;
    const safeEnd = parseInt(endDayInput) || 30;

    const valorDia = safeSalary / 30;

    // Días reales de contrato
    const diasContrato = Math.max(0, (safeEnd - safeStart) + 1);

    const diasVacaciones = counters.VAC;
    const diasVacacionesResto = counters.VAC_REST || 0;
    const diasIncapacidad = counters.INC;
    const diasNoRemun = counters.LNR;
    const diasLicRemun = counters.REM;
    const diasLeyMaria = counters.MAT;
    
    const diasRemoto = counters.RMT || 0;
    const diasCitaMedica = counters.MED || 0;
    const diasPermisoRem = counters.PRM || 0;
    const diasPermisoNoRem = counters.PNR || 0;

    // Días Físicos
    // Restamos todo lo que no sea trabajo presencial
    const diasTrabajadosFisicos = Math.max(0, diasContrato - diasVacaciones - diasVacacionesResto - diasIncapacidad - diasNoRemun - diasLicRemun - diasLeyMaria - diasRemoto - diasCitaMedica - diasPermisoRem - diasPermisoNoRem);

    // Pagos
    const pagoBasico = diasTrabajadosFisicos * valorDia;
    const pagoRemoto = diasRemoto * valorDia;
    const pagoCitaMedica = diasCitaMedica * valorDia;
    const pagoPermisoRem = diasPermisoRem * valorDia;
    
    const pagoVacaciones = diasVacaciones * valorDia; 
    const pagoVacacionesResto = diasVacacionesResto * valorDia;
    const pagoIncapacidad = diasIncapacidad * valorDia; 
    const pagoLicRemun = diasLicRemun * valorDia;
    const pagoLeyMaria = diasLeyMaria * valorDia;

    // Base para Auxilios (Bono y Alimentación)
    // Se excluye Trabajo Remoto, Citas y Permisos, ya que no se asiste físicamente a la oficina.
    // CAMBIO: Trabajo Remoto SÍ paga Bono Extralegal, pero NO paga Auxilio de Alimentación.
    const diasParaAlimentacion = diasTrabajadosFisicos + diasVacacionesResto;
    const diasParaBono = diasTrabajadosFisicos + diasVacacionesResto + diasRemoto;

    const bonoReal = (safeBonus / 30) * diasParaBono; 
    const auxAlimReal = (safeFood / 30) * diasParaAlimentacion;
    
    const totalDevengado = pagoBasico + pagoRemoto + pagoCitaMedica + pagoPermisoRem + pagoVacaciones + pagoVacacionesResto + pagoIncapacidad + pagoLicRemun + pagoLeyMaria + bonoReal + auxAlimReal + safeOtros + safeOvertime;

    // Deducciones
    const ibc = pagoBasico + pagoRemoto + pagoCitaMedica + pagoPermisoRem + pagoVacaciones + pagoVacacionesResto + pagoIncapacidad + pagoLicRemun + pagoLeyMaria + safeOvertime; 
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
      pagoRemoto,
      pagoCitaMedica,
      pagoPermisoRem,
      pagoVacaciones,
      pagoVacacionesResto,
      pagoIncapacidad,
      pagoLicRemun,
      pagoLeyMaria,
      bonoReal,
      auxAlimReal,
      diasTrabajadosFisicos,
      diasRemoto,
      diasCitaMedica,
      diasPermisoRem,
      diasPermisoNoRem,
      diasNoRemun,
      diasVacaciones,
      diasVacacionesResto,
      diasIncapacidad,
      diasLicRemun,
      diasLeyMaria,
      safeOtros,
      safePrestamos,
      safeFunebres,
      diasContrato,
      diasParaAlimentacion,
      diasParaBono,
      safeOvertime
    };
  }, [salary, bonus, food, otrosIngresos, prestamos, funebres, counters, startDayInput, endDayInput, overtimeValue]);

  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDay = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();
  const handleMonthChange = (delta) => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + delta)));
  
  const handleClearMonth = () => {
    if (window.confirm('¿Estás seguro de borrar todas las novedades de este mes?')) {
        const currentMonth = viewDate.getMonth();
        const currentYear = viewDate.getFullYear();
        setEvents(events.filter(ev => {
            const [y, m] = ev.date.split('-').map(Number);
            // Mantener eventos que NO sean del mes/año actual
            return !(y === currentYear && (m - 1) === currentMonth);
        }));
    }
  };

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
      const existingEvent = events.find(e => e.date === dateStr);
      
      if (existingEvent && existingEvent.type === TOOLS[currentTool].id) {
        // Si ya existe y es del mismo tipo, lo borramos (toggle)
        setEvents(events.filter(e => e.date !== dateStr));
      } else {
        // Si no existe o es de otro tipo, lo agregamos/reemplazamos
        const filtered = events.filter(e => e.date !== dateStr);
        setEvents([...filtered, { date: dateStr, type: TOOLS[currentTool].id }]);
      }
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

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setIsDark(!isDark)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {isDark ? <Icons.Sun /> : <Icons.Moon />}
                </button>
            </div>
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

                    {/* BOTÓN HORAS EXTRAS (SOLO DESKTOP) */}
                    <button 
                        onClick={() => setShowOvertime(true)}
                        className="hidden md:flex w-full mt-4 items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
                                <Icons.Clock />
                            </div>
                            <div className="text-left">
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase block">Horas Extras</span>
                                <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 font-medium">Calcular Recargos</span>
                            </div>
                        </div>
                        <div className="text-amber-500 dark:text-amber-400">
                            <Icons.ChevronRight />
                        </div>
                    </button>
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

                      {payroll.pagoRemoto > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Trabajo Remoto <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 rounded text-[9px] text-indigo-600 dark:text-indigo-300 font-mono">{payroll.diasRemoto}d</span></span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatMoney(payroll.pagoRemoto)}</span>
                        </div>
                      )}

                      {payroll.pagoCitaMedica > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Cita Médica <span className="px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/30 rounded text-[9px] text-teal-600 dark:text-teal-300 font-mono">{payroll.diasCitaMedica}d</span></span>
                            <span className="font-bold text-teal-600 dark:text-teal-400">{formatMoney(payroll.pagoCitaMedica)}</span>
                        </div>
                      )}

                      {payroll.pagoPermisoRem > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Permiso Remunerado <span className="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-900/30 rounded text-[9px] text-cyan-600 dark:text-cyan-300 font-mono">{payroll.diasPermisoRem}d</span></span>
                            <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(payroll.pagoPermisoRem)}</span>
                        </div>
                      )}

                      {payroll.diasPermisoNoRem > 0 && (
                        <div className="flex justify-between py-1 opacity-75">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">Permiso No Rem. <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-900/30 rounded text-[9px] text-orange-600 dark:text-orange-300 font-mono">{payroll.diasPermisoNoRem}d</span></span>
                            <span className="font-bold text-slate-400 dark:text-slate-500">$0</span>
                        </div>
                      )}

                      {payroll.diasNoRemun > 0 && (
                        <div className="flex justify-between py-1 opacity-75">
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">No Remun. <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-900/30 rounded text-[9px] text-rose-600 dark:text-rose-300 font-mono">{payroll.diasNoRemun}d</span></span>
                            <span className="font-bold text-slate-400 dark:text-slate-500">$0</span>
                        </div>
                      )}
                      
                      {payroll.pagoVacaciones > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Vacaciones <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasVacaciones}d</span></span>
                            <span className="font-bold text-slate-800 dark:text-white">{formatMoney(payroll.pagoVacaciones)}</span>
                        </div>
                      )}

                      {payroll.pagoVacacionesResto > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Vacaciones (No Hábiles) <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasVacacionesResto}d</span></span>
                            <span className="font-bold text-slate-800 dark:text-white">{formatMoney(payroll.pagoVacacionesResto)}</span>
                        </div>
                      )}

                      {payroll.pagoLeyMaria > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Ley María <span className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/50 rounded text-[9px] text-pink-600 dark:text-pink-300 font-mono">{payroll.diasLeyMaria}d</span></span>
                            <span className="font-bold text-pink-500 dark:text-pink-400">{formatMoney(payroll.pagoLeyMaria)}</span>
                        </div>
                      )}

                      {payroll.pagoLicRemun > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Licencia Remunerada <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 rounded text-[9px] text-blue-600 dark:text-blue-300 font-mono">{payroll.diasLicRemun}d</span></span>
                            <span className="font-bold text-blue-500 dark:text-blue-400">{formatMoney(payroll.pagoLicRemun)}</span>
                        </div>
                      )}

                      {payroll.pagoIncapacidad > 0 && (
                        <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Incapacidad <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 rounded text-[9px] text-amber-600 dark:text-amber-300 font-mono">{payroll.diasIncapacidad}d</span></span>
                            <span className="font-bold text-amber-500 dark:text-amber-400">{formatMoney(payroll.pagoIncapacidad)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Bono Extralegal <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasParaBono}d</span></span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(payroll.bonoReal)}</span>
                      </div>

                      <div className="flex justify-between py-1">
                          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Aux. Alimentación <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[9px] text-slate-500 dark:text-slate-300 font-mono">{payroll.diasParaAlimentacion}d</span></span>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400">{formatMoney(payroll.auxAlimReal)}</span>
                      </div>

                      {payroll.safeOtros > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Otros Ingresos</span>
                            <span className="font-bold text-blue-500 dark:text-blue-400">{formatMoney(payroll.safeOtros)}</span>
                          </div>
                      )}

                      {payroll.safeOvertime > 0 && (
                          <div className="flex justify-between py-1">
                            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-2">Horas Extras</span>
                            <span className="font-bold text-amber-500 dark:text-amber-400">{formatMoney(payroll.safeOvertime)}</span>
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

                    {/* PDF DOWNLOAD BUTTON */}
                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <PDFDownloadLink
                        document={<PayrollPDF payroll={payroll} period={{ start: startDayInput, end: endDayInput }} />}
                        fileName={`Nomina_HAMB_${viewDate.getFullYear()}_${viewDate.getMonth() + 1}.pdf`}
                        className="w-full group flex items-center justify-center gap-3 py-3 px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 rounded-xl transition-all duration-300"
                      >
                        {({ blob, url, loading, error }) =>
                          loading ? 'Generando PDF...' : (
                            <>
                              <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 shadow-sm transition-colors">
                                <Icons.Download className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-wider transition-colors">Descargar Comprobante</span>
                            </>
                          )
                        }
                      </PDFDownloadLink>
                    </div>
                </div>
              </section>
            </div>

            {/* COLUMNA 3: NOVEDADES Y DEDUCCIONES (Desktop Only) */}
            <div className="space-y-4 lg:h-[calc(100vh-120px)] lg:overflow-y-auto lg:pr-2 lg:pb-4 order-2 lg:order-3 custom-scrollbar hidden md:block">
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
                  <NovedadesContent 
                    startDayInput={startDayInput} setStartDayInput={setStartDayInput} handleDayInput={handleDayInput}
                    endDayInput={endDayInput} setEndDayInput={setEndDayInput}
                    currentTool={currentTool} setCurrentTool={setCurrentTool}
                    isToolOpen={isToolOpen} setIsToolOpen={setIsToolOpen}
                    viewDate={viewDate} handleMonthChange={handleMonthChange} hasEventsInCurrentMonth={hasEventsInCurrentMonth} handleClearMonth={handleClearMonth}
                    events={events} handleDayClick={handleDayClick}
                    counters={counters}
                  />
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
                  <DeductionsContent 
                    prestamos={prestamos} setPrestamos={setPrestamos}
                    funebres={funebres} setFunebres={setFunebres}
                    handleNumInput={handleNumInput}
                  />
                </div>
              </section>
            </div>

          </div>
        </main>

        {/* FOOTER */}
        <footer className="text-center py-6 border-t border-slate-200 dark:border-white/5 mt-auto">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 uppercase tracking-widest font-bold">
            Desarrollado por <span className="text-slate-600 dark:text-slate-400">DilsonZM</span>
          </p>
          <p className="text-[9px] text-slate-300 dark:text-slate-700 font-mono mt-1 opacity-50">
            {APP_VERSION}
          </p>
        </footer>

        <div className="md:hidden">
          <BottomNav 
              activeTab={activeTab} 
              onTabChange={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'overtime') setShowOvertime(true);
              }}
          />
        </div>

        <OvertimeCalculator 
            salary={salary}
            isOpen={showOvertime}
            onClose={() => {
                setShowOvertime(false);
                setActiveTab('home');
            }}
            onChange={setOvertimeValue}
        />

        {/* MOBILE MODALS */}
        <SheetModal 
            isOpen={activeTab === 'novedades'} 
            onClose={() => setActiveTab('home')}
            title="Novedades"
            icon={Icons.Calendar}
            color="text-purple-500 dark:text-purple-400"
        >
            <NovedadesContent 
                startDayInput={startDayInput} setStartDayInput={setStartDayInput} handleDayInput={handleDayInput}
                endDayInput={endDayInput} setEndDayInput={setEndDayInput}
                currentTool={currentTool} setCurrentTool={setCurrentTool}
                isToolOpen={isToolOpen} setIsToolOpen={setIsToolOpen}
                viewDate={viewDate} handleMonthChange={handleMonthChange} hasEventsInCurrentMonth={hasEventsInCurrentMonth} handleClearMonth={handleClearMonth}
                events={events} handleDayClick={handleDayClick}
                counters={counters}
            />
        </SheetModal>

        <SheetModal 
            isOpen={activeTab === 'deducciones'} 
            onClose={() => setActiveTab('home')}
            title="Deducciones"
            icon={Icons.TrendingDown}
            color="text-rose-500 dark:text-rose-400"
        >
            <DeductionsContent 
                prestamos={prestamos} setPrestamos={setPrestamos}
                funebres={funebres} setFunebres={setFunebres}
                handleNumInput={handleNumInput}
            />
        </SheetModal>

        <SheetModal 
            isOpen={activeTab === 'pdf'} 
            onClose={() => setActiveTab('home')}
            title="Exportar PDF"
            icon={Icons.Download}
            color="text-cyan-500 dark:text-cyan-400"
        >
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Icons.Download className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Comprobante de Nómina</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
                    Descarga el detalle completo de tu nómina en formato PDF listo para imprimir o guardar.
                </p>
                
                <PDFDownloadLink
                    document={<PayrollPDF payroll={payroll} period={{ start: startDayInput, end: endDayInput }} />}
                    fileName={`Nomina_HAMB_${viewDate.getFullYear()}_${viewDate.getMonth() + 1}.pdf`}
                    className="w-full max-w-xs group flex items-center justify-center gap-3 py-4 px-6 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105"
                >
                    {({ blob, url, loading, error }) =>
                        loading ? 'Generando...' : (
                        <>
                            <Icons.Download className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider">Descargar PDF</span>
                        </>
                        )
                    }
                </PDFDownloadLink>
            </div>
        </SheetModal>
      </div>
    </div>
  );
}
