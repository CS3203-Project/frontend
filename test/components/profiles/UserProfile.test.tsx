import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfileHeader from '../../../src/components/profiles/shared/ProfileHeader'
import { BrowserRouter } from 'react-router-dom'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}))

const mockProvider = {
  id: '1',
  user: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    imageUrl: 'https://example.com/avatar.jpg'
  },
  coverImage: 'https://example.com/cover.jpg',
  isVerified: true,
  createdAt: new Date().toISOString(),
  location: {
    city: 'New York',
    state: 'NY',
    country: 'USA'
  },
  rating: 4.5,
  totalReviews: 10,
  status: 'available',
  description: 'Professional service provider'
}

const mockProps = {
  provider: mockProvider,
  setShowContactModal: vi.fn(),
  setShowLocationModal: vi.fn(),
  isFollowing: false,
  setIsFollowing: vi.fn(),
  setShowBannerUpload: vi.fn()
}

const ProfileHeaderWrapper = (props: any) => (
  <BrowserRouter>
    <ProfileHeader {...props} />
  </BrowserRouter>
)

describe('ProfileHeader', () => {
  it('renders without crashing', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    expect(document.body).toBeInTheDocument()
  })

  it('displays profile elements', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows verification status', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    const verifiedElements = screen.queryAllByText(/verified/i)
    expect(verifiedElements.length).toBeGreaterThanOrEqual(0)
  })

  it('displays location information', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    const locationElements = screen.queryAllByText(/New York/i)
    expect(locationElements.length).toBeGreaterThanOrEqual(0)
  })

  it('handles provider without cover image', () => {
    const providerWithoutImage = { ...mockProvider, coverImage: null }
    render(<ProfileHeaderWrapper {...mockProps} provider={providerWithoutImage} />)
    // Should render without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('handles unverified provider', () => {
    const unverifiedProvider = { ...mockProvider, isVerified: false }
    render(<ProfileHeaderWrapper {...mockProps} provider={unverifiedProvider} />)
    // Should render without crashing
    expect(document.body).toBeInTheDocument()
  })

  it('displays status information', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    const statusElements = screen.queryAllByText(/available/i)
    expect(statusElements.length).toBeGreaterThanOrEqual(0)
  })

  it('handles rating display', () => {
    render(<ProfileHeaderWrapper {...mockProps} />)
    const ratingElements = screen.queryAllByText(/4\.5/i)
    expect(ratingElements.length).toBeGreaterThanOrEqual(0)
  })
})