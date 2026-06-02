"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboard, getComprasDashboard } from "../services/dashboard";

// ======================================================
// TYPES
// ======================================================

export interface AdminDashboardData {
  totalComprado: number;

  totalKg: number;

  mediaCompra: number;

  clientesAtivos: number;
}

// ======================================================
// ÚLTIMAS COMPRAS
// ======================================================

export interface CompraOperacaoItem {
  /////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  /////////////////////////////////////////////////////////

  id: string;

  usuarioResponsavelId?: string | null;

  usuarioResponsavelNome?: string | null;

  numeroRomaneio: string | null;

  safra: string | null;

  status: string;

  createdAt: string;

  dataCompra: string;

  /////////////////////////////////////////////////////////
  // LEGADO
  /////////////////////////////////////////////////////////

  cliente?: {
    id: string;

    nome: string;

    telefone?: string | null;
  } | null;

  /////////////////////////////////////////////////////////
  // FORNECEDOR
  /////////////////////////////////////////////////////////

  fornecedor?: {
    id: string;

    nome: string;
  } | null;

  /////////////////////////////////////////////////////////
  // FAZENDA
  /////////////////////////////////////////////////////////

  fazendaFornecedor?: {
    id: string;

    nome: string;
  } | null;

  /////////////////////////////////////////////////////////
  // TRANSPORTE
  /////////////////////////////////////////////////////////

  placa: string;

  modeloCaminhao: string;

  /////////////////////////////////////////////////////////
  // PESAGEM
  /////////////////////////////////////////////////////////

  kgBruto: number;

  kgLiquido: number;

  kgDescontado: number;

  quantidadeFrutas: number;

  mediaFruta: number;

  /////////////////////////////////////////////////////////
  // DESCONTOS
  /////////////////////////////////////////////////////////

  tipoDesconto: string;

  descontoPercentualAplicado: number;

  descontoKgManual?: number | null;

  descontoKgCalculado: number;

  /////////////////////////////////////////////////////////
  // FINANCEIRO
  /////////////////////////////////////////////////////////

  precoKg: number;

  despesas: number;

  totalBruto: number;

  valorTotal: number;

  valorPago?: number;

  valorRestante?: number;

  /////////////////////////////////////////////////////////
  // OBS
  /////////////////////////////////////////////////////////

  numeroFolha?: string | null;

  observacoes?: string | null;
}

// ======================================================
// COMPRAS DASHBOARD
// ======================================================

export interface ComprasDashboardData {
  comprasHoje: number;

  kgMovimentado: number;

  mediaCompra: number;

  fornecedoresAtivos: number;

  totalFornecedores: number;

  totalFazendas: number;

  totalFrutas: number;

  mediaFrutaGeral: number;

  totalDespesasOperacionais: number;

  quantidadeDespesasOperacionais: number;

  totalOperacoes: number;

  // ====================================================
  // TIMELINE OPERACIONAL
  // ====================================================
  ultimasCompras: CompraOperacaoItem[];
}

// ======================================================
// FALLBACKS
// ======================================================

const EMPTY_ADMIN_DASHBOARD: AdminDashboardData = {
  totalComprado: 0,

  totalKg: 0,

  mediaCompra: 0,

  clientesAtivos: 0,
};

const EMPTY_COMPRAS_DASHBOARD: ComprasDashboardData = {
  comprasHoje: 0,

  kgMovimentado: 0,

  mediaCompra: 0,

  fornecedoresAtivos: 0,

  totalOperacoes: 0,

  totalFornecedores: 0,

  totalFazendas: 0,

  totalFrutas: 0,

  mediaFrutaGeral: 0,

  totalDespesasOperacionais: 0,

  quantidadeDespesasOperacionais: 0,

  ultimasCompras: [],
};

// ======================================================
// ADMIN DASHBOARD
// ======================================================

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: ["admin-dashboard"],

    queryFn: getAdminDashboard,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  return {
    data: query.data ?? EMPTY_ADMIN_DASHBOARD,

    loading: query.isLoading,

    error: query.error as Error | null,

    refetch: query.refetch,
  };
}

// ======================================================
// COMPRAS DASHBOARD
// ======================================================

export function useComprasDashboard() {
  const query = useQuery({
    queryKey: ["compras-dashboard"],

    queryFn: getComprasDashboard,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  return {
    data: query.data ?? EMPTY_COMPRAS_DASHBOARD,

    loading: query.isLoading,

    error: query.error as Error | null,

    refetch: query.refetch,
  };
}
