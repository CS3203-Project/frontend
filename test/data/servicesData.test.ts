import { describe, it, expect } from 'vitest'
import { servicesData, categoriesData } from '../../src/data/servicesData'

describe('servicesData', () => {
  describe('servicesData', () => {
    it('exports an array of services', () => {
      expect(Array.isArray(servicesData)).toBe(true)
      expect(servicesData.length).toBeGreaterThan(0)
    })

    it('has valid service structure', () => {
      servicesData.forEach((service) => {
        expect(service).toHaveProperty('id')
        expect(service).toHaveProperty('title')
        expect(service).toHaveProperty('provider')
        expect(service).toHaveProperty('price')
        expect(service).toHaveProperty('image')
        expect(service).toHaveProperty('category')
        expect(service).toHaveProperty('subcategory')
        
        expect(typeof service.id).toBe('string')
        expect(typeof service.title).toBe('string')
        expect(typeof service.provider).toBe('object')
        expect(typeof service.price).toBe('object')
        expect(typeof service.image).toBe('string')
        expect(typeof service.category).toBe('string')
        expect(typeof service.subcategory).toBe('string')
      })
    })

    it('has valid provider structure', () => {
      servicesData.forEach((service) => {
        expect(service.provider).toHaveProperty('name')
        expect(service.provider).toHaveProperty('avatar')
        expect(service.provider).toHaveProperty('rating')
        expect(service.provider).toHaveProperty('reviews')
        
        expect(typeof service.provider.name).toBe('string')
        expect(typeof service.provider.avatar).toBe('string')
        expect(typeof service.provider.rating).toBe('number')
        expect(typeof service.provider.reviews).toBe('number')
      })
    })

    it('has valid price structure', () => {
      servicesData.forEach((service) => {
        expect(service.price).toHaveProperty('amount')
        expect(service.price).toHaveProperty('currency')
        expect(service.price).toHaveProperty('type')
        
        expect(typeof service.price.amount).toBe('number')
        expect(typeof service.price.currency).toBe('string')
        expect(['fixed', 'hourly']).toContain(service.price.type)
      })
    })
  })

  describe('categoriesData', () => {
    it('exports an array of service categories', () => {
      expect(Array.isArray(categoriesData)).toBe(true)
      expect(categoriesData.length).toBeGreaterThan(0)
    })

    it('has valid category structure', () => {
      categoriesData.forEach((category) => {
        expect(category).toHaveProperty('slug')
        expect(category).toHaveProperty('title')
        expect(category).toHaveProperty('description')
        expect(category).toHaveProperty('icon')
        expect(category).toHaveProperty('gradient')
        expect(category).toHaveProperty('subcategories')
        
        expect(typeof category.slug).toBe('string')
        expect(typeof category.title).toBe('string')
        expect(typeof category.description).toBe('string')
        expect(typeof category.icon).toBe('object')
        expect(typeof category.gradient).toBe('string')
        expect(Array.isArray(category.subcategories)).toBe(true)
      })
    })

    it('contains expected main categories', () => {
      const categoryTitles = categoriesData.map(category => category.title)
      
      expect(categoryTitles).toContain('Home Services')
      expect(categoryTitles).toContain('Professional Services')
      expect(categoryTitles).toContain('Creative Services')
      expect(categoryTitles).toContain('Technical Services')
      expect(categoryTitles).toContain('Personal Care')
      expect(categoryTitles).toContain('Business Services')
    })

    it('has valid subcategory structure', () => {
      categoriesData.forEach((category) => {
        category.subcategories.forEach((subcategory) => {
          expect(subcategory).toHaveProperty('id')
          expect(subcategory).toHaveProperty('name')
          expect(subcategory).toHaveProperty('slug')
          expect(subcategory).toHaveProperty('description')
          expect(subcategory).toHaveProperty('icon')
          
          expect(typeof subcategory.id).toBe('string')
          expect(typeof subcategory.name).toBe('string')
          expect(typeof subcategory.slug).toBe('string')
          expect(typeof subcategory.description).toBe('string')
          expect(typeof subcategory.icon).toBe('object')
        })
      })
    })

    it('has valid gradient CSS classes', () => {
      categoriesData.forEach((category) => {
        expect(category.gradient).toMatch(/^from-\w+-\d+\s+to-\w+-\d+$/)
      })
    })
  })
})