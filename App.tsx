import React, { useState, useEffect } from 'react';
import { CurrencyInput } from './components/CurrencyInput';
import { ResultCard } from './components/ResultCard';
import { PayrollCalendar } from './components/PayrollCalendar';
import { analyzeSalaryWithGemini } from './services/geminiService';
import { PayrollInput, CalculatedResults, AnalysisStatus, DayType } from './types';

// --- Icons Components ---
const CalculatorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" /></svg>;
const BriefcaseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const GiftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const HeartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const VacationIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;

// --- Components ---

const ToggleSwitch = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
  <div className="flex items-start justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 group">
    <div className="mr-4">
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{label}</div>
      {description && <div className="text-xs text-slate-400 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const App: React.FC = () => {
  // Theme Management
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // State Initialization
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
    commissions: 0
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [results, setResults] = useState<CalculatedResults>({
    grossSalary: 0,
    vacationPay: 0,
    disabilityPay: 0,
    paidLeavePay: 0,
    grossIncome: 0,
    healthDeduction: 0,
    pensionDeduction: 0,
    totalDeductions: 0,
    netIncome: 0,
    daysBreakdown: {
      worked: 30,
      vacation: 0,
      disability: 0,
      paidLeave: 0,
      unpaidLeave: 0
    }
  });

  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  // Calculation Logic
  useEffect(() => {
    const dailyValue = input.baseSalary / 30;

    // 1. Count Days from Calendar
    let vacationDays = 0;
    let disabilityDays = 0;
    let unpaidLeaveDays = 0;
    let paidLeaveDays = 0;
    let totalMonthDays = 30; // Standard accounting month

    // We iterate through the selected month's statuses
    Object.entries(input.dayStatuses).forEach(([dateStr, status]) => {
      const [y, m] = dateStr.split('-').map(Number);
      // Only count if it belongs to selected month/year
      if (y === input.selectedYear && m === input.selectedMonth + 1) {
        if (status === DayType.VACATION) vacationDays++;
        if (status === DayType.DISABILITY) disabilityDays++;
        if (status === DayType.UNPAID_LEAVE) unpaidLeaveDays++;
        if (status === DayType.PAID_LEAVE) paidLeaveDays++;
      }
    });

    // Worked days are remaining days
    const workedDays = Math.max(0, totalMonthDays - vacationDays - disabilityDays - unpaidLeaveDays - paidLeaveDays);

    // 2. Calculate Concept Values
    const grossSalary = dailyValue * workedDays;
    const vacationPay = dailyValue * vacationDays; // Paid at 100% usually
    const disabilityPay = (dailyValue * 0.6666) * disabilityDays; // Paid at 66.66% for general illness
    const paidLeavePay = dailyValue * paidLeaveDays; // Paid at 100% usually (Ley Maria etc)
    
    // 3. Additional Income
    const totalBonuses = input.extralegalBonus + input.foodBonus + input.otherRefunds + input.commissions;
    const overtime = input.includeOvertime ? input.overtimeValue : 0;
    
    // 4. Total Gross Income (Devengado)
    const grossIncome = grossSalary + vacationPay + disabilityPay + paidLeavePay + totalBonuses + overtime;

    // 5. Deductions Base (IBC) - Simplified
    const ibc = grossSalary + vacationPay + paidLeavePay + overtime + input.commissions; 

    // 6. Deductions
    const healthRate = 0.04;
    const pensionRate = 0.04;
    
    const healthDeduction = ibc * healthRate;
    const pensionDeduction = ibc * pensionRate;
    
    const funeral = input.funeralInsurance;
    const totalDeductions = healthDeduction + pensionDeduction + funeral;

    // 7. Net
    const netIncome = grossIncome - totalDeductions;

    setResults({
      grossSalary,
      vacationPay,
      disabilityPay,
      paidLeavePay,
      grossIncome,
      healthDeduction,
      pensionDeduction,
      totalDeductions,
      netIncome,
      daysBreakdown: {
        worked: workedDays,
        vacation: vacationDays,
        disability: disabilityDays,
        paidLeave: paidLeaveDays,
        unpaidLeave: unpaidLeaveDays
      }
    });
  }, [input]);

  // Handlers
  const updateInput = (key: keyof PayrollInput, val: any) => {
    setInput(prev => ({ ...prev, [key]: val }));
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
      const contextInput = {
         ...input,
         workedDays: results.daysBreakdown.worked 
      }
      const text = await analyzeSalaryWithGemini(contextInput, results);
      setAiAnalysis(text);
      setAiStatus(AnalysisStatus.SUCCESS);
    } catch (e) {
      setAiAnalysis("Error conectando con el servicio.");
      setAiStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] transition-colors duration-300 font-sans p-4 md:p-8">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center sticky top-2 z-20 bg-slate-50/80 dark:bg-[#0B0F17]/80 backdrop-blur-md py-3 rounded-2xl">
        <div className="flex items-center gap-3 px-2">
           <div className="bg-gradient-to-tr from-brand-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/30 text-white">
             <CalculatorIcon />
           </div>
           <div>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Finanzas Personales</p>
             <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Nómina AI Pro</h1>
           </div>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-full bg-white dark:bg-[#151B28] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Inputs Card */}
          <div className="bg-white dark:bg-[#151B28] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conceptos Básicos</h2>
            </div>

            <CurrencyInput
              label="Salario Básico Mensual"
              value={input.baseSalary}
              onChange={(v) => updateInput('baseSalary', v)}
            />

            <CurrencyInput
              label="Bono Extralegal"
              value={input.extralegalBonus}
              onChange={(v) => updateInput('extralegalBonus', v)}
            />

            <CurrencyInput
              label="Bono Alimentación"
              value={input.foodBonus}
              onChange={(v) => updateInput('foodBonus', v)}
            />
          </div>

          {/* Advanced Collapsible Section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#151B28] shadow-lg shadow-slate-200/50 dark:shadow-none">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-[#1e293b]/30 hover:bg-slate-100 dark:hover:bg-[#1e293b]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${showAdvanced ? 'bg-brand-500' : 'bg-slate-400'}`}></div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Opciones Avanzadas y Calendario</span>
              </div>
              {showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {showAdvanced && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2 duration-200">
                
                <div className="mb-8">
                   <PayrollCalendar 
                      month={input.selectedMonth}
                      year={input.selectedYear}
                      dayStatuses={input.dayStatuses}
                      onToggleDay={handleToggleDay}
                      onMonthChange={(m, y) => {
                        setInput(prev => ({ ...prev, selectedMonth: m, selectedYear: y }));
                      }}
                    />
                </div>

                <div className="space-y-6">
                  <div>
                    <ToggleSwitch 
                      label="Horas extra y recargos" 
                      description="Habilitar cálculo de horas extra"
                      checked={input.includeOvertime} 
                      onChange={(v) => updateInput('includeOvertime', v)} 
                    />
                    {input.includeOvertime && (
                      <div className="mt-3 pl-4 border-l-2 border-brand-500">
                        <CurrencyInput
                          label="Valor Total Horas Extra"
                          value={input.overtimeValue}
                          onChange={(v) => updateInput('overtimeValue', v)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <ToggleSwitch 
                      label="Comisiones" 
                      description="Agregar comisiones por ventas"
                      checked={input.commissions > 0} 
                      onChange={(v) => updateInput('commissions', v ? 1 : 0)} 
                    />
                    {input.commissions > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-brand-500">
                          <CurrencyInput
                            label="Valor Comisiones"
                            value={input.commissions}
                            onChange={(v) => updateInput('commissions', v)}
                          />
                        </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Otras Deducciones</h3>
                    <CurrencyInput
                      label="Seguro Exequial (Los Olivos)"
                      value={input.funeralInsurance}
                      onChange={(v) => updateInput('funeralInsurance', v)}
                    />
                    <CurrencyInput
                      label="Novedades (Reembolsos)"
                      value={input.otherRefunds}
                      onChange={(v) => updateInput('otherRefunds', v)}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

          <button 
              onClick={handleAnalyze}
              disabled={aiStatus === AnalysisStatus.LOADING}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold py-4 px-4 rounded-2xl shadow-xl shadow-brand-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {aiStatus === AnalysisStatus.LOADING ? (
                <span className="animate-pulse">Analizando datos...</span>
              ) : (
                <>
                  <SparklesIcon />
                  <span>Analizar Nómina con IA</span>
                </>
              )}
          </button>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Insight Box */}
          {aiStatus === AnalysisStatus.SUCCESS && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/30 p-6 rounded-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 shadow-sm">
               <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-20 text-indigo-600 dark:text-white"><SparklesIcon /></div>
               <h3 className="text-indigo-700 dark:text-indigo-300 font-bold flex items-center gap-2 mb-3">
                 <SparklesIcon /> Análisis Financiero Inteligente
               </h3>
               <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-line leading-relaxed font-medium">
                 {aiAnalysis}
               </div>
            </div>
          )}

          {/* Ingresos Section */}
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 pl-1">Detalle de Ingresos</h3>
            
            <ResultCard 
              title="Salario Básico" 
              subtitle="Proporcional al tiempo trabajado"
              amount={results.grossSalary} 
              type="income"
              icon={<BriefcaseIcon />}
              days={results.daysBreakdown.worked}
            />
            
            {results.vacationPay > 0 && (
               <ResultCard 
                title="Vacaciones" 
                subtitle="Periodo de descanso remunerado"
                amount={results.vacationPay} 
                type="income"
                icon={<VacationIcon />}
                days={results.daysBreakdown.vacation}
              />
            )}

            {results.paidLeavePay > 0 && (
               <ResultCard 
                title="Licencias Remuneradas" 
                subtitle="Luto, Paternidad, etc."
                amount={results.paidLeavePay} 
                type="income"
                icon={<GiftIcon />}
                days={results.daysBreakdown.paidLeave}
              />
            )}

            {results.disabilityPay > 0 && (
               <ResultCard 
                title="Incapacidades" 
                subtitle="Cobertura parcial (66.66%)"
                amount={results.disabilityPay} 
                type="warning" 
                icon={<AlertIcon />}
                days={results.daysBreakdown.disability}
              />
            )}

            {(input.extralegalBonus > 0 || input.foodBonus > 0 || input.commissions > 0 || input.overtimeValue > 0) && (
              <ResultCard 
                title="Bonos, Extras y Comisiones" 
                subtitle="Ingresos variables y no salariales"
                amount={input.extralegalBonus + input.foodBonus + input.commissions + input.overtimeValue} 
                type="income"
                icon={<GiftIcon />}
              />
            )}
            
            <ResultCard 
              title="TOTAL DEVENGADO" 
              amount={results.grossIncome} 
              type="subtotal"
            />
          </div>

          {/* Deductions Section */}
          <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 mt-8 pl-1">Deducciones de Ley</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <ResultCard 
                title="Salud (4%)" 
                amount={results.healthDeduction} 
                type="deduction"
                icon={<HeartIcon />}
              />
              <ResultCard 
                title="Pensión (4%)" 
                amount={results.pensionDeduction} 
                type="deduction"
                icon={<HomeIcon />}
              />
            </div>
            
            {input.funeralInsurance > 0 && (
               <ResultCard 
                  title="Seguro Exequial" 
                  amount={input.funeralInsurance} 
                  type="deduction"
                />
            )}

            <div className="bg-rose-50 dark:bg-[#2D1A1A] rounded-xl px-5 py-4 flex justify-between items-center border border-rose-100 dark:border-rose-900/30">
               <span className="text-rose-700 dark:text-rose-200 text-sm font-bold">TOTAL DEDUCCIONES</span>
               <span className="text-rose-600 dark:text-rose-400 font-extrabold text-lg">
                 {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.totalDeductions)}
               </span>
            </div>
          </div>

          {/* NETO Final */}
          <div className="mt-8 sticky bottom-4 z-10">
             <ResultCard 
               title="NETO A PAGAR" 
               subtitle="Disponible en cuenta"
               amount={results.netIncome} 
               type="net"
             />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;