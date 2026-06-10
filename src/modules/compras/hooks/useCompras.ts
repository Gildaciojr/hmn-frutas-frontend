import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/core/http/api";

import type { FazendaFornecedor } from "@/modules/fornecedores/services/fornecedores.service";

export type ModeloCaminhao = "TRUCK" | "BITRUCK" | "CARRETA";

export type TipoDescontoCompra =
  | "AUTOMATICO_MODELO"
  | "PERCENTUAL"
  | "MANUAL_KG";

export type StatusCompra = "ABERTA" | "FECHADA" | "CANCELADA";

export type QualidadeFrutaCompra = "GRAUDA" | "MEDIA" | "MIUDA";

////////////////////////////////////////////////////////////
// LEGADO
////////////////////////////////////////////////////////////

export interface CompraCliente {
  id: string;

  nome: string;

  telefone?: string | null;

  documento?: string | null;

  endereco?: string | null;
}

////////////////////////////////////////////////////////////
// FORNECEDOR
////////////////////////////////////////////////////////////

export interface CompraFornecedor {
  id: string;

  nome: string;

  sobrenome?: string | null;

  telefone?: string | null;

  estado?: string | null;
}

export interface Compra {
  id: string;

  ////////////////////////////////////////////////////////////
  // LEGADO (VENDAS / COMPATIBILIDADE)
  ////////////////////////////////////////////////////////////

  clienteId?: string | null;

  cliente?: CompraCliente | null;

  ////////////////////////////////////////////////////////////
  // NOVO DOMÍNIO COMPRAS
  ////////////////////////////////////////////////////////////

  fornecedorId?: string | null;

  fornecedor?: CompraFornecedor | null;

  fazendaFornecedorId?: string | null;

  fazendaFornecedor?: FazendaFornecedor | null;

  ////////////////////////////////////////////////////////////
  // AUDITORIA
  ////////////////////////////////////////////////////////////

  usuarioResponsavelId?: string | null;

  usuarioResponsavelNome?: string | null;

  ////////////////////////////////////////////////////////////
  // SNAPSHOTS
  ////////////////////////////////////////////////////////////

  clienteNomeSnapshot: string;

  clienteTelefoneSnapshot?: string | null;

  clienteDocumentoSnapshot?: string | null;

  clienteEnderecoSnapshot?: string | null;

  ////////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  ////////////////////////////////////////////////////////////

  safra?: string | null;
  dataCompra: string;

  ////////////////////////////////////////////////////////////
  // CAMINHÃO
  ////////////////////////////////////////////////////////////

  modeloCaminhao: ModeloCaminhao;
  placa: string;
  numeroFolha?: string | null;

  ////////////////////////////////////////////////////////////
  // CONTROLE INTERNO HMN
  ////////////////////////////////////////////////////////////

  controleInterno?: boolean | null;

  qualidadeFruta?: QualidadeFrutaCompra | null;

  cargueiro?: string | null;

  motoristaNome?: string | null;

  motoristaTelefone?: string | null;

  icmsOutros?: string | number | null;

  ////////////////////////////////////////////////////////////
  // PESAGEM
  ////////////////////////////////////////////////////////////

  kgBruto: number;
  quantidadeFrutas: number;
  mediaFruta: number;

  ////////////////////////////////////////////////////////////
  // DESCONTO
  ////////////////////////////////////////////////////////////

  tipoDesconto: TipoDescontoCompra;

  descontoPercentualAplicado?: number | null;

  descontoKgManual?: number | null;

  descontoKgCalculado: number;

  ////////////////////////////////////////////////////////////
  // RESULTADO PESAGEM
  ////////////////////////////////////////////////////////////

  kgDescontado: number;
  kgLiquido: number;

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  precoKg: string | number;

  totalBruto: string | number;

  despesas: string | number;

  valorTotal: string | number;

  ////////////////////////////////////////////////////////////
  // LEGADO
  ////////////////////////////////////////////////////////////

  caminhoes: number;

  descontoKg?: number | null;

  descontoValor?: number | null;

  ////////////////////////////////////////////////////////////
  // STATUS
  ////////////////////////////////////////////////////////////

  status: StatusCompra;

  canceladoEm?: string | null;

  motivoCancelamento?: string | null;

  ////////////////////////////////////////////////////////////
  // OBS
  ////////////////////////////////////////////////////////////

  observacoes?: string | null;

  transacoes?: {
    id: string;

    valorPago?: string | number | null;

    valorRestante?: string | number | null;
  }[];

  ////////////////////////////////////////////////////////////
  // TIMESTAMPS
  ////////////////////////////////////////////////////////////

  createdAt: string;

  updatedAt: string;
}

export interface CreateCompraPayload {
  ////////////////////////////////////////////////////////////
  // NOVO FLUXO COMPRAS
  ////////////////////////////////////////////////////////////

  fornecedorId: string;

  fazendaFornecedorId: string;

  ////////////////////////////////////////////////////////////
  // LEGADO / COMPATIBILIDADE
  ////////////////////////////////////////////////////////////

  clienteId?: string;

  ////////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  ////////////////////////////////////////////////////////////

  safra?: string;

  dataCompra: string;

  ////////////////////////////////////////////////////////////
  // CAMINHÃO
  ////////////////////////////////////////////////////////////

  modeloCaminhao: ModeloCaminhao;

  placa: string;

  numeroFolha?: string;

  ////////////////////////////////////////////////////////////
  // CONTROLE INTERNO HMN
  ////////////////////////////////////////////////////////////

  controleInterno?: boolean;

  qualidadeFruta?: QualidadeFrutaCompra;

  cargueiro?: string;

  motoristaNome?: string;

  motoristaTelefone?: string;

  icmsOutros?: number;

  ////////////////////////////////////////////////////////////
  // PESAGEM
  ////////////////////////////////////////////////////////////

  kgBruto: number;

  quantidadeFrutas: number;

  ////////////////////////////////////////////////////////////
  // DESCONTO
  ////////////////////////////////////////////////////////////

  tipoDesconto: TipoDescontoCompra;

  descontoPercentualAplicado?: number;

  descontoKgManual?: number;

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  precoKg: number;

  despesas?: number;

  valorTotal?: number;

  ////////////////////////////////////////////////////////////
  // LEGADO
  ////////////////////////////////////////////////////////////

  caminhoes?: number;

  ////////////////////////////////////////////////////////////
  // OBS
  ////////////////////////////////////////////////////////////

  observacoes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

async function getCompras(): Promise<Compra[]> {
  const response = await api.get<ApiResponse<Compra[]>>("/compras");

  return response.data.data;
}

async function getCompra(id: string): Promise<Compra> {
  const response = await api.get<ApiResponse<Compra>>(`/compras/${id}`);

  return response.data.data;
}

async function createCompra(payload: CreateCompraPayload): Promise<Compra> {
  const response = await api.post<ApiResponse<Compra>>("/compras", payload);

  return response.data.data;
}

async function updateCompra(
  id: string,
  payload: UpdateCompraPayload,
): Promise<Compra> {
  const response = await api.patch<ApiResponse<Compra>>(
    `/compras/${id}`,
    payload,
  );

  return response.data.data;
}

////////////////////////////////////////////////////////////
// UPDATE PAYLOAD
////////////////////////////////////////////////////////////

export type UpdateCompraPayload = Partial<CreateCompraPayload>;

export function useCompra(id?: string) {
  return useQuery({
    queryKey: ["compra", id],

    queryFn: () => getCompra(id!),

    enabled: !!id,

    staleTime: 1000 * 10,

    refetchOnWindowFocus: false,
  });
}

export function useCompras() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["compras"],
    queryFn: getCompras,
    staleTime: 1000 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: createCompra,

    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["compras"] }),
        queryClient.refetchQueries({ queryKey: ["compras-dashboard"] }),
        queryClient.refetchQueries({ queryKey: ["admin-dashboard"] }),
        queryClient.refetchQueries({ queryKey: ["financeiro-resumo"] }),
        queryClient.refetchQueries({ queryKey: ["financeiro-fluxo"] }),
        queryClient.refetchQueries({ queryKey: ["clientes"] }),
        queryClient.refetchQueries({ queryKey: ["clientes-resumo"] }),
        queryClient.refetchQueries({ queryKey: ["estoque-resumo"] }),
        queryClient.refetchQueries({
          queryKey: ["fornecedor-historico"],
        }),

        queryClient.refetchQueries({
          queryKey: ["fornecedor-resumo"],
        }),

        queryClient.refetchQueries({
          queryKey: ["fornecedor-financeiro"],
        }),

        queryClient.refetchQueries({
          queryKey: ["compras-relatorio"],
        }),
      ]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCompraPayload;
    }) => updateCompra(id, payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["compras"] }),
        queryClient.refetchQueries({ queryKey: ["compras-dashboard"] }),
        queryClient.refetchQueries({ queryKey: ["admin-dashboard"] }),
        queryClient.refetchQueries({ queryKey: ["financeiro-resumo"] }),
        queryClient.refetchQueries({ queryKey: ["financeiro-fluxo"] }),
        queryClient.refetchQueries({ queryKey: ["clientes"] }),
        queryClient.refetchQueries({ queryKey: ["clientes-resumo"] }),
        queryClient.refetchQueries({ queryKey: ["estoque-resumo"] }),
        queryClient.refetchQueries({
          queryKey: ["fornecedor-historico"],
        }),

        queryClient.refetchQueries({
          queryKey: ["fornecedor-resumo"],
        }),

        queryClient.refetchQueries({
          queryKey: ["fornecedor-financeiro"],
        }),

        queryClient.refetchQueries({
          queryKey: ["compras-relatorio"],
        }),
      ]);
    },
  });

  return {
    compras: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    createCompra: mutation.mutateAsync,
    creating: mutation.isPending,

    updateCompra: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}
