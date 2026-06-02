import { api } from "@/core/http/api";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface AdminDashboardResumo {
  totalComprado: number;
  totalKg: number;
  mediaCompra: number;
  clientesAtivos: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardResumo> {
  const response =
    await api.get<ApiResponse<AdminDashboardResumo>>(
      "/dashboard/admin",
    );

  return response.data.data;
}