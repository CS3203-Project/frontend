import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WebSocketStatus } from '../../src/components/WebSocketStatus'

describe('WebSocketStatus Component', () => {
  it('renders connected state correctly', () => {
    render(<WebSocketStatus isConnected={true} />)
    
    expect(screen.getByText('Connected')).toBeInTheDocument()
    const statusText = screen.getByText('Connected')
    expect(statusText).toHaveClass('text-green-600')
    
    // Check for the green indicator dot
    const indicator = statusText.previousSibling
    expect(indicator).toHaveClass('bg-green-500', 'animate-pulse')
  })

  it('renders disconnected state correctly', () => {
    render(<WebSocketStatus isConnected={false} />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
    const statusText = screen.getByText('Disconnected')
    expect(statusText).toHaveClass('text-red-600')
    
    // Check for the red indicator dot
    const indicator = statusText.previousSibling
    expect(indicator).toHaveClass('bg-red-500')
    expect(indicator).not.toHaveClass('animate-pulse')
  })

  it('applies custom className', () => {
    const { container } = render(
      <WebSocketStatus isConnected={true} className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with default className when none provided', () => {
    const { container } = render(<WebSocketStatus isConnected={true} />)
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'space-x-2')
  })

  it('has correct indicator size and shape', () => {
    render(<WebSocketStatus isConnected={true} />)
    
    const indicator = screen.getByText('Connected').previousSibling
    expect(indicator).toHaveClass('w-2', 'h-2', 'rounded-full')
  })

  it('shows correct text size', () => {
    render(<WebSocketStatus isConnected={true} />)
    
    const statusText = screen.getByText('Connected')
    expect(statusText).toHaveClass('text-xs')
  })

  it('maintains accessibility with proper text content', () => {
    render(<WebSocketStatus isConnected={true} />)
    
    // Should have text content that screen readers can access
    expect(screen.getByText('Connected')).toBeInTheDocument()
    
    render(<WebSocketStatus isConnected={false} />)
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('renders with proper flex layout', () => {
    const { container } = render(<WebSocketStatus isConnected={true} />)
    
    expect(container.firstChild).toHaveClass('flex', 'items-center', 'space-x-2')
  })

  it('combines custom className with default classes', () => {
    const { container } = render(
      <WebSocketStatus isConnected={true} className="extra-spacing" />
    )
    
    expect(container.firstChild).toHaveClass(
      'flex', 
      'items-center', 
      'space-x-2',
      'extra-spacing'
    )
  })
})