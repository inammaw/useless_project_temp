import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { AcousticToastData } from '../utils/chaosEngine';
import { Utensils, Bell, CloudRain, Zap, MessageSquare, Coffee, X } from 'lucide-react';

interface DesktopToastProps {
  toast: AcousticToastData | null;
  onDismiss: () => void;
}

export const DesktopToast: React.FC<DesktopToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;

    // Auto-dismiss after 6.5 seconds
    const timer = setTimeout(() => {
      onDismiss();
    }, 6500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getToastIcon = () => {
    switch (toast.icon) {
      case 'cooker':
        return <Utensils size={18} className="text-orange-700" />;
      case 'gate':
        return <Bell size={18} className="text-amber-800" />;
      case 'thunder':
        return <CloudRain size={18} className="text-blue-700" />;
      case 'power':
        return <Zap size={18} className="text-amber-600" />;
      case 'whatsapp':
        return <MessageSquare size={18} className="text-emerald-700" />;
      case 'tea':
        return <Coffee size={18} className="text-amber-900" />;
      default:
        return <Bell size={18} className="text-gray-700" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-9 right-4 z-40 max-w-sm w-80 win95-box shadow-2xl p-2 select-none border-2 border-gray-400 bg-[#ffffd9]"
    >
      {/* Toast Header */}
      <div className="flex items-center justify-between pb-1 border-b border-gray-300 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-amber-100 border border-amber-300 rounded-xs flex items-center justify-center">
            {getToastIcon()}
          </div>
          <span className="font-bold text-xs text-gray-900 tracking-tight font-sans">
            {toast.title}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="win95-btn w-4 h-4 p-0 flex items-center justify-center text-gray-800 hover:bg-red-200 cursor-pointer"
          title="Dismiss notification"
        >
          <X size={10} />
        </button>
      </div>

      {/* Toast Body */}
      <p className="text-[11px] text-gray-800 leading-snug font-sans px-1">
        {toast.subtitle}
      </p>

      {/* Micro Status Bar */}
      <div className="mt-2 pt-1 border-t border-gray-300 flex items-center justify-between text-[9px] font-mono text-gray-600 px-1">
        <span>THARAVADU ACOUSTIC RADAR</span>
        <span className="text-red-700 font-bold">+{toast.stressDelta}% STRESS</span>
      </div>
    </motion.div>
  );
};
