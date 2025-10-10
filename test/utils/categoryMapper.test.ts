import { describe, it, expect } from 'vitest'
import { 
  mapCategoriesToNavbarFormat, 
  getCategoryIcon, 
  getCategoryGradient, 
  getSubcategoryIcon 
} from '../../src/utils/categoryMapper'

describe('categoryMapper', () => {
  describe('mapCategoriesToNavbarFormat', () => {
    it('transforms categories to navbar format', () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Home Services',
          slug: 'home-services',
          description: 'Home related services',
          children: [
            {
              id: '2',
              name: 'Cleaning',
              slug: 'cleaning',
              description: 'Cleaning services'
            }
          ]
        }
      ]

      const result = mapCategoriesToNavbarFormat(mockCategories)
      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('slug', 'home-services')
      expect(result[0]).toHaveProperty('title', 'Home Services')
      expect(result[0]).toHaveProperty('subcategories')
      expect(result[0].subcategories).toHaveLength(1)
    })

    it('handles categories without children', () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Simple Service',
          slug: 'simple-service',
          description: 'A simple service'
        }
      ]

      const result = mapCategoriesToNavbarFormat(mockCategories)
      expect(result[0].subcategories).toHaveLength(0)
    })
  })

  describe('getCategoryIcon', () => {
    it('returns icon component for known categories', () => {
      const icon = getCategoryIcon('home-services')
      expect(icon).toBeDefined()
      expect(typeof icon).toBe('object')
    })

    it('returns default icon for unknown categories', () => {
      const defaultIcon = getCategoryIcon('unknown-category')
      expect(defaultIcon).toBeDefined()
      expect(typeof defaultIcon).toBe('object')
    })
  })

  describe('getCategoryGradient', () => {
    it('returns gradient for known categories', () => {
      const gradient = getCategoryGradient('home-services')
      expect(gradient).toBe('from-green-400 to-blue-500')
    })

    it('returns default gradient for unknown categories', () => {
      const defaultGradient = getCategoryGradient('unknown-category')
      expect(defaultGradient).toBe('from-gray-400 to-gray-600')
    })
  })

  describe('getSubcategoryIcon', () => {
    it('returns icon for known subcategories', () => {
      const icon = getSubcategoryIcon('cleaning')
      expect(icon).toBeDefined()
      expect(typeof icon).toBe('object')
    })

    it('returns default icon for unknown subcategories', () => {
      const defaultIcon = getSubcategoryIcon('unknown-subcategory')
      expect(defaultIcon).toBeDefined()
      expect(typeof defaultIcon).toBe('object')
    })
  })
})