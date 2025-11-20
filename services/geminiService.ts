import { GoogleGenAI } from "@google/genai";
import { PayrollInput, CalculatedResults } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSalaryWithGemini = async (
  input: PayrollInput,
  results: CalculatedResults
): Promise<string> => {
  try {
    // Formateador simple para el prompt
    const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

    const prompt = `
      Actúa como un asesor financiero experto en nómina y finanzas personales en Colombia/Latinoamérica. 
      Analiza la siguiente colilla de pago mensual:
      
      DATOS DEL EMPLEADO:
      - Salario Base Contratado: ${fmt(input.baseSalary)}
      - Días trabajados: ${input.workedDays ?? 30}
      - Ingresos NO salariales (Bonos extralegales/Alimentación): ${fmt(input.extralegalBonus + input.foodBonus)}
      
      RESULTADOS DE LA LIQUIDACIÓN:
      - Total Devengado (Ingresos Totales): ${fmt(results.grossIncome)}
      - Deducción Salud (4%): ${fmt(results.healthDeduction)}
      - Deducción Pensión (4%): ${fmt(results.pensionDeduction)}
      - Otras deducciones (Exequial, etc): ${fmt(input.funeralInsurance)}
      - TOTAL A PAGAR (NETO): ${fmt(results.netIncome)}
      
      Por favor, proporciona un análisis breve (máximo 3 párrafos) en formato texto plano o markdown simple:
      1. **Salud Financiera**: Analiza la relación entre ingresos fijos vs variables (bonos). ¿Es riesgoso tener tantos bonos extralegales frente al salario base para prestaciones sociales?
      2. **Capacidad de Ahorro**: Basado en el neto de ${fmt(results.netIncome)}, sugiere un monto ideal de ahorro (regla 50/30/20).
      3. **Consejo Rápido**: Un tip sobre optimización de gastos hormiga o inversión.
      
      Usa un tono motivador y profesional. Responde siempre en Español.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error analyzing payroll:", error);
    throw new Error("Hubo un error al conectar con el asistente financiero.");
  }
};