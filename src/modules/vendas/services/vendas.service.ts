import { api } from "@/core/http/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ================= TYPES =================

export interface VendaCliente {
  id: string;

  nome: string;

  telefone?: string;
}

export interface Venda {
  //////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  //////////////////////////////////////////////////

  id: string;

  clienteId: string;

  usuarioResponsavelId?: string | null;

  usuarioResponsavelNome?: string | null;

  numeroPedido?: string | null;

  numeroRomaneio?: string | null;

  //////////////////////////////////////////////////
  // CLIENTE
  //////////////////////////////////////////////////

  cliente?: VendaCliente;

  //////////////////////////////////////////////////
  // LOGÍSTICA
  //////////////////////////////////////////////////

  dataVenda?: string;

  produto?: string | null;

  qualidade?: string | null;

  cidade?: string | null;

  telefone?: string | null;

  localEntrega?: string | null;

  //////////////////////////////////////////////////
  // ROMANEIO
  //////////////////////////////////////////////////

  destino?: string | null;

  tipoFrete?: "CIF" | "FOB" | null;

  //////////////////////////////////////////////////
  // CAMINHÃO
  //////////////////////////////////////////////////

  placa?: string | null;

  modeloCaminhao?: "TRUCK" | "BITRUCK" | "CARRETA" | null;

  //////////////////////////////////////////////////
  // MOTORISTA
  //////////////////////////////////////////////////

  motoristaNome?: string | null;

  motoristaTelefone?: string | null;

  motoristaCpf?: string | null;

  //////////////////////////////////////////////////
  // PESAGEM
  //////////////////////////////////////////////////

  pesoBruto?: number | null;

  pesoDesconto?: number | null;

  pesoLiquido?: number | null;

  quantidadeFrutas?: number | null;

  mediaFruta?: number | null;

  //////////////////////////////////////////////////
  // ESTOQUE
  //////////////////////////////////////////////////

  quantidadeKg: number;

  //////////////////////////////////////////////////
  // FINANCEIRO
  //////////////////////////////////////////////////

  precoMelancia?: string | number;

  observacaoPreco?: string | null;

  precoMercado?: string | number | null;

  precoFrete?: string | number | null;

  valorPorKg?: string | number;

  precoFinal?: string | number | null;

  descontoFruta?: string | number | null;

  descontoValor?: string | number | null;

  icmsOutros?: string | number | null;

  valorMelancia?: string | number;

  freteTotal?: string | number;

  valorTotal: string | number;

  //////////////////////////////////////////////////
  // STATUS
  //////////////////////////////////////////////////

  statusPagamento: "PAGO" | "PENDENTE" | "PARCIAL";

  status: "ABERTA" | "FATURADA" | "ENTREGUE" | "CANCELADA";

  //////////////////////////////////////////////////
  // OBSERVAÇÕES
  //////////////////////////////////////////////////

  observacoes?: string | null;

  //////////////////////////////////////////////////
  // CONTROLE
  //////////////////////////////////////////////////

  createdAt: string;

  updatedAt: string;

  //////////////////////////////////////////////////
  // FINANCEIRO GRANULAR
  //////////////////////////////////////////////////

  transacoes?: {
    id: string;

    tipo: "ENTRADA" | "SAIDA";

    valor: string | number;

    valorPago?: string | number | null;

    valorRestante?: string | number | null;

    statusFinanceiro?: "PENDENTE" | "PARCIAL" | "PAGO";

    formaPagamento?:
      | "DINHEIRO"
      | "PIX"
      | "TRANSFERENCIA"
      | "BOLETO"
      | "CARTAO"
      | "CHEQUE"
      | "PROMISSORIA"
      | "OUTRO"
      | null;

    vencimento?: string | null;

    pagoEm?: string | null;

    descricao?: string | null;

    pagamentos?: {
      id: string;

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

      observacoes?: string | null;

      createdAt: string;
    }[];
  }[];
}

// ================= PAYLOAD =================

export interface CreateVendaPayload {
  //////////////////////////////////////////////////
  // CLIENTE
  //////////////////////////////////////////////////

  clienteId: string;

  //////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  //////////////////////////////////////////////////

  numeroPedido?: string;

  dataVenda?: string;

  produto?: string;

  qualidade?: string;

  //////////////////////////////////////////////////
  // ENTREGA
  //////////////////////////////////////////////////

  cidade?: string;

  telefone?: string;

  localEntrega?: string;

  //////////////////////////////////////////////////
  // ROMANEIO
  //////////////////////////////////////////////////

  destino?: string;

  tipoFrete?: "CIF" | "FOB";

  //////////////////////////////////////////////////
  // CAMINHÃO
  //////////////////////////////////////////////////

  placa?: string;

  modeloCaminhao?: "TRUCK" | "BITRUCK" | "CARRETA";

  //////////////////////////////////////////////////
  // MOTORISTA
  //////////////////////////////////////////////////

  motoristaNome?: string;

  motoristaTelefone?: string;

  motoristaCpf?: string;

  //////////////////////////////////////////////////
  // PESAGEM
  //////////////////////////////////////////////////

  pesoBruto: number;

  pesoDesconto?: number;

  pesoLiquido?: number;

  quantidadeFrutas?: number;

  mediaFruta?: number;

  //////////////////////////////////////////////////
  // ESTOQUE
  //////////////////////////////////////////////////

  quantidadeKg?: number;

  //////////////////////////////////////////////////
  // FINANCEIRO
  //////////////////////////////////////////////////

  precoMelancia: number;

  observacaoPreco?: string;

  precoMercado?: number;

  precoFrete?: number;

  valorPorKg?: number;

  precoFinal?: number;

  descontoFruta?: number;

  descontoValor?: number;

  icmsOutros?: number;

  valorMelancia?: number;

  freteTotal?: number;

  valorTotal?: number;

  //////////////////////////////////////////////////
  // PAGAMENTO
  //////////////////////////////////////////////////

  statusPagamento?: "PAGO" | "PENDENTE" | "PARCIAL";

  //////////////////////////////////////////////////
  // VENCIMENTO
  //////////////////////////////////////////////////

  vencimento?: string;

  //////////////////////////////////////////////////
  // OBSERVAÇÕES
  //////////////////////////////////////////////////

  observacoes?: string;
}

// ================= REQUESTS =================

export async function getVendas(): Promise<Venda[]> {
  const response = await api.get<ApiResponse<Venda[]>>("/vendas");

  return response.data.data;
}

export async function getVenda(vendaId: string): Promise<Venda> {
  const response = await api.get<ApiResponse<Venda>>(`/vendas/${vendaId}`);

  return response.data.data;
}

export async function getVendaByPedido(numeroPedido: string): Promise<Venda> {
  const response = await api.get<ApiResponse<Venda>>(
    `/vendas/pedido/${numeroPedido}`,
  );

  return response.data.data;
}

export async function getVendaByRomaneio(
  numeroRomaneio: string,
): Promise<Venda> {
  const response = await api.get<ApiResponse<Venda>>(
    `/vendas/romaneio/${numeroRomaneio}`,
  );

  return response.data.data;
}

export async function createVenda(payload: CreateVendaPayload): Promise<Venda> {
  const response = await api.post<ApiResponse<Venda>>("/vendas", payload);

  return response.data.data;
}

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

export function parseMoney(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value);
}
