export interface ConversationConfirmation {
  id?: string;
  conversationId: string;
  customerConfirmation: boolean;
  providerConfirmation: boolean;
  startDate: string | null; // ISO string
  endDate: string | null;   // ISO string
  serviceFee?: number | null; // Service fee amount - only editable by provider
  currency?: string; // Currency for the service fee (default: USD)
  updatedAt?: string;
}
