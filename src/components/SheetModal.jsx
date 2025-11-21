import React, { useEffect } from 'react';

export const SheetModal = ({ isOpen, onClose, title, icon: Icon, children, color = "text-slate-900 dark:text-white" }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Modal / Sheet */}
      <div className="bg-white dark:bg-[#161E2E] w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-transform duration-300 pointer-events-auto animate-in slide-in-from-bottom-10 max-h-[85vh] flex flex-col relative overflow-hidden">
        <div className="pt-6 px-6 pb-0 flex-shrink-0">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
            
            <div className="flex items-center gap-3 mb-6">
                {Icon && (
                    <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-xl ${color}`}>
                        <Icon />
                    </div>
                )}
                <div>
                    <h2 className={`text-xl font-bold ${color}`}>{title}</h2>
                </div>
                <button onClick={onClose} className="ml-auto p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 pb-32">
            {children}
        </div>

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#161E2E] to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};
