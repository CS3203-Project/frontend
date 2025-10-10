import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SignIn from '../../src/Pages/SignIn'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  Toaster: () => <div data-testid="toaster">Toaster</div>
}))

import { userApi } from '../../src/api/userApi'

// Mock userApi
vi.mock('../../src/api/userApi', () => ({
  userApi: {
    login: vi.fn(),
    getProfile: vi.fn()
  }
}))

const mockUserApi = vi.mocked(userApi)

// Mock AuthContext
const mockLoginContext = vi.fn()
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLoginContext
  })
}))

// Mock Orb component
vi.mock('../../src/components/Orb', () => ({
  default: () => <div data-testid="orb">Orb Animation</div>
}))

// Mock localStorage
const mockLocalStorage = {
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserApi.login.mockResolvedValue({ token: 'fake-token', message: 'Success' })
    mockUserApi.getProfile.mockResolvedValue({ id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user', location: 'Test Location', phone: '1234567890', createdAt: '2023-01-01', isEmailVerified: true })
  })

  it('renders without crashing', () => {
    render(<SignIn />)
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    render(<SignIn />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('renders sign in button', () => {
    render(<SignIn />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles email input change', () => {
    render(<SignIn />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('handles password input change', () => {
    render(<SignIn />)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(passwordInput).toHaveValue('password123')
  })

  it('toggles password visibility', () => {
    render(<SignIn />)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const toggleButtons = screen.getAllByRole('button')
    const toggleButton = toggleButtons.find(btn => btn.querySelector('svg')) // Find the eye icon button
    
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    if (toggleButton) {
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    }
  })

  it('submits form with valid credentials', async () => {
    render(<SignIn />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('shows loading state during submission', async () => {
    mockUserApi.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<SignIn />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getAllByText(/signing in/i)[0]).toBeInTheDocument()
  })

  it('handles login failure', async () => {
    mockUserApi.login.mockRejectedValue(new Error('Invalid credentials'))
    
    render(<SignIn />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('stores token and updates auth context on successful login', async () => {
    render(<SignIn />)
    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-token')
      expect(mockUserApi.getProfile).toHaveBeenCalled()
      expect(mockLoginContext).toHaveBeenCalledWith({ id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User', role: 'user', location: 'Test Location', phone: '1234567890', createdAt: '2023-01-01', isEmailVerified: true })
    })
  })

  it('renders Orb components', () => {
    render(<SignIn />)
    const orbs = screen.getAllByTestId('orb')
    expect(orbs.length).toBeGreaterThan(0)
    orbs.forEach(orb => expect(orb).toBeInTheDocument())
  })

  it('renders Toaster component', () => {
    render(<SignIn />)
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
  })

  it('has link to signup page', () => {
    render(<SignIn />)
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
  })
})