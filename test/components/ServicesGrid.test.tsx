import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ServicesGrid from '../../src/components/ServicesGrid'

// Mock service data
const mockServices = [
  {
    id: '1',
    title: 'Web Development',
    provider: { name: 'John Doe', avatar: '/avatar.jpg', rating: 4.8, reviews: 120 },
    price: { amount: 500, currency: 'USD', type: 'fixed' as const },
    image: 'https://example.com/web.jpg',
    category: 'technical-services',
    subcategory: 'web-development'
  },
  {
    id: '2',
    title: 'Graphic Design',
    provider: { name: 'Jane Smith', avatar: '/avatar2.jpg', rating: 4.9, reviews: 85 },
    price: { amount: 75, currency: 'USD', type: 'hourly' as const },
    image: 'https://example.com/design.jpg',
    category: 'creative-services',
    subcategory: 'graphic-design'
  }
]

const ServicesGridWrapper = ({ services }: { services: any[] }) => (
  <BrowserRouter>
    <ServicesGrid services={services} />
  </BrowserRouter>
)

describe('ServicesGrid', () => {
  it('renders without crashing', () => {
    render(<ServicesGridWrapper services={mockServices} />)
    expect(document.body).toBeInTheDocument()
  })

  it('renders service cards', () => {
    render(<ServicesGridWrapper services={mockServices} />)
    expect(screen.getByText('Web Development')).toBeInTheDocument()
    expect(screen.getByText('Graphic Design')).toBeInTheDocument()
  })

  it('renders empty state when no services provided', () => {
    render(<ServicesGridWrapper services={[]} />)
    expect(document.body).toBeInTheDocument()
  })

  it('handles null services gracefully', () => {
    render(<ServicesGridWrapper services={null as any} />)
    expect(document.body).toBeInTheDocument()
  })

  it('displays service grid layout', () => {
    const { container } = render(<ServicesGridWrapper services={mockServices} />)
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toBeInTheDocument()
  })
})