import { Trade, PaginatedTrades } from '../types/Trade';

// Use environment variable for API URL, fallback to deployed URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trading-journal-0mup.onrender.com/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for session
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; message: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; message: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/status');
  }

  async changePassword(passwords: {
    current_password: string;
    new_password: string;
  }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  async updateProfile(profileData: {
    username?: string;
    email?: string;
  }): Promise<ApiResponse<{ user: any; message: string }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteAccount(password: string): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/delete-account', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }

  // Trade endpoints
  async getTrades(page: number = 1, perPage: number = 10): Promise<ApiResponse<PaginatedTrades>> {
    return this.request(`/trades/?page=${page}&per_page=${perPage}`);
  }

  async createTrade(tradeData: Omit<Trade, 'id'>): Promise<ApiResponse<Trade>> {
    return this.request('/trades/', {
      method: 'POST',
      body: JSON.stringify(tradeData),
    });
  }

  async getTrade(tradeId: number): Promise<ApiResponse<Trade>> {
    return this.request(`/trades/${tradeId}`);
  }

  async updateTrade(
    tradeId: number,
    tradeData: Partial<Omit<Trade, 'id'>>
  ): Promise<ApiResponse<Trade>> {
    return this.request(`/trades/${tradeId}`, {
      method: 'PUT',
      body: JSON.stringify(tradeData),
    });
  }

  async deleteTrade(tradeId: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/trades/${tradeId}`, {
      method: 'DELETE',
    });
  }

  async getAnalytics(): Promise<ApiResponse<{
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    win_rate: number;
    total_pnl: number;
    average_pnl: number;
    best_trade: Trade | null;
    worst_trade: Trade | null;
  }>> {
    return this.request('/trades/analytics');
  }

  // User preferences endpoints
  async getPreferences(): Promise<ApiResponse<{ preferences: any }>> {
    return this.request('/users/preferences');
  }

  async updatePreferences(preferences: {
    default_currency?: string;
    default_timeframe?: string;
    dark_mode?: boolean;
    notifications_enabled?: boolean;
  }): Promise<ApiResponse<{ preferences: any; message: string }>> {
    return this.request('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  async importDemoData(): Promise<ApiResponse<{ message: string }>> {
    return this.request('/trades/seed', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();

// Trade API wrapper for easier usage
export const tradeApi = {
  async getTrades(page: number = 1, perPage: number = 50): Promise<PaginatedTrades> {
    const response = await apiService.getTrades(page, perPage);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  async createTrade(tradeData: Omit<Trade, 'id'>): Promise<Trade> {
    const response = await apiService.createTrade(tradeData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  async updateTrade(tradeId: number, tradeData: Partial<Omit<Trade, 'id'>>): Promise<Trade> {
    const response = await apiService.updateTrade(tradeId, tradeData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  async deleteTrade(tradeId: number): Promise<void> {
    const response = await apiService.deleteTrade(tradeId);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async getTrade(tradeId: number): Promise<Trade> {
    const response = await apiService.getTrade(tradeId);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data!;
  },

  async importDemoData(): Promise<void> {
    const response = await apiService.importDemoData();
    if (response.error) {
      throw new Error(response.error);
    }
  }
}; 