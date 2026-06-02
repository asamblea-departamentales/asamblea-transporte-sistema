// src/auth/auth.types.ts

export interface LoginPayload {
  username: string;
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
