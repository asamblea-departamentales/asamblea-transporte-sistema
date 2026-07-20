// src/pages/transport/FormPrimitives.tsx

export function SectionTitle({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(15,37,72,0.07)", color: "#0f2548" }}
      >
        {icon}
      </div>
      <span className="text-[14px] font-bold text-slate-800">{label}</span>
    </div>
  );
}

export function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
      {children}
      {required && (
        <span className="normal-case font-black tracking-normal text-red-500">
          *
        </span>
      )}
    </label>
  );
}
