import React from 'react';
import { Icons } from './Icons';

export const BottomNav = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'salary', icon: Icons.Wallet, label: 'Salario' },
    { id: 'novedades', icon: Icons.Calendar, label: 'Novedades' },
    { id: 'home', icon: Icons.Home, label: 'Resumen' },
    { id: 'deducciones', icon: Icons.TrendingDown, label: 'Deducciones' },
    { id: 'overtime', icon: Icons.Clock, label: 'Horas' },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[60] px-4 flex justify-center pointer-events-none">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl w-full max-w-md shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-2 py-2 pointer-events-auto relative transition-colors duration-300">
        {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
                <button 
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="relative flex-1 flex flex-col items-center justify-end h-14 group"
                >
                    <div 
                        className={`
                            absolute transition-all duration-300 ease-out flex items-center justify-center
                            ${isActive 
                                ? '-top-8 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/30 border-[4px] border-white dark:border-[#0B1120] text-white transform scale-110' 
                                : 'top-1 w-10 h-10 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                            }
                        `}
                    >
                        <item.icon className={isActive ? 'w-6 h-6' : 'w-5 h-5'} />
                    </div>
                    
                    <span 
                        className={`
                            text-[9px] font-bold mb-1 transition-all duration-300
                            ${isActive 
                                ? 'text-cyan-600 dark:text-cyan-400 translate-y-0 opacity-100' 
                                : 'text-slate-500 translate-y-2 opacity-0'
                            }
                        `}
                    >
                        {item.label}
                    </span>
                </button>
            );
        })}
      </div>
    </div>
  );
};
