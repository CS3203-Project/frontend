import apiClient from './axios';
import type { ConversationConfirmation } from '../types/confirmation';

const baseURL = '/confirmations'; // backend should expose /api/confirmations

export const confirmationApi = {
  async getByConversation(conversationId: string): Promise<ConversationConfirmation> {
    const { data } = await apiClient.get(`${baseURL}/${conversationId}`);
    return data;
  },

  async create(conversationId: string, payload?: Partial<ConversationConfirmation>): Promise<ConversationConfirmation> {
    const { data } = await apiClient.post(baseURL, {
      conversationId,
      customerConfirmation: false,
      providerConfirmation: false,
      startDate: null,
      endDate: null,
      serviceFee: null,
      currency: 'USD',
      ...payload,
    });
    return data;
  },

  async upsert(conversationId: string, patch: Partial<ConversationConfirmation>): Promise<ConversationConfirmation> {
    const { data } = await apiClient.patch(`${baseURL}/${conversationId}`, patch);
    return data;
  },

  async ensure(conversationId: string): Promise<ConversationConfirmation> {
    try {
      return await this.getByConversation(conversationId);
    } catch {
      return await this.create(conversationId);
    }
  },
};

export default confirmationApi;
