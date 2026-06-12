import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createVenda,
  updateVenda,
  getVendas,
  type CreateVendaPayload,
} from "../services/vendas.service";

type UpdateVendaVariables = {
  id: string;
  payload: Partial<CreateVendaPayload>;
};

function useInvalidateVendas() {
  const queryClient = useQueryClient();

  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["vendas"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["financeiro-resumo"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["financeiro-fluxo"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["estoque-resumo"],
      }),
    ]);
  };
}

export function useVendas() {
  const invalidateVendas = useInvalidateVendas();

  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const query = useQuery({
    queryKey: ["vendas"],
    queryFn: getVendas,

    staleTime: 1000 * 30,
  });

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  const createMutation = useMutation({
    mutationFn: (payload: CreateVendaPayload) => createVenda(payload),

    onSuccess: invalidateVendas,
  });

  ////////////////////////////////////////////////////////////
  // UPDATE
  ////////////////////////////////////////////////////////////

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateVendaVariables) =>
      updateVenda(id, payload),

    onSuccess: invalidateVendas,
  });

  ////////////////////////////////////////////////////////////
  // RETURN
  ////////////////////////////////////////////////////////////

  return {
    vendas: query.data ?? [],

    loading: query.isLoading,
    error: query.error,

    refetch: query.refetch,

    createVenda: createMutation.mutateAsync,
    creating: createMutation.isPending,

    updateVenda: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}

export function useVendaMutations() {
  const invalidateVendas = useInvalidateVendas();

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  const createMutation = useMutation({
    mutationFn: (payload: CreateVendaPayload) => createVenda(payload),

    onSuccess: invalidateVendas,
  });

  ////////////////////////////////////////////////////////////
  // UPDATE
  ////////////////////////////////////////////////////////////

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: UpdateVendaVariables) =>
      updateVenda(id, payload),

    onSuccess: invalidateVendas,
  });

  ////////////////////////////////////////////////////////////
  // RETURN
  ////////////////////////////////////////////////////////////

  return {
    createVenda: createMutation.mutateAsync,
    creating: createMutation.isPending,

    updateVenda: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}
