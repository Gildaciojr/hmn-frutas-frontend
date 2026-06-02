import { api } from "@/core/http/api";

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

export function parseDecimal(
  value: string | number | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value
    .replace(/\s/g, "")
    .replace(/\.(?=\d{3}(,|$))/g, "")
    .replace(",", ".");

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

////////////////////////////////////////////////////////////
// MODELS
////////////////////////////////////////////////////////////

export interface FazendaFornecedor {
  id: string;

  fornecedorId: string;

  nome: string;

  cidade?: string | null;

  estado?: string | null;

  observacoes?: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface Fornecedor {
  id: string;

  nome: string;

  sobrenome?: string | null;

  telefone?: string | null;

  estado?: string | null;

  observacoes?: string | null;

  limiteFinanceiroValor?: string | number | null;

  limiteFinanceiroDias?: number | null;

  _count?: {
    fazendas: number;
  },

  createdAt: string;

  updatedAt: string;
}

////////////////////////////////////////////////////////////
// COMPRA HISTÓRICO
////////////////////////////////////////////////////////////

export interface CompraFornecedorHistorico {
  id: string;

  fornecedorId: string;

  fazendaFornecedorId?: string | null;

  dataCompra: string;

  placa: string;

  numeroFolha?: string | null;

  kgBruto: number;

  kgLiquido: number;

  quantidadeFrutas: number;

  valorTotal: string | number;

  status: string;

  createdAt: string;
}

////////////////////////////////////////////////////////////
// ÚLTIMO PAGAMENTO
////////////////////////////////////////////////////////////

export interface UltimoPagamentoFornecedor {
  id: string;

  valor: string | number;

  formaPagamento: string;

  pagoEm?: string | null;

  createdAt: string;
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export interface FornecedorResumoResponse {
  fornecedor: Fornecedor & {
    fazendas: FazendaFornecedor[];
  };

  resumo: {
    totalCompras: number;

    totalComprado: number;

    totalKg: number;

    totalFrutas: number;

    quantidadeFazendas: number;

    limiteFinanceiroValor: number;

    limiteFinanceiroDias: number;

    alertasAtivos: number;

    ultimaCompra: CompraFornecedorHistorico | null;
  };

  compras: CompraFornecedorHistorico[];
}

////////////////////////////////////////////////////////////
// PAGAMENTO
////////////////////////////////////////////////////////////

export interface PagamentoFornecedor {
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

export interface TransacaoFornecedor {
  id: string;

  descricao: string;

  valor: string | number;

  valorPago: string | number;

  valorRestante: string | number;

  statusFinanceiro: "PENDENTE" | "PARCIAL" | "PAGO" | "VENCIDO";

  vencimento?: string | null;

  createdAt: string;

  pagamentos: PagamentoFornecedor[];

  compra?: CompraFornecedorHistorico;
}

////////////////////////////////////////////////////////////
// HISTÓRICO OPERACIONAL
////////////////////////////////////////////////////////////

export interface HistoricoOperacionalFornecedor {
  ////////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  ////////////////////////////////////////////////////////////

  compraId: string;

  numeroFolha?: string | null;

  statusCompra?: string;

  dataCompra: string;

  ////////////////////////////////////////////////////////////
  // FAZENDA
  ////////////////////////////////////////////////////////////

  fazenda?: string | null;

  ////////////////////////////////////////////////////////////
  // CAMINHÃO
  ////////////////////////////////////////////////////////////

  modeloCaminhao?: string | null;

  placa?: string | null;

  ////////////////////////////////////////////////////////////
  // PESAGEM
  ////////////////////////////////////////////////////////////

  kgBruto: number;

  quantidadeFrutas: number;

  mediaFruta: number;

  descontoKgCalculado: number;

  kgLiquido: number;

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  precoKg: number;

  totalBruto: number;

  despesas: number;

  valorTotal: number;

  ////////////////////////////////////////////////////////////
  // STATUS
  ////////////////////////////////////////////////////////////

  statusFinanceiro:
    | "PENDENTE"
    | "PARCIAL"
    | "PAGO"
    | "VENCIDO";

  valorPago: number;

  valorRestante: number;

  ////////////////////////////////////////////////////////////
  // PAGAMENTOS
  ////////////////////////////////////////////////////////////

  pagamentos: PagamentoFornecedor[];
}

////////////////////////////////////////////////////////////
// HISTÓRICO
////////////////////////////////////////////////////////////

export interface FornecedorHistoricoResponse {
  fornecedor: Fornecedor & {
    fazendas: FazendaFornecedor[];
  };

  resumo: {
    totalComprado: number;

    totalPago: number;

    saldoDevedor: number;

    limiteFinanceiro: number;

    percentualLimite: number;

    quantidadeCompras: number;

    quantidadePagamentos: number;

    ultimaCompra: CompraFornecedorHistorico | null;

    ultimoPagamento: UltimoPagamentoFornecedor | null;

    alertasAtivos: number;

    limiteFinanceiroDias: number;
  };

  compras: CompraFornecedorHistorico[];

  transacoes: TransacaoFornecedor[];

  historicoOperacional: HistoricoOperacionalFornecedor[];
}

////////////////////////////////////////////////////////////
// PAYLOADS
////////////////////////////////////////////////////////////

export interface CreateFornecedorPayload {
  nome: string;

  sobrenome?: string;

  telefone?: string;

  estado?: string;

  limiteFinanceiroValor?: number;

  limiteFinanceiroDias?: number;

  observacoes?: string;
}

export type UpdateFornecedorPayload = CreateFornecedorPayload;

////////////////////////////////////////////////////////////
// FAZENDA
////////////////////////////////////////////////////////////

export interface CreateFazendaPayload {
  nome: string;

  cidade?: string;

  estado?: string;

  observacoes?: string;
}

export type UpdateFazendaPayload = CreateFazendaPayload;

////////////////////////////////////////////////////////////
// API RESPONSE
////////////////////////////////////////////////////////////

interface ApiResponse<T> {
  success: boolean;

  data: T;
}

////////////////////////////////////////////////////////////
// FORNECEDORES
////////////////////////////////////////////////////////////

export async function getFornecedores(): Promise<Fornecedor[]> {
  const response = await api.get<ApiResponse<Fornecedor[]>>("/fornecedores");

  return response.data.data;
}

export async function getFornecedor(id: string): Promise<Fornecedor> {
  const response = await api.get<ApiResponse<Fornecedor>>(
    `/fornecedores/${id}`,
  );

  return response.data.data;
}

export async function createFornecedor(
  payload: CreateFornecedorPayload,
): Promise<Fornecedor> {
  const response = await api.post<ApiResponse<Fornecedor>>(
    "/fornecedores",
    payload,
  );

  return response.data.data;
}

export async function updateFornecedor(
  id: string,
  payload: UpdateFornecedorPayload,
): Promise<Fornecedor> {
  const response = await api.patch<ApiResponse<Fornecedor>>(
    `/fornecedores/${id}`,
    payload,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export async function getFornecedorResumo(
  fornecedorId: string,
): Promise<FornecedorResumoResponse> {
  const response = await api.get<ApiResponse<FornecedorResumoResponse>>(
    `/fornecedores/${fornecedorId}/resumo`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// HISTÓRICO
////////////////////////////////////////////////////////////

export async function getFornecedorHistorico(
  fornecedorId: string,
): Promise<FornecedorHistoricoResponse> {
  const response = await api.get<ApiResponse<FornecedorHistoricoResponse>>(
    `/fornecedores/${fornecedorId}/historico`,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// FAZENDAS
////////////////////////////////////////////////////////////

export async function getFazendasFornecedor(
  fornecedorId: string,
): Promise<FazendaFornecedor[]> {
  const response = await api.get<ApiResponse<FazendaFornecedor[]>>(
    `/fornecedores/${fornecedorId}/fazendas`,
  );

  return response.data.data;
}

export async function createFazenda(
  fornecedorId: string,
  payload: CreateFazendaPayload,
): Promise<FazendaFornecedor> {
  const response = await api.post<ApiResponse<FazendaFornecedor>>(
    `/fornecedores/${fornecedorId}/fazendas`,
    payload,
  );

  return response.data.data;
}

export async function updateFazenda(
  id: string,
  payload: UpdateFazendaPayload,
): Promise<FazendaFornecedor> {
  const response = await api.patch<ApiResponse<FazendaFornecedor>>(
    `/fornecedores/fazendas/${id}`,
    payload,
  );

  return response.data.data;
}
