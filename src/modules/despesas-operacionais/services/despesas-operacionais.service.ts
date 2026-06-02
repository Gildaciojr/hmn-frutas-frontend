import { api } from "@/core/http/api";

////////////////////////////////////////////////////////////
// DESPESA OPERACIONAL
////////////////////////////////////////////////////////////

export interface DespesaOperacional {
  id: string;

  data: string;

  atividade: string;

  valor: number | string;

  observacoes?: string | null;

  createdAt: string;

  updatedAt: string;
}

////////////////////////////////////////////////////////////
// CREATE PAYLOAD
////////////////////////////////////////////////////////////

export interface CreateDespesaOperacionalPayload {
  data: string;

  atividade: string;

  valor: number;

  observacoes?: string;
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export interface ResumoDespesaOperacional {
  totalDespesas: number;

  quantidadeDespesas: number;
}

////////////////////////////////////////////////////////////
// API RESPONSE
////////////////////////////////////////////////////////////

interface ApiResponse<T> {
  success: boolean;

  data: T;
}

////////////////////////////////////////////////////////////
// LISTAR
////////////////////////////////////////////////////////////

export async function getDespesasOperacionais(): Promise<
  DespesaOperacional[]
> {
  const response = await api.get<
    ApiResponse<DespesaOperacional[]>
  >("/despesas-operacionais");

  return response.data.data;
}

////////////////////////////////////////////////////////////
// RESUMO
////////////////////////////////////////////////////////////

export async function getResumoDespesasOperacionais(): Promise<
  ResumoDespesaOperacional
> {
  const response = await api.get<
    ApiResponse<ResumoDespesaOperacional>
  >("/despesas-operacionais/resumo");

  return response.data.data;
}

////////////////////////////////////////////////////////////
// CRIAR
////////////////////////////////////////////////////////////

export async function createDespesaOperacional(
  payload: CreateDespesaOperacionalPayload,
): Promise<DespesaOperacional> {
  const response = await api.post<
    ApiResponse<DespesaOperacional>
  >("/despesas-operacionais", payload);

  return response.data.data;
}