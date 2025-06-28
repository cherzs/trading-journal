import { User } from '../types/Trade';
import { apiService } from './api';

const CURRENT_USER_KEY = 'trading_journal_current_user';

export const registerUser = async (
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await apiService.register({ username, email, password });
    
    if (response.error) {
      return { success: false, error: response.error };
    }
    
    if (response.data?.user) {
      const user = response.data.user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Registration failed' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed' 
    };
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await apiService.login({ email, password });
    
    if (response.error) {
      return { success: false, error: response.error };
    }
    
    if (response.data?.user) {
      const user = response.data.user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Login failed' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Login failed' 
    };
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await apiService.logout();
    
    if (response.error) {
      return { success: false, error: response.error };
    }
    
    localStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  } catch (error) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Logout failed' 
    };
  }
};

export const checkAuthStatus = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await apiService.getCurrentUser();
    
    if (response.error) {
      localStorage.removeItem(CURRENT_USER_KEY);
      return { success: false, error: response.error };
    }
    
    if (response.data?.user) {
      const user = response.data.user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Authentication failed' };
  } catch (error) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Authentication check failed' 
    };
  }
};