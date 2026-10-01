"use client";
import type { VendasReportSummary } from "../services/vendas-relatorios.service";
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export function VendasResumoCard({
  summary,
}: {
  summary: VendasReportSummary;
}) {
  const cards = [
    [
      "Operações",
      summary.operacoes.toLocaleString("pt-BR"),
      "operações encontradas",
    ],
    [
      "Kg líquido vendido",
      `${summary.kgLiquidoVendido.toLocaleString("pt-BR")} kg`,
      "peso líquido",
    ],
    [
      "Valor líquido vendido",
      currency.format(summary.valorLiquidoVendido),
      "total operacional",
    ],
    [
      "Preço comercial médio/kg",
      currency.format(summary.precoComercialMedioKg),
      "preço ponderado pelo kg líquido",
    ],
    [
      "Ticket médio líquido",
      currency.format(summary.ticketMedioLiquido),
      "por venda",
    ],
  ];
  return (
    <section className="space-y-3 min-w-0" aria-label="Indicadores de vendas">
      <h2 className="text-xl font-semibold tracking-tight">
        Indicadores de vendas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {cards.map(([label, value, subtitle]) => (
          <div
            key={label}
            className="soft-card min-w-0 rounded-[18px] p-4 break-words"
          >
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--muted)]">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-[color:var(--muted)]">{subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
