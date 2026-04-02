import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("=== APP CRASH ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    console.error("Component Stack:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "40px",
          background: "#1a1a2e",
          minHeight: "100vh",
          color: "white",
          fontFamily: "monospace"
        }}>
          <h1 style={{ color: "#f87171", fontSize: "24px" }}>⚠️ App Crashed</h1>
          <p style={{ color: "#94a3b8", marginBottom: "16px" }}>
            Please copy the error below and share it:
          </p>
          <pre style={{
            background: "#0f172a",
            padding: "20px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#fca5a5",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all"
          }}>
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
