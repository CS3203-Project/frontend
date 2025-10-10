import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../src/contexts/AuthContext'
import { userApi } from '../../src/api/userApi'

// Mock userApi
vi.mock('../../src/api/userApi', () => ({
  userApi: {
    getProfile: vi.fn()
  }
}))

const mockUserApi = vi.mocked(userApi)

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Test component to access auth context
const TestComponent = () => {
  const { user, isLoggedIn, isLoading, login, logout, updateUser } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isLoggedIn">{isLoggedIn.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button 
        onClick={() => login({ 
          id: '1', 
          email: 'test@example.com', 
          firstName: 'Test', 
          lastName: 'User',
          role: 'user',
          location: 'Test Location',
          phone: '1234567890',
          createdAt: '2023-01-01',
          isEmailVerified: true
        })} 
        data-testid="login"
      >
        Login
      </button>
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
      <button 
        onClick={() => updateUser({ 
          id: '1', 
          email: 'updated@example.com', 
          firstName: 'Updated', 
          lastName: 'User',
          role: 'user',
          location: 'Updated Location',
          phone: '1234567890',
          createdAt: '2023-01-01',
          isEmailVerified: true
        })} 
        data-testid="update"
      >
        Update
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('throws error when useAuth is used outside provider', () => {
    const TestWithoutProvider = () => {
      useAuth()
      return <div>Test</div>
    }

    expect(() => render(<TestWithoutProvider />)).toThrow(
      'useAuth must be used within an AuthProvider'
    )
  })

  it('provides initial values when no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false')
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
    })
  })

  it('fetches user profile when token exists', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com', 
      firstName: 'Test', 
      lastName: 'User',
      role: 'user',
      location: 'Test Location',
      phone: '1234567890',
      createdAt: '2023-01-01',
      isEmailVerified: true
    }
    mockLocalStorage.getItem.mockReturnValue('fake-token')
    mockUserApi.getProfile.mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
    })

    expect(mockUserApi.getProfile).toHaveBeenCalled()
  })

  it('handles failed profile fetch', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token')
    mockUserApi.getProfile.mockRejectedValue(new Error('Unauthorized'))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false')
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
    })

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('handles login function', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByTestId('login')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(
        JSON.stringify({ 
          id: '1', 
          email: 'test@example.com', 
          firstName: 'Test', 
          lastName: 'User',
          role: 'user',
          location: 'Test Location',
          phone: '1234567890',
          createdAt: '2023-01-01',
          isEmailVerified: true
        })
      )
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
    })
  })

  it('handles logout function', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com', 
      firstName: 'Test', 
      lastName: 'User',
      role: 'user',
      location: 'Test Location',
      phone: '1234567890',
      createdAt: '2023-01-01',
      isEmailVerified: true
    }
    mockLocalStorage.getItem.mockReturnValue('fake-token')
    mockUserApi.getProfile.mockResolvedValue(mockUser)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
    })

    const logoutButton = screen.getByTestId('logout')
    logoutButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('false')
    })

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
  })

  it('handles updateUser function', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // First login
    const loginButton = screen.getByTestId('login')
    loginButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('isLoggedIn')).toHaveTextContent('true')
    })

    // Then update
    const updateButton = screen.getByTestId('update')
    updateButton.click()

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent(
        JSON.stringify({ 
          id: '1', 
          email: 'updated@example.com', 
          firstName: 'Updated', 
          lastName: 'User',
          role: 'user',
          location: 'Updated Location',
          phone: '1234567890',
          createdAt: '2023-01-01',
          isEmailVerified: true
        })
      )
    })
  })

  it('shows loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('isLoading')).toHaveTextContent('false')
  })
})