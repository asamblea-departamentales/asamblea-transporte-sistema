import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({ children, loading, className = "", ...props }: Props) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`
        w-full rounded-xl bg-primary px-5 py-3 text-sm font-extrabold tracking-widest text-white
        shadow-lg shadow-primary/25 transition
        hover:brightness-110 active:scale-[0.99]
        disabled:cursor-not-allowed disabled:opacity-60
        ${className}
      `}
    >
      {loading ? "PROCESANDO..." : children}
    </button>
  );
}
