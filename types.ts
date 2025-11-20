export interface PayrollInput {
  baseSalary: number;
  extralegalBonus: number; 
  foodBonus: number;       
  otherRefunds: number;    
  funeralInsurance: number;
  
  // Contadores de días (Editables manualmente o por calendario)
  days: {
    worked: number;       // Días trabajados reales
    vacation: number;     // Días de vacaciones
    disability: number;   // Días de incapacidad
    paidLeave: number;    // Licencias remuneradas
    unpaidLeave: number;  // No remunerados
  };

  // Configuración de fecha y calendario
  selectedMonth: number; // 0-11
  selectedYear: number;
  dayStatuses: Record<string, DayType>; // key: "YYYY-MM-DD", value: DayType
  
  includeOvertime: boolean;
  overtimeValue: number;
  commissions: number;
}

export enum DayType {
  WORK = 'WORK',
  VACATION = 'VACATION',
  DISABILITY = 'DISABILITY',
  PAID_LEAVE = 'PAID_LEAVE',     // Licencia remunerada (Luto, Paternidad, etc)
  UNPAID_LEAVE = 'UNPAID_LEAVE'  // Permiso no remunerado
}

export interface CalculatedResults {
  grossSalary: number;      // Pago por tiempo trabajado
  vacationPay: number;      // Pago por vacaciones
  disabilityPay: number;    // Pago por incapacidad
  paidLeavePay: number;     // Pago por licencias remuneradas
  
  bonusPay: number;         // Pago proporcional de bonos (Extralegal + Alimentación)

  grossIncome: number;      // Total Devengado
  healthDeduction: number;  
  pensionDeduction: number; 
  totalDeductions: number;
  netIncome: number; 
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}