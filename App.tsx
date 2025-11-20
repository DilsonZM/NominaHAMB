import React, { useState, useEffect } from 'react';
import { CurrencyInput } from './components/CurrencyInput';
import { ResultCard } from './components/ResultCard';
import { PayrollCalendar } from './components/PayrollCalendar';
import { analyzeSalaryWithGemini } from './services/geminiService';
import { PayrollInput, CalculatedResults, AnalysisStatus, DayType } from './types';

// --- Icons Components ---
const CalculatorIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const MoonIcon = () => <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>;
const BriefcaseIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const GiftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const HeartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SparklesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const AlertIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const SunIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronUpIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;

// --- Components ---

const ToggleSwitch = ({ label, checked, onChange, description }: { label: string, checked: boolean, onChange: (v: boolean) => void, description?: string }) => (
  <div className="flex items-start justify-between py-3 border-b border-slate-800 last:border-0">
    <div className="mr-4">
      <div className="text-sm font-medium text-slate-200">{label}</div>
      {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? 'bg-brand-600' : 'bg-slate-700'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const App: React.FC = () => {
  // State Initialization
  const today = new Date();
  const [input, setInput] = useState<PayrollInput>({
    baseSalary: 1800000,
    selectedMonth: today.getMonth(),
    selectedYear: today.getFullYear(),
    dayStatuses: {}, // Will hold '2025-10-10': 'VACATION' etc.
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
    netIncome: 0
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

    // 5. Deductions Base (IBC)
    // In Colombia:
    // - Vacations -> IBC Yes
    // - Disability -> IBC Yes (Health is paid by EPS, Pension usually not but let's keep it simple for estimate)
    // - Paid Leave -> IBC Yes
    // - Unpaid Leave -> Reduces IBC
    
    // Simplified IBC for user estimate:
    const ibc = grossSalary + vacationPay + paidLeavePay + overtime + input.commissions; 

    // 6. Deductions
    const healthRate = 0.04;
    const pensionRate = 0.04;
    
    const healthDeduction = ibc * healthRate;
    // Pension is not paid during disability usually.
    // Unpaid leave: employer pays most, employee pays part? Usually unpaid leave implies no salary thus no deduction from employee, but employer has to pay health.
    // We will calculate deductions based on the money received that constitutes salary.
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
      netIncome
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
        // WORK is default/delete
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
      // Calculate total days for context
      const currentMonthStatuses = Object.entries(input.dayStatuses)
        .filter(([k]) => k.startsWith(`${input.selectedYear}-${String(input.selectedMonth + 1).padStart(2,'0')}`))
        .map(([,v]) => v);
      const workDays = 30 - currentMonthStatuses.length;

      const contextInput = {
         ...input,
         workedDays: workDays 
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
    <div className="min-h-screen bg-dark-bg p-4 md:p-8 font-sans text-slate-200">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="bg-gradient-to-tr from-brand-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/20">
             <CalculatorIcon />
           </div>
           <div>
             <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Hola, bienvenido</p>
             <h1 className="text-2xl font-bold text-white">Calculadora de Nómina</h1>
           </div>
        </div>
        <div className="p-2 rounded-full bg-dark-card border border-slate-800 text-slate-400">
          <MoonIcon />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Inputs Card */}
          <div className="bg-dark-card rounded-2xl border border-dark-border p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Conceptos Básicos</h2>
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
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-dark-card/50">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-4 bg-dark-card hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-300">Opciones Avanzadas</span>
              {showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {showAdvanced && (
              <div className="p-6 bg-dark-card border-t border-slate-800 animate-in slide-in-from-top-2 duration-200">
                
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
                      <div className="mt-3">
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
                        <div className="mt-3">
                          <CurrencyInput
                            label="Valor Comisiones"
                            value={input.commissions}
                            onChange={(v) => updateInput('commissions', v)}
                          />
                        </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Otras Deducciones</h3>
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
              className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold py-4 px-4 rounded-xl shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2"
            >
              {aiStatus === AnalysisStatus.LOADING ? (
                <span className="animate-pulse">Analizando...</span>
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
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 p-5 rounded-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="absolute top-0 right-0 p-2 opacity-20"><SparklesIcon /></div>
               <h3 className="text-indigo-300 font-bold flex items-center gap-2 mb-2">
                 <SparklesIcon /> Análisis Financiero
               </h3>
               <div className="text-slate-200 text-sm whitespace-pre-line leading-relaxed">
                 {aiAnalysis}
               </div>
            </div>
          )}

          {/* Ingresos Section */}
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Detalle de Ingresos</h3>
            
            <ResultCard 
              title="Salario Base Proporcional" 
              subtitle="Días trabajados efectivamente"
              amount={results.grossSalary} 
              type="income"
              icon={<BriefcaseIcon />}
            />
            
            {results.vacationPay > 0 && (
               <ResultCard 
                title="Pago de Vacaciones" 
                subtitle="Días disfrutados"
                amount={results.vacationPay} 
                type="income"
                icon={<SunIcon />}
              />
            )}

            {results.paidLeavePay > 0 && (
               <ResultCard 
                title="Licencias Remuneradas" 
                subtitle="Luto, Paternidad, etc."
                amount={results.paidLeavePay} 
                type="income"
                icon={<GiftIcon />}
              />
            )}

            {results.disabilityPay > 0 && (
               <ResultCard 
                title="Pago Incapacidades" 
                subtitle="Cobertura parcial (66.66%)"
                amount={results.disabilityPay} 
                type="warning" 
                icon={<AlertIcon />}
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
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 mt-6">Deducciones de Ley</h3>
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

            <div className="bg-[#2D1A1A] rounded-xl px-4 py-3 flex justify-between items-center border border-rose-900/30">
               <span className="text-rose-200 text-sm font-medium">TOTAL DEDUCCIONES</span>
               <span className="text-rose-400 font-bold text-lg">
                 {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(results.totalDeductions)}
               </span>
            </div>
          </div>

          {/* NETO Final */}
          <div className="mt-8">
             <ResultCard 
               title="NETO A RECIBIR" 
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