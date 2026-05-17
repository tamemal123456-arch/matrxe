import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">حدث خطأ غير متوقع</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            نعتذر عن هذا الخطأ. يمكنك المحاولة مرة أخرى أو الاتصال بالدعم الفني.
          </p>
          {this.state.error && (
            <details className="mb-4 text-sm text-left bg-muted p-3 rounded-lg max-w-md w-full overflow-auto">
              <summary className="cursor-pointer text-muted-foreground">تفاصيل الخطأ</summary>
              <pre className="mt-2 text-xs text-destructive whitespace-pre-wrap">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-3">
            <Button onClick={this.handleReset}>حاول مرة أخرى</Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              العودة للرئيسية
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
