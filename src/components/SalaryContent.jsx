import { Icons } from './Icons';

export const SalaryContent = ({
  salary, setSalary,
  bonus, setBonus,
  food, setFood,
  otrosIngresos, setOtrosIngresos,
  handleNumInput
}) => {
  return (
    <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};
