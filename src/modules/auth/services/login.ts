import { api } from "@/core/http/api";

////////////////////////////////////////////////////////////
// RESPONSE
////////////////////////////////////////////////////////////

interface LoginResponse {
  success: boolean;

  data: {
    access_token: string;
  };
}

////////////////////////////////////////////////////////////
// LOGIN
////////////////////////////////////////////////////////////

export async function login(
  email: string,
  senha: string,
): Promise<string> {
  const response =
    await api.post<LoginResponse>(
      "/auth/login",
      {
        email,
        senha,
      },
    );

  return response.data.data.access_token;
}