import React from 'react';
import { render } from '@testing-library/react';

// Mock the next/navigation functions
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/current-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Wrap components with necessary providers for testing
function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, {
    ...options,
  });
}

export * from '@testing-library/react';
export { customRender as render };
