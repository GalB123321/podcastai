'use client';

import { RequireAuth } from './RequireAuth';

export function withProtectedRoute<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo?: string
) {
  return function ProtectedRoute(props: P) {
    return (
      <RequireAuth redirectTo={redirectTo}>
        <WrappedComponent {...props} />
      </RequireAuth>
    );
  };
} 