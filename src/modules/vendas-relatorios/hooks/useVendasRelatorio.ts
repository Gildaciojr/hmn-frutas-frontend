"use client";
import { useQuery } from "@tanstack/react-query";
import {
  searchVendas,
  type SearchVendaParams,
} from "../services/vendas-relatorios.service";

export function useVendasRelatorio(
  filters: SearchVendaParams,
  enabled = false,
) {
  const query = useQuery({
    queryKey: ["vendas-relatorio", filters],
    queryFn: () => searchVendas(filters),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  return {
    vendas: query.data?.items ?? [],
    summary: query.data?.summary,
    pagination: query.data?.pagination,
    loading: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
