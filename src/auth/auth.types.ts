// src/auth/auth.types.ts

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string; // Laravel debe devolver esto (o cambia el nombre luego)
  user?: {
    id: string | number;
    name?: string;
    email?: string;
  };
}
