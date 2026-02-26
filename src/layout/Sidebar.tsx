// components/navigation/Navbar.tsx

import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="
      sticky top-0 z-50
      h-[72px]
      bg-[#0f172a]
      border-b border-white/5
    ">
      <div className="max-w-[1400px] mx-auto h-full px-8 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-10">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-white text-[#0f172a] flex items-center justify-center font-semibold">
              A
            </div>
            <span className="text-white font-medium text-[15px] tracking-tight">
              Sistema Transporte
            </span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <Link to="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link to="/solicitudes" className="hover:text-white transition-colors">
              Solicitudes
            </Link>
            <Link to="/reportes" className="hover:text-white transition-colors">
              Reportes
            </Link>
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">

          {/* Search */}
          <div className="
            hidden md:flex items-center gap-2
            bg-white/5
            border border-white/10
            rounded-xl
            px-3 py-2
            text-slate-300
          ">
            <Search size={16} />
            <input
              placeholder="Buscar"
              className="
                bg-transparent
                outline-none
                text-sm
                placeholder:text-slate-500
              "
            />
          </div>

          {/* CTA */}
          <button className="
            bg-white
            text-[#0f172a]
            text-sm font-medium
            px-5 py-2.5
            rounded-xl
            hover:bg-slate-200
            transition-colors
          ">
            Nueva solicitud
          </button>

        </div>
      </div>
    </header>
  );
}