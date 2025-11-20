export interface PayrollInput {
  baseSalary: number;
  workedDays?: number;
  // workedDays se calculará dinámicamente basado en el calendario
  extralegalBonus: number; 
  foodBonus: number;       
  otherRefunds: number;    
  funeralInsurance: number;
  
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
  grossSalary: number;      // Salario por días trabajados
  vacationPay: number;      // Pago por vacaciones
  disabilityPay: number;    // Pago por incapacidad
  paidLeavePay: number;     // Pago por licencias remuneradas
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