import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVenda,
  updateVenda,
  getVendas,
  type CreateVendaPayload,
} from "../services/vendas.service";

export function useVendas() {
  const queryClient = useQueryClient();

  // ================= QUERY =================
  const query = useQuery({
    queryKey: ["vendas"],
    queryFn: getVendas,

    // 🔥 evita refetch agressivo e melhora UX
    staleTime: 1000 * 30,
  });

  // ================= MUTATION =================
  const createMutation = useMutation({
    mutationFn: (payload: CreateVendaPayload) => createVenda(payload),

    onSuccess: async () => {
      // 🔥 REFETCH CONSISTENTE EM CASCATA (CRÍTICO)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["vendas"] }),
        queryClient.invalidateQueries({ queryKey: ["financeiro-resumo"] }),
        queryClient.invalidateQueries({ queryKey: ["financeiro-fluxo"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["estoque-resumo"] }), // 🔥 ESSENCIAL
      ]);
    },
  });
  // ================= UPDATE =================
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateVendaPayload>;
    }) => updateVenda(id, payload),

    onSuccess: async () => {
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
    },
  });

  // ================= RETURN =================
  return {
    // 🔥 DADOS
    vendas: query.data ?? [],

    // 🔥 ESTADOS
    loading: query.isLoading,
    error: query.error,

    // 🔥 CONTROLE
    refetch: query.refetch,

    // 🔥 MUTATION
    createVenda: createMutation.mutateAsync,
    creating: createMutation.isPending,

    // 🔥 UPDATE
    updateVenda: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
  };
}
