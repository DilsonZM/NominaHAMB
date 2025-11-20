import React, { useState, useEffect } from 'react';
import { CurrencyInput } from './components/CurrencyInput';
import { ResultCard } from './components/ResultCard';
import { PayrollCalendar } from './components/PayrollCalendar';
import { analyzeSalaryWithGemini } from './services/geminiService';
import { PayrollInput, CalculatedResults, AnalysisStatus, DayType } from './types';

// --- Icons Components ---
const CalculatorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const WalletIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const ToggleSwitch = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-slate-200 dark:border-white/10 last:border-0">
    <div className="mr-4">
      <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</div>
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none shadow-inner ${checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const today = new Date();
  
  // State
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
    days: {
      worked: 30,
      vacation: 0,
      disability: 0,
      paidLeave: 0,
      unpaidLeave: 0
    }
  });
  
  // New state to track override for bonus days specifically
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

  // 1. CALENDAR LOGIC -> Updates Input Days (One way sync initial)
  useEffect(() => {
    if (Object.keys(input.dayStatuses).length === 0) return;

    let vacationDays = 0;
    let disabilityDays = 0;
    let unpaidLeaveDays = 0;
    let paidLeaveDays = 0;
    let totalMonthDays = 30; 

    Object.entries(input.dayStatuses).forEach(([dateStr, status]) => {
      const [y, m] = dateStr.split('-').map(Number);
      if (y === input.selectedYear && m === input.selectedMonth + 1) {
        if (status === DayType.VACATION) vacationDays++;
        if (status === DayType.DISABILITY) disabilityDays++;
        if (status === DayType.UNPAID_LEAVE) unpaidLeaveDays++;
        if (status === DayType.PAID_LEAVE) paidLeaveDays++;
      }
    });

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
    
    // Reset manual overrides when calendar is used to ensure sync, or keep them?
    // Better UX: Calendar updates clear manual overrides to show the calendar value
    setManualBonusDays(null);
    setManualSalaryDays(null);

  }, [input.dayStatuses, input.selectedMonth, input.selectedYear]);


  // 2. MONEY CALCULATION LOGIC
  useEffect(() => {
    const dailyBaseSalary = input.baseSalary / 30;
    
    // Determine Salary Days
    // Default: Worked Days + Paid Leaves (Normal salary covers these)
    // If user manually typed in the Salary Input 'Days' field, use that.
    const calculatedSalaryDays = input.days.worked + input.days.paidLeave;
    const effectiveSalaryDays = manualSalaryDays !== null ? manualSalaryDays : calculatedSalaryDays;
    
    const salaryPay = dailyBaseSalary * effectiveSalaryDays;
    
    // Vacation (Always separate line item)
    const vacationPay = dailyBaseSalary * input.days.vacation;
    
    // Disability (66.66%)
    const disabilityPay = (dailyBaseSalary * 0.6666) * input.days.disability;

    // --- Bonus Calculation (Specific Logic) ---
    // User Request: "Descuenten los dias de incapacidad etc de ese bono"
    // Default: Bonuses paid ONLY for Worked Days.
    // If user manually typed in the Bonus Input 'Days' field, use that.
    const totalBonusesBase = input.extralegalBonus + input.foodBonus;
    const dailyBonus = totalBonusesBase / 30;
    
    const calculatedBonusDays = input.days.worked;
    const effectiveBonusDays = manualBonusDays !== null ? manualBonusDays : calculatedBonusDays;
    
    const bonusPay = dailyBonus * effectiveBonusDays;

    // --- Totals ---
    const overtime = input.includeOvertime ? input.overtimeValue : 0;
    const commissions = input.commissions;
    const otherRefunds = input.otherRefunds;

    const grossIncome = salaryPay + vacationPay + disabilityPay + bonusPay + overtime + commissions + otherRefunds;

    // --- Deductions ---
    // IBC Base includes Salary + Vacation + Overtime + Commissions. Excludes non-salary bonuses.
    // Using effective Salary Days for IBC calculation to match reality
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

  // Handlers
  const updateInput = (key: keyof PayrollInput, val: any) => {
    setInput(prev => ({ ...prev, [key]: val }));
  };
  
  const updateDays = (key: keyof typeof input.days, val: number) => {
    setInput(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [key]: val
      }
    }));
  };

  const handleToggleDay = (dateStr: string, type: DayType) => {
    setInput(prev => {
      const newStatuses = { ...prev.dayStatuses };
      if (type === DayType.WORK) {
        delete newStatuses[dateStr];
      } else {
        newStatuses[dateStr] = type;
      }
      return { ...prev, dayStatuses: newStatuses };
    });
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
    <div className="min-h-screen font-sans selection:bg-brand-500 selection:text-white pb-10 transition-colors duration-300">
      
      {/* Navbar Glass */}
      <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-white/70 dark:bg-[#0B0F17]/70 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
             <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-brand-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
                  <CalculatorIcon />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Nómina<span className="text-brand-500">AI</span>
                </span>
             </div>
             <button 
               onClick={() => setDarkMode(!darkMode)}
               className="p-2.5 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-500 dark:text-slate-400 border border-transparent dark:border-white/5"
             >
               {darkMode ? <SunIcon /> : <MoonIcon />}
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input & Control */}
        <div className="lg:col-span-7 space-y-6 animate-fade-in">
          
          {/* Main Config Card */}
          <div className="glass-panel rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">
             {/* Glow Effect */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-700"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
                <WalletIcon />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Conceptos Salariales</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ingresos base y bonificaciones</p>
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <CurrencyInput
                label="Salario Base (Mensual)"
                value={input.baseSalary}
                onChange={(v) => updateInput('baseSalary', v)}
                // Show effective days (Worked + Paid Leave)
                daysValue={manualSalaryDays !== null ? manualSalaryDays : (input.days.worked + input.days.paidLeave)}
                // Allow manual override
                onDaysChange={(d) => setManualSalaryDays(d)}
                disabled={false}
              />
              
              <div className="my-6 border-t border-dashed border-slate-200 dark:border-white/10"></div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/5">
                <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center gap-2">
                  <SparklesIcon /> Bonos No Salariales
                </h3>
                <CurrencyInput
                  label="Bono Extralegal"
                  value={input.extralegalBonus}
                  onChange={(v) => updateInput('extralegalBonus', v)}
                  // Logic: Only worked days apply
                  daysValue={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                  onDaysChange={(d) => setManualBonusDays(d)}
                />

                <CurrencyInput
                  label="Bono Alimentación"
                  value={input.foodBonus}
                  onChange={(v) => updateInput('foodBonus', v)}
                  // Logic: Only worked days apply, linked to same override as Extralegal for UX simplicity, or separate? Let's use the manualBonusDays for both visually if confusing, but cleaner to pass the same derived value. 
                  // For this UI, let's assume the Day counter on Extralegal controls the "Bonus Days" factor generally, or disable days on this second one to avoid confusion.
                  // Let's enable it but sync it via logic? No, let's just let user edit Extralegal days and assume it applies to Food too, or let them edit both. Let's let them edit Extralegal as the "Driver".
                  // Actually, let's keep simple:
                  daysValue={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                  onDaysChange={(d) => setManualBonusDays(d)}
                />
              </div>
            </div>
          </div>

          {/* Advanced Accordion */}
          <div className="glass-panel rounded-3xl overflow-hidden shadow-lg transition-all">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
            >
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                   <CalendarIcon />
                 </div>
                 <div className="text-left">
                   <h3 className="font-bold text-slate-900 dark:text-white">Detalle de Días y Novedades</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400">Vacaciones, Incapacidades, Extras</p>
                 </div>
               </div>
               <div className={`transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''} text-slate-400`}>
                 <ChevronDownIcon />
               </div>
            </button>
            
            {showAdvanced && (
              <div className="p-6 border-t border-slate-200 dark:border-white/5 space-y-8 animate-slide-up">
                
                {/* Calendar Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Calendario Interactivo</label>
                     <PayrollCalendar 
                        month={input.selectedMonth}
                        year={input.selectedYear}
                        dayStatuses={input.dayStatuses}
                        onToggleDay={handleToggleDay}
                        onMonthChange={(m, y) => setInput(prev => ({ ...prev, selectedMonth: m, selectedYear: y }))}
                      />
                  </div>
                  <div className="space-y-5">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Ajuste Manual de Días</label>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block mb-1">Vacaciones</span>
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-900 dark:text-white focus:ring-0"
                            value={input.days.vacation}
                            onChange={(e) => updateDays('vacation', parseFloat(e.target.value)||0)}
                          />
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold block mb-1">Incapacidad</span>
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-900 dark:text-white focus:ring-0"
                            value={input.days.disability}
                            onChange={(e) => updateDays('disability', parseFloat(e.target.value)||0)}
                          />
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold block mb-1">Licencia Remun.</span>
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-900 dark:text-white focus:ring-0"
                            value={input.days.paidLeave}
                            onChange={(e) => updateDays('paidLeave', parseFloat(e.target.value)||0)}
                          />
                       </div>
                       <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                          <span className="text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold block mb-1">No Remun.</span>
                          <input 
                            type="number" 
                            className="w-full bg-transparent border-none p-0 text-xl font-bold text-slate-900 dark:text-white focus:ring-0"
                            value={input.days.unpaidLeave}
                            onChange={(e) => updateDays('unpaidLeave', parseFloat(e.target.value)||0)}
                          />
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                       Los días editados aquí recalculan automáticamente el salario. El calendario es una ayuda visual.
                    </p>
                  </div>
                </div>

                {/* Extras Toggle Section */}
                <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/5">
                   <div className="flex items-center gap-2 mb-2">
                      <SettingsIcon />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Deducciones y Extras</h4>
                   </div>
                   <ToggleSwitch 
                      label="Horas Extras y Recargos" 
                      checked={input.includeOvertime} 
                      onChange={(v) => updateInput('includeOvertime', v)} 
                    />
                    {input.includeOvertime && (
                      <CurrencyInput
                        label="Valor Total Extras"
                        value={input.overtimeValue}
                        onChange={(v) => updateInput('overtimeValue', v)}
                      />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                       <CurrencyInput
                        label="Comisiones Ventas"
                        value={input.commissions}
                        onChange={(v) => updateInput('commissions', v)}
                      />
                      <CurrencyInput
                        label="Seguro Exequial"
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
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-600/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
            >
              {aiStatus === AnalysisStatus.LOADING ? (
                <span className="animate-pulse">Procesando datos...</span>
              ) : (
                <>
                  <SparklesIcon />
                  <span>Generar Análisis Financiero</span>
                </>
              )}
          </button>

          {/* AI Result Box */}
          {aiStatus === AnalysisStatus.SUCCESS && (
            <div className="p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md animate-fade-in">
              <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-4">
                <SparklesIcon /> Asesor Financiero IA
              </h3>
              <div className="prose prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300">
                <p className="whitespace-pre-line leading-relaxed">{aiAnalysis}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Receipt View */}
        <div className="lg:col-span-5">
           <div className="sticky top-28">
             <div className="glass-panel rounded-3xl shadow-2xl relative overflow-hidden border border-white/10">
                
                {/* Receipt Header */}
                <div className="bg-slate-100 dark:bg-[#1e2736]/50 p-8 border-b border-slate-200 dark:border-white/5 border-dashed relative">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-purple-600"></div>
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xs font-black uppercase tracking-widest text-brand-500">Comprobante de Pago</h3>
                     <div className="px-2 py-1 rounded bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-300">
                        {new Date().toLocaleDateString()}
                     </div>
                   </div>
                   <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                     {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.netIncome)}
                   </h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Neto a Recibir</p>
                </div>
                
                {/* Body */}
                <div className="p-8 space-y-6 relative bg-white/50 dark:bg-[#0B0F17]/30">
                   {/* Decorative punch holes */}
                   <div className="absolute -left-3 top-0 w-6 h-6 bg-slate-50 dark:bg-[#0B0F17] rounded-full"></div>
                   <div className="absolute -right-3 top-0 w-6 h-6 bg-slate-50 dark:bg-[#0B0F17] rounded-full"></div>

                   <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Devengado Salarial</h4>
                      <ResultCard 
                        title="Salario Básico" 
                        amount={results.grossSalary} 
                        type="income" 
                        // Show effective days
                        days={manualSalaryDays !== null ? manualSalaryDays : (input.days.worked + input.days.paidLeave)} 
                      />
                      {results.vacationPay > 0 && (
                        <ResultCard title="Vacaciones" amount={results.vacationPay} type="income" days={input.days.vacation} />
                      )}
                      {results.disabilityPay > 0 && (
                        <ResultCard title="Incapacidades" amount={results.disabilityPay} type="warning" days={input.days.disability} icon={<AlertIcon/>} />
                      )}
                   </div>

                   {(results.bonusPay > 0 || input.overtimeValue > 0 || input.commissions > 0) && (
                     <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest mt-6">No Salarial & Variables</h4>
                        <ResultCard 
                           title="Bonos Extralegales" 
                           subtitle="Prop. Días Trabajados"
                           amount={results.bonusPay} 
                           type="info"
                           days={manualBonusDays !== null ? manualBonusDays : input.days.worked}
                        />
                        {input.overtimeValue > 0 && <ResultCard title="Horas Extras" amount={input.overtimeValue} type="info" />}
                        {input.commissions > 0 && <ResultCard title="Comisiones" amount={input.commissions} type="info" />}
                     </div>
                   )}
                   
                   <div className="flex justify-between items-center py-3 border-t border-dashed border-slate-300 dark:border-white/10 mt-4">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Total Devengado</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.grossIncome)}
                      </span>
                   </div>

                   <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Deducciones de Ley</h4>
                      <ResultCard title="Salud (4%)" amount={results.healthDeduction} type="deduction" />
                      <ResultCard title="Pensión (4%)" amount={results.pensionDeduction} type="deduction" />
                      {input.funeralInsurance > 0 && <ResultCard title="Exequial" amount={input.funeralInsurance} type="deduction" />}
                   </div>
                   
                   <div className="flex justify-between items-center py-3 border-t border-dashed border-slate-300 dark:border-white/10 text-rose-500">
                      <span className="text-sm font-bold">Total Deducciones</span>
                      <span className="text-sm font-bold">
                        - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.totalDeductions)}
                      </span>
                   </div>

                </div>
                
                {/* Footer */}
                <div className="bg-slate-100 dark:bg-[#1e2736]/50 p-4 text-center border-t border-slate-200 dark:border-white/5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Cálculo estimado • Normativa Colombia</p>
                </div>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;