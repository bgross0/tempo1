import '@testing-library/jest-dom';

// Add TypeScript types for jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveStyle(style: Record<string, any>): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeChecked(): R;
      toBeEmpty(): R;
      toHaveFocus(): R;
      toContainElement(element: HTMLElement | null): R;
    }

    // Make TypeScript work better with mocked functions
    interface MockInstance<T = any, Y extends any[] = any> {
      mockReturnValue: (value: T) => MockInstance<T, Y>;
      mockImplementation: (fn: (...args: Y) => T) => MockInstance<T, Y>;
      mockResolvedValue: <U = T>(value: U | PromiseLike<U>) => MockInstance<Promise<U>, Y>;
      mockRejectedValue: (value: any) => MockInstance<Promise<never>, Y>;
    }
  }
}