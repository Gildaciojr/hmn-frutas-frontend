"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useFluxoFinanceiro } from "../hooks/useFinanceiro";

type Periodo = "hoje" | "7d" | "30d";

export function AdminOperacoesResumo() {
  const { fluxo, loading } = useFluxoFinanceiro();

  const [periodo, setPeriodo] = useState<Periodo>("7d");

  function toSafeNumber(value: number | string | null | undefined): number {
    ////////////////////////////////////////////////////////////
    // NUMBER
    ////////////////////////////////////////////////////////////

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    ////////////////////////////////////////////////////////////
    // STRING
    ////////////////////////////////////////////////////////////

    if (typeof value === "string") {
      const normalized = value.replace(",", ".");

      const parsed = Number(normalized);

      return Number.isFinite(parsed) ? parsed : 0;
    }

    ////////////////////////////////////////////////////////////
    // FALLBACK
    ////////////////////////////////////////////////////////////

    return 0;
  }

  function formatCurrency(value: number | string | null | undefined) {
    const safeValue = toSafeNumber(value);

    return safeValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // 🔥 FILTRO
  const fluxoFiltrado = useMemo(() => {
    const now = new Date();

    return fluxo.filter((op) => {
      const data = new Date(op.createdAt);

      if (periodo === "hoje") {
        return isToday(data);
      }

      if (periodo === "7d") {
        const d = new Date();
        d.setDate(now.getDate() - 7);
        return data >= d;
      }

      if (periodo === "30d") {
        const d = new Date();
        d.setDate(now.getDate() - 30);
        return data >= d;
      }

      return true;
    });
  }, [fluxo, periodo]);

  // 🔥 AGRUPAMENTO (Stripe-like)
  const grouped = useMemo(() => {
    const map = new Map<string, typeof fluxoFiltrado>();

    fluxoFiltrado.forEach((op) => {
      const date = new Date(op.createdAt);

      let label = "";

      if (isToday(date)) label = "Hoje";
      else if (isYesterday(date)) label = "Ontem";
      else
        label = format(date, "dd 'de' MMMM", {
          locale: ptBR,
        });

      if (!map.has(label)) {
        map.set(label, []);
      }

      map.get(label)!.push(op);
    });

    return Array.from(map.entries());
  }, [fluxoFiltrado]);

  return (
    <div
      className="
      group relative overflow-hidden
      rounded-[var(--radius-lg)]
      border border-[color:var(--border-soft)]
      bg-[color:var(--surface-100)]
      shadow-[var(--shadow-card)]
      p-3 space-y-3
      transition-all duration-300
      hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]
    "
    >
      {/* CAMADA VISUAL */}
      <div className="absolute inset-0 pointer-events-none">
        {/* textura */}
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle,rgba(0,0,0,0.4)_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(0,0,0,0.05),transparent_60%)]" />
        </div>
      </div>

      {/* ================= HEADER ================= */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="space-y-[0.10px]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-1 rounded-full bg-[color:var(--brand)]" />
            <span className="text-[9px] uppercase tracking-[0.28em] text-[color:var(--muted-soft)]">
              Fluxo
            </span>
          </div>

          <h2 className="text-[17px] font-semibold tracking-tight">
            Operações
          </h2>

          <p className="text-[10px] text-[color:var(--muted)]">
            Movimentações financeiras recentes
          </p>
        </div>

        {/* FILTRO */}
        <div className="flex gap-2">
          {["hoje", "7d", "30d"].map((item) => {
            const active = periodo === item;

            return (
              <button
                key={item}
                onClick={() => setPeriodo(item as Periodo)}
                className={`
                px-4.5 py-1.9 text-[12px] rounded-[20px] font-medium
                border transition-all duration-100

                ${
                  active
                    ? `
                      bg-[color:var(--brand)]
                      text-white
                      border-[color:var(--brand)]
                      shadow-[0_6px_18px_rgba(99,102,241,0.35)]
                    `
                    : `
                      bg-[color:var(--surface-200)]
                      text-[color:var(--muted)]
                      border-[color:var(--border-soft)]
                      hover:text-[color:var(--foreground)]
                      hover:border-[color:var(--border-strong)]
                    `
                }
              `}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= LISTA ================= */}
      <div className="relative z-10 space-y-2 max-h-[420px] overflow-auto pr-2">
        {/* LOADING */}
        {loading && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="
                h-[30px]
                rounded-md
                bg-[color:var(--surface-100)]
              "
              />
            ))}
          </div>
        )}

        {/* AGRUPADO */}
        {!loading &&
          grouped.map(([group, items]) => (
            <div key={group} className="space-y-1.8">
              {/* HEADER DATA */}
              <div
                className="
              flex items-center gap-2
              text-[12px]
              uppercase tracking-wide
              text-[color:var(--muted-soft)]
            "
              >
                <span>{group}</span>
                <div className="flex-10 h-px bg-[color:var(--border-soft)]" />
              </div>

              {/* ITENS */}
              {items.map((op, i) => {
                const isEntrada = op.tipo === "ENTRADA";

                return (
                  <motion.div
                    key={op.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.16,
                      ease: "easeOut",
                    }}
                    className="
    group/item
    relative
    overflow-hidden

    rounded-[10px]

    border
    border-black/[0.04]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]

    px-2 py-2.5

    transition-all
    duration-300

    hover:-translate-y-[2px]

    hover:border-black/[0.08]

    hover:shadow-[0_14px_32px_rgba(0,0,0,0.06)]

    will-change-transform
  "
                  >
                    {/* FX */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* TEXTURA */}
                      <div
                        className="
      absolute
      inset-0

      opacity-[0.01]

      bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)]
      bg-[size:32px_32px]
    "
                      />

                      {/* GLOW */}
                      <div
                        className="
      absolute
      top-0
      right-0

      w-[120px]
      h-[120px]

      rounded-full

      blur-[28px]

      opacity-0
      group-hover/item:opacity-100

      transition-opacity
      duration-300

      pointer-events-none
    "
                      >
                        <div
                          className={`
        w-full
        h-full

        rounded-full

        ${isEntrada ? "bg-emerald-400/12" : "bg-red-400/10"}
      `}
                        />
                      </div>

                      {/* TOP LINE */}
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

                    {/* CONTENT */}
                    <div
                      className="
    relative
    z-10

    flex
    items-center
    justify-between

    gap-3
  "
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-4 min-w-0">
                        {/* ICON */}
                        <div
                          className={`
          relative
          shrink-0

          w-[40px]
          h-[40px]

          rounded-[12px]

          flex
          items-center
          justify-center

          border

          transition-all
          duration-300

          ${
            isEntrada
              ? `
                border-emerald-200

                bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)]

                text-emerald-600

                shadow-[0_10px_24px_rgba(16,185,129,0.10)]
              `
              : `
                border-red-200

                bg-[linear-gradient(135deg,#fef2f2,#fee2e2)]

                text-red-500

                shadow-[0_10px_24px_rgba(239,68,68,0.10)]
              `
          }
        `}
                        >
                          {/* FX */}
                          <div
                            className={`
            absolute
            inset-0

            rounded-[16px]

            opacity-0
            group-hover/item:opacity-100

            transition-all
            duration-500

            ${
              isEntrada
                ? `
                  bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_65%)]
                `
                : `
                  bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_65%)]
                `
            }
          `}
                          />

                          <div className="relative z-10">
                            {isEntrada ? (
                              <ArrowDownRight size={18} />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>
                        </div>

                        {/* INFO */}
                        <div className="min-w-0">
                          {/* TOP */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="
              text-[12px]
              font-semibold

              tracking-tight

              text-[color:var(--foreground)]

              truncate
            "
                            >
                              {op.cliente?.nome ??
                                op.fornecedor?.nome ??
                                op.descricao ??
                                "Movimentação financeira"}
                            </p>

                            <div
                              className={`
              px-2 py-[2px]

              rounded-full

              border

              text-[9px]
              uppercase
              tracking-[0.20em]

              ${
                isEntrada
                  ? `
                    border-emerald-200
                    bg-emerald-50
                    text-emerald-600
                  `
                  : `
                    border-red-200
                    bg-red-50
                    text-red-500
                  `
              }
            `}
                            >
                              {op.tipo}
                            </div>
                          </div>

                          {/* META */}
                          <div
                            className="
            mt-1

            flex
            items-center
            gap-2
            flex-wrap
          "
                          >
                            <p
                              className="
              text-[12px]

              text-[color:var(--muted-soft)]
            "
                            >
                              {format(
                                new Date(op.createdAt),
                                "dd/MM/yyyy • HH:mm",
                              )}
                            </p>

                            {op.compraId && (
                              <div
                                className="
                px-2 py-[4px]

                rounded-full

                bg-black/[0.04]

                text-[10px]

                text-[color:var(--muted)]
              "
                              >
                                COMPRA
                              </div>
                            )}

                            {op.vendaId && (
                              <div
                                className="
                px-2 py-[4px]

                rounded-full

                bg-black/[0.04]

                text-[10px]

                text-[color:var(--muted)]
              "
                              >
                                VENDA
                              </div>
                            )}
                            {!op.compraId && !op.vendaId && op.descricao && (
                              <div
                                className="
      px-2 py-[4px]

      rounded-full

      bg-orange-50

      text-[10px]

      text-orange-600

      border

      border-orange-200
    "
                              >
                                DESPESA
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="text-right shrink-0">
                        <p
                          className={`
          text-[18px]

          font-semibold

          tracking-[-0.04em]

          ${isEntrada ? "text-emerald-600" : "text-red-500"}
        `}
                        >
                          {formatCurrency(op.valor)}
                        </p>

                        <p
                          className="
          mt-1

          text-[9px]
          uppercase
          tracking-[0.18em]

          text-[color:var(--muted-soft)]
        "
                        >
                          {isEntrada ? "Entrada" : "Saída"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}

        {/* EMPTY */}
        {!loading && grouped.length === 0 && (
          <div
            className="
          flex flex-col items-center justify-center
          py-12 text-center space-y-2
        "
          >
            <div
              className="
            w-9 h-9 rounded-md
            flex items-center justify-center
            bg-[color:var(--surface-200)]
            text-[color:var(--muted-soft)]
          "
            >
              —
            </div>

            <p className="text-[12px] text-[color:var(--muted)]">
              Nenhuma operação encontrada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
