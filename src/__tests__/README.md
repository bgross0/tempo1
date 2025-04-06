# Testing with Vitest

This directory contains examples of how to use Vitest with our project.

## Test Structure

- Place tests in `__tests__` directories adjacent to the components they test
- Suffix test files with `.test.tsx` for unit tests and `.integration.test.tsx` for integration tests

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## Example Tests

The `example` directory contains sample tests that demonstrate:

- Basic unit testing with Vitest
- React component testing with Testing Library
- Mocking techniques
- Test organization patterns

Feel free to use these as templates for your own tests.

## Best Practices

1. Test behavior, not implementation details
2. Keep tests simple and focused on a single behavior
3. Use descriptive test names that explain what is being tested
4. Mock dependencies to ensure isolated tests
5. Use realistic test data that resembles production data

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)