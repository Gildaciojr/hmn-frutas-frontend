import { api } from "@/core/http/api";

export type StatusVendaRelatorio =
  | "ABERTA"
  | "FATURADA"
  | "ENTREGUE"
  | "CANCELADA";
export type StatusPagamentoRelatorio = "PENDENTE" | "PARCIAL" | "PAGO";
export interface SearchVendaParams {
  cliente?: string;
  clienteId?: string;
  placa?: string;
  numeroPedido?: string;
  numeroRomaneio?: string;
  status?: StatusVendaRelatorio;
  statusPagamento?: StatusPagamentoRelatorio;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  pageSize?: number;
}
export interface VendaRelatorioItem {
  id: string;
  clienteId: string | null;
  cliente: { id: string; nome: string } | null;
  clienteNomeSnapshot: string;
  dataVenda: string;
  numeroPedido: string | null;
  numeroRomaneio: string | null;
  placa: string | null;
  pesoLiquido: number;
  valorPorKg: number | string;
  valorMelancia: number | string;
  valorTotal: number | string;
  status: StatusVendaRelatorio;
  statusPagamento: StatusPagamentoRelatorio;
}
export interface VendasReportSummary {
  operacoes: number;
  kgLiquidoVendido: number;
  valorLiquidoVendido: number;
  precoComercialMedioKg: number;
  ticketMedioLiquido: number;
}
export interface VendasReportResponse {
  items: VendaRelatorioItem[];
  summary: VendasReportSummary;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
export async function searchVendas(
  params: SearchVendaParams,
): Promise<VendasReportResponse> {
  const response = await api.get<{
    success: boolean;
    data: VendasReportResponse;
  }>("/vendas/search", {
    params: {
      ...params,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 25,
    },
  });
  return response.data.data;
}
