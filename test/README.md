# Test Suite Documentation

This directory contains comprehensive test coverage for the frontend application using Vitest and React Testing Library.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our test suite provides comprehensive coverage across multiple layers:

- **Component Tests**: UI component rendering and interaction
- **API Tests**: Backend API integration
- **Utils Tests**: Utility functions and helpers
- **Context Tests**: React context providers
- **Data Tests**: Static data structures and transformations

### Current Statistics

- **Test Files**: 28
- **Total Tests**: 184
- **Pass Rate**: 100%
- **Overall Coverage**: ~12%

## 📁 Test Structure

```
test/
├── components/           # Component tests
│   ├── Chatbot.test.tsx
│   ├── Button.test.tsx
│   ├── Footer.test.tsx
│   ├── Layout.test.tsx
│   ├── Navbar.test.tsx
│   ├── StepMedia.test.tsx
│   ├── AnalyticsDashboard.test.tsx
│   ├── HeroSection.test.tsx
│   ├── ServicesGrid.test.tsx
│   ├── CategoriesSection.test.tsx
│   ├── Loader.test.tsx
│   ├── LoaderContext.test.tsx
│   ├── LocationFilter.test.tsx
│   ├── WebSocketStatus.test.tsx
│   ├── profiles/
│   │   └── UserProfile.test.tsx
│   └── services/
│       └── Breadcrumb.test.tsx
├── Pages/                # Page component tests
│   ├── HomepageEnhanced.test.tsx
│   └── SignIn.test.tsx
├── api/                  # API integration tests
│   └── confirmationApi.test.ts
├── contexts/             # Context provider tests
│   └── AuthContext.test.tsx
├── data/                 # Data structure tests
│   └── servicesData.test.ts
├── utils/                # Utility function tests
│   ├── categoryMapper.test.ts
│   ├── imageUpload.test.ts
│   ├── messageDB.test.ts
│   ├── messageOrdering.test.ts
│   └── messagingDebug.test.ts
├── App.test.tsx
├── main.test.tsx
└── README.md            # This file
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run specific test file
pnpm test test/components/Button.test.tsx

# Run tests matching pattern
pnpm test Button
```

### Advanced Options

```bash
# Run tests with UI
pnpm test --ui

# Run tests in a specific directory
pnpm test test/utils/

# Run tests with verbose output
pnpm test --reporter=verbose

# Update snapshots
pnpm test -u
```

## ✍️ Writing Tests

### Component Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyComponent from '../../src/components/MyComponent';

describe('MyComponent', () => {
  const renderComponent = (props = {}) => {
    return render(
      <BrowserRouter>
        <MyComponent {...props} />
      </BrowserRouter>
    );
  };

  it('should render correctly', () => {
    renderComponent();
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    const mockHandler = vi.fn();
    renderComponent({ onClick: mockHandler });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### API Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { myApi } from '../../src/api/myApi';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockAxios = vi.mocked(axios);

describe('myApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    mockAxios.get.mockResolvedValue({ data: mockData });

    const result = await myApi.getData();

    expect(result).toEqual(mockData);
    expect(mockAxios.get).toHaveBeenCalledWith('/api/data');
  });

  it('should handle errors', async () => {
    mockAxios.get.mockRejectedValue(new Error('Network error'));

    await expect(myApi.getData()).rejects.toThrow('Network error');
  });
});
```

### Utility Function Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { myUtilFunction } from '../../src/utils/myUtils';

describe('myUtilFunction', () => {
  it('should process input correctly', () => {
    const input = 'test';
    const result = myUtilFunction(input);
    
    expect(result).toBe('expected output');
  });

  it('should handle edge cases', () => {
    expect(myUtilFunction('')).toBe('');
    expect(myUtilFunction(null)).toBe(null);
  });
});
```

## 📊 Test Coverage

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Current Coverage Highlights

| Component/Module | Coverage | Status |
|-----------------|----------|--------|
| Button.tsx | 100% | ✅ |
| Footer.tsx | 100% | ✅ |
| Layout.tsx | 100% | ✅ |
| Loader.tsx | 100% | ✅ |
| categoryMapper.ts | 100% | ✅ |
| servicesData.ts | 100% | ✅ |
| confirmationApi.ts | 100% | ✅ |
| messageOrdering.ts | 100% | ✅ |
| imageUpload.ts | 100% | ✅ |
| Breadcrumb.tsx | 100% | ✅ |
| StepMedia.tsx | 97.36% | ✅ |
| messageDB.ts | 87.87% | ✅ |
| Chatbot.tsx | 70.93% | 🟡 |

### Viewing Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# Open HTML coverage report (after running coverage)
# Located at: coverage/index.html
```

## 🎨 Best Practices

### 1. Test Naming

```typescript
// ✅ Good: Descriptive and clear
it('should display error message when login fails', () => {});

// ❌ Bad: Vague
it('test login', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should update user profile', () => {
  // Arrange: Set up test data
  const user = { name: 'John', email: 'john@example.com' };
  
  // Act: Perform the action
  const result = updateProfile(user);
  
  // Assert: Verify the outcome
  expect(result.success).toBe(true);
});
```

### 3. Mocking External Dependencies

```typescript
// Mock API calls
vi.mock('../../src/api/userApi');

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});
```

### 4. Testing User Interactions

```typescript
import { fireEvent, waitFor } from '@testing-library/react';

// Click events
fireEvent.click(button);

// Input changes
fireEvent.change(input, { target: { value: 'test' } });

// Keyboard events
fireEvent.keyPress(input, { key: 'Enter', code: 13 });

// Wait for async updates
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 5. Accessibility Testing

```typescript
// Use accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email address');
screen.getByPlaceholderText('Enter your name');

// Check ARIA attributes
expect(button).toHaveAttribute('aria-label', 'Close dialog');
```

### 6. Clean Up

```typescript
import { beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});
```

## 🔧 Common Mocks

### Router Mock

```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '123' }),
  };
});
```

### Axios Mock

```typescript
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));
```

### WebSocket Mock

```typescript
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));
```

## 🐛 Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution**: Check import paths and ensure files exist
```typescript
// Use correct relative paths
import Component from '../../src/components/Component';
```

#### 2. "ReferenceError: X is not defined"

**Solution**: Mock browser APIs
```typescript
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

#### 3. "Unable to find element"

**Solution**: Use proper queries and wait for async updates
```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Use correct query
screen.getByRole('button'); // More reliable than getByText
```

#### 4. "Jest/Vitest has detected the following 1 open handle"

**Solution**: Clean up timers and promises
```typescript
afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});
```

### Debug Tips

```typescript
// Print rendered component
import { screen } from '@testing-library/react';
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));

// Use logRoles to see all available roles
import { logRoles } from '@testing-library/react';
const { container } = render(<Component />);
logRoles(container);
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Common Mistakes with RTL](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new tests:

1. Follow the existing structure and naming conventions
2. Ensure tests are isolated and don't depend on each other
3. Mock external dependencies appropriately
4. Add meaningful assertions
5. Update this README if adding new test patterns
6. Run `pnpm test:coverage` to verify coverage

## 📝 Test Checklist

Before submitting a PR with new tests:

- [ ] All tests pass (`pnpm test`)
- [ ] Coverage meets minimum thresholds
- [ ] Tests are properly organized
- [ ] Mocks are cleaned up
- [ ] Tests follow naming conventions
- [ ] Edge cases are covered
- [ ] Accessibility is tested where applicable
- [ ] Documentation is updated if needed

---

**Last Updated**: October 11, 2025
**Maintained By**: Frontend Development Team
