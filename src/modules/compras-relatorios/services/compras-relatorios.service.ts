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
  page?: number;
  pageSize?: number;
}

export interface ComprasReportSummary {
  operacoes: number;
  kgLiquido: number;
  valorLiquido: number;
  precoComercialMedioKg: number;
  ticketMedioLiquido: number;
}

export interface ComprasReportResponse {
  items: Compra[];
  summary: ComprasReportSummary;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;

  data: T;
}

export async function searchCompras(
  params: SearchCompraParams,
): Promise<ComprasReportResponse> {
  const response =
    await api.get<ApiResponse<ComprasReportResponse>>(
      "/compras/search",
      {
        params: { ...params, page: params.page ?? 1, pageSize: params.pageSize ?? 25 },
      },
    );

  return response.data.data;
}
