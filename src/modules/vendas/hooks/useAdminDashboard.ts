import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../services/dashboard-admin.service";

export function useAdminDashboard() {
  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}