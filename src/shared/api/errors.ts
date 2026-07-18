import { isAxiosError } from 'axios';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
}

export function getApiValidationErrors(err: unknown): string | null {
  if (isAxiosError(err) && err.response?.status === 422 && err.response?.data?.errors) {
    const firstError = Object.values(err.response.data.errors)[0];
    if (Array.isArray(firstError) && firstError.length > 0) {
      return String(firstError[0]);
    }
  }
  return null;
}
