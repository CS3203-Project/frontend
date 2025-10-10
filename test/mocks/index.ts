import { vi } from 'vitest'

// Mock functions that can be imported and used in tests
export const mockUseAuth = vi.fn()
export const mockUseNotifications = vi.fn()
export const mockUseNavigate = vi.fn()
export const mockUseLocation = vi.fn()

// Default implementations
mockUseAuth.mockReturnValue({
  user: {
    id: '123',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+94123456789',
    isEmailVerified: true,
    role: 'user',
    profilePicture: null,
    address: {
      street: '123 Test St',
      city: 'Colombo',
      province: 'Western',
      postalCode: '10001',
      country: 'Sri Lanka'
    }
  },
  isLoggedIn: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
  updateUser: vi.fn(),
})

mockUseNotifications.mockReturnValue({
  stats: {
    unread: 0,
    total: 0
  },
  notifications: [],
  loading: false,
  error: null,
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
  refetch: vi.fn()
})

mockUseLocation.mockReturnValue({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default'
})

// Mock APIs
export const mockSemanticSearchApi = {
  search: vi.fn().mockResolvedValue([]),
  getRecommendations: vi.fn().mockResolvedValue([])
}

export const mockUserApi = {
  getProfile: vi.fn().mockResolvedValue({
    id: '123',
    email: 'test@example.com',
    username: 'testuser'
  }),
  updateProfile: vi.fn().mockResolvedValue({}),
  login: vi.fn().mockResolvedValue({ token: 'mock-token' }),
  register: vi.fn().mockResolvedValue({ token: 'mock-token' })
}