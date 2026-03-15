# Testing Patterns

**Analysis Date:** 2025-03-15

## Test Framework

**Status:** No testing framework currently configured

- **Jest:** Not installed
- **Vitest:** Not installed
- **React Native Testing Library:** Not installed

**Run Commands:**
```bash
npm run lint              # ESLint static analysis only
npm run format            # Prettier formatting (not a test runner)
```

## Test Organization

**Location:** No test files found in codebase (no `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`)

**Current State:**
- Testing infrastructure is not set up
- All verification is manual via EAS builds on physical Android devices
- No automated test suite exists

## Manual Testing Approach

**Current Workflow:**
1. Code changes committed to `claude/hungry-elion` branch
2. EAS build triggered: `eas build --platform android --profile preview --non-interactive`
3. APK installed on physical Android device
4. User manually tests and provides feedback
5. Fixes applied based on feedback

**Why No Web Preview:**
- `expo-secure-store` is native-only and throws before any UI renders
- Web preview always shows blank screen — provides no value
- **Never run `expo start --web` or `preview_start`**

## Type Safety as Testing Layer

**TypeScript Strict Mode:**
- `tsconfig.json` configured with `strict: true`
- Catches many errors at compile time
- ESLint enforces:
  - `@typescript-eslint/no-explicit-any`: warn (types must be explicit)
  - `@typescript-eslint/no-unused-vars`: warn

**Static Analysis:**
```bash
npm run lint              # Check TypeScript and ESLint violations
```

## Error Handling Verification

**Patterns to test manually:**
- Silent failures (async errors caught and logged, defaults returned)
- Optimistic updates with rollback on failure
- Cleanup on component unmount (cancelled requests)

**Examples from codebase:**
- `home.tsx`: Location fetch with cancellation token prevents state updates after unmount
- `auth.ts`: OAuth flow validates OAuth URL and token before using
- `progress.ts`: Silent failures in Supabase calls (errors caught, state not corrupted)

## Component Testing

**No Unit Tests:**
- All component testing is manual via EAS build and device testing
- Complex calculations (e.g., sobriety arc, date math) are validated by eye on device

**Example Components:**
- `SobrietyCounter.tsx`: SVG arc rendering tested by visual inspection on device
- `Button.tsx`: Haptic feedback and state variants tested manually
- `CheckInModal.tsx`: Form submission and callback behavior tested on device

## Integration Testing

**No Integration Tests:**
- All integration flow testing is done manually on device
- Examples:
  - Authentication flow (sign up → verify email → sign in)
  - Check-in flow (home screen → modal → database update → UI reflects)
  - Nearby meetings fetch (location permission → API call → render)

## Testing Recommendations (Future)

**If testing is added, consider:**

1. **Unit Tests (Jest/Vitest):**
   - Service functions: `auth.ts`, `meetings.ts` (especially data transformation)
   - Store reducers: `useProgressStore`, `useAuthStore`
   - Utility functions: date math, time formatting

2. **Types of Unit Tests to Add:**
   ```typescript
   // Example: meetings.ts
   describe('formatTime', () => {
     it('formats 24h time to 12h AM/PM', () => {
       expect(formatTime('14:30')).toBe('2:30 PM');
     });
   });

   // Example: progress.ts
   describe('weekStartISO', () => {
     it('returns Monday of current week in ISO format', () => {
       // mock Date to ensure consistent testing
     });
   });
   ```

3. **React Native Testing Library:**
   - Component rendering tests
   - Button press and callback tests
   - Modal visibility tests

4. **Snapshot Tests:**
   - Component snapshots for regression detection
   - Color/font constant snapshots

5. **Coverage Goals:**
   - Services: 80%+
   - Stores: 70%+
   - Components: 50%+ (UI-heavy components may not need high coverage)

## Known Testing Gaps

**Untested Areas:**
- `components/ErrorBoundary.tsx`: Error state rendering never manually tested with real error
- `SobrietyCounter.tsx`: SVG math and arc rendering — visual only
- `streamChat.ts`: Stream Chat integration (stubbed, no implementation)
- `streamFeed.ts`: Stream Feed integration (stubbed, no implementation)
- All authentication flows: sign up, password reset, Google OAuth (tested manually on device, no automation)

**Risk:** UI regressions may not be caught until manual testing on device

## Testing Tools Not Used

- **Sentry/Error Tracking:** Removed in v1.0.44 due to startup crashes
- **React Query DevTools:** Not installed
- **Redux DevTools:** Not applicable (using Zustand)
- **Detox (E2E):** Not installed

## Build Verification

**EAS Build Process:**
- Android-only (`--platform android`)
- Preview profile: `preview` (internal distribution)
- Non-interactive mode: `--non-interactive`
- Output: APK for device testing

**Build Environment Variables:**
- All `EXPO_PUBLIC_*` variables embedded in `eas.json` profile env
- No `.env` file used during build (gitignored)

## Best Practices for Manual Testing

**When testing a change:**
1. Verify TypeScript compiles: `npm run lint` passes
2. Build locally if possible to catch build errors early
3. Test the specific feature end-to-end on device
4. Test adjacent features that may be affected
5. Check error states manually (e.g., deny location permission, bad network)

**Checklist for UI Changes:**
- [ ] Component renders without crash
- [ ] Text is readable and properly positioned (per Figma)
- [ ] Colors match constants (`Colors.*` and `Fonts.*`)
- [ ] Buttons respond to presses with haptic feedback
- [ ] Navigation works correctly

**Checklist for Async Operations:**
- [ ] Loading state shows while fetching
- [ ] Success state shows data correctly
- [ ] Error state handled gracefully (silent fail or error message)
- [ ] Unmounting during fetch doesn't crash (cancelled flag prevents setState)

---

*Testing analysis: 2025-03-15*
