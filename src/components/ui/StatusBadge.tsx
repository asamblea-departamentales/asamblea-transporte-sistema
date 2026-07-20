import { Check } from "lucide-react";
import { getStatusStyle, isCompleted } from "../../lib/format";

export function StatusBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getStatusStyle(estado)}`}>
      {isCompleted(estado) && <Check className="h-3 w-3" strokeWidth={3} />}
      {estado.replace("_", " ")}
    </span>
  );
}
