import { api } from "@/core/http/api";

import type { Compra } from "@/modules/compras/hooks/useCompras";

export interface SearchCompraParams {
  fornecedor?: string;

  fornecedorId?: string;

  fazenda?: string;

  fazendaId?: string;

  placa?: string;

  numeroFolha?: string;

  status?: string;

  dataInicio?: string;

  dataFim?: string;
}

interface ApiResponse<T> {
  success: boolean;

  data: T;
}

export async function searchCompras(
  params: SearchCompraParams,
): Promise<Compra[]> {
  const response =
    await api.get<ApiResponse<Compra[]>>(
      "/compras/search",
      {
        params,
      },
    );

  return response.data.data;
}