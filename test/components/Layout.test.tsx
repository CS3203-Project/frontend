import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import Layout from '../../src/components/Layout'

// Mock Navbar component
vi.mock('../../src/components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>
}))

const LayoutWrapper = ({ children, initialEntries = ['/'] }: { 
  children: React.ReactNode, 
  initialEntries?: string[] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
)

describe('Layout Component', () => {
  it('renders children content', () => {
    render(
      <LayoutWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with navbar and footer for regular pages', () => {
    render(
      <LayoutWrapper>
        <Layout>
          <div>Regular Page Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByText('Regular Page Content')).toBeInTheDocument()
  })

  it('renders without navbar for auth routes', () => {
    render(
      <LayoutWrapper initialEntries={['/signin']}>
        <Layout>
          <div>Sign In Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
    expect(screen.getByText('Sign In Content')).toBeInTheDocument()
  })

  it('renders without navbar for signup route', () => {
    render(
      <LayoutWrapper initialEntries={['/signup']}>
        <Layout>
          <div>Sign Up Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
    expect(screen.getByText('Sign Up Content')).toBeInTheDocument()
  })

  it('renders without navbar for admin routes', () => {
    render(
      <LayoutWrapper initialEntries={['/admin']}>
        <Layout>
          <div>Admin Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('renders without navbar for admin dashboard route', () => {
    render(
      <LayoutWrapper initialEntries={['/admin-dashboard']}>
        <Layout>
          <div>Admin Dashboard Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
    expect(screen.getByText('Admin Dashboard Content')).toBeInTheDocument()
  })

  it('handles nested admin routes', () => {
    render(
      <LayoutWrapper initialEntries={['/admin/users']}>
        <Layout>
          <div>Admin Users Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument()
    expect(screen.getByText('Admin Users Content')).toBeInTheDocument()
  })

  it('applies correct CSS classes for layout structure', () => {
    const { container } = render(
      <LayoutWrapper>
        <Layout>
          <div>Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    const layoutContainer = container.firstChild
    expect(layoutContainer).toHaveClass('min-h-screen', 'flex', 'flex-col')
    
    const mainElement = screen.getByRole('main')
    expect(mainElement).toHaveClass('flex-1')
  })

  it('renders different layout for auth routes', () => {
    const { container } = render(
      <LayoutWrapper initialEntries={['/signin']}>
        <Layout>
          <div>Auth Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    // Auth routes should render children directly without layout wrapper
    const authContent = screen.getByText('Auth Content')
    expect(authContent).toBeInTheDocument()
    
    // Should not have the min-h-screen wrapper for auth routes
    expect(container.firstChild).toBe(authContent)
  })

  it('handles root route correctly', () => {
    render(
      <LayoutWrapper initialEntries={['/']}>
        <Layout>
          <div>Home Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByText('Home Content')).toBeInTheDocument()
  })

  it('handles other service routes correctly', () => {
    render(
      <LayoutWrapper initialEntries={['/services']}>
        <Layout>
          <div>Services Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByText('Services Content')).toBeInTheDocument()
  })

  it('handles profile routes correctly', () => {
    render(
      <LayoutWrapper initialEntries={['/profile']}>
        <Layout>
          <div>Profile Content</div>
        </Layout>
      </LayoutWrapper>
    )
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByText('Profile Content')).toBeInTheDocument()
  })
})