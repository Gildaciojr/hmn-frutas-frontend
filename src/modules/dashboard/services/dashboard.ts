// frontend/src/modules/dashboard/services/dashboard.ts

import { api } from "@/core/http/api";
import type {
  AdminDashboardData,
  ComprasDashboardData,
} from "../hooks/useDashboard";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const res = await api.get<ApiResponse<AdminDashboardData>>(
    "/dashboard/admin",
  );

  return res.data.data;
}

export async function getComprasDashboard(): Promise<ComprasDashboardData> {
  const res = await api.get<ApiResponse<ComprasDashboardData>>(
    "/dashboard/compras",
  );

  return res.data.data;
}