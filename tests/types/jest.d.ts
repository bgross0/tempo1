import 'jest';

// Extend Jest's mocking types for TypeScript
declare global {
  namespace jest {
    interface MockInstance<T = any, Y extends any[] = any> {
      mockReturnValue: (value: T) => MockInstance<T, Y>;
      mockImplementation: (fn: (...args: Y) => T) => MockInstance<T, Y>;
      mockResolvedValue: (value: Awaited<T>) => MockInstance<Promise<Awaited<T>>, Y>;
      mockRejectedValue: (value: any) => MockInstance<Promise<never>, Y>;
    }
  }
}