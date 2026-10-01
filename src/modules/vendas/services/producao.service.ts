import { api } from "@/core/http/api";

export interface ProducaoFilters {
  dataInicial: string;
  dataFinal: string;
  tipo: "COMPRAS" | "VENDAS" | "AMBOS";
  usuarioId?: string;
}

interface ProducaoOperation {
  id: string;
  placa?: string | null;
  modeloCaminhao?: string | null;
  usuarioResponsavelNome?: string | null;
  clienteNomeSnapshot?: string | null;
  valorTotal: string | number;
}

export interface ProducaoReport {
  filtros: ProducaoFilters;
  periodo: { dataInicio: string; dataFim: string };
  usuarioSelecionado: string;
  emissor?: string;
  usuariosDisponiveis: { id: string; nome: string }[];
  totais: {
    compras: number;
    vendas: number;
    kgComprado: number;
    kgVendido: number;
    valorComprado: number;
    valorVendido: number;
  };
  producaoPorUsuario: {
    usuarioId: string | null;
    usuarioNome: string;
    quantidadeCompras: number;
    quantidadeVendas: number;
    kgComprado: number;
    kgVendido: number;
    valorComprado: number;
    valorVendido: number;
  }[];
  compras: (ProducaoOperation & {
    dataCompra: string;
    numeroFolha?: string | null;
    kgLiquido: number;
    fornecedor?: { nome: string } | null;
  })[];
  vendas: (ProducaoOperation & {
    dataVenda: string;
    numeroPedido?: string | null;
    numeroRomaneio?: string | null;
    pesoLiquido: number;
    cliente?: { nome: string } | null;
  })[];
}

export function getProducaoParams(filters: ProducaoFilters): URLSearchParams {
  const params = new URLSearchParams({
    dataInicial: filters.dataInicial,
    dataFinal: filters.dataFinal,
    tipo: filters.tipo,
  });
  if (filters.usuarioId) params.set("usuarioId", filters.usuarioId);
  return params;
}

export async function getProducao(filters: ProducaoFilters): Promise<ProducaoReport> {
  const response = await api.get<{ success: boolean; data: ProducaoReport }>(
    `/financeiro/producao?${getProducaoParams(filters).toString()}`,
  );
  return response.data.data;
}
