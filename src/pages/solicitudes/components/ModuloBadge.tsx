import { CarFront, Wrench, Fuel } from "lucide-react";
import type { Modulo } from "../../../hooks/useCombinedRequests";
import { MODULO_CONFIG } from "../../../constants/modulo.config";

export function ModuloBadge({ modulo }: { modulo: Modulo }) {
  const cfg = MODULO_CONFIG[modulo];
  const Icon = modulo === "transporte" ? CarFront : modulo === "mantenimiento" ? Wrench : Fuel;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${cfg.badgeClass}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}
