export const FullPageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-slate-300 border-t-[#182645] rounded-full animate-spin" />
      <p className="text-xs font-medium text-slate-400 tracking-wide">Cargando...</p>
    </div>
  </div>
);
