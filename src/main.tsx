import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import SimpleApp from './SimpleApp.tsx'
import "./main.css"
import "./index.css"

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong:</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise:', event.promise);
});

const container = document.getElementById('root');
if (container) {
  console.log('Container found, attempting to render...');
  
  // Try SimpleApp first to test basic React functionality
  const AppToRender = window.location.search.includes('simple') ? SimpleApp : App;
  
  createRoot(container).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppToRender />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('Root container not found!');
}
