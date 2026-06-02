import { api } from "@/core/http/api";

export interface FinanceiroResumoResponse {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

export interface FluxoFinanceiroItem {
  id: string;

  clienteId?: string | null;

  tipo: "ENTRADA" | "SAIDA";

  valor: string | number;

  descricao?: string | null;

  compraId?: string | null;

  vendaId?: string | null;

  createdAt: string;

  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
  } | null;

  fornecedor?: {
    id: string;
    nome: string;
    telefone?: string;
  } | null;
}

////////////////////////////////////////////////////////////
// PAGAMENTO TRANSAÇÃO
////////////////////////////////////////////////////////////

export interface PagamentoTransacaoItem {
  id: string;

  transacaoId: string;

  clienteId?: string | null;

  valor: string | number;

  valorRestanteApos?: string | number | null;

  formaPagamento:
    | "DINHEIRO"
    | "PIX"
    | "TRANSFERENCIA"
    | "BOLETO"
    | "CARTAO"
    | "CHEQUE"
    | "PROMISSORIA"
    | "OUTRO";

  pagoEm?: string | null;

  vencimento?: string | null;

  observacoes?: string | null;

  createdAt: string;
}

////////////////////////////////////////////////////////////
// REGISTRAR PAGAMENTO
////////////////////////////////////////////////////////////

export interface RegistrarPagamentoPayload {
  valor: number;

  formaPagamento:
    | "DINHEIRO"
    | "PIX"
    | "TRANSFERENCIA"
    | "BOLETO"
    | "CARTAO"
    | "CHEQUE"
    | "PROMISSORIA"
    | "OUTRO";

  pagoEm?: string;

  vencimento?: string;

  observacoes?: string;
}

export async function getFinanceiroResumo(): Promise<FinanceiroResumoResponse> {
  const response = await api.get("/financeiro/resumo");
  return response.data.data;
}

export async function getFluxoFinanceiro(): Promise<FluxoFinanceiroItem[]> {
  const response = await api.get("/financeiro/fluxo");
  return response.data.data;
}

////////////////////////////////////////////////////////////
// PAGAMENTOS TRANSAÇÃO
////////////////////////////////////////////////////////////

export async function getPagamentosTransacao(
  transacaoId: string,
): Promise<PagamentoTransacaoItem[]> {
  const response = await api.get(
    `/financeiro/transacao/${transacaoId}/pagamentos`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// REGISTRAR PAGAMENTO
////////////////////////////////////////////////////////////

export async function registrarPagamentoFinanceiro(
  transacaoId: string,
  data: RegistrarPagamentoPayload,
) {
  const response = await api.post(
    `/financeiro/transacao/${transacaoId}/pagamento`,
    data,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// PAGAMENTOS CLIENTE
////////////////////////////////////////////////////////////

export async function getPagamentosCliente(clienteId: string) {
  const response = await api.get(`/financeiro/cliente/${clienteId}/pagamentos`);

  return response.data.data;
}
