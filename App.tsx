import React, { useState, useEffect } from 'react';
import { CurrencyInput } from './components/CurrencyInput';
import { ResultCard } from './components/ResultCard';
import { PayrollCalendar } from './components/PayrollCalendar';
import { analyzeSalaryWithGemini } from './services/geminiService';
import { PayrollInput, CalculatedResults, AnalysisStatus, DayType } from './types';

// --- Icons Components ---
const CalculatorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const WalletIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const ToggleSwitch = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-white/5 last:border-0">
    <div className="mr-4">
      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-light">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-all focus:outline-none ${checked ? 'bg-brand-500 shadow-neon' : 'bg-slate-300 dark:bg-white/10'}`}
    >
      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  </div>
);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const today = new Date();
  
  const [input, setInput] = useState<PayrollInput>({
    baseSalary: 1800000,
    selectedMonth: today.getMonth(),
    selectedYear: today.getFullYear(),
    dayStatuses: {},
    extralegalBonus: 4550000,
    foodBonus: 0,
    otherRefunds: 0,
    funeralInsurance: 0,
    includeOvertime: false,
    overtimeValue: 0,
    commissions: 0,
    // Initialize to 0 explicitly to avoid ghost day bugs
    days: {
      worked: 30,
      vacation: 0,
      disability: 0,
      paidLeave: 0,
      unpaidLeave: 0
    }
  });
  
  const [manualBonusDays, setManualBonusDays] = useState<number | null>(null);
  const [manualSalaryDays, setManualSalaryDays] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [results, setResults] = useState<CalculatedResults>({
    grossSalary: 0,
    vacationPay: 0,
    disabilityPay: 0,
    paidLeavePay: 0,
    bonusPay: 0,
    grossIncome: 0,
    healthDeduction: 0,
    pensionDeduction: 0,
    totalDeductions: 0,
    netIncome: 0
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light-mesh-bg');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-mesh-bg');
    }
  }, [darkMode]);

  // 1. CALENDAR SYNC LOGIC
  useEffect(() => {
    // Ensure we calculate based on the CURRENT selected month/year in input
    // If no statuses exist for this month, we default to standard 30 days.
    // This logic runs every time dayStatuses changes.
    
    let vacationDays = 0;
    let disabilityDays = 0;
    let unpaidLeaveDays = 0;
    let paidLeaveDays = 0;
    let totalMonthDays = 30; 

    Object.entries(input.dayStatuses).forEach(([dateStr, status]) => {
      const [y, m] = dateStr.split('-').map(Number);
      // IMPORTANT: Match year and month (month is 1-indexed in string, 0-indexed in state)
      if (y === input.selectedYear && m === input.selectedMonth + 1) {
        if (status === DayType.VACATION) vacationDays++;
        if (status === DayType.DISABILITY) disabilityDays++;
        if (status === DayType.UNPAID_LEAVE) unpaidLeaveDays++;
        if (status === DayType.PAID_LEAVE) paidLeaveDays++;
      }
    });

    // If we have NO markers, ensure we have 0s
    const workedDays = Math.max(0, totalMonthDays - vacationDays - disabilityDays - unpaidLeaveDays - paidLeaveDays);

    setInput(prev => ({
      ...prev,
      days: {
        worked: workedDays,
        vacation: vacationDays,
        disability: disabilityDays,
        paidLeave: paidLeaveDays,
        unpaidLeave: unpaidLeaveDays
      }
    }));

    // If the user is interacting with the calendar, we should probably clear manual overrides
    // to show the "Real" calculated value. However, if they haven't touched the calendar recently,
    // we don't want to wipe their manual entry. 
    // For now, let's only wipe if the calculated days differ significantly or we could just leave it.
    // Best UX: Let manual override persist until cleared? No, calendar should drive inputs if used.
    // We will leave manual overrides active if they are set, but the Input placeholders will update.
    
  }, [input.dayStatuses, input.selectedMonth, input.selectedYear]);

  // 2. FINANCIAL CALCULATION LOGIC
  useEffect(() => {
    const dailyBaseSalary = input.baseSalary / 30;
    
    // SALARY: Pays for Worked Days + Paid Leaves
    const calculatedSalaryDays = input.days.worked + input.days.paidLeave;
    const effectiveSalaryDays = manualSalaryDays !== null ? manualSalaryDays : calculatedSalaryDays;
    const salaryPay = dailyBaseSalary * effectiveSalaryDays;
    
    // VACATION: Separate line item
    const vacationPay = dailyBaseSalary * input.days.vacation;
    
    // DISABILITY: Pays at 66.66%
    const disabilityPay = (dailyBaseSalary * 0.6666) * input.days.disability;

    // BONUSES: Extralegal + Food
    // Logic: These are usually paid for days WORKED.
    // Since workedDays = 30 - disability - vacation - unpaid, 
    // using input.days.worked AUTOMATICALLY subtracts disability/vacation days.
    const totalBonusesBase = input.extralegalBonus + input.foodBonus;
    const dailyBonus = totalBonusesBase / 30;
    
    const calculatedBonusDays = input.days.worked;
    const effectiveBonusDays = manualBonusDays !== null ? manualBonusDays : calculatedBonusDays;
    const bonusPay = dailyBonus * effectiveBonusDays;

    // EXTRAS & DEDUCTIONS
    const overtime = input.includeOvertime ? input.overtimeValue : 0;
    const commissions = input.commissions;
    const otherRefunds = input.otherRefunds;

    const grossIncome = salaryPay + vacationPay + disabilityPay + bonusPay + overtime + commissions + otherRefunds;

    // IBC (Ingreso Base de Cotización)
    // Typically includes Salary + Vacation + Overtime + Commissions (but not non-salary bonuses)
    // Using effective salary days ensures consistency.
    const ibc = salaryPay + vacationPay + overtime + commissions; 
    
    const healthDeduction = ibc * 0.04;
    const pensionDeduction = ibc * 0.04;
    const totalDeductions = healthDeduction + pensionDeduction + input.funeralInsurance;

    const netIncome = grossIncome - totalDeductions;

    setResults({
      grossSalary: salaryPay,
      vacationPay,
      disabilityPay,
      paidLeavePay: 0,
      bonusPay,
      grossIncome,
      healthDeduction,
      pensionDeduction,
      totalDeductions,
      netIncome
    });
    
  }, [
    input.baseSalary, 
    input.extralegalBonus, 
    input.foodBonus, 
    input.days, 
    manualBonusDays,
    manualSalaryDays,
    input.includeOvertime, 
    input.overtimeValue, 
    input.commissions, 
    input.otherRefunds, 
    input.funeralInsurance
  ]);

  const updateInput = (key: keyof PayrollInput, val: any) => {
    setInput(prev => ({ ...prev, [key]: val }));
  };
  
  const updateDays = (key: keyof typeof input.days, val: number) => {
    setInput(prev => ({
      ...prev,
      days: { ...prev.days, [key]: val }
    }));
  };

  const handleToggleDay = (dateStr: string, type: DayType) => {
    setInput(prev => {
      const newStatuses = { ...prev.dayStatuses };
      if (prev.dayStatuses[dateStr] === type || type === DayType.WORK) {
        // Toggle off or set to work (delete)
        delete newStatuses[dateStr];
      } else {
        newStatuses[dateStr] = type;
      }
      return { ...prev, dayStatuses: newStatuses };
    });
    // When interacting with calendar, clear manual overrides to prioritize calendar
    setManualSalaryDays(null);
    setManualBonusDays(null);
  };

  const handleAnalyze = async () => {
    setAiStatus(AnalysisStatus.LOADING);
    try {
      const text = await analyzeSalaryWithGemini(input, results);
      setAiAnalysis(text);
      setAiStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      setAiAnalysis("Error conectando con el servicio.");
      setAiStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-500 selection:text-white pb-10 transition-colors duration-500 overflow-x-hidden">
      
      {/* Floating Header / Bubble */}
      <nav className="fixed w-full z-50 top-0 pt-4 px-4 pointer-events-none">
        <div className="max-w-[1600px] mx-auto flex justify-between items-start pointer-events-auto">
           {/* Logo Area */}
           <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 transition-all hover:bg-white/10 cursor-default">
              <div className="bg-brand-500 rounded-full p-1.5 text-white">
                <CalculatorIcon />
              </div>
              <span className="font-bold text-sm tracking-tight text-white hidden sm:block">
                Nómina<span className="text-brand-400">AI</span>
              </span>
           </div>

           {/* Dynamic Island Bubble - Net Salary */}
           <div className="glass-panel rounded-full px-6 py-2.5 flex items-center gap-4 shadow-neon animate-float border-brand-500/20">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400 hidden sm:block">Neto Estimado</span>
              <div className="h-4 w-[1px] bg-white/10 hidden sm:block"></div>
              <span className="text-lg font-bold text-white font-mono tracking-tight">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.netIncome)}
              </span>
              <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></div>
           </div>

           {/* Theme Toggle */}
           <button 
             onClick={() => setDarkMode(!darkMode)}
             className="glass-panel p-2.5 rounded-full hover:bg-white/10 transition-all text-slate-400 hover:text-white"
           >
             {darkMode ? <SunIcon /> : <MoonIcon />}
           </button>
        </div>
      </nav>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 pt-28 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in pb-20">
          
          {/* Header Text */}
          <div className="mb-8 ml-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
              Calculadora <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-accent-purple">Inteligente</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-lg font-light">
              Configura tus ingresos, deducciones y novedades. El sistema ajustará automáticamente los cálculos basándose en la normativa vigente.
            </p>
          </div>

          {/* Main Config Card */}
          <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-brand-500/10 rounded-lg text-brand-400 border border-brand-500/20">
                <WalletIcon />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Ingresos Base</h2>
                <p className="text-xs text-slate-500">Salario y Bonificaciones</p>
              </div>
            </div>

            <div className="space-y-4">
              <CurrencyInput
                label="Salario Base Contrato"
                value={input.baseSalary}
                onChange={(v) => updateInput('baseSalary', v)}
                daysValue={manualSalaryDays !== null ? manualSalaryDays : (input.days.worked + input.days.paidLeave)}
                onDaysChange={(d) => setManualSalaryDays(d)}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CurrencyInput
                  label="Bono Extralegal"
                  value={input.extralegalBonus}
                  onChange={(v) => updateInput('extralegalBonus', v)}
                  daysValue={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                  onDaysChange={(d) => setManualBonusDays(d)}
                />
                <CurrencyInput
                  label="Aux. Alimentación"
                  value={input.foodBonus}
                  onChange={(v) => updateInput('foodBonus', v)}
                  daysValue={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                  onDaysChange={(d) => setManualBonusDays(d)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Section (Calendar & Extras) */}
          <div className="glass-panel rounded-3xl overflow-hidden transition-all duration-500">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-accent-purple/10 text-accent-purple rounded-xl border border-accent-purple/20 group-hover:scale-105 transition-transform">
                   <CalendarIcon />
                 </div>
                 <div className="text-left">
                   <h3 className="font-bold text-white">Novedades y Calendario</h3>
                   <p className="text-xs text-slate-500">Vacaciones, Incapacidades, Extras</p>
                 </div>
               </div>
               <div className={`transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''} text-slate-500`}>
                 <ChevronDownIcon />
               </div>
            </button>
            
            {showAdvanced && (
              <div className="p-6 lg:p-8 border-t border-white/5 space-y-8 animate-slide-up">
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div>
                     <PayrollCalendar 
                        month={input.selectedMonth}
                        year={input.selectedYear}
                        dayStatuses={input.dayStatuses}
                        onToggleDay={handleToggleDay}
                        onMonthChange={(m, y) => setInput(prev => ({ ...prev, selectedMonth: m, selectedYear: y }))}
                      />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4 block">Resumen de Días (Manual)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: 'Vacaciones', key: 'vacation', color: 'text-emerald-400' },
                          { label: 'Incapacidad', key: 'disability', color: 'text-amber-400' },
                          { label: 'Lic. Remun.', key: 'paidLeave', color: 'text-blue-400' },
                          { label: 'No Remun.', key: 'unpaidLeave', color: 'text-rose-400' },
                        ].map((item) => (
                           <div key={item.key} className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                              <span className={`text-[10px] uppercase tracking-wider font-bold block mb-1 ${item.color}`}>{item.label}</span>
                              <input 
                                type="number" 
                                className="w-full bg-transparent border-none p-0 text-xl font-bold text-white focus:ring-0"
                                value={(input.days as any)[item.key]}
                                onChange={(e) => updateDays(item.key as any, parseFloat(e.target.value)||0)}
                              />
                           </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-brand-500/10 p-4 rounded-xl border border-brand-500/20">
                      <h5 className="text-brand-400 font-bold text-xs uppercase mb-1">Sincronización Inteligente</h5>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Al marcar días en el calendario, los contadores manuales se actualizan. Si editas los números manualmente, el cálculo monetario obedecerá tu entrada.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Extras Inputs */}
                <div className="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                   <div className="col-span-full">
                      <ToggleSwitch 
                        label="Horas Extras y Recargos" 
                        checked={input.includeOvertime} 
                        onChange={(v) => updateInput('includeOvertime', v)} 
                        description="Habilitar cálculo de tiempo suplementario"
                      />
                   </div>
                    {input.includeOvertime && (
                      <div className="col-span-full md:col-span-1">
                        <CurrencyInput
                          label="Valor Total Extras"
                          value={input.overtimeValue}
                          onChange={(v) => updateInput('overtimeValue', v)}
                        />
                      </div>
                    )}
                    <div className="col-span-full md:col-span-1">
                       <CurrencyInput
                        label="Comisiones Ventas"
                        value={input.commissions}
                        onChange={(v) => updateInput('commissions', v)}
                      />
                    </div>
                    <div className="col-span-full md:col-span-1">
                      <CurrencyInput
                        label="Seguro Exequial / Otros"
                        value={input.funeralInsurance}
                        onChange={(v) => updateInput('funeralInsurance', v)}
                      />
                    </div>
                </div>

              </div>
            )}
          </div>

          <button 
              onClick={handleAnalyze}
              disabled={aiStatus === AnalysisStatus.LOADING}
              className="w-full bg-gradient-to-r from-brand-600 via-brand-500 to-accent-purple hover:to-accent-purple/80 text-white font-bold py-5 rounded-2xl shadow-neon transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 text-lg border border-white/10"
            >
              {aiStatus === AnalysisStatus.LOADING ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Analizando...
                </span>
              ) : (
                <>
                  <SparklesIcon />
                  <span>Generar Análisis IA</span>
                </>
              )}
          </button>

          {aiStatus === AnalysisStatus.SUCCESS && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-accent-purple/10 to-brand-500/10 border border-accent-purple/20 animate-fade-in">
              <h3 className="text-accent-purple font-bold flex items-center gap-2 mb-4 text-lg">
                <SparklesIcon /> Análisis Financiero
              </h3>
              <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-light leading-relaxed">
                <p className="whitespace-pre-line">{aiAnalysis}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Digital Receipt */}
        <div className="lg:col-span-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
           <div className="sticky top-32">
             <div className="glass-panel rounded-3xl shadow-2xl relative overflow-hidden group">
                
                {/* Receipt Header */}
                <div className="bg-[#12141c]/80 p-8 border-b border-white/5 relative overflow-hidden">
                   {/* Top Shine */}
                   <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent opacity-50"></div>
                   
                   <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">En línea</span>
                     </div>
                     <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
                        REC-{new Date().getTime().toString().slice(-6)}
                     </span>
                   </div>
                   
                   <div className="flex flex-col">
                     <span className="text-sm text-slate-400 font-medium mb-1">Total Neto a Pagar</span>
                     <h2 className="text-5xl font-bold text-white tracking-tight font-sans">
                       {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.netIncome)}
                     </h2>
                   </div>
                </div>
                
                {/* Body */}
                <div className="p-8 space-y-8 bg-[#0B0F17]/40">
                   
                   <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-600"></span>
                        Devengados
                      </h4>
                      <div className="space-y-1">
                        <ResultCard 
                          title="Salario Básico" 
                          amount={results.grossSalary} 
                          type="income" 
                          days={manualSalaryDays !== null ? manualSalaryDays : (input.days.worked + input.days.paidLeave)} 
                        />
                        {results.vacationPay > 0 && (
                          <ResultCard title="Vacaciones" amount={results.vacationPay} type="income" days={input.days.vacation} />
                        )}
                        {results.disabilityPay > 0 && (
                          <ResultCard title="Incapacidades (66%)" amount={results.disabilityPay} type="warning" days={input.days.disability} icon={<AlertIcon/>} />
                        )}
                        {(results.bonusPay > 0) && (
                           <ResultCard 
                              title="Bonos No Salariales" 
                              amount={results.bonusPay} 
                              type="info"
                              days={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                           />
                        )}
                         {input.overtimeValue > 0 && <ResultCard title="Horas Extras" amount={input.overtimeValue} type="info" />}
                         {input.commissions > 0 && <ResultCard title="Comisiones" amount={input.commissions} type="info" />}
                      </div>
                   </div>

                   <div className="py-3 border-y border-dashed border-white/10 flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-400 uppercase">Total Ingresos</span>
                       <span className="font-mono font-bold text-white">
                         {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.grossIncome)}
                       </span>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest flex items-center gap-2">
                         <span className="w-4 h-[1px] bg-slate-600"></span>
                         Deducciones
                      </h4>
                      <div className="space-y-1">
                        <ResultCard title="Salud (4%)" amount={results.healthDeduction} type="deduction" />
                        <ResultCard title="Pensión (4%)" amount={results.pensionDeduction} type="deduction" />
                        {input.funeralInsurance > 0 && <ResultCard title="Otros / Exequial" amount={input.funeralInsurance} type="deduction" />}
                      </div>
                   </div>
                   
                   <div className="bg-rose-500/10 rounded-xl p-4 flex justify-between items-center border border-rose-500/20">
                      <span className="text-xs font-bold text-rose-400">Total Deducciones</span>
                      <span className="font-mono font-bold text-rose-400">
                        - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.totalDeductions)}
                      </span>
                   </div>

                </div>
                
                {/* Footer */}
                <div className="bg-[#0B0F17]/60 p-4 text-center border-t border-white/5">
                   <p className="text-[10px] text-slate-600 font-mono">Powered by Google Gemini 2.5</p>
                </div>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;