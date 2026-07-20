"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Wraps the persistent 3D scene so a render-time failure inside the
// Canvas (which can otherwise fail with no visible output at all) is
// at least logged clearly instead of silently showing nothing.
export default class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[PersistentScene] failed to render:", error, info);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
