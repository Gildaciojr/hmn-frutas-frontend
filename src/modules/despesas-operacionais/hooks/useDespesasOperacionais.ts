import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createDespesaOperacional,
  getDespesasOperacionais,
  getResumoDespesasOperacionais,
  type CreateDespesaOperacionalPayload,
} from "../services/despesas-operacionais.service";

export function useDespesasOperacionais() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["despesas-operacionais"],
    queryFn: getDespesasOperacionais,
  });

  const createMutation = useMutation({
    mutationFn: (
      payload: CreateDespesaOperacionalPayload,
    ) => createDespesaOperacional(payload),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["despesas-operacionais"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["compras-dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["admin-dashboard"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["financeiro-resumo"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["financeiro-fluxo"],
        }),
      ]);
    },
  });

  return {
    despesas: query.data ?? [],

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,

    createDespesa:
      createMutation.mutateAsync,

    creating:
      createMutation.isPending,
  };
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export function useResumoDespesasOperacionais() {
  const query = useQuery({
    queryKey: ["despesas-operacionais-resumo"],
    queryFn: getResumoDespesasOperacionais,
  });

  return {
    resumo: query.data,

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,
  };
}