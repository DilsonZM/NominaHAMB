import React from 'react';

export const DeductionsContent = ({
  prestamos, setPrestamos,
  funebres, setFunebres,
  handleNumInput
}) => {
  return (
    <div className="space-y-4 pt-2">
        <div>
          <div className="flex justify-between">
            <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mb-1 uppercase">Préstamos / Deudas Empresa</p>
          </div>
          <div className="relative group">
              <span className="absolute left-4 top-3.5 text-rose-300 dark:text-rose-900/50 font-mono group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 transition-colors">$</span>
              <input 
                type="number" 
                value={prestamos} 
                onChange={handleNumInput(setPrestamos)} 
                className="w-full bg-rose-50 dark:bg-[#0B1120] border border-rose-200 dark:border-rose-900/30 rounded-2xl py-3 pl-8 pr-4 text-rose-700 dark:text-rose-100 font-bold focus:border-rose-500 outline-none transition-all"
              />
          </div>
        </div>

        <div>
          <div className="flex justify-between">
            <p className="text-xs font-bold text-rose-500 dark:text-rose-400 mb-1 uppercase">Seguro Exequial / Funeraria</p>
          </div>
          <div className="relative group">
              <span className="absolute left-4 top-3.5 text-rose-300 dark:text-rose-900/50 font-mono group-focus-within:text-rose-500 dark:group-focus-within:text-rose-400 transition-colors">$</span>
              <input 
                type="number" 
                value={funebres} 
                onChange={handleNumInput(setFunebres)} 
                className="w-full bg-rose-50 dark:bg-[#0B1120] border border-rose-200 dark:border-rose-900/30 rounded-2xl py-3 pl-8 pr-4 text-rose-700 dark:text-rose-100 font-bold focus:border-rose-500 outline-none transition-all"
              />
          </div>
        </div>
    </div>
  );
};
