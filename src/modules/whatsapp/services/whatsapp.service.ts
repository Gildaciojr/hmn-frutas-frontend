import { api } from '@/core/http/api';

// ======================================================
// TYPES
// ======================================================

export interface WhatsappResumoResponse {
  cliente: {
    id: string;

    nome: string;

    telefone: string;
  };

  resumo: {
    totalComprado: number;

    totalVendas: number;

    saldoDevedor: number;

    totalOperacoes: number;

    ultimaCompraEm: string | null;
  };

  mensagem: string;

  whatsappUrl: string;
}

// ======================================================
// GET RESUMO CLIENTE
// ======================================================

export async function getWhatsappResumoCliente(
  clienteId: string,
): Promise<WhatsappResumoResponse> {
  const response = await api.get(
    `/whatsapp/cliente/${clienteId}/resumo`,
  );

  return response.data.data;
}