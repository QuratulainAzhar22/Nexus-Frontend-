import { api } from './api';

export interface Transaction {
  id: number;
  userId: string;
  amount: number;
  type: string;
  status: string;
  reference: string;
  toUserId?: string;
  createdAt: string;
}

export const paymentService = {
  async getConfig(): Promise<{ publishableKey: string; currency: string }> {
    return api.get('/Payments/config');
  },

  async createPaymentIntent(amount: number): Promise<{ clientSecret: string; paymentIntentId: string }> {
    return api.post('/Payments/create-payment-intent', { amount });
  },
  
  async confirmDeposit(paymentIntentId: string): Promise<void> {
    await api.post('/Payments/confirm-deposit', paymentIntentId);
  },
  
  async withdraw(amount: number): Promise<void> {
    await api.post('/Payments/withdraw', { amount });
  },
  
  async transfer(toUserId: string, amount: number): Promise<void> {
    await api.post('/Payments/transfer', { toUserId, amount });
  },
  
  async getBalance(): Promise<number> {
    const response = await api.get('/Payments/balance');
    return response.balance;
  },
  
  async getTransactionHistory(): Promise<Transaction[]> {
    return api.get('/Payments/transactions');
  },
};