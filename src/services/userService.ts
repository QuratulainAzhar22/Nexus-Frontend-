import { api } from './api';
import { User } from './authService';

export const userService = {
  async getAllEntrepreneurs(): Promise<User[]> {
    return api.get('/Users/entrepreneurs');
  },
  
  async getAllInvestors(): Promise<User[]> {
    return api.get('/Users/investors');
  },
  
  async getEntrepreneurById(id: string): Promise<User> {
    return api.get(`/Users/entrepreneurs/${id}`);
  },
  
  async getInvestorById(id: string): Promise<User> {
    return api.get(`/Users/investors/${id}`);
  },
  
  async updateProfile(data: Partial<User>): Promise<User> {
    return api.put('/Users/profile', data);
  },
  
  async searchUsers(query: string): Promise<User[]> {
    return api.get(`/Users/search?q=${encodeURIComponent(query)}`);
  },
};