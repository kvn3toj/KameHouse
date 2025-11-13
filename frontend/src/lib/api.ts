import { API_BASE_URL } from '@/config/api.config';

const API_URL = API_BASE_URL;

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    // If no content or content-length is 0, return null
    if (contentLength === '0' || response.status === 204) {
      return null as T;
    }

    // Only parse as JSON if content-type indicates JSON
    if (contentType?.includes('application/json')) {
      const text = await response.text();
      // Handle empty response body
      if (!text || text.trim() === '') {
        return null as T;
      }
      return JSON.parse(text);
    }

    // For other content types, try to parse as JSON anyway (backward compatibility)
    const text = await response.text();
    if (!text || text.trim() === '') {
      return null as T;
    }
    return JSON.parse(text);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
