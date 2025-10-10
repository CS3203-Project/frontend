import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'

// Mock all the router components
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div data-testid="routes">{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div data-testid="route">{children}</div>,
}))

// Mock contexts
vi.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}))

vi.mock('../src/components/LoaderContext', () => ({
  LoaderProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="loader-provider">{children}</div>,
}))

// Mock Layout component
vi.mock('../src/components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}))

// Mock Chatbot component
vi.mock('../src/components/Chatbot', () => ({
  Chatbot: () => <div data-testid="chatbot">Chatbot</div>,
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('router')).toBeInTheDocument()
  })

  it('renders with correct providers', () => {
    render(<App />)
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('loader-provider')).toBeInTheDocument()
  })

  it('renders layout component', () => {
    render(<App />)
    expect(screen.getByTestId('layout')).toBeInTheDocument()
  })

  it('renders routes structure', () => {
    render(<App />)
    expect(screen.getByTestId('routes')).toBeInTheDocument()
  })

  it('renders chatbot component', () => {
    render(<App />)
    expect(screen.getByTestId('chatbot')).toBeInTheDocument()
  })
})