# Coding Conventions

**Analysis Date:** 2025-03-15

## Naming Patterns

**Files:**
- Screen/page components: camelCase, e.g., `home.tsx`, `edit-profile.tsx` (kebab-case for multi-word)
- Components: PascalCase, e.g., `Button.tsx`, `SobrietyCounter.tsx`, `ErrorBoundary.tsx`
- Services: camelCase, e.g., `auth.ts`, `meetings.ts`, `streamChat.ts`
- Store/Zustand files: camelCase, e.g., `auth.ts`, `progress.ts`
- Constants: lowercase with separators, e.g., `colors.ts`, `fonts.ts`

**Functions:**
- Exported functions: camelCase, e.g., `fetchNearbyMeetings()`, `markTodayCheckedIn()`
- Helper functions: camelCase, e.g., `formatTime()`, `arcPath()`, `polarToCartesian()`
- React component functions: PascalCase, e.g., `export default function HomeScreen() {}`
- Event handlers: `handle` prefix in camelCase, e.g., `handleCheckIn()`, `handleCheckInConfirm()`, `handlePress()`

**Variables:**
- State variables: camelCase, e.g., `checkInVisible`, `meetingsLoading`, `daysSober`
- Constants (module-level): UPPER_CASE, e.g., `STORAGE_KEY`, `BASE`, `DAY_NAMES`
- Type/interface names: PascalCase, e.g., `UserProfile`, `Meeting`, `Props`
- Private/scoped constants: camelCase, e.g., `QUICK_ACTIONS`

**Types:**
- Type definitions: PascalCase, e.g., `UserProfile`, `ProgressState`, `Meeting`
- Props types: `Props`, e.g., `type Props = { title: string; onPress: () => void; }`
- Union types: PascalCase, e.g., `type Variant = 'primary' | 'outline' | 'ghost' | 'danger';`

## Code Style

**Formatting:**
- Prettier enforced via `prettier --write "**/*.{ts,tsx,js,json}"`
- Configured in `.prettierrc`:
  - Print width: 100
  - Tab width: 2 spaces
  - Semicolons: true
  - Single quotes: true
  - Trailing commas: es5

**Linting:**
- ESLint with flat config (`eslint.config.js`)
- TypeScript parser (`@typescript-eslint/parser`)
- Key rules:
  - `@typescript-eslint/no-explicit-any`: warn
  - `@typescript-eslint/no-unused-vars`: warn (ignores variables starting with `_`)
  - `react-hooks/rules-of-hooks`: error
  - `react-hooks/exhaustive-deps`: warn
  - `no-console`: warn (allows `console.warn` and `console.error`)

**Strict TypeScript:**
- `tsconfig.json` extends `expo/tsconfig.base` with `strict: true`
- Path aliases configured:
  - `@/*` → `./`
  - `@components/*` → `./components/*`
  - `@constants/*` → `./constants/*`
  - `@store/*` → `./store/*`
  - `@services/*` → `./services/*`
  - `@hooks/*` → `./hooks/*`

## Import Organization

**Order:**
1. React and React Native imports: `import { ... } from 'react';`, `import { ... } from 'react-native';`
2. Expo and navigation: `import { ... } from 'expo-*';`, `import { ... } from 'expo-router';`
3. Third-party libraries: `import * as ... from 'package-name';`
4. Local services: `import { ... } from '../services/*';`
5. Local stores: `import { ... } from '../store/*';`
6. Local components: `import { ... } from '../components/*';`
7. Local constants: `import { ... } from '../constants/*';`
8. Type imports: `import type { ... } from '...'` (no duplicate imports)

**Path Aliases:**
- Used across codebase for clarity, e.g., `import { Colors } from '@constants/colors'`
- Avoid relative paths when possible; use aliases instead

## Error Handling

**Patterns:**
- Silent failures where appropriate (no UI error needed):
  ```typescript
  try {
    // operation
  } catch {
    return []; // or default value
  }
  ```
- Explicit error throws for critical operations:
  ```typescript
  if (error) throw error;
  ```
- Optimistic updates with rollback on failure:
  ```typescript
  set({ user: { ...user, ...updates } }); // optimistic
  try {
    await update(id, updates);
  } catch {
    set({ user }); // revert on failure
  }
  ```
- Service methods return null on non-critical failures (e.g., `getProfile()` returns `null` on error)
- Async operations that may fail are wrapped in try-catch; errors may be silently suppressed if they don't affect UX

## Logging

**Framework:** `console` native API

**Patterns:**
- ESLint allows only `console.warn` and `console.error`
- Use `console.error()` for actual errors or diagnostic warnings
- Avoid `console.log()` in production code
- Remove debug logs before committing

## Comments

**When to Comment:**
- Explain "why", not "what" — code should be self-documenting
- Complex algorithms or non-obvious logic
- Important edge cases and workarounds
- Figma references or design decisions
- Example: `// Arc spans 210° (from -105° to +105° — slightly more than a semicircle)`

**Comment Style:**
- Single-line comments for inline explanations: `// comment`
- Section separators for logical groupings:
  ```typescript
  // ── Quick-action buttons (row of 5, Figma: 55×60 each) ──────────────────────
  ```
- Avoid over-commenting; prioritize clear naming and structure

**TSDoc:**
- Type definitions are documented inline: `type Props = { title: string; onPress: () => void; };`
- Service functions include brief descriptive comments explaining parameters and return
- No @param/@returns style annotations unless complex

## Function Design

**Size:**
- Keep functions < 50 lines (screen components may be longer)
- Break complex logic into smaller named helpers

**Parameters:**
- Prefer object destructuring for component props
- Named parameters for clarity:
  ```typescript
  function formatTime(time: string): string { ... }
  export async function fetchNearbyMeetings(latitude: number, longitude: number, distanceMiles = 15): Promise<Meeting[]> { ... }
  ```
- Default parameters used when appropriate (e.g., `size = 'md'`, `distanceMiles = 15`)

**Return Values:**
- Explicit return types on all exported functions
- Async functions return `Promise<T>`
- Components typically return JSX (`React.ReactElement` or implicit)
- Service methods return data or null on failure
- Helper functions return primitives or typed objects

**Async/Await:**
- Use async/await consistently (no mixing with .then())
- Handle promises in try-catch blocks
- Use `let cancelled = false` pattern to prevent state updates after unmount:
  ```typescript
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetch(...);
        if (cancelled) return;
        setState(data);
      } catch { ... }
    }
    load();
    return () => { cancelled = true; };
  }, []);
  ```

## Module Design

**Exports:**
- Named exports for services, utilities, and types
- Default exports for screen components only
- Services export a singleton object (e.g., `export const authService = { ... }`)
- Zustand stores export the hook directly: `export const useAuthStore = create(...)`

**Barrel Files:**
- Not used; import directly from source files
- Example: `import { Button } from '../../components/ui/Button'` (not from a barrel export)

**File Structure:**
- One component per file (or closely related variants)
- Services organized by domain (auth, meetings, streamChat)
- Stores co-located with state type definitions
- Constants centralized: `constants/colors.ts`, `constants/fonts.ts`

## React/React Native Patterns

**Hooks:**
- `useState` for local component state
- `useMemo` for expensive computations
- `useCallback` for stable function references (passed as props or dependencies)
- `useEffect` for side effects and cleanup
- Zustand hooks for global state: `const user = useAuthStore((s) => s.user);`

**Component Structure:**
- Functional components only (no class components except ErrorBoundary)
- Props destructured inline
- TypeScript-first: all props typed
- Internal styles with `StyleSheet.create()`
- No inline style objects except for dynamic calculations

**Component Example:**
```typescript
type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
};

export function Button({ title, onPress, variant = 'primary' }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.base, styles[`variant_${variant}`]]}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({ ... });
```

## Font Usage (Critical Rule)

**NEVER use `fontWeight` — always use named `fontFamily` from `Fonts.*`**

- **Poppins** (headings, buttons, card titles): `Fonts.poppinsBold`, `Fonts.poppinsSemiBold`, `Fonts.poppinsMedium`, `Fonts.poppins`
- **Jost** (body, captions, sublabels, inputs): `Fonts.jost`, `Fonts.jostMedium`

Example:
```typescript
style={{ fontFamily: Fonts.poppinsBold, fontSize: 18 }}
// NOT: fontWeight: 'bold'
```

## Color Usage

- All colors defined in `constants/colors.ts` — never use inline color strings
- Reference: `Colors.primary` (#b740ff), `Colors.text`, `Colors.background`, etc.
- Semantic colors for UI states: `Colors.error`, `Colors.success`, `Colors.warning`

## Styling

- Use `StyleSheet.create()` for all styles (not inline objects except calculations)
- Separate style objects at module bottom
- Inline styles only for dynamic/calculated values
- Example:
  ```typescript
  <View style={[styles.base, styles[`size_${size}`], (disabled || loading) && styles.disabled, style]}>
  ```

---

*Convention analysis: 2025-03-15*
