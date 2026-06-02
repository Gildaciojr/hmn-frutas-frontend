import { api } from "./api";

let interceptorInitialized = false;

export function setupInterceptor(
  getToken: () => string | null,
) {
  if (interceptorInitialized) {
    return;
  }

  interceptorInitialized = true;

  api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers ?? {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}