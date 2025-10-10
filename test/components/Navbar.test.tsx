import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Navbar from '../../src/components/Navbar'

// Mock all dependencies to avoid complex setup
vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    signup: vi.fn()
  })
}))

vi.mock('../../src/hooks/useNotifications', () => ({
  useNotifications: () => ({
    notifications: [],
    loading: false,
    error: null,
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn()
  })
}))

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => vi.fn(),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
  BrowserRouter: ({ children }: any) => <div>{children}</div>
}))

vi.mock('../../src/utils/messageDB', () => ({
  clearMessages: vi.fn()
}))

vi.mock('../../src/data/servicesData', () => ({
  categories: [],
  categoriesData: []
}))

vi.mock('../../src/utils/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Navbar Component', () => {
  it('renders navbar', () => {
    render(<Navbar />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})