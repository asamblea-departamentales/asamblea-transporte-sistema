import { axiosClient } from '../../../shared/api/axiosClient';
import { LoginCredentials, LoginResponse, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosClient.post<any>('/auth/login', credentials);
    const resData = response.data;

    // Si la API devuelve status 200 pero indica un error en el cuerpo
    if (resData && (resData.success === false || resData.status === 'error' || resData.error)) {
      const msg = resData.message || resData.error || 'Credenciales inválidas.';
      throw new Error(msg);
    }

    // Extraer payload soportando tanto estructuras planas como anidadas { data: { user, token } }
    const payload = resData?.data && typeof resData.data === 'object' ? resData.data : resData;
    
    const user = payload?.user || resData?.user || null;
    const token = payload?.token || payload?.access_token || resData?.token || resData?.access_token || '';

    if (!user || !token) {
      const msg = resData?.message || 'Credenciales inválidas o respuesta del servidor incompleta.';
      throw new Error(msg);
    }

    return {
      message: resData?.message,
      user,
      token,
    };
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<any>('/auth/me');
    const resData = response.data;
    const user = resData?.data?.user || resData?.data || resData?.user || resData;
    if (!user || typeof user !== 'object') {
      throw new Error('No se pudo obtener el perfil del usuario');
    }
    return user as User;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  }
};
