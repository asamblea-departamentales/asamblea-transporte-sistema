import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../../features/Auth/context/AuthContext';

export const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { pendingCount } = useNotifications(user);

  return (
    <div className="flex min-h-screen bg-bgMain font-body flex-col md:flex-row text-textMain overflow-x-hidden">
      
      {/* ── MOBILE HEADER (Glassmorphism) ── */}
      <div className="md:hidden sticky top-0 flex items-center justify-between bg-surface-overlay backdrop-blur-md p-4 text-white z-40 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert drop-shadow-lg" />
          <h1 className="font-display font-extrabold text-sm tracking-widest">ASAMBLEA</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile Bell (Simplified) */}
          <div className="relative text-ink-muted hover:text-white transition-colors">
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border border-surface-base text-[8px] font-bold text-white flex items-center justify-center">
                {pendingCount > 9 ? '+' : pendingCount}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 bg-surface-subtle border border-surface-border rounded-lg hover:bg-white/10 transition-colors"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Overlay for mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR / BOTTOM NAV ── */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* ── MAIN CONTENT W/ PAGE TRANSITIONS ── */}
      <main className="flex-1 md:ml-[260px] w-full min-h-[calc(100vh-64px-70px)] md:min-h-screen pb-[80px] md:pb-0 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
