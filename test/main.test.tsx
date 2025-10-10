import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StrictMode } from 'react'

// Mock React DOM
const mockRender = vi.fn()
const mockCreateRoot = vi.fn(() => ({
  render: mockRender
}))

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot
}))

// Mock App component
vi.mock('../src/App', () => ({
  default: () => <div data-testid="app">App</div>
}))

// Mock document.getElementById
const mockGetElementById = vi.fn(() => ({
  id: 'root'
}))

Object.defineProperty(document, 'getElementById', {
  value: mockGetElementById,
  writable: true
})

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates root and renders app in strict mode', async () => {
    // Import main to trigger the execution
    await import('../src/main')

    expect(mockGetElementById).toHaveBeenCalledWith('root')
    expect(mockCreateRoot).toHaveBeenCalled()
    expect(mockRender).toHaveBeenCalled()

    // Check that StrictMode is used
    const renderCall = mockRender.mock.calls[0][0]
    expect(renderCall.type).toBe(StrictMode)
  })
})