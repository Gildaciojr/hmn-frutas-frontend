import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createFazenda,
  createFornecedor,
  CreateFazendaPayload,
  CreateFornecedorPayload,
  FazendaFornecedor,
  Fornecedor,
  FornecedorHistoricoResponse,
  FornecedorResumoResponse,
  getFazendasFornecedor,
  getFornecedorHistorico,
  getFornecedorResumo,
  getFornecedores,
  updateFazenda,
  updateFornecedor,
  UpdateFazendaPayload,
  UpdateFornecedorPayload,
} from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// LISTAGEM PRINCIPAL
////////////////////////////////////////////////////////////

export function useFornecedores() {
  const queryClient = useQueryClient();

  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const query = useQuery({
    queryKey: ["fornecedores"],

    queryFn: getFornecedores,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  const createMutation = useMutation({
    mutationFn: (payload: CreateFornecedorPayload) => createFornecedor(payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["fornecedores"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["compras-dashboard"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });
    },
  });

  ////////////////////////////////////////////////////////////
  // UPDATE
  ////////////////////////////////////////////////////////////

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;

      payload: UpdateFornecedorPayload;
    }) => updateFornecedor(id, payload),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fornecedores"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-resumo", variables.id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-historico", variables.id],
      });
    },
  });

  return {
    fornecedores: query.data ?? [],

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,

    /////////////////////////////////////////////////////////
    // CREATE
    /////////////////////////////////////////////////////////

    createFornecedor: createMutation.mutateAsync,

    creating: createMutation.isPending,

    /////////////////////////////////////////////////////////
    // UPDATE
    /////////////////////////////////////////////////////////

    updateFornecedor: updateMutation.mutateAsync,

    updating: updateMutation.isPending,
  };
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export function useFornecedorResumo(fornecedorId?: string) {
  return useQuery<FornecedorResumoResponse>({
    queryKey: ["fornecedor-resumo", fornecedorId],

    queryFn: () => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return getFornecedorResumo(fornecedorId);
    },

    enabled: !!fornecedorId,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

////////////////////////////////////////////////////////////
// HISTÓRICO
////////////////////////////////////////////////////////////

export function useFornecedorHistorico(fornecedorId?: string) {
  return useQuery<FornecedorHistoricoResponse>({
    queryKey: ["fornecedor-historico", fornecedorId],

    queryFn: () => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return getFornecedorHistorico(fornecedorId);
    },

    enabled: !!fornecedorId,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

////////////////////////////////////////////////////////////
// CREATE FAZENDA
////////////////////////////////////////////////////////////

export function useCreateFazenda() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      fornecedorId,
      payload,
    }: {
      fornecedorId: string;

      payload: CreateFazendaPayload;
    }) => createFazenda(fornecedorId, payload),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-fazendas", variables.fornecedorId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-resumo", variables.fornecedorId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-historico", variables.fornecedorId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedores"],
      });
    },
  });

  return {
    createFazenda: mutation.mutateAsync,

    creating: mutation.isPending,
  };
}

////////////////////////////////////////////////////////////
// FAZENDAS
////////////////////////////////////////////////////////////

export function useFazendasFornecedor(fornecedorId?: string) {
  const queryClient = useQueryClient();

  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const query = useQuery<FazendaFornecedor[]>({
    queryKey: ["fornecedor-fazendas", fornecedorId],

    queryFn: () => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return getFazendasFornecedor(fornecedorId);
    },

    enabled: !!fornecedorId,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  ////////////////////////////////////////////////////////////
  // CREATE
  ////////////////////////////////////////////////////////////

  const createMutation = useMutation({
    mutationFn: ({
      fornecedorId,
      payload,
    }: {
      fornecedorId: string;

      payload: CreateFazendaPayload;
    }) => createFazenda(fornecedorId, payload),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-fazendas", variables.fornecedorId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-resumo", variables.fornecedorId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-historico", variables.fornecedorId],
      });
    },
  });

  ////////////////////////////////////////////////////////////
  // UPDATE
  ////////////////////////////////////////////////////////////

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;

      payload: UpdateFazendaPayload;
    }) => updateFazenda(id, payload),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-fazendas"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-resumo"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-historico"],
      });
    },
  });

  return {
    fazendas: query.data ?? [],

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,

    /////////////////////////////////////////////////////////
    // CREATE
    /////////////////////////////////////////////////////////

    createFazenda: createMutation.mutateAsync,

    creating: createMutation.isPending,

    /////////////////////////////////////////////////////////
    // UPDATE
    /////////////////////////////////////////////////////////

    updateFazenda: updateMutation.mutateAsync,

    updating: updateMutation.isPending,
  };
}
