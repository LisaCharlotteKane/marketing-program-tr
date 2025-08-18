import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import SimpleApp from './SimpleApp.tsx'
import "./main.css"
import "./index.css"
import { initializeHTTP431Prevention } from './utils/http431-prevention'

// Initialize HTTP 431 prevention system as early as possible
let cleanupHTTP431Prevention: (() => void) | null = null;

try {
  cleanupHTTP431Prevention = initializeHTTP431Prevention();
} catch (error) {
  console.warn('Failed to initialize HTTP 431 prevention:', error);
}

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
    
    // If the error might be related to HTTP 431, try emergency cleanup
    if (error.message.includes('431') || error.message.includes('header') || error.message.includes('cookie')) {
      console.log('Attempting emergency cleanup for potential HTTP 431 issue...');
      import('./utils/http431-prevention').then(({ emergencyCleanup }) => {
        emergencyCleanup();
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong:</h2>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px', marginTop: '10px' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handlers with HTTP 431 detection
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  console.error('Error details:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
  
  // Check for HTTP 431 related errors
  if (event.message.includes('431') || event.message.includes('Request Header Fields Too Large')) {
    console.warn('HTTP 431 error detected, running emergency cleanup...');
    import('./utils/http431-prevention').then(({ emergencyCleanup }) => {
      emergencyCleanup();
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  console.error('Promise:', event.promise);
  
  // Check if the rejection is related to HTTP 431
  const reason = String(event.reason);
  if (reason.includes('431') || reason.includes('header') || reason.includes('cookie')) {
    console.warn('HTTP 431 related promise rejection, running emergency cleanup...');
    import('./utils/http431-prevention').then(({ emergencyCleanup }) => {
      emergencyCleanup();
    });
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (cleanupHTTP431Prevention) {
    cleanupHTTP431Prevention();
  }
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
