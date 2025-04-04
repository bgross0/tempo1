# Testing Setup Guide

This project uses Jest with SWC for testing React components written in TypeScript.

## Running Tests

### Windows

```bash
npm run test:win
```

Or directly:

```bash
tests\run-tests.bat
```

### Unix/Mac/Linux

```bash
npm run test:unix
```

Or directly:

```bash
./tests/run-tests.sh
```

### Standard NPM Scripts

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:unit        # Run only unit tests
npm run test:integration # Run only integration tests
npm run test:coverage    # Generate coverage report
```

## Test Structure

- Unit tests: `src/**/__tests__/*.test.tsx`
- Integration tests: `src/**/__tests__/*.integration.test.tsx`

## Configuration

- Jest config: `tests/config/jest.config.js`
- Jest setup: `tests/config/jest.setup.js`
- TypeScript definitions: `tests/types/*.d.ts`

## Mocking Patterns

### Mocking Hooks

```typescript
import { useMyHook } from '@/hooks/useMyHook';

// Mock the hook
jest.mock('@/hooks/useMyHook');

// Get the mocked function with proper TypeScript typing
const mockedUseMyHook = jest.mocked(useMyHook);

// Set up the mock implementation
mockedUseMyHook.mockReturnValue({
  data: mockData,
  loading: false,
  error: null
});
```

### Mocking Zustand Store

```typescript
// Mock store values
const mockStore = {
  someValue: 'test',
  someFunction: jest.fn()
};

// Mock the store
jest.mock('@/lib/store', () => ({
  useAppStore: jest.fn().mockImplementation((selector) => {
    // If selector is a function (standard Zustand pattern)
    if (typeof selector === 'function') {
      return selector(mockStore);
    }
    // For direct state access
    return mockStore[selector] || jest.fn();
  })
}));
```

### Mocking External APIs

See the `jest.setup.js` file for examples of mocking:
- Next.js Router
- Supabase Client
- localStorage
- window.matchMedia