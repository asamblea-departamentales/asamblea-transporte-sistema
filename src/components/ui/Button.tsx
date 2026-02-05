type Props = {
  children: React.ReactNode;
  type?: "button" | "submit";
  disabled?: boolean;
  loading?: boolean;
};

export default function Button({ children, type = "button", disabled, loading }: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-extrabold tracking-widest text-white
                 shadow-lg shadow-primary/25 transition
                 hover:brightness-110 active:scale-[0.99]
                 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "PROCESANDO..." : children}
    </button>
  );
}
