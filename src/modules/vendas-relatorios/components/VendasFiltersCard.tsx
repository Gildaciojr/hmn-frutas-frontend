"use client";
import { useState } from "react";
import {
  PERIOD_PRESETS,
  getPeriodPreset,
  type PeriodPreset,
} from "@/shared/utils/report-period";
import type {
  SearchVendaParams,
  StatusVendaRelatorio,
  StatusPagamentoRelatorio,
} from "../services/vendas-relatorios.service";

interface Props {
  clientes: { id: string; nome: string }[];
  loading?: boolean;
  onSearch: (filters: SearchVendaParams) => void;
  onClear: () => void;
}
const inputClass =
  "input-base w-full min-w-0 max-w-full text-[16px] md:text-[13px]";
export function VendasFiltersCard({
  clientes,
  loading,
  onSearch,
  onClear,
}: Props) {
  const [filters, setFilters] = useState<SearchVendaParams>({});
  const [preset, setPreset] = useState<PeriodPreset>("custom");
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function dateChange(field: "dataInicio" | "dataFim", value: string) {
    setFilters((current) => ({ ...current, [field]: value || undefined }));
    setPreset("custom");
    setError(null);
  }
  function search() {
    if (
      filters.dataInicio &&
      filters.dataFim &&
      filters.dataInicio > filters.dataFim
    ) {
      setError("A data inicial deve ser anterior à data final.");
      return;
    }
    setError(null);
    onSearch({ ...filters, page: 1, pageSize: 25 });
  }
  return (
    <section
      className="soft-card relative rounded-[20px] sm:rounded-[24px] p-3 sm:p-5 space-y-3 min-w-0"
      aria-label="Relatório analítico de vendas"
    >
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-bold tracking-tight">
            Relatório analítico de vendas
          </h2>
          <p className="text-xs text-[color:var(--muted)]">
            Filtre operações por cliente, identificação e período.
          </p>
        </div>
        <span className="text-xs uppercase tracking-widest text-[color:var(--muted)]">
          Vendas
        </span>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Períodos rápidos">
        {PERIOD_PRESETS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={preset === item.id}
            onClick={() => {
              setPreset(item.id);
              setError(null);
              const range = getPeriodPreset(item.id);
              if (range)
                setFilters((current) => ({
                  ...current,
                  dataInicio: range.inicio,
                  dataFim: range.fim,
                }));
            }}
            className={`min-h-[44px] max-w-full rounded-xl border px-3 text-xs ${preset === item.id ? "border-red-400 bg-red-50 text-red-700" : "border-[color:var(--border-soft)] text-[color:var(--muted)]"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
        <div className="min-w-0">
          <label htmlFor="vendas-report-cliente" className="label-base">
            Cliente
          </label>
          <select
            id="vendas-report-cliente"
            className={inputClass}
            value={filters.clienteId ?? ""}
            onChange={(e) =>
              setFilters((current) => ({
                ...current,
                clienteId: e.target.value || undefined,
              }))
            }
          >
            <option value="">Todos os clientes</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor="vendas-report-inicio" className="label-base">
            Data inicial
          </label>
          <input
            id="vendas-report-inicio"
            type="date"
            className={inputClass}
            value={filters.dataInicio ?? ""}
            onChange={(e) => dateChange("dataInicio", e.target.value)}
          />
        </div>
        <div className="min-w-0">
          <label htmlFor="vendas-report-fim" className="label-base">
            Data final
          </label>
          <input
            id="vendas-report-fim"
            type="date"
            className={inputClass}
            value={filters.dataFim ?? ""}
            onChange={(e) => dateChange("dataFim", e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between gap-3">
        <button
          type="button"
          aria-expanded={advanced}
          onClick={() => setAdvanced(!advanced)}
          className="min-h-[44px] rounded-xl border px-4 text-xs"
        >
          {advanced ? "Ocultar filtros avançados" : "Filtros avançados"}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFilters({});
              setPreset("custom");
              setError(null);
              setAdvanced(false);
              onClear();
            }}
            className="min-h-[44px] rounded-xl border px-4 text-xs"
          >
            Limpar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={search}
            className="btn-primary min-h-[44px] flex-1 px-5 text-xs"
          >
            {loading ? "Gerando..." : "Gerar relatório"}
          </button>
        </div>
      </div>
      {advanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 border-t pt-3">
          <div className="min-w-0">
            <label htmlFor="vendas-report-nome" className="label-base">
              Nome do cliente
            </label>
            <input
              id="vendas-report-nome"
              className={inputClass}
              disabled={Boolean(filters.clienteId)}
              placeholder="Nome cadastral ou informado na venda"
              value={filters.cliente ?? ""}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  cliente: e.target.value || undefined,
                }))
              }
            />
          </div>
          {(
            [
              ["placa", "Placa"],
              ["numeroPedido", "Pedido"],
              ["numeroRomaneio", "Romaneio"],
            ] as const
          ).map(([field, label]) => (
            <div key={field} className="min-w-0">
              <label htmlFor={`vendas-report-${field}`} className="label-base">
                {label}
              </label>
              <input
                id={`vendas-report-${field}`}
                className={inputClass}
                value={filters[field] ?? ""}
                onChange={(e) =>
                  setFilters((current) => ({
                    ...current,
                    [field]: e.target.value.trim() || undefined,
                  }))
                }
              />
            </div>
          ))}
          <div className="min-w-0">
            <label htmlFor="vendas-report-status" className="label-base">
              Status operacional
            </label>
            <select
              id="vendas-report-status"
              className={inputClass}
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  status: (e.target.value || undefined) as
                    | StatusVendaRelatorio
                    | undefined,
                }))
              }
            >
              <option value="">Todas, exceto canceladas</option>
              <option value="ABERTA">Aberta</option>
              <option value="FATURADA">Faturada</option>
              <option value="ENTREGUE">Entregue</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          <div className="min-w-0">
            <label htmlFor="vendas-report-pagamento" className="label-base">
              Status de pagamento
            </label>
            <select
              id="vendas-report-pagamento"
              className={inputClass}
              value={filters.statusPagamento ?? ""}
              onChange={(e) =>
                setFilters((current) => ({
                  ...current,
                  statusPagamento: (e.target.value || undefined) as
                    | StatusPagamentoRelatorio
                    | undefined,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PARCIAL">Parcial</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
