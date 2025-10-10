import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocationFilter from '../../src/components/LocationFilter'

// Mock the useLocation hook
vi.mock('../../src/hooks/useLocation', () => ({
  useLocation: () => ({
    coordinates: null,
    locationInfo: null,
    loading: false,
    error: null,
    permissionStatus: null,
    getCurrentLocation: vi.fn(),
    getLocationFromIP: vi.fn(),
    geocodeAddress: vi.fn(),
    reverseGeocode: vi.fn(),
    clearError: vi.fn(),
    clearLocation: vi.fn()
  })
}))

vi.mock('../../src/utils/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('LocationFilter Component', () => {
  const mockOnFilterChange = vi.fn()

  it('renders location filter', () => {
    render(<LocationFilter onFilterChange={mockOnFilterChange} />)
    expect(screen.getByText(/location/i)).toBeInTheDocument()
  })
})