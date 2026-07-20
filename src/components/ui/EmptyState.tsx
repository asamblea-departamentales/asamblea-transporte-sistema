import { Inbox } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/50">
        <Inbox className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-bold text-slate-700">No hay solicitudes</p>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{message}</p>
      </div>
    </div>
  );
}
