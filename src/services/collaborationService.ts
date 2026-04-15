import { api } from './api';

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  investor?: any;
  entrepreneur?: any;
}

export const collaborationService = {
  async sendRequest(entrepreneurId: string, message: string): Promise<void> {
    await api.post('/Collaboration/requests', { entrepreneurId, message });
  },
  
  async getRequestsForEntrepreneur(): Promise<CollaborationRequest[]> {
    return api.get('/Collaboration/requests/entrepreneur');
  },
  
  async getRequestsFromInvestor(): Promise<CollaborationRequest[]> {
    return api.get('/Collaboration/requests/investor');
  },
  
  async updateRequestStatus(requestId: number, status: 'accepted' | 'rejected'): Promise<void> {
    await api.put(`/Collaboration/requests/${requestId}/status`, { status });
  },
};