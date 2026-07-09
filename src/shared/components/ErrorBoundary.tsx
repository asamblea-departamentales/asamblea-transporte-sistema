import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
          <div className="w-24 h-24 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Algo salió mal
          </h1>
          <p className="text-slate-500 max-w-md text-sm md:text-base leading-relaxed mb-8">
            Hemos encontrado un error inesperado al procesar esta pantalla. No te preocupes, tus datos están a salvo.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f2548] text-white rounded-xl font-bold uppercase tracking-wider text-sm shadow-md hover:bg-[#1a3a75] active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar Aplicación
          </button>
          
          {import.meta.env.DEV && (
             <div className="mt-8 p-4 bg-red-50 border border-red-200 text-left text-xs text-red-800 rounded-lg max-w-2xl w-full overflow-auto">
               <span className="font-bold block mb-1">Detalle del Error (Modo Dev):</span>
               {this.state.errorMsg}
             </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
