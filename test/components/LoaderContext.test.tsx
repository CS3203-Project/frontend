import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'
import { LoaderProvider, useLoader } from '../../src/components/LoaderContext'

// Mock the Loader component
vi.mock('../../src/components/Loader', () => ({
  default: () => <div data-testid="loader">Loading...</div>
}))

// Test component that uses the loader context
const TestComponent = () => {
  const { showLoader, hideLoader, isLoading } = useLoader()
  
  return (
    <div>
      <button onClick={() => showLoader('Test message')}>
        Show Loader
      </button>
      <button onClick={hideLoader}>
        Hide Loader
      </button>
      <div data-testid="loading-state">
        {isLoading ? 'Loading' : 'Not Loading'}
      </div>
    </div>
  )
}

describe('LoaderContext', () => {
  it('provides loader context to children', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    )
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
  })

  it('shows loader when showLoader is called', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    )
    
    const showButton = screen.getByText('Show Loader')
    act(() => {
      showButton.click()
    })
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')
  })

  it('hides loader when hideLoader is called', () => {
    render(
      <LoaderProvider>
        <TestComponent />
      </LoaderProvider>
    )
    
    // First show the loader
    act(() => {
      screen.getByText('Show Loader').click()
    })
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading')
    
    // Then hide it
    act(() => {
      screen.getByText('Hide Loader').click()
    })
    
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not Loading')
  })
})