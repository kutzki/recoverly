/**
 * services/sentry.ts — STUB
 *
 * @sentry/react-native has been removed from the build.
 * All exports are no-ops so callers (ErrorBoundary, etc.) compile without changes.
 */

export const Sentry = {
  captureException: (_err: unknown, _ctx?: unknown) => {},
  captureMessage: (_msg: string, _ctx?: unknown) => {},
  wrap: <T>(component: T): T => component,
};

export function initSentry(): void {}
