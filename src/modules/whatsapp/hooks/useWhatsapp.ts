'use client';

import { useQuery } from '@tanstack/react-query';

import {
  getWhatsappResumoCliente,
  WhatsappResumoResponse,
} from '../services/whatsapp.service';

// ======================================================
// HOOK
// ======================================================

export function useWhatsappResumoCliente(
  clienteId: string | null,
) {
  const query = useQuery<WhatsappResumoResponse>({
    queryKey: ['whatsapp-resumo', clienteId],

    queryFn: () => {
      if (!clienteId) {
        throw new Error('Cliente inválido');
      }

      return getWhatsappResumoCliente(clienteId);
    },

    enabled: Boolean(clienteId),

    staleTime: 1000 * 60,

    retry: 1,

    refetchOnWindowFocus: false,
  });

  // ====================================================
  // OPEN WHATSAPP
  // ====================================================

  function openWhatsapp() {
    if (!query.data?.whatsappUrl) {
      return;
    }

    window.open(
      query.data.whatsappUrl,
      '_blank',
      'noopener,noreferrer',
    );
  }

  return {
    // ==================================================
    // DATA
    // ==================================================

    data: query.data ?? null,

    // ==================================================
    // STATES
    // ==================================================

    loading: query.isLoading,

    error: query.error as Error | null,

    // ==================================================
    // ACTIONS
    // ==================================================

    refetch: query.refetch,

    openWhatsapp,
  };
}