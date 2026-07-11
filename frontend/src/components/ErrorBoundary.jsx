import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught crash:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6 relative overflow-hidden font-sans">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-clinic-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-md w-full text-center space-y-8 p-10 bg-slate-900/60 border border-slate-800/80 rounded-3xl backdrop-blur-md relative z-10 shadow-2xl">
            <div className="flex justify-center">
              <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500">
                <ShieldAlert className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white tracking-tight">Application Error</h1>
              <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">Error 500 - Runtime Crash</p>
              <p className="text-slate-450 text-sm leading-relaxed pt-2">
                Service not available right now. Try some time later.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full px-5 py-3 bg-clinic-500 hover:bg-clinic-600 hover:scale-102 active:scale-98 text-white text-xs font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer shadow-clinic-500/25"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Restart Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
