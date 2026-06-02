import { api } from "@/core/http/api";

export interface AdminDashboardResumo {
  totalComprado: number;
  totalKg: number;
  mediaCompra: number;
  clientesAtivos: number;
}

export async function getAdminDashboard(): Promise<AdminDashboardResumo> {
  const response = await api.get("/dashboard/admin");
  return response.data.data;
}