"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getClientes,
  getClientesResumo,
  createCliente,
  updateCliente,

  type Cliente,
  type ClienteInput,
  type ClienteResumoItem,
} from "../services/clientes.service";

////////////////////////////////////////////////////////////
// CLIENTES
////////////////////////////////////////////////////////////

export function useClientes() {
  const queryClient = useQueryClient();

  // ================= QUERY =================

  const query = useQuery<Cliente[]>({
    queryKey: ["clientes"],

    queryFn: getClientes,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,
  });

  // ================= CREATE =================

  const create = useMutation<
    Cliente,
    Error,
    ClienteInput
  >({
    mutationFn: createCliente,

    onSuccess: (novoCliente) => {
      ////////////////////////////////////////////////////////
      // BASE PRINCIPAL
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["clientes"],
      });

      ////////////////////////////////////////////////////////
      // TABELA RESUMO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["clientes-resumo"],
      });

      ////////////////////////////////////////////////////////
      // FINANCEIRO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["financeiro-resumo"],
      });

      queryClient.invalidateQueries({
        queryKey: ["financeiro-fluxo"],
      });

      ////////////////////////////////////////////////////////
      // DASHBOARD
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });

      ////////////////////////////////////////////////////////
      // CLIENTE INDIVIDUAL
      ////////////////////////////////////////////////////////

      if (novoCliente?.id) {
        //////////////////////////////////////////////////////
        // RESUMO
        //////////////////////////////////////////////////////

        queryClient.invalidateQueries({
          queryKey: [
            "cliente-resumo",
            novoCliente.id,
          ],
        });

        //////////////////////////////////////////////////////
        // HISTÓRICO
        //////////////////////////////////////////////////////

        queryClient.invalidateQueries({
          queryKey: [
            "cliente-historico",
            novoCliente.id,
          ],
        });

        //////////////////////////////////////////////////////
        // FINANCEIRO CLIENTE
        //////////////////////////////////////////////////////

        queryClient.invalidateQueries({
          queryKey: [
            "financeiro-cliente",
            novoCliente.id,
          ],
        });

        //////////////////////////////////////////////////////
        // PAGAMENTOS
        //////////////////////////////////////////////////////

        queryClient.invalidateQueries({
          queryKey: [
            "cliente-pagamentos",
            novoCliente.id,
          ],
        });
      }
    },

    onError: (error) => {
      console.error(
        "Erro ao criar cliente:",
        error,
      );
    },
  });

  // ================= UPDATE =================

  const update = useMutation<
    Cliente,
    Error,
    {
      id: string;

      data: Partial<ClienteInput>;
    }
  >({
    mutationFn: ({ id, data }) =>
      updateCliente(id, data),

    onSuccess: (clienteAtualizado) => {
      ////////////////////////////////////////////////////////
      // LISTA
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["clientes"],
      });

      ////////////////////////////////////////////////////////
      // TABELA RESUMO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["clientes-resumo"],
      });

      ////////////////////////////////////////////////////////
      // FINANCEIRO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["financeiro-resumo"],
      });

      queryClient.invalidateQueries({
        queryKey: ["financeiro-fluxo"],
      });

      ////////////////////////////////////////////////////////
      // DASHBOARD
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });

      ////////////////////////////////////////////////////////
      // CLIENTE RESUMO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: [
          "cliente-resumo",
          clienteAtualizado.id,
        ],
      });

      ////////////////////////////////////////////////////////
      // CLIENTE HISTÓRICO
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: [
          "cliente-historico",
          clienteAtualizado.id,
        ],
      });

      ////////////////////////////////////////////////////////
      // FINANCEIRO CLIENTE
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: [
          "financeiro-cliente",
          clienteAtualizado.id,
        ],
      });

      ////////////////////////////////////////////////////////
      // PAGAMENTOS
      ////////////////////////////////////////////////////////

      queryClient.invalidateQueries({
        queryKey: [
          "cliente-pagamentos",
          clienteAtualizado.id,
        ],
      });
    },

    onError: (error) => {
      console.error(
        "Erro ao atualizar cliente:",
        error,
      );
    },
  });

  // ================= RETURN =================

  return {
    clientes: query.data ?? [],

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,

    ////////////////////////////////////////////////////////
    // CREATE
    ////////////////////////////////////////////////////////

    createCliente: create.mutateAsync,

    creating: create.isPending,

    ////////////////////////////////////////////////////////
    // UPDATE
    ////////////////////////////////////////////////////////

    updateCliente: update.mutateAsync,

    updating: update.isPending,
  };
}

////////////////////////////////////////////////////////////
// RESUMO FINANCEIRO CLIENTES
////////////////////////////////////////////////////////////

export function useClientesResumo() {
  const query = useQuery<
    ClienteResumoItem[]
  >({
    queryKey: ["clientes-resumo"],

    queryFn: getClientesResumo,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,
  });

  return {
    clientes: query.data ?? [],

    loading: query.isLoading,

    error: query.error,

    refetch: query.refetch,
  };
}