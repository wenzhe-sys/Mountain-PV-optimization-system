import React, { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isRetrying: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRetrying: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = async () => {
    this.setState({ isRetrying: true });
    
    try {
      // 强制刷新缓存并重新加载
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (fallback) {
        return fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-slate-900 text-white">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">组件加载失败</h2>
            <p className="text-gray-400 mb-2">
              缓存已过期或损坏，请刷新页面重试
            </p>
            <p className="text-gray-500 text-sm mb-6">
              提示：可以尝试 Ctrl+Shift+R 强制刷新
            </p>
            <button
              onClick={this.handleRetry}
              disabled={this.state.isRetrying}
              className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {this.state.isRetrying ? '刷新中...' : '刷新页面'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;