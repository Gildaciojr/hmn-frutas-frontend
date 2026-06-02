import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getFornecedorFinanceiro,
  getFornecedorPagamentos,
  registrarPagamentoFornecedor,
  type FornecedorFinanceiroResponse,
  type FornecedorPagamentosResponse,
  type RegistrarPagamentoFornecedorPayload,
} from "../services/financeiro-fornecedor.service";

////////////////////////////////////////////////////////////
// FINANCEIRO FORNECEDOR
////////////////////////////////////////////////////////////

export function useFornecedorFinanceiro(fornecedorId?: string) {
  return useQuery<FornecedorFinanceiroResponse>({
    queryKey: ["fornecedor-financeiro", fornecedorId],

    queryFn: () => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return getFornecedorFinanceiro(fornecedorId);
    },

    enabled: !!fornecedorId,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

////////////////////////////////////////////////////////////
// PAGAMENTOS FORNECEDOR
////////////////////////////////////////////////////////////

export function useFornecedorPagamentos(fornecedorId?: string) {
  return useQuery<FornecedorPagamentosResponse>({
    queryKey: ["fornecedor-pagamentos", fornecedorId],

    queryFn: () => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return getFornecedorPagamentos(fornecedorId);
    },

    enabled: !!fornecedorId,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });
}

////////////////////////////////////////////////////////////
// REGISTRAR PAGAMENTO FORNECEDOR
////////////////////////////////////////////////////////////

export function useRegistrarPagamentoFornecedor(fornecedorId?: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: RegistrarPagamentoFornecedorPayload) => {
      if (!fornecedorId) {
        throw new Error("Fornecedor não informado");
      }

      return registrarPagamentoFornecedor(fornecedorId, payload);
    },

    onSuccess: async () => {
      //////////////////////////////////////////////////////
      // FINANCEIRO
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-financeiro", fornecedorId],
      });

      //////////////////////////////////////////////////////
      // PAGAMENTOS
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-pagamentos", fornecedorId],
      });

      //////////////////////////////////////////////////////
      // HISTÓRICO
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-historico", fornecedorId],
      });

      //////////////////////////////////////////////////////
      // RESUMO
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["fornecedor-resumo", fornecedorId],
      });

      //////////////////////////////////////////////////////
      // DASHBOARD COMPRAS
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["compras-dashboard"],
      });

      //////////////////////////////////////////////////////
      // FINANCEIRO GLOBAL
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["financeiro-resumo"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["financeiro-fluxo"],
      });

      //////////////////////////////////////////////////////
      // ADMIN DASHBOARD
      //////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });
    },
  });

  return {
    registrarPagamentoFornecedor: mutation.mutateAsync,

    registrando: mutation.isPending,

    error: mutation.error,
  };
}

////////////////////////////////////////////////////////////
// HOOK COMPLETO
////////////////////////////////////////////////////////////

export function useFornecedorFinanceiroCompleto(fornecedorId?: string) {
  const financeiro = useFornecedorFinanceiro(fornecedorId);

  const pagamentos = useFornecedorPagamentos(fornecedorId);

  const pagamentoMutation = useRegistrarPagamentoFornecedor(fornecedorId);

  return {
    /////////////////////////////////////////////////////////
    // FINANCEIRO
    /////////////////////////////////////////////////////////

    financeiro: financeiro.data,

    financeiroLoading: financeiro.isLoading,

    financeiroError: financeiro.error,

    refetchFinanceiro: financeiro.refetch,

    /////////////////////////////////////////////////////////
    // PAGAMENTOS
    /////////////////////////////////////////////////////////

    pagamentos: pagamentos.data,

    pagamentosLoading: pagamentos.isLoading,

    pagamentosError: pagamentos.error,

    refetchPagamentos: pagamentos.refetch,

    /////////////////////////////////////////////////////////
    // REGISTRAR PAGAMENTO
    /////////////////////////////////////////////////////////

    registrarPagamentoFornecedor:
      pagamentoMutation.registrarPagamentoFornecedor,

    registrandoPagamento: pagamentoMutation.registrando,

    registrarPagamentoError: pagamentoMutation.error,
  };
}
