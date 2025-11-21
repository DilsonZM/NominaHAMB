import React, { useState, useMemo, useEffect } from 'react';
import { formatMoney } from './utils/formatMoney';
import { Icons } from './components/Icons';
import { TOOLS } from './constants/tools';
import { RATES } from './constants/rates';
import { isBusinessDay } from './utils/holidays';
import { BottomNav } from './components/BottomNav';
import { SheetModal } from './components/SheetModal';
import { NovedadesContent } from './components/NovedadesContent';
import { DeductionsContent } from './components/DeductionsContent';
import { SalaryContent } from './components/SalaryContent';
import { OvertimeContent } from './components/OvertimeContent';
import { SummaryContent } from './components/SummaryContent';

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

const APP_VERSION = "v1.4.0";

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
  const [salary, setSalary] = useLocalStorage('hamb_salary', 1800000);
  const [bonus, setBonus] = useLocalStorage('hamb_bonus', 4550000);
  const [food, setFood] = useLocalStorage('hamb_food', 452000);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  
  // Overtime State (Event based now)
  const [overtimeEntries, setOvertimeEntries] = useLocalStorage('hamb_overtimeEntries', []);

  // Derived Overtime Hours for calculations
  const overtimeHours = useMemo(() => {
    const totals = { HED: 0, HEN: 0, RN: 0, DD: 0, HEDF: 0, HENF: 0 };
    overtimeEntries.forEach(entry => {
      if (totals[entry.type] !== undefined) {
        totals[entry.type] += (parseFloat(entry.hours) || 0);
      }
    });
    return totals;
  }, [overtimeEntries]);

  const [otrosIngresos, setOtrosIngresos] = useLocalStorage('hamb_otrosIngresos', 0); 
  const [prestamos, setPrestamos] = useLocalStorage('hamb_prestamos', 0); 
  const [funebres, setFunebres] = useLocalStorage('hamb_funebres', 0); 

  // FECHAS DE CONTRATO
  const [startDayInput, setStartDayInput] = useLocalStorage('hamb_startDayInput', '1');
  const [endDayInput, setEndDayInput] = useLocalStorage('hamb_endDayInput', '30');

  const [currentTool, setCurrentTool] = useLocalStorage('hamb_currentTool', 'REMOTO');
  const [isToolOpen, setIsToolOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(2025, 10, 1));
  
  const [events, setEvents] = useLocalStorage('hamb_events', []);

  const [counters, setCounters] = useState({ VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0, VAC_REST: 0, RMT: 0, MED: 0, PRM: 0, PNR: 0 });

  // Desktop Collapsible States
  const [showCalendar, setShowCalendar] = useLocalStorage('hamb_showCalendar', false); 
  const [showDeductions, setShowDeductions] = useLocalStorage('hamb_showDeductions', false); 

  // --- LÓGICA ---
  
  const handleNumInput = (setter) => (e) => {
    const val = e.target.value;
    if (val === '') {
      setter(''); 
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) setter(num);
    }
  };

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
    const sDay = parseInt(startDayInput) || 1;
    const eDay = parseInt(endDayInput) || 30;
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();

    const newCounters = { VAC: 0, INC: 0, REM: 0, LNR: 0, MAT: 0, VAC_REST: 0, RMT: 0, MED: 0, PRM: 0, PNR: 0 };
    
    events.forEach(ev => {
      const [y, m, d] = ev.date.split('-').map(Number);
      if (y === currentYear && (m - 1) === currentMonth) {
          if (d >= sDay && d <= eDay) {
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

  const hasEventsInCurrentMonth = useMemo(() => {
    const currentMonth = viewDate.getMonth();
    const currentYear = viewDate.getFullYear();
    return events.some(ev => {
      const [y, m] = ev.date.split('-').map(Number);
      return y === currentYear && (m - 1) === currentMonth;
    });
  }, [events, viewDate]);

  const payroll = useMemo(() => {
    const safeSalary = Number(salary) || 0;
    const safeBonus = Number(bonus) || 0;
    const safeFood = Number(food) || 0;
    const safeOtros = Number(otrosIngresos) || 0;
    const safePrestamos = Number(prestamos) || 0;
    const safeFunebres = Number(funebres) || 0;
    const safeStart = parseInt(startDayInput) || 1;
    const safeEnd = parseInt(endDayInput) || 30;

    // Calculate Overtime Value
    const hourlyRate = safeSalary / 240;
    const safeOvertime = Object.entries(overtimeHours).reduce((total, [key, hours]) => {
        if (!RATES[key]) return total;
        return total + (hours * hourlyRate * RATES[key].factor);
    }, 0);

    const valorDia = safeSalary / 30;
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

    const diasTrabajadosFisicos = Math.max(0, diasContrato - diasVacaciones - diasVacacionesResto - diasIncapacidad - diasNoRemun - diasLicRemun - diasLeyMaria - diasRemoto - diasCitaMedica - diasPermisoRem - diasPermisoNoRem);

    const pagoBasico = diasTrabajadosFisicos * valorDia;
    const pagoRemoto = diasRemoto * valorDia;
    const pagoCitaMedica = diasCitaMedica * valorDia;
    const pagoPermisoRem = diasPermisoRem * valorDia;
    
    const pagoVacaciones = diasVacaciones * valorDia; 
    const pagoVacacionesResto = diasVacacionesResto * valorDia;
    const pagoIncapacidad = diasIncapacidad * valorDia; 
    const pagoLicRemun = diasLicRemun * valorDia;
    const pagoLeyMaria = diasLeyMaria * valorDia;

    const diasParaAlimentacion = diasTrabajadosFisicos + diasVacacionesResto;
    const diasParaBono = diasTrabajadosFisicos + diasVacacionesResto + diasRemoto;

    const bonoReal = (safeBonus / 30) * diasParaBono; 
    const auxAlimReal = (safeFood / 30) * diasParaAlimentacion;
    
    const totalDevengado = pagoBasico + pagoRemoto + pagoCitaMedica + pagoPermisoRem + pagoVacaciones + pagoVacacionesResto + pagoIncapacidad + pagoLicRemun + pagoLeyMaria + bonoReal + auxAlimReal + safeOtros + safeOvertime;

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
  }, [salary, bonus, food, otrosIngresos, prestamos, funebres, counters, startDayInput, endDayInput, overtimeHours]);

  const handleMonthChange = (delta) => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + delta)));
  
  const handleClearMonth = () => {
    if (window.confirm('¿Estás seguro de borrar todas las novedades de este mes?')) {
        const currentMonth = viewDate.getMonth();
        const currentYear = viewDate.getFullYear();
        setEvents(events.filter(ev => {
            const [y, m] = ev.date.split('-').map(Number);
            return !(y === currentYear && (m - 1) === currentMonth);
        }));
    }
  };

  const handleDayClick = (day) => {
    const sDay = parseInt(startDayInput) || 1;
    const eDay = parseInt(endDayInput) || 30;
    if(day < sDay || day > eDay) return;

    const dateStr = `${viewDate.getFullYear()}-${String(viewDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    
    if (currentTool === 'DEL') {
      setEvents(events.filter(e => e.date !== dateStr));
    } else {
      const existingEvent = events.find(e => e.date === dateStr);
      if (existingEvent && existingEvent.type === TOOLS[currentTool].id) {
        setEvents(events.filter(e => e.date !== dateStr));
      } else {
        const filtered = events.filter(e => e.date !== dateStr);
        setEvents([...filtered, { date: dateStr, type: TOOLS[currentTool].id }]);
      }
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans transition-colors duration-500 pb-24 md:pb-10">
        
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
            
            {/* COLUMNA 1: INGRESOS BASE (Desktop) */}
            <div className="space-y-4 lg:sticky lg:top-4 order-1 lg:order-1 hidden md:block">
              <section className="bg-white dark:bg-[#161E2E] rounded-2xl p-4 border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-xl transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-400"><Icons.Card /></div>
                  <div>
                    <h2 className="font-bold text-slate-800 dark:text-white text-lg">Ingresos Base</h2>
                    <p className="text-xs text-slate-500">Salario y Bonificaciones</p>
                  </div>
                </div>
                <SalaryContent 
                    salary={salary} setSalary={setSalary}
                    bonus={bonus} setBonus={setBonus}
                    food={food} setFood={setFood}
                    otrosIngresos={otrosIngresos} setOtrosIngresos={setOtrosIngresos}
                    handleNumInput={handleNumInput}
                />
                
                {/* Desktop Overtime Trigger */}
                <button 
                    onClick={() => setActiveTab('overtime')}
                    className="w-full mt-4 flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors group"
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
              </section>
            </div>

            {/* COLUMNA 2: RESUMEN FINAL (Always Visible) */}
            <div className="lg:sticky lg:top-4 order-3 lg:order-2">
              <SummaryContent 
                payroll={payroll}
                viewDate={viewDate}
                startDayInput={startDayInput}
                endDayInput={endDayInput}
                overtimeHours={overtimeHours}
                salary={salary}
              />
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
              onTabChange={setActiveTab}
          />
        </div>

        {/* MOBILE MODALS */}
        <SheetModal 
            isOpen={activeTab === 'salary'} 
            onClose={() => setActiveTab('home')}
            title="Salario y Pagos"
            icon={Icons.Wallet}
            color="text-cyan-500 dark:text-cyan-400"
        >
            <SalaryContent 
                salary={salary} setSalary={setSalary}
                bonus={bonus} setBonus={setBonus}
                food={food} setFood={setFood}
                otrosIngresos={otrosIngresos} setOtrosIngresos={setOtrosIngresos}
                handleNumInput={handleNumInput}
            />
        </SheetModal>

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
            isOpen={activeTab === 'overtime'} 
            onClose={() => setActiveTab('home')}
            title="Horas Extras"
            icon={Icons.Clock}
            color="text-amber-500 dark:text-amber-400"
            headerRight={
              <span className="text-lg font-black text-amber-500 dark:text-amber-400">
                {formatMoney(payroll.safeOvertime)}
              </span>
            }
        >
            <OvertimeContent 
                salary={salary}
                entries={overtimeEntries}
                onChange={setOvertimeEntries}
            />
        </SheetModal>

      </div>
    </div>
  );
}
