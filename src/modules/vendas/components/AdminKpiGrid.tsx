"use client";

import { motion } from "framer-motion";
import { useFinanceiroResumo } from "../hooks/useFinanceiro";
import { useClientes } from "@/modules/clientes/hooks/useClientes";
import { KpiCard } from "@/ui/dashboard/KpiCard";

export function AdminKpiGrid() {
  const { resumo, loading: loadingFinanceiro } = useFinanceiroResumo();
  const { clientes, loading: loadingClientes } = useClientes();

  const loading = loadingFinanceiro || loadingClientes;

  function formatCurrency(value: number) {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  }

  // ================= DADOS =================
  const totalComprado = resumo?.totalSaidas ?? 0;
  const totalVendido = resumo?.totalEntradas ?? 0;

  const lucro = totalVendido - totalComprado;

  const margem = totalVendido > 0 ? (lucro / totalVendido) * 100 : 0;

  const clientesAtivos = clientes?.length ?? 0;

  // ================= KPIS =================
  const kpis = [
    {
      label: "Total Comprado",
      value: loading ? "..." : formatCurrency(totalComprado),
      delta: null,
    },
    {
      label: "Total Vendido",
      value: loading ? "..." : formatCurrency(totalVendido),
      delta: null,
    },
    {
      label: "Lucro",
      value: loading ? "..." : formatCurrency(lucro),
      delta: loading ? undefined : margem,
    },
    {
      label: "Clientes",
      value: loading ? "..." : String(clientesAtivos),
      delta: null,
    },
  ];

  // ================= RENDER =================
  return (
    <div
      className="
      grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4

      gap-3
      sm:gap-4
    "
    >
      {kpis.map((item) => (
        <div
          key={item.label}
          className="
          animate-[fadeIn_.22s_ease-out]

          min-w-0
        "
        >
          <KpiCard
            label={item.label}
            value={item.value}
            delta={item.delta ?? undefined}
          />
        </div>
      ))}
    </div>
  );
}
