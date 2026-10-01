"use client";

import type { ComprasReportSummary } from "../services/compras-relatorios.service";

interface Props {
  summary: ComprasReportSummary;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function formatKg(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function ComprasResumoCard({ summary }: Props) {
  const totalCompras = summary.operacoes;
  const totalKg = summary.kgLiquido;
  const valorComprado = summary.valorLiquido;
  const precoMedioKg = summary.precoComercialMedioKg;
  const ticketMedio = summary.ticketMedioLiquido;

  const cards = [
    {
      label: "Operações",
      value: totalCompras.toLocaleString("pt-BR"),
      subtitle: "operações encontradas",
    },

    {
      label: "Kg Líquido Comprado",
      value: `${formatKg(totalKg)} kg`,
      subtitle: "peso líquido",
    },

    {
      label: "Valor Líquido Comprado",
      value: formatCurrency(valorComprado),
      subtitle: "total operacional",
    },

    {
      label: "Preço Comercial Médio/Kg",
      value: formatCurrency(precoMedioKg),
      subtitle: "ponderado pelo kg líquido",
    },

    {
      label: "Ticket Médio Líquido",
      value: formatCurrency(ticketMedio),
      subtitle: "por compra",
    },
  ];

  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-none

        sm:rounded-[20px]
        md:rounded-[24px]

        border-0
        sm:border
        sm:border-[rgba(0,0,0,0.06)]

        bg-transparent
        sm:bg-[linear-gradient(180deg,#ffffff,#fafafa)]

        p-0

        sm:p-4
        md:p-5

        shadow-none
        sm:shadow-[0_18px_50px_rgba(0,0,0,0.05)]

        space-y-3
        sm:space-y-4
      "
    >
      {/* FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            hidden
            sm:block

            absolute

            top-0
            right-0

            w-[140px]
            h-[140px]

            md:w-[220px]
            md:h-[220px]

            rounded-full

            bg-indigo-400/10

            blur-[40px]
          "
        />

        <div
          className="
            hidden
            sm:block

            absolute

            inset-x-0
            top-0

            h-[1px]

            bg-gradient-to-r
            from-transparent
            via-black/10
            to-transparent
          "
        />
      </div>

      {/* HEADER */}
      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-[4px] h-4 rounded-full bg-indigo-500" />

          <span
            className="
              text-[11px]
              sm:text-[10px]
              uppercase

              tracking-[0.24em]

              text-[color:var(--muted-soft)]
            "
          >
            resumo executivo
          </span>
        </div>

        <h2
          className="
            mt-1

            text-[20px]
            sm:text-[22px]

            xl:text-[20px]

            font-semibold

            tracking-[-0.03em]

            text-[color:var(--foreground)]
          "
        >
          Indicadores de compras
        </h2>
      </div>

      {/* KPIS */}
      <div
        className="
          relative z-10

          grid

          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-5

          gap-3
        "
      >
        {cards.map((card) => (
          <div
            key={card.label}
            className="
              group

              relative
              overflow-hidden

              min-w-0
              sm:last:col-span-2
              xl:last:col-span-1

              rounded-[16px]

              sm:rounded-[18px]
              md:rounded-[20px]

              border
              border-[color:var(--border-soft)]

              bg-[linear-gradient(135deg,#ffffff,#fafafa)]

              p-3

              sm:p-4
              md:p-5

              transition-all
              duration-300

              sm:hover:-translate-y-[2px]

              sm:hover:border-indigo-200

              sm:hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)]
            "
          >
            <div
              className="
                hidden
                sm:block

                absolute

                top-0
                right-0

                w-[100px]
                h-[100px]

                rounded-full

                bg-indigo-400/10

                blur-[22px]

                opacity-0

                sm:group-hover:opacity-100

                transition-opacity
              "
            />

            <div className="relative z-10">
              <p
                className="
                  text-[11px]
                  sm:text-[10px]

                  uppercase

                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                {card.label}
              </p>

              <p
                className="
                  mt-2

                  text-[20px]
                  sm:text-[22px]
                  xl:text-[24px]

                  leading-none

                  font-semibold

                  tracking-[-0.05em]

                  text-[color:var(--foreground)]
                "
              >
                {card.value}
              </p>

              <p
                className="
                  mt-2

                  text-[13px]
                  sm:text-[11px]

                  text-[color:var(--muted)]
                "
              >
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
