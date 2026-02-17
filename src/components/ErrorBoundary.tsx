import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console and optionally to an external logging service
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive/5 rounded-lg border border-destructive">
          <h3 className="text-sm font-semibold text-destructive">Something went wrong</h3>
          <p className="text-xs text-muted-foreground mt-1">An error occurred while rendering this component. Check the console for details.</p>
          <pre className="text-xs mt-2 text-muted-foreground">{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
