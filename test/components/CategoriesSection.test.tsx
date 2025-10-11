import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CategoriesSection from '../../src/components/CategoriesSection'

// Mock utils to avoid errors
vi.mock('../../src/utils/utils', () => ({
  cn: (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ')
}))

// Mock the API to avoid network calls
vi.mock('../../src/api/categoryApi', () => ({
  categoryApi: {
    getRootCategories: vi.fn().mockResolvedValue({
      success: true,
      data: []
    })
  }
}))

const CategoriesSectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('CategoriesSection Component', () => {
  it('renders section title', () => {
    render(
      <CategoriesSectionWrapper>
        <CategoriesSection />
      </CategoriesSectionWrapper>
    )

    expect(screen.getByText('Browse Service Categories')).toBeInTheDocument()
  })
})