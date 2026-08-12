import React, { useCallback, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationPanel } from '@/shared/components/NotificationPanel';
import { NotificationItem } from '@/shared/notifications/types';
import { resolveNotificationPath, useNotifications } from '@/shared/notifications';

export const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const openNotifications = useCallback(() => setIsNotifOpen(true), []);
  const closeNotifications = useCallback(() => setIsNotifOpen(false), []);
  const {
    notifications,
    pendingCount,
    isLoading,
    error,
    notificationActionError,
    pushEnabled,
    refreshNotifications,
    markAsRead,
    markAllRead,
    dismissNotification,
    dismissAllNotifications,
    retryNotificationAction,
    enablePush
  } = useNotifications();

  const handleNotificationClick = async (notification: NotificationItem) => {
    const canNavigate = notification.read || await markAsRead(notification.id);
    if (!canNavigate) return;

    closeNotifications();
    navigate(resolveNotificationPath({
      url: notification.action_url,
      module: notification.module,
      requestCode: notification.requestCode
    }));
  };

  return (
    <div className="flex min-h-screen bg-bgMain font-body flex-col md:flex-row text-textMain overflow-x-hidden">
      <div className="md:hidden sticky top-0 flex items-center justify-between p-4 text-white z-40 border-b border-white/5 bg-gradient-header shadow-header-mobile">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain brightness-0 invert drop-shadow-lg" />
          <h1 className="font-display font-extrabold text-sm tracking-widest">ASAMBLEA</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openNotifications}
            aria-label="Abrir notificaciones"
            className="relative text-white/60 hover:text-white transition-colors p-2 rounded-xl"
          >
            <Bell size={20} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-[#0f2548] text-[8px] font-black text-[#0f2548] flex items-center justify-center">
                {pendingCount > 9 ? '+' : pendingCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Abrir menú"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

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

      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenNotifications={openNotifications}
      />

      <NotificationPanel
        isOpen={isNotifOpen}
        onClose={closeNotifications}
        notifications={notifications}
        isLoading={isLoading}
        error={error}
        actionError={notificationActionError}
        pushEnabled={pushEnabled}
        onRefresh={refreshNotifications}
        onRetryAction={retryNotificationAction}
        onEnablePush={enablePush}
        onClearAll={dismissAllNotifications}
        onMarkAllRead={markAllRead}
        onDelete={dismissNotification}
        onNotificationClick={handleNotificationClick}
      />

      <main className="flex-1 md:ml-[280px] w-full min-h-[calc(100vh-64px-70px)] md:min-h-screen pb-[80px] md:pb-0 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
