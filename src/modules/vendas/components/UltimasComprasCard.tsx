"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Truck } from "lucide-react";
import { searchCompras } from "@/modules/compras-relatorios/services/compras-relatorios.service";
import { CompraViewModal } from "@/modules/compras/components/CompraViewModal";
import { formatOperationalDate } from "@/shared/utils/report-period";

export function UltimasComprasCard() {
  const [compraId, setCompraId] = useState<string | null>(null);
  const closeModal = useCallback(() => setCompraId(null), []);
  const query = useQuery({
    queryKey: ["compras-relatorio", { page: 1, pageSize: 10, status: "FECHADA" }],
    queryFn: () => searchCompras({ page: 1, pageSize: 10, status: "FECHADA" }),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const compras = (query.data?.items ?? []).filter((compra) => compra.status !== "CANCELADA");

  return (
    <>
      <section aria-labelledby="ultimas-compras-title" className="soft-card min-w-0 rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            <Truck size={20} className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" />
            <div className="min-w-0">
              <h2 id="ultimas-compras-title" className="text-sm font-semibold">Últimas compras</h2>
              <p className="text-xs text-[color:var(--muted)]">Consulta rápida das cargas disponíveis para venda</p>
            </div>
          </div>
          <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} aria-label="Atualizar últimas compras" className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-xl border hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:opacity-50">
            <RefreshCw size={16} className={query.isFetching ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
        {query.isPending ? (
          <div role="status" aria-label="Carregando últimas compras" className="space-y-2">
            {[0, 1, 2].map((item) => <div key={item} className="h-14 animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : query.isError ? (
          <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <p>Não foi possível carregar as últimas compras.</p>
            <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching} className="mt-2 min-h-11 rounded-lg border px-3 text-xs font-medium disabled:opacity-50">Tentar novamente</button>
          </div>
        ) : compras.length === 0 ? (
          <p role="status" className="py-3 text-sm text-[color:var(--muted)]">Nenhuma compra disponível para consulta.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto overscroll-contain space-y-1" aria-label="Compras recentes">
            {compras.map((compra) => {
              const fornecedor = [compra.fornecedor?.nome, compra.fornecedor?.sobrenome].filter(Boolean).join(" ").trim() || compra.clienteNomeSnapshot || compra.cliente?.nome || "Sem fornecedor";
              return (
                <li key={compra.id} className="min-w-0">
                  <button type="button" onClick={() => setCompraId(compra.id)} aria-haspopup="dialog" className="grid w-full min-w-0 min-h-11 grid-cols-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-x-3 gap-y-1 rounded-xl border border-slate-100 px-3 py-2 text-left hover:border-emerald-200 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-600">
                    <span className="min-w-0 truncate text-xs font-semibold" title={fornecedor}>{fornecedor}</span>
                    <span className="text-right text-xs font-medium text-emerald-700">{compra.kgLiquido.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} kg líquidos</span>
                    <span className="min-w-0 break-all text-xs font-medium text-slate-600">{compra.placa.toUpperCase().replace(/[^A-Z0-9]/g, "")}</span>
                    <span className="text-right text-[11px] text-[color:var(--muted)]">{formatOperationalDate(compra.dataCompra)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {compraId && <CompraViewModal key={compraId} compraId={compraId} open onClose={closeModal} showDocumentActions />}
    </>
  );
}
