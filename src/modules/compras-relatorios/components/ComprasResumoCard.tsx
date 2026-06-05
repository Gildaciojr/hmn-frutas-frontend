"use client";

import type { Compra } from "@/modules/compras/hooks/useCompras";

interface Props {
  compras: Compra[];
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  return Number(value ?? 0);
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

export function ComprasResumoCard({ compras }: Props) {
  const totalCompras = compras.length;

  const totalKg = compras.reduce(
    (acc, compra) => acc + Number(compra.kgLiquido ?? 0),
    0,
  );

  const valorComprado = compras.reduce(
    (acc, compra) => acc + toNumber(compra.valorTotal),
    0,
  );

  const precoMedioKg =
    totalKg > 0
      ? valorComprado / totalKg
      : 0;

  const ticketMedio =
    totalCompras > 0
      ? valorComprado / totalCompras
      : 0;

  const cards = [
    {
      label: "Compras",
      value: totalCompras.toLocaleString("pt-BR"),
      subtitle: "operações encontradas",
    },

    {
      label: "Kg Comprado",
      value: `${formatKg(totalKg)} kg`,
      subtitle: "peso líquido",
    },

    {
      label: "Valor Comprado",
      value: formatCurrency(valorComprado),
      subtitle: "total operacional",
    },

    {
      label: "Preço Médio Kg",
      value: formatCurrency(precoMedioKg),
      subtitle: "valor médio",
    },

    {
      label: "Ticket Médio",
      value: formatCurrency(ticketMedio),
      subtitle: "por compra",
    },
  ];

  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-[20px]

        sm:rounded-[24px]

        border
        border-[rgba(0,0,0,0.06)]

        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

        p-4

        sm:p-5

        shadow-[0_18px_50px_rgba(0,0,0,0.05)]

        space-y-4
      "
    >
      {/* FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
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

            text-[24px]
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
          md:grid-cols-2
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

              rounded-[18px]

              sm:rounded-[20px]

              border
              border-[color:var(--border-soft)]

              bg-[linear-gradient(135deg,#ffffff,#fafafa)]

              p-4

              md:p-5

              transition-all
              duration-300

              hover:-translate-y-[2px]

              hover:border-indigo-200

              hover:shadow-[0_12px_24px_rgba(99,102,241,0.08)]
            "
          >
            <div
              className="
                absolute

                top-0
                right-0

                w-[100px]
                h-[100px]

                rounded-full

                bg-indigo-400/10

                blur-[22px]

                opacity-0

                group-hover:opacity-100

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