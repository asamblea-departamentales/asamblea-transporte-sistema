import { axiosClient } from '../../../shared/api/axiosClient';
import { LoginCredentials, LoginResponse, User } from '../types';

type RecordValue = Record<string, unknown>;

const isRecord = (value: unknown): value is RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const stringValue = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosClient.post<unknown>('/auth/login', credentials);
    const resData = isRecord(response.data) ? response.data : {};

    if (resData.success === false || resData.status === 'error' || resData.error) {
      const msg = stringValue(resData.message) ?? stringValue(resData.error) ?? 'Credenciales invÃ¡lidas.';
      throw new Error(msg);
    }

    const payload = isRecord(resData.data) ? resData.data : resData;
    const user = payload.user ?? resData.user ?? null;
    const token = stringValue(payload.token) ??
      stringValue(payload.access_token) ??
      stringValue(resData.token) ??
      stringValue(resData.access_token) ??
      '';

    if (!isRecord(user) || !token) {
      throw new Error(stringValue(resData.message) ?? 'Credenciales invÃ¡lidas o respuesta incompleta.');
    }

    return {
      message: stringValue(resData.message),
      user: user as unknown as User,
      token
    };
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<unknown>('/auth/me');
    const resData = isRecord(response.data) ? response.data : {};
    const nestedData = isRecord(resData.data) ? resData.data : null;
    const user = nestedData?.user ?? nestedData ?? resData.user ?? resData;

    if (!isRecord(user)) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    return user as unknown as User;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  }
};
