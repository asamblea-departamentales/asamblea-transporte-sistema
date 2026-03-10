// src/components/ui/TransportWizard.tsx
import { motion } from "framer-motion";

type Step = { id: number; label: string };
type Props = { steps: Step[]; currentStep: number };

export default function TransportWizard({ steps, currentStep }: Props) {
  // Progreso = fracción de pasos completados (paso 1 → 33%, paso 2 → 66%, paso 3 → 100%)
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-8 py-5 shadow-sm">

      {/* Barra de progreso */}
      <div className="relative mb-6 h-1 w-full rounded-full bg-slate-200">
        <motion.div
          className="absolute h-1 rounded-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Pasos — texto DEBAJO del número para no romper en móvil */}
      <div className="flex justify-between">
        {steps.map((step) => {
          const completed = step.id < currentStep;
          const active    = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-1.5">
              {/* Círculo numerado */}
              <div
                className={`
                  flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold
                  ${completed ? "bg-blue-600 text-white"
                    : active   ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500"
                               : "bg-slate-200 text-slate-500"}
                `}
              >
                {completed
                  ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  : step.id
                }
              </div>

              {/* Etiqueta debajo */}
              <span className={`
                text-[11px] font-medium text-center leading-tight
                ${active ? "text-blue-700" : completed ? "text-slate-700" : "text-slate-400"}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}