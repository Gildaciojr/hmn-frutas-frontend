"use client";
import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/ui/layout/AppLayout";
import {
  ComprasReport,
  VendasReport,
} from "@/modules/relatorios/AnalyticalReports";
import { PartyReports } from "@/modules/relatorios/PartyReports";
import { RelatorioProducao } from "@/modules/vendas/components/financeiro/RelatorioProducao";

const areas = [
  {
    id: "compras",
    label: "Compras",
    description: "Analítico por fornecedor, fazenda e período.",
  },
  {
    id: "vendas",
    label: "Vendas",
    description: "Analítico por cliente, operação e período.",
  },
  {
    id: "financeiro",
    label: "Financeiro",
    description: "Produção e PDF do relatório existente.",
  },
  {
    id: "clientes",
    label: "Clientes",
    description: "Relatório / Extrato consolidado e PDF.",
  },
  {
    id: "fornecedores",
    label: "Fornecedores",
    description: "Histórico consolidado e PDF.",
  },
] as const;
type Area = (typeof areas)[number]["id"];
export default function RelatoriosPage() {
  const [area, setArea] = useState<Area>("compras");
  return (
    <AppLayout>
      <main className="max-w-[1400px] mx-auto px-1 sm:px-0 space-y-5 min-w-0">
        <header className="soft-card rounded-2xl p-4 sm:p-6 space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex min-h-[44px] items-center text-sm underline"
          >
            Voltar ao painel
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Central de Relatórios
          </h1>
          <p className="text-sm text-[color:var(--muted)]">
            Compras, vendas, financeiro, clientes e fornecedores.
          </p>
        </header>
        <nav
          aria-label="Áreas de relatórios"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 min-w-0"
        >
          {areas.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={area === item.id}
              onClick={() => setArea(item.id)}
              className={`min-w-0 min-h-[44px] rounded-2xl border p-4 text-left break-words ${area === item.id ? "border-green-700 bg-green-50" : "bg-[color:var(--surface-100)]"}`}
            >
              <span className="block font-semibold">{item.label}</span>
              <span className="block text-xs mt-1 text-[color:var(--muted)]">
                {item.description}
              </span>
            </button>
          ))}
        </nav>
        <div
          className="soft-card rounded-2xl p-3 sm:p-5 min-w-0 space-y-4"
          aria-label={`Relatórios de ${areas.find((item) => item.id === area)?.label}`}
        >
          {area === "compras" && <ComprasReport />}
          {area === "vendas" && <VendasReport />}
          {area === "financeiro" && (
            <>
              <p className="text-sm">
                Produção registra valores operacionais nominais. Consulte
                recebido, pago, a receber e a pagar no{" "}
                <Link
                  href="/financeiro"
                  className="underline inline-flex min-h-[44px] items-center"
                >
                  painel financeiro
                </Link>
                .
              </p>
              <div className="min-w-0 max-w-full overflow-x-auto">
                <RelatorioProducao />
              </div>
            </>
          )}
          {(area === "clientes" || area === "fornecedores") && (
            <PartyReports key={area} kind={area} />
          )}
        </div>
      </main>
    </AppLayout>
  );
}
