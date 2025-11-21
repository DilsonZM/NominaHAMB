import React from 'react';
import { Icons } from './Icons';

export const BottomNav = ({ activeTab, onTabChange, onMainAction }) => {
  const navItems = [
    { id: 'home', icon: Icons.Home, label: 'Inicio' },
    { id: 'overtime', icon: Icons.Clock, label: 'Extras' },
  ];

  const secondaryItems = [
    { id: 'settings', icon: Icons.Settings, label: 'Ajustes' }, // Placeholder for now
    { id: 'pdf', icon: Icons.Download, label: 'PDF' }, // Placeholder for now
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-xs sm:max-w-sm">
      <div className="bg-[#1e293b] dark:bg-[#0f172a] rounded-full px-6 py-3 shadow-2xl border border-slate-700/50 flex items-center justify-between relative">
        
        {/* Left Items */}
        <div className="flex gap-6">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <item.icon />
                </button>
            ))}
        </div>

        {/* Center Action Button (Floating) */}
        <div className="absolute left-1/2 -top-6 transform -translate-x-1/2">
            <button 
                onClick={onMainAction}
                className="w-14 h-14 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform border-4 border-slate-50 dark:border-[#0B1120]"
            >
                <Icons.Plus />
            </button>
        </div>

        {/* Right Items */}
        <div className="flex gap-6">
            {secondaryItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeTab === item.id ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <item.icon />
                </button>
            ))}
        </div>

      </div>
    </div>
  );
};
