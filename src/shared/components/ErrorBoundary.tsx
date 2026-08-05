import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error no capturado:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertTriangle size={48} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Algo salió mal
            </h1>
            
            <p className="text-slate-600 mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 text-left bg-red-50 p-3 rounded text-sm text-red-800 overflow-auto max-h-32">
                <p className="font-semibold">{this.state.error.message}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={18} />
                <span>Recargar</span>
              </button>
              
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
              >
                <Home size={18} />
                <span>Volver al inicio</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
