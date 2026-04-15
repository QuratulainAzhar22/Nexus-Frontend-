import { api } from './api';

export interface LoginData {
  email: string;
  password: string;
  role: 'entrepreneur' | 'investor';
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'entrepreneur' | 'investor';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  bio: string;
  isOnline: boolean;
  createdAt: string;
  startupName?: string;
  pitchSummary?: string;
  fundingNeeded?: string;
  industry?: string;
  location?: string;
  foundedYear?: number;
  teamSize?: number;
  investmentInterests?: string[];
  investmentStage?: string[];
  portfolioCompanies?: string[];
  totalInvestments?: number;
  minimumInvestment?: string;
  maximumInvestment?: string;
}

export const authService = {
  async login(data: LoginData): Promise<{ token: string; user: User }> {
    const response = await api.post('/Auth/login', data);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { token: response.token, user: response.user };
    }
    throw new Error(response.message);
  },
  
  async register(data: RegisterData): Promise<{ token: string; user: User }> {
    const response = await api.post('/Auth/register', data);
    if (response.success) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { token: response.token, user: response.user };
    }
    throw new Error(response.message);
  },
  
  async logout(userId: string): Promise<void> {
    try {
      await api.post('/Auth/logout', userId);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await api.get('/Auth/me');
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },
  
  async getUserById(id: string): Promise<User> {
    return api.get(`/Auth/user/${id}`);
  },
  
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/Auth/change-password', { currentPassword, newPassword });
  },
  
  async sendOtp(email: string): Promise<void> {
    await api.post('/Auth/send-otp', { email });
  },
  
  async verifyOtp(email: string, otp: string): Promise<{ resetToken: string }> {
    const response = await api.post('/Auth/verify-otp', { email, otp });
    return { resetToken: response.resetToken };
  },
  
  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    await api.post('/Auth/reset-password', { email, token, newPassword });
  },
  
  getToken(): string | null {
    return localStorage.getItem('token');
  },
  
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};