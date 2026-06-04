"use client";

import type { Compra } from "@/modules/compras/hooks/useCompras";

interface Props {
  compras: Compra[];
}

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatKg(value: number) {
  return `${value.toLocaleString("pt-BR")} kg`;
}

export function ComprasRelatorioTable({ compras }: Props) {
  return (
    <section
      className="
        soft-card

        overflow-hidden

        rounded-[var(--radius-lg)]
      "
    >
      {/* HEADER */}

      <div
        className="
          px-4
          sm:px-5

          py-4

          border-b

          border-[color:var(--border-soft)]
        "
      >
        <h2
          className="
            text-[14px]
            font-semibold

            tracking-tight
          "
        >
          Resultado da pesquisa
        </h2>

        <p
          className="
            mt-1

            text-[11px]

            text-[color:var(--muted)]
          "
        >
          {compras.length} registro(s) encontrado(s)
        </p>
      </div>

      {/* EMPTY */}

      {compras.length === 0 && (
        <div
          className="
            p-6
            sm:p-10

            text-center

            text-[15px]
            sm:text-sm

            text-[color:var(--muted)]
          "
        >
          Nenhuma compra encontrada para os filtros informados.
        </div>
      )}

      {/* TABLE */}

      {compras.length > 0 && (
        <>
          {/* MOBILE CARDS */}
          <div className="lg:hidden p-3 sm:p-4 space-y-3">
            {compras.map((compra) => (
              <div
                key={compra.id}
                className="
            rounded-[18px]
            border border-[color:var(--border-soft)]
            bg-[color:var(--surface-100)]
            p-4

            sm:p-5
            hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]

            transition-all
            space-y-3
          "
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[color:var(--muted)]">
                      Fornecedor
                    </p>

                    <p className="text-[15px] sm:text-sm font-semibold text-[color:var(--foreground)]">
                      {compra.fornecedor?.nome ?? compra.cliente?.nome ?? "-"}
                    </p>
                  </div>

                  <span
                    className={`
                shrink-0 inline-flex px-2.5 py-1 rounded-full
                text-[12px] sm:text-[11px] font-medium
                ${
                  compra.status === "FECHADA"
                    ? "bg-emerald-100 text-emerald-700"
                    : compra.status === "ABERTA"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                }
              `}
                  >
                    {compra.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <MobileInfo
                    label="Fazenda"
                    value={compra.fazendaFornecedor?.nome ?? "-"}
                  />
                  <MobileInfo
                    label="Data"
                    value={new Date(compra.dataCompra).toLocaleDateString(
                      "pt-BR",
                    )}
                  />
                  <MobileInfo label="Placa" value={compra.placa} />
                  <MobileInfo
                    label="Kg líquido"
                    value={formatKg(compra.kgLiquido)}
                  />
                  <MobileInfo
                    label="Frutas"
                    value={String(compra.quantidadeFrutas)}
                  />
                  <MobileInfo
                    label="Preço/Kg"
                    value={formatCurrency(compra.precoKg)}
                  />
                </div>

                <div
                  className="
              rounded-[16px]
              border border-emerald-200
              bg-emerald-50
              px-3 py-2
            "
                >
                  <p className="text-[11px] text-emerald-700/80">Total</p>
                  <p className="text-[22px] sm:text-[20px] lg:text-[18px] font-semibold text-emerald-700">
                    {formatCurrency(compra.valorTotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-[color:var(--border-soft)] bg-[color:var(--surface-200)]">
                  <th className="px-4 py-3 text-left text-xs">Fornecedor</th>
                  <th className="px-4 py-3 text-left text-xs">Fazenda</th>
                  <th className="px-4 py-3 text-left text-xs">Data</th>
                  <th className="px-4 py-3 text-left text-xs">Placa</th>
                  <th className="px-4 py-3 text-left text-xs">Kg Líquido</th>
                  <th className="px-4 py-3 text-left text-xs">Frutas</th>
                  <th className="px-4 py-3 text-left text-xs">Preço/Kg</th>
                  <th className="px-4 py-3 text-left text-xs">Total</th>
                  <th className="px-4 py-3 text-left text-xs">Status</th>
                </tr>
              </thead>

              <tbody>
                {compras.map((compra) => (
                  <tr
                    key={compra.id}
                    className="border-b border-[color:var(--border-soft)] hover:bg-black/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm">
                      {compra.fornecedor?.nome ?? compra.cliente?.nome ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {compra.fazendaFornecedor?.nome ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {new Date(compra.dataCompra).toLocaleDateString("pt-BR")}
                    </td>

                    <td className="px-4 py-3 text-sm">{compra.placa}</td>

                    <td className="px-4 py-3 text-sm">
                      {formatKg(compra.kgLiquido)}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {compra.quantidadeFrutas}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {formatCurrency(compra.precoKg)}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(compra.valorTotal)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`
                    inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium
                    ${
                      compra.status === "FECHADA"
                        ? "bg-emerald-100 text-emerald-700"
                        : compra.status === "ABERTA"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }
                  `}
                      >
                        {compra.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
function MobileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="
          text-[11px]
          text-[color:var(--muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          text-sm
          font-medium
          text-[color:var(--foreground)]
        "
      >
        {value}
      </p>
    </div>
  );
}
