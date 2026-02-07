// src/auth/auth.types.ts

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string | number;
    name?: string;
    email?: string;
    roles?: string[];
  };
}
