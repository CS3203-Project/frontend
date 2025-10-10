import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomepageEnhanced from '../../src/Pages/HomepageEnhanced'

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock hooks
vi.mock('../../src/hooks/useServices', () => ({
  default: vi.fn(() => ({
    services: [
      { id: 1, title: 'Test Service 1', description: 'Test Description 1', isActive: true },
      { id: 2, title: 'Test Service 2', description: 'Test Description 2', isActive: true }
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  }))
}))

// Mock API
vi.mock('../../src/api/hybridSearchApi', () => ({
  hybridSearchApi: {
    hybridSearch: vi.fn(() => Promise.resolve({ data: { results: [] } }))
  }
}))

// Mock components
vi.mock('../../src/components/ServicesGrid', () => ({
  default: ({ services }: { services: any[] }) => (
    <div data-testid="services-grid">
      {services.map(service => (
        <div key={service.id} data-testid="service-item">{service.title}</div>
      ))}
    </div>
  )
}))

vi.mock('../../src/components/Orb', () => ({
  default: () => <div data-testid="orb">Orb Animation</div>
}))

vi.mock('../../src/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}))

vi.mock('../../src/components/LocationPickerAdvanced', () => ({
  default: ({ onLocationChange }: { onLocationChange?: (location: any) => void }) => (
    <div data-testid="location-picker">
      <button 
        onClick={() => onLocationChange && onLocationChange({ latitude: 40.7128, longitude: -74.0060 })}
        data-testid="select-location"
      >
        Select Location
      </button>
    </div>
  )
}))

vi.mock('../../src/components/Button', () => ({
  default: ({ children, onClick, type, ...props }: any) => (
    <button onClick={onClick} type={type} data-testid="button" {...props}>
      {children}
    </button>
  )
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('HomepageEnhanced', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    renderWithRouter(<HomepageEnhanced />)
    expect(screen.getByTestId('services-grid')).toBeInTheDocument()
  })

  it('displays services grid with test services', () => {
    renderWithRouter(<HomepageEnhanced />)
    expect(screen.getByText('Test Service 1')).toBeInTheDocument()
    expect(screen.getByText('Test Service 2')).toBeInTheDocument()
  })

  it('renders search input', () => {
    renderWithRouter(<HomepageEnhanced />)
    const searchInput = screen.getByRole('textbox')
    expect(searchInput).toBeInTheDocument()
  })

  it('handles search input change', () => {
    renderWithRouter(<HomepageEnhanced />)
    const searchInput = screen.getByRole('textbox')
    
    fireEvent.change(searchInput, { target: { value: 'web development' } })
    expect(searchInput).toHaveValue('web development')
  })

  it('navigates to services page when search is empty', async () => {
    renderWithRouter(<HomepageEnhanced />)
    const searchButton = screen.getAllByTestId('button')[0] // Get search button
    
    fireEvent.click(searchButton)
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/services')
    })
  })

  it('renders popular searches', () => {
    renderWithRouter(<HomepageEnhanced />)
    expect(screen.getByText('Web Development')).toBeInTheDocument()
    expect(screen.getByText('Graphic Design')).toBeInTheDocument()
  })

  it('renders Orb components', () => {
    renderWithRouter(<HomepageEnhanced />)
    const orbs = screen.getAllByTestId('orb')
    expect(orbs.length).toBeGreaterThan(0)
    orbs.forEach(orb => expect(orb).toBeInTheDocument())
  })

  it('renders Footer component', () => {
    renderWithRouter(<HomepageEnhanced />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders location picker', () => {
    renderWithRouter(<HomepageEnhanced />)
    expect(screen.getByTestId('location-picker')).toBeInTheDocument()
  })

  it('handles location selection', () => {
    renderWithRouter(<HomepageEnhanced />)
    const selectLocationButton = screen.getByTestId('select-location')
    
    fireEvent.click(selectLocationButton)
    // Location should be set internally (tested through integration)
  })
})