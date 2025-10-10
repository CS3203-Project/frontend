import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import HeroSection from '../../src/components/HeroSection'

// Mock the search API
const mockSearch = vi.fn()
vi.mock('../../src/api/serviceApi', () => ({
  semanticSearchApi: {
    search: mockSearch
  }
}))

vi.mock('../../src/utils/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')
}))

const HeroSectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('HeroSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch.mockResolvedValue({ success: true, data: [] })
  })

  it('renders hero section with main heading', () => {
    render(
      <HeroSectionWrapper>
        <HeroSection />
      </HeroSectionWrapper>
    )

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(
      <HeroSectionWrapper>
        <HeroSection />
      </HeroSectionWrapper>
    )

    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders search button', () => {
    render(
      <HeroSectionWrapper>
        <HeroSection />
      </HeroSectionWrapper>
    )

    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('allows typing in search input', async () => {
    const user = userEvent.setup()
    
    render(
      <HeroSectionWrapper>
        <HeroSection />
      </HeroSectionWrapper>
    )

    const searchInput = screen.getByRole('textbox')
    await user.type(searchInput, 'plumbing')
    
    expect(searchInput).toHaveValue('plumbing')
  })
})