import { api } from "@/core/http/api";

////////////////////////////////////////////////////////////
// PAGAMENTO
////////////////////////////////////////////////////////////

export interface FornecedorPagamento {
  id: string;

  transacaoId: string;

  valor: string | number;

  formaPagamento:
    | "DINHEIRO"
    | "PIX"
    | "TRANSFERENCIA"
    | "BOLETO"
    | "CARTAO"
    | "CHEQUE"
    | "PROMISSORIA"
    | "OUTRO";

  observacoes?: string | null;

  pagoEm?: string | null;

  createdAt: string;
}

////////////////////////////////////////////////////////////
// TRANSAÇÃO
////////////////////////////////////////////////////////////

export interface FornecedorTransacao {
  id: string;

  descricao: string;

  valor: string | number;

  valorPago: string | number;

  valorRestante: string | number;

  statusFinanceiro: "PENDENTE" | "PARCIAL" | "PAGO" | "VENCIDO";

  vencimento?: string | null;

  createdAt: string;

  pagamentos: FornecedorPagamento[];
}

////////////////////////////////////////////////////////////
// RESUMO FINANCEIRO
////////////////////////////////////////////////////////////

export interface FornecedorFinanceiroResumo {
  totalComprado: number;

  totalPago: number;

  saldoDevedor: number;

  limiteFinanceiro: number;

  percentualLimite: number;
}

////////////////////////////////////////////////////////////
// FINANCEIRO COMPLETO
////////////////////////////////////////////////////////////

export interface FornecedorFinanceiroResponse {
  fornecedor: {
    id: string;

    nome: string;

    sobrenome?: string | null;

    telefone?: string | null;

    estado?: string | null;
  };

  resumo: FornecedorFinanceiroResumo;

  transacoes: FornecedorTransacao[];
}

////////////////////////////////////////////////////////////
// PAGAMENTOS RESPONSE
////////////////////////////////////////////////////////////

export interface FornecedorPagamentosResponse {
  fornecedor: {
    id: string;

    nome: string;

    sobrenome?: string | null;
  };

  resumo: {
    quantidadePagamentos: number;

    totalPago: number;
  };

  pagamentos: FornecedorPagamento[];
}

////////////////////////////////////////////////////////////
// REGISTRAR PAGAMENTO
////////////////////////////////////////////////////////////

export interface RegistrarPagamentoFornecedorPayload {
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

  observacoes?: string;

  pagoEm?: string;
}

////////////////////////////////////////////////////////////
// API RESPONSE
////////////////////////////////////////////////////////////

interface ApiResponse<T> {
  success: boolean;

  data: T;
}

////////////////////////////////////////////////////////////
// FINANCEIRO FORNECEDOR
////////////////////////////////////////////////////////////

export async function getFornecedorFinanceiro(
  fornecedorId: string,
): Promise<FornecedorFinanceiroResponse> {
  const response = await api.get<ApiResponse<FornecedorFinanceiroResponse>>(
    `/financeiro/fornecedor/${fornecedorId}`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// PAGAMENTOS FORNECEDOR
////////////////////////////////////////////////////////////

export async function getFornecedorPagamentos(
  fornecedorId: string,
): Promise<FornecedorPagamentosResponse> {
  const response = await api.get<ApiResponse<FornecedorPagamentosResponse>>(
    `/financeiro/fornecedor/${fornecedorId}/pagamentos`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// PAGAMENTOS TRANSAÇÃO
////////////////////////////////////////////////////////////

export async function getPagamentosTransacao(
  transacaoId: string,
): Promise<FornecedorPagamento[]> {
  const response = await api.get<ApiResponse<FornecedorPagamento[]>>(
    `/financeiro/transacao/${transacaoId}/pagamentos`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// REGISTRAR PAGAMENTO FORNECEDOR
////////////////////////////////////////////////////////////

export async function registrarPagamentoFornecedor(
  fornecedorId: string,
  payload: RegistrarPagamentoFornecedorPayload,
) {
  const response = await api.post(
    `/financeiro/fornecedor/${fornecedorId}/pagamento`,
    payload,
  );

  return response.data;
}
