import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Loader from '../../src/components/Loader'

describe('Loader Component', () => {
  it('renders with default props', () => {
    render(<Loader />)
    const loader = document.querySelector('.loader')
    expect(loader).toBeInTheDocument()
    expect(loader).toHaveClass('loader', 'loader-md', 'loader-primary')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Loader size="sm" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-sm')
    
    rerender(<Loader size="lg" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-lg')
    
    rerender(<Loader size="xl" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-xl')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Loader variant="success" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-success')
    
    rerender(<Loader variant="accent" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-accent')
    
    rerender(<Loader variant="white" />)
    expect(document.querySelector('.loader')).toHaveClass('loader-white')
  })

  it('accepts custom className', () => {
    render(<Loader className="custom-loader" />)
    const loader = document.querySelector('.loader')
    expect(loader).toHaveClass('custom-loader')
  })

  it('combines size, variant, and custom classes correctly', () => {
    render(<Loader size="lg" variant="success" className="extra-class" />)
    const loader = document.querySelector('.loader')
    expect(loader).toHaveClass('loader', 'loader-lg', 'loader-success', 'extra-class')
  })
})