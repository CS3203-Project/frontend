import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock apiClient
const mockApiClient = {
  post: vi.fn(),
  get: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn()
}

vi.mock('../../src/api/axios', () => ({
  default: mockApiClient
}))

describe('confirmationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getByConversation', () => {
    it('sends GET request to correct endpoint', async () => {
      const conversationId = '123'
      const mockResponse = { 
        conversationId, 
        customerConfirmation: false, 
        providerConfirmation: false 
      }
      
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      // Dynamically import to ensure mock is applied
      const { confirmationApi } = await import('../../src/api/confirmationApi')
      const result = await confirmationApi.getByConversation(conversationId)

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/confirmations/${conversationId}`
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('create', () => {
    it('sends POST request to create confirmation', async () => {
      const conversationId = '123'
      const mockResponse = { 
        conversationId, 
        customerConfirmation: false, 
        providerConfirmation: false 
      }

      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const { confirmationApi } = await import('../../src/api/confirmationApi')
      const result = await confirmationApi.create(conversationId)

      expect(mockApiClient.post).toHaveBeenCalledWith('/confirmations', {
        conversationId,
        customerConfirmation: false,
        providerConfirmation: false,
        startDate: null,
        endDate: null,
        serviceFee: null,
        currency: 'USD'
      })
      expect(result).toEqual(mockResponse)
    })

    it('accepts optional payload', async () => {
      const conversationId = '123'
      const payload = { serviceFee: 100 }
      
      mockApiClient.post.mockResolvedValue({ data: {} })

      const { confirmationApi } = await import('../../src/api/confirmationApi')
      await confirmationApi.create(conversationId, payload)

      expect(mockApiClient.post).toHaveBeenCalledWith('/confirmations', 
        expect.objectContaining({ serviceFee: 100 })
      )
    })
  })

  describe('upsert', () => {
    it('sends PATCH request to update confirmation', async () => {
      const conversationId = '123'
      const patch = { customerConfirmation: true }
      
      mockApiClient.patch.mockResolvedValue({ data: { ...patch } })

      const { confirmationApi } = await import('../../src/api/confirmationApi')
      await confirmationApi.upsert(conversationId, patch)

      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/confirmations/${conversationId}`,
        patch
      )
    })
  })

  describe('ensure', () => {
    it('returns existing confirmation if found', async () => {
      const conversationId = '123'
      const mockResponse = { conversationId, customerConfirmation: true }
      
      mockApiClient.get.mockResolvedValue({ data: mockResponse })

      const { confirmationApi } = await import('../../src/api/confirmationApi')
      const result = await confirmationApi.ensure(conversationId)

      expect(result).toEqual(mockResponse)
      expect(mockApiClient.get).toHaveBeenCalled()
      expect(mockApiClient.post).not.toHaveBeenCalled()
    })

    it('creates new confirmation if not found', async () => {
      const conversationId = '123'
      const mockResponse = { conversationId, customerConfirmation: false }
      
      mockApiClient.get.mockRejectedValue(new Error('Not found'))
      mockApiClient.post.mockResolvedValue({ data: mockResponse })

      const { confirmationApi } = await import('../../src/api/confirmationApi')
      const result = await confirmationApi.ensure(conversationId)

      expect(result).toEqual(mockResponse)
      expect(mockApiClient.get).toHaveBeenCalled()
      expect(mockApiClient.post).toHaveBeenCalled()
    })
  })
})