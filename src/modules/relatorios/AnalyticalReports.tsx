"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ComprasFiltersCard } from "@/modules/compras-relatorios/components/ComprasFiltersCard";
import { ComprasResumoCard } from "@/modules/compras-relatorios/components/ComprasResumoCard";
import { ComprasRelatorioTable } from "@/modules/compras-relatorios/components/ComprasRelatorioTable";
import { useComprasRelatorio } from "@/modules/compras-relatorios/hooks/useComprasRelatorio";
import type { SearchCompraParams } from "@/modules/compras-relatorios/services/compras-relatorios.service";
import { VendasFiltersCard } from "@/modules/vendas-relatorios/components/VendasFiltersCard";
import { VendasResumoCard } from "@/modules/vendas-relatorios/components/VendasResumoCard";
import { VendasRelatorioTable } from "@/modules/vendas-relatorios/components/VendasRelatorioTable";
import { useVendasRelatorio } from "@/modules/vendas-relatorios/hooks/useVendasRelatorio";
import type { SearchVendaParams } from "@/modules/vendas-relatorios/services/vendas-relatorios.service";
import { getClientes } from "@/modules/clientes/services/clientes.service";
import { ReportExportActions } from "@/shared/report-export/ReportExportActions";
import { getComprasExport, getVendasExport } from "./analytical-export";

export function ComprasReport() {
  const [filters, setFilters] = useState<SearchCompraParams | null>(null);
  const report = useComprasRelatorio(filters ?? {}, Boolean(filters));
  return (
    <section className="space-y-4 min-w-0">
      <ComprasFiltersCard
        loading={report.loading}
        onSearch={(value) => setFilters({ ...value, page: 1, pageSize: 25 })}
        onClear={() => setFilters(null)}
      />
      {filters ? (
        <>
          {report.summary && !report.loading && !report.error && (
            <ComprasResumoCard summary={report.summary} />
          )}
          <ReportExportActions
            disabled={
              report.loading ||
              Boolean(report.error) ||
              !report.pagination?.total
            }
            getReport={() => getComprasExport(filters)}
          />
          <div className="min-w-0 max-w-full overflow-x-auto">
            <ComprasRelatorioTable
              compras={report.compras}
              loading={report.loading}
              error={report.error?.message}
              onRetry={() => void report.refetch()}
              pagination={report.pagination}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          Selecione os filtros e gere o relatório de compras.
        </p>
      )}
    </section>
  );
}
export function VendasReport() {
  const [filters, setFilters] = useState<SearchVendaParams | null>(null);
  const clients = useQuery({ queryKey: ["clientes"], queryFn: getClientes });
  const report = useVendasRelatorio(filters ?? {}, Boolean(filters));
  return (
    <section className="space-y-4 min-w-0">
      {clients.error && (
        <p role="alert" className="text-sm text-red-600">
          Não foi possível carregar os clientes.{" "}
          <button
            type="button"
            onClick={() => void clients.refetch()}
            className="underline min-h-[44px]"
          >
            Tentar novamente
          </button>
        </p>
      )}
      <VendasFiltersCard
        clientes={clients.data ?? []}
        loading={report.loading || clients.isFetching}
        onSearch={(value) => setFilters({ ...value, page: 1, pageSize: 25 })}
        onClear={() => setFilters(null)}
      />
      {filters ? (
        <>
          {report.summary && !report.loading && !report.error && (
            <VendasResumoCard summary={report.summary} />
          )}
          <ReportExportActions
            disabled={
              report.loading ||
              Boolean(report.error) ||
              !report.pagination?.total
            }
            getReport={() =>
              getVendasExport(
                filters,
                clients.data?.find((client) => client.id === filters.clienteId)
                  ?.nome,
              )
            }
          />
          <div className="min-w-0 max-w-full overflow-x-auto">
            <VendasRelatorioTable
              vendas={report.vendas}
              loading={report.loading}
              error={report.error?.message}
              onRetry={() => void report.refetch()}
              pagination={report.pagination}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          Selecione os filtros e gere o relatório de vendas.
        </p>
      )}
    </section>
  );
}
