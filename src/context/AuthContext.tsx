import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, User, LoginData, RegisterData } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'entrepreneur' | 'investor') => Promise<void>;
  register: (name: string, email: string, password: string, role: 'entrepreneur' | 'investor') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        const currentUser = authService.getUser();
        if (currentUser) {
          setUser(currentUser);
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch (error) {
            console.error('Failed to refresh user:', error);
          }
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, role: 'entrepreneur' | 'investor') => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await authService.login({ email, password, role });
      setUser(loggedInUser);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: 'entrepreneur' | 'investor') => {
    setIsLoading(true);
    try {
      const { user: registeredUser } = await authService.register({ name, email, password, role });
      setUser(registeredUser);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      await authService.logout(user.id);
    }
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};