// src/components/ui/TransportWizard.tsx
import { motion } from "framer-motion";

type Step = { id: number; label: string };
type Props = { steps: Step[]; currentStep: number };

export default function TransportWizard({ steps, currentStep }: Props) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      {/* Barra de progreso */}
      <div className="relative mb-8 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="absolute h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #0f2548, #2563eb)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Pasos */}
      <div className="flex justify-between px-2">
        {steps.map((step) => {
          const completed = step.id < currentStep;
          const active    = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2.5">
              {/* Círculo numerado */}
              <motion.div
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  backgroundColor: completed ? "#0f2548" : active ? "#eff6ff" : "#f1f5f9",
                }}
                className={`
                  flex h-10 w-10 items-center justify-center rounded-full text-sm font-black shadow-sm transition-all
                  ${completed ? "text-white" : active ? "text-[#0f2548] ring-2 ring-[#0f2548]/20" : "text-slate-400"}
                `}
                style={completed ? { background: "linear-gradient(135deg, #0f2548, #1e3a8a)" } : {}}
              >
                {completed ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4 }}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </motion.div>

              {/* Etiqueta */}
              <span className={`
                text-[10px] font-black uppercase tracking-widest text-center transition-colors
                ${active ? "text-[#0f2548]" : completed ? "text-slate-600" : "text-slate-400"}
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