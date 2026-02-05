type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  name?: string;
};

export default function TextField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  name,
}: Props) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-sm bg-primary/70" />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>

      <input
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition
                   focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
      />
    </label>
  );
}
