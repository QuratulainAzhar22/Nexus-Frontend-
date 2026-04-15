// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5286/api';

export const api = {
  baseURL: API_BASE_URL,
  
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  },
  
  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  post(endpoint: string, body: any) {
    return this.request(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(body) 
    });
  },
  
  put(endpoint: string, body: any) {
    return this.request(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(body) 
    });
  },
  
  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};