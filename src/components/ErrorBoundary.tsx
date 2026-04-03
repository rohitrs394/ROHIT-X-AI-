import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore Error: ${parsed.error} during ${parsed.operationType} at ${parsed.path || "unknown path"}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF0] dark:bg-[#0D0221] p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1A0B2E] rounded-3xl p-8 shadow-2xl border border-pink-500/20 text-center">
            <div className="w-16 h-16 bg-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-pink-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Kuch galat ho gaya
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 break-words">
              {isFirestoreError ? (
                <span className="font-mono text-sm opacity-80">{errorMessage}</span>
              ) : (
                errorMessage
              )}
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#FF0080] to-[#7928CA] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform active:scale-[0.98] shadow-lg shadow-pink-500/25"
            >
              <RefreshCw className="w-5 h-5" />
              App Restart Karein
            </button>
            
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
              Agar ye issue baar-baar aa raha hai, toh please internet connection check karein.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
