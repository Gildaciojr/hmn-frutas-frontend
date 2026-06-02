import { api } from "@/core/http/api";

import { AlertaSistema } from "../types/alerta.types";

////////////////////////////////////////////////////////////
// API RESPONSE
////////////////////////////////////////////////////////////

interface ApiResponse<T> {
  success?: boolean;

  data: T;

  message?: string;
}

////////////////////////////////////////////////////////////
// GET ALERTAS
////////////////////////////////////////////////////////////

export async function getAlertas(
  params?: {
    somenteAtivos?: boolean;

    somenteNaoLidos?: boolean;

    limit?: number;
  },
): Promise<AlertaSistema[]> {
  const response = await api.get<
    ApiResponse<AlertaSistema[]>
  >("/alertas", {
    params: {
      ativos: params?.somenteAtivos,

      naoLidos:
        params?.somenteNaoLidos,

      limit: params?.limit,
    },
  });

  ////////////////////////////////////////////////////////////
  // NORMALIZA RESPONSE
  ////////////////////////////////////////////////////////////

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.data;
}

////////////////////////////////////////////////////////////
// MARCAR COMO LIDO
////////////////////////////////////////////////////////////

export async function marcarAlertaComoLido(
  id: string,
): Promise<void> {
  await api.patch(
    `/alertas/${id}/lido`,
  );
}

////////////////////////////////////////////////////////////
// RESOLVER ALERTA
////////////////////////////////////////////////////////////

export async function resolverAlerta(
  id: string,
): Promise<void> {
  await api.patch(
    `/alertas/${id}/resolver`,
  );
}