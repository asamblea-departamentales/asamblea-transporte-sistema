import { axiosClient } from '../../../shared/api/axiosClient';
import { LoginCredentials, LoginResponse, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  }
};
