import { useQuery } from "@tanstack/react-query";
import {
  getFinanceiroResumo,
  getFluxoFinanceiro,
} from "../services/financeiro.service";

export function useFinanceiroResumo() {
  const query = useQuery({
    queryKey: ["financeiro-resumo"],
    queryFn: getFinanceiroResumo,
  });

  return {
    resumo: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useFluxoFinanceiro() {
  const query = useQuery({
    queryKey: ["financeiro-fluxo"],
    queryFn: getFluxoFinanceiro,
  });

  return {
    fluxo: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}