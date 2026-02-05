type Props = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: Props) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-xl px-4">
        <button
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-slate-200"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <h1 className="text-sm font-bold text-slate-900">Sistema de Transporte</h1>
        
        <div className="w-10" /> {/* Spacer para centrar el título */}
      </div>
    </div>
  );
}