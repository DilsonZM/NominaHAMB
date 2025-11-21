import { formatMoney } from '../utils/formatMoney';
import { Icons } from './Icons';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PayrollPDF } from './PayrollPDF';
import { RATES } from '../constants/rates';

export const SummaryContent = ({
  payroll,
  viewDate,
  startDayInput,
  endDayInput,
  overtimeHours,
  salary // Needed for rate calculation display if needed, but payroll has values
}) => {
  
  // Helper to calculate individual overtime value for display
  const hourlyRate = (Number(salary) || 0) / 240;
  const getOvertimeValue = (key, hours) => hours * hourlyRate * RATES[key].factor;

  return (
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

                {/* DETALLE DE HORAS EXTRAS */}
                {payroll.safeOvertime > 0 && (
                    <div className="mt-2 pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                        <p className="text-[9px] font-bold text-amber-500/70 uppercase mb-1">Detalle Extras</p>
                        {Object.entries(overtimeHours).map(([key, hours]) => {
                            if (hours <= 0 || !RATES[key]) return null;
                            const val = getOvertimeValue(key, hours);
                            return (
                                <div key={key} className="flex justify-between py-0.5 text-xs">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        {RATES[key].label} 
                                        <span className="text-[9px] bg-amber-50 dark:bg-amber-900/20 px-1 rounded text-amber-600 dark:text-amber-400">{hours}h</span>
                                    </span>
                                    <span className="font-bold text-amber-500 dark:text-amber-400">{formatMoney(val)}</span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between py-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-slate-600 dark:text-slate-300 font-bold text-xs">Total Extras</span>
                            <span className="font-bold text-amber-500 dark:text-amber-400">{formatMoney(payroll.safeOvertime)}</span>
                        </div>
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
                {({ loading }) =>
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
  );
};
