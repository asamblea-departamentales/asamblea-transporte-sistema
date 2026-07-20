import React from "react";
import { LayoutGrid, PlusCircle, List, Menu as MenuIcon, X, Bell, LogOut, Check, Trash2, User, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

export type NavItem = { to: string; label: string; mobileLabel: string; icon: () => React.ReactElement; badge?: number };

export const T = {
  headerBg:    "linear-gradient(135deg, #0f2548 0%, #1a3a75 100%)",
  bottomNavBg: "linear-gradient(180deg, #163166 0%, #0f2548 100%)",
  goldenLine:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.3) 30%, rgba(251,191,36,0.85) 50%, rgba(251,191,36,0.3) 70%, transparent 100%)",
  drawerGlow:  "linear-gradient(180deg, transparent 0%, rgba(251,191,36,0.4) 40%, rgba(251,191,36,0.4) 60%, transparent 100%)",
};

export const Icons = {
  Dashboard: () => <LayoutGrid size={20} strokeWidth={1.75} />,
  Plus: () => <PlusCircle size={20} strokeWidth={1.75} />,
  List: () => <List size={20} strokeWidth={1.75} />,
  Menu: () => <MenuIcon size={22} strokeWidth={1.75} />,
  X: () => <X size={22} strokeWidth={1.75} />,
  Bell: () => <Bell size={18} strokeWidth={1.75} />,
  Logout: () => <LogOut size={16} strokeWidth={2} />,
  Check: () => <Check size={14} strokeWidth={2.5} />,
  Trash: () => <Trash2 size={15} strokeWidth={2} />,
  User: () => <User size={20} strokeWidth={1.75} />,
  Shield: () => <Shield size={20} strokeWidth={1.75} />,
};

const avatarDim = {
  sm: "w-8 h-8 text-[12px] rounded-md",
  md: "w-10 h-10 text-[14px] rounded-lg",
  lg: "w-12 h-12 text-[16px] rounded-xl",
};

export function Avatar({ initial, size = "md" }: { initial: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn("flex items-center justify-center font-bold text-white flex-shrink-0", avatarDim[size])}
      style={{
        background: "linear-gradient(135deg, #2354b4 0%, #0f2548 100%)",
        boxShadow: "0 2px 8px rgba(35,84,180,0.35)",
      }}
    >
      {initial}
    </div>
  );
}

export function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return "Ahora";
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}


export const notiCfg: Record<string, { dot: string; iconBg: string; iconBorder: string }> = {
  aprobada:     { dot: "bg-emerald-500", iconBg: "bg-emerald-50",  iconBorder: "ring-emerald-200" },
  pre_aprobada: { dot: "bg-violet-500",  iconBg: "bg-violet-50",   iconBorder: "ring-violet-200"  },
  asignada:     { dot: "bg-cyan-500",    iconBg: "bg-cyan-50",     iconBorder: "ring-cyan-200"    },
  programada:   { dot: "bg-indigo-500",  iconBg: "bg-indigo-50",   iconBorder: "ring-indigo-200"  },
  rechazada:    { dot: "bg-red-500",     iconBg: "bg-red-50",      iconBorder: "ring-red-200"     },
  observada:    { dot: "bg-blue-500",    iconBg: "bg-blue-50",     iconBorder: "ring-blue-200"    },
  en_revision:  { dot: "bg-amber-400",   iconBg: "bg-amber-50",    iconBorder: "ring-amber-200"   },
  finalizada:   { dot: "bg-slate-400",   iconBg: "bg-slate-50",    iconBorder: "ring-slate-200"   },
  cancelada:    { dot: "bg-slate-300",   iconBg: "bg-slate-50",    iconBorder: "ring-slate-100"   },
  recordatorio: { dot: "bg-amber-400",   iconBg: "bg-amber-50",    iconBorder: "ring-amber-200"   },
  info:         { dot: "bg-blue-400",    iconBg: "bg-blue-50",     iconBorder: "ring-blue-200"    },
};
