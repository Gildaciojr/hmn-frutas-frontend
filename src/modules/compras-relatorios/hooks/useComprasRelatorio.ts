"use client";

import { useQuery } from "@tanstack/react-query";

import {
  searchCompras,
  type SearchCompraParams,
} from "../services/compras-relatorios.service";

export function useComprasRelatorio(
  filters: SearchCompraParams,
  enabled = false,
) {
  const query = useQuery({
    queryKey: [
      "compras-relatorio",
      filters,
    ],

    queryFn: () =>
      searchCompras(filters),

    enabled,

    staleTime: 1000 * 30,

    refetchOnWindowFocus: false,
  });

  return {
    compras: query.data ?? [],

    loading: query.isLoading,

    error: query.error as Error | null,

    refetch: query.refetch,
  };
}