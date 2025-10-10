/// <reference types="vite/client" />
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

// Extend Jest matchers for TypeScript
declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T> {}
  }
}
