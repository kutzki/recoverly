/**
 * services/sentry.ts
 *
 * Centralised Sentry initialisation.
 *
 * To enable:
 *  1. Create a project at https://sentry.io (platform: React Native)
 *  2. Copy the DSN and add it to eas.json:
 *       "env": { "EXPO_PUBLIC_SENTRY_DSN": "https://xxx@sentry.io/yyy" }
 *     Do this for each profile (preview, production) or in a shared block.
 *  3. For symbolicated stack traces in production, also set SENTRY_AUTH_TOKEN
 *     in your EAS secret env vars.
 *
 * Without a DSN the SDK is a no-op — no crash, no overhead.
 */

import * as Sentry from '@sentry/react-native';

export { Sentry };

export function initSentry(): void {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn || !dsn.startsWith('https://')) {
    // DSN not configured or still a placeholder — Sentry disabled in this build.
    if (__DEV__) {
      console.info('[Sentry] DSN not set — disabled. Set EXPO_PUBLIC_SENTRY_DSN to enable.');
    }
    return;
  }

  const env = (process.env.APP_ENV as string | undefined) ?? 'development';
  const isProd = env === 'production';

  Sentry.init({
    dsn,
    environment: env,

    // ── Crash reporting ────────────────────────────────────────────────────
    // enableNative: true captures Java/NDK crashes and Android ANRs,
    // not just JS exceptions.
    enableNative: true,

    // ── Performance ────────────────────────────────────────────────────────
    // Sample 100% of transactions in non-prod, 20% in prod.
    tracesSampleRate: isProd ? 0.2 : 1.0,

    // ── Sessions ───────────────────────────────────────────────────────────
    // Powers crash-free-users / crash-free-sessions metrics.
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10_000,

    // ── Breadcrumbs ────────────────────────────────────────────────────────
    // Records the last N events (taps, network calls, console logs) before
    // a crash — invaluable for reproducing issues.
    maxBreadcrumbs: 100,
    attachStacktrace: true,

    // ── Noise reduction ────────────────────────────────────────────────────
    // Ignore benign network errors that pollute the issue list.
    ignoreErrors: [
      'Network request failed',
      'TypeError: Network request failed',
    ],

    // ── Debug ──────────────────────────────────────────────────────────────
    debug: __DEV__,
  });
}
