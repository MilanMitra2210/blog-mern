import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 bg-white border border-red-100 rounded-3xl shadow-sm text-center max-w-lg mx-auto my-12">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-200">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="h3 mb-2">Something went wrong</h3>
          <p className="small-paragraph mb-6 text-dark-blue/60">
            An unexpected error occurred in this view.
          </p>
          {this.state.error && (
            <pre className="text-[11px] font-mono text-left bg-red-50 text-red-600 p-4 rounded-xl mb-6 max-h-40 overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
          <PrimaryButton onClick={this.handleReset} className="mx-auto">
            <RefreshCw className="w-4 h-4" />
            <span>Reload View</span>
          </PrimaryButton>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
