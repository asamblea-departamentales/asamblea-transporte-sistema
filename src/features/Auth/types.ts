export interface User {
  id: number;
  name: string;
  email: string;
  roles?: string[];
}

export interface LoginResponse {
  message?: string;
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
