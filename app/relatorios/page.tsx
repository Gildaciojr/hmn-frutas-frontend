"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  ShoppingCart,
  Truck,
  Wallet,
  Users,
  Handshake,
} from "lucide-react";
import "./reports.css";
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
    description: "Fornecedor e período",
    icon: Truck,
  },
  {
    id: "vendas",
    label: "Vendas",
    description: "Cliente e operação",
    icon: ShoppingCart,
  },
  {
    id: "financeiro",
    label: "Financeiro",
    description: "Produção e período",
    icon: Wallet,
  },
  {
    id: "clientes",
    label: "Clientes",
    description: "Extrato consolidado",
    icon: Users,
  },
  {
    id: "fornecedores",
    label: "Fornecedores",
    description: "Histórico consolidado",
    icon: Handshake,
  },
] as const;
type Area = (typeof areas)[number]["id"];
export default function RelatoriosPage() {
  const [area, setArea] = useState<Area>("compras");
  return (
    <AppLayout>
      <main className="hmn-reports max-w-[1400px] mx-auto px-1 sm:px-0 space-y-4 min-w-0">
        <header className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <BarChart3 size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Central de Relatórios
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Compras, vendas, financeiro, clientes e fornecedores.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Voltar ao painel
          </Link>
        </header>
        <nav
          aria-label="Áreas de relatórios"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 min-w-0"
        >
          {areas.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={area === item.id}
              onClick={() => setArea(item.id)}
              className={`min-w-0 min-h-[44px] flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left break-words transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 last:col-span-2 md:last:col-span-1 ${area === item.id ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
            >
              <item.icon size={17} className="shrink-0" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {item.label}
                </span>
                <span className="hidden text-[11px] mt-0.5 text-slate-500 xl:block">
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </nav>
        <div
          className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 min-w-0 space-y-4 shadow-sm"
          aria-label={`Relatórios de ${areas.find((item) => item.id === area)?.label}`}
        >
          {area === "compras" && <ComprasReport />}
          {area === "vendas" && <VendasReport />}
          {area === "financeiro" && (
            <>
              <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
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
