import { useState } from "react";

type Props = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  name?: string;
};

// Ícono de correo
function MailIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// Ícono de candado
function LockIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Ícono de Ojo Abierto
function EyeIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// Ícono de Ojo Cerrado
function EyeOffIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function TextField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  name,
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const icon = isPassword ? <LockIcon /> : autoComplete === "email" ? <MailIcon /> : null;
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 flex items-center">
            {icon}
          </span>
        )}
        <input
          name={name}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-xl border border-slate-200 bg-white py-3 text-slate-700 outline-none transition
                     focus:border-primary/60 focus:ring-4 focus:ring-primary/10
                     ${icon ? "pl-10" : "pl-4"} ${isPassword ? "pr-10" : "pr-4"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 flex items-center p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </label>
  );
}