const API_BASE_URL = 'http://localhost:5000/api';

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
    return this.request('/auth/me');
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
  async getTrades(page: number = 1, perPage: number = 10): Promise<ApiResponse<{
    trades: any[];
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
  }>> {
    return this.request(`/trades/?page=${page}&per_page=${perPage}`);
  }

  async createTrade(tradeData: {
    symbol: string;
    entry_price: number;
    exit_price: number;
    quantity: number;
    entry_date: string;
    trade_type?: string;
    strategy?: string;
    notes?: string;
  }): Promise<ApiResponse<{ trade: any; message: string }>> {
    return this.request('/trades/', {
      method: 'POST',
      body: JSON.stringify(tradeData),
    });
  }

  async getTrade(tradeId: string): Promise<ApiResponse<{ trade: any }>> {
    return this.request(`/trades/${tradeId}`);
  }

  async updateTrade(
    tradeId: string,
    tradeData: Partial<{
      symbol: string;
      entry_price: number;
      exit_price: number;
      quantity: number;
      date: string;
      trade_type: string;
      strategy: string;
      notes: string;
    }>
  ): Promise<ApiResponse<{ trade: any; message: string }>> {
    return this.request(`/trades/${tradeId}`, {
      method: 'PUT',
      body: JSON.stringify(tradeData),
    });
  }

  async deleteTrade(tradeId: string): Promise<ApiResponse<{ message: string }>> {
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
    best_trade: any;
    worst_trade: any;
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
}

export const apiService = new ApiService(); 