import { api } from './api';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', credentials);
  },

  async getMe(): Promise<User> {
    return api.get<User>('/auth/me');
  },
};
