"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useFinanceiroResumo } from "@/modules/vendas/hooks/useFinanceiro";
import { useFinanceiroModalStore } from "@/core/stores/useFinanceiroModalStore";

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

export function FinanceiroResumo() {
  const { openModal } = useFinanceiroModalStore();

  const { resumo, loading } = useFinanceiroResumo();

  const entradas = Number(resumo?.totalEntradas ?? 0);

  const saidas = Number(resumo?.totalSaidas ?? 0);

  const saldo = Number(resumo?.saldo ?? 0);

  const {
    volumeFinanceiro,
    percentualEntrada,
    percentualSaida,
    diferenca,
  } = useMemo(() => {
    const total = entradas + saidas;

    return {
      volumeFinanceiro: total,

      percentualEntrada:
        total > 0 ? (entradas / total) * 100 : 0,

      percentualSaida:
        total > 0 ? (saidas / total) * 100 : 0,

      diferenca: entradas - saidas,
    };
  }, [entradas, saidas]);

  const isSaldoPositivo = saldo >= 0;

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* HERO FINANCEIRO */}
      {/* ========================================================= */}
      <motion.div
        onClick={() => openModal(null)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={`
          group
          relative
          overflow-hidden

          rounded-[18px]

          sm:rounded-[16px]

          border

          px-4

          sm:px-5

          py-4

          sm:py-3

          cursor-pointer

          transition-all
          duration-300

          ${
            isSaldoPositivo
              ? `
                border-emerald-200
                bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_48%,#ecfdf5_100%)]

                shadow-[0_18px_45px_rgba(16,185,129,0.12)]

                hover:shadow-[0_26px_60px_rgba(16,185,129,0.16)]
              `
              : `
                border-red-200
                bg-[linear-gradient(135deg,#fef2f2_0%,#ffffff_48%,#fff1f2_100%)]

                shadow-[0_18px_45px_rgba(239,68,68,0.12)]

                hover:shadow-[0_26px_60px_rgba(239,68,68,0.16)]
              `
          }
        `}
      >

        {/* ========================================================= */}
        {/* CONTENT */}
        {/* ========================================================= */}
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* ===================================================== */}
          {/* LEFT */}
          {/* ===================================================== */}
          <div className="space-y-1">
            {/* LABEL */}
            <div className="flex items-center gap-2">
              <div
                className={`
                  w-1 h-2 rounded-full

                  ${
                    isSaldoPositivo
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }
                `}
              />

              <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted-soft)]">
                Saldo atual
              </span>
            </div>

            {/* VALOR */}
            <div className="space-y-1">
              <h2
                className={`
                  text-[22px]

                  sm:text-[20px]


                  xl:text-[20px]

                  leading-none

                  font-semibold
                  tracking-[-0.03em]

                  ${
                    isSaldoPositivo
                      ? "text-emerald-600"
                      : "text-red-500"
                  }
                `}
              >
                {loading ? "..." : formatCurrency(saldo)}
              </h2>

              <div className="flex items-center gap-2 text-[12px]">
                <div
                  className={`
                    w-2 h-2 rounded-full

                    ${
                      isSaldoPositivo
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }
                  `}
                />

                <span
                  className={
                    isSaldoPositivo
                      ? "text-emerald-700"
                      : "text-red-600"
                  }
                >
                  {isSaldoPositivo
                    ? "Resultado positivo"
                    : "Resultado negativo"}
                </span>
              </div>
            </div>

            {/* FOOTER INFO */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-[10px] text-[color:var(--muted)]">
              <span>
                Diferença:
                {" "}
                <strong>
                  {formatCurrency(diferenca)}
                </strong>
              </span>

              <span className="opacity-30">•</span>

              <span>
                Volume:
                {" "}
                <strong>
                  {formatCurrency(volumeFinanceiro)}
                </strong>
              </span>
            </div>
          </div>

          {/* ===================================================== */}
          {/* RIGHT */}
          {/* ===================================================== */}
          <div className="flex items-start gap-3">
            <div
              className={`
                px-3
                py-1.5

                rounded-full

                border

                backdrop-blur-sm

                ${
                  isSaldoPositivo
                    ? `
                      border-emerald-200
                      bg-emerald-50/80
                      text-emerald-700
                    `
                    : `
                      border-red-200
                      bg-red-50/80
                      text-red-600
                    `
                }
              `}
            >
              <div className="flex items-center gap-2 text-[10px] font-medium">
                <span
                  className={`
                    w-1.5 h-1.5 rounded-full

                    ${
                      isSaldoPositivo
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }
                  `}
                />

                tempo real
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* ENTRADAS / SAÍDAS */}
      {/* ========================================================= */}
      <div className="grid sm:grid-cols-1 gap-3 xl:grid-cols-2">
        {/* ===================================================== */}
        {/* ENTRADAS */}
        {/* ===================================================== */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            openModal("entrada");
          }}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.995 }}
          className="
            group
            relative
            overflow-hidden

            rounded-[16px]

            border border-emerald-200

            bg-[linear-gradient(135deg,#f0fdf4,#ffffff)]

            px-3
            py-2

            text-left

            transition-all
            duration-100

            hover:shadow-[0_16px_35px_rgba(16,185,129,0.14)]
          "
        >
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* LEFT */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 rounded-full bg-emerald-500" />

                <span className="text-[10px] uppercase tracking-[0.22em] text-emerald-700">
                  Entradas
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-[20px] sm:text-[18px] font-semibold tracking-[-0.02em] text-emerald-700">
                  {loading
                    ? "..."
                    : formatCurrency(entradas)}
                </h3>

                <p className="text-[10px] text-emerald-700/70">
                  {percentualEntrada.toFixed(1)}% do fluxo financeiro
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                flex items-center justify-center

                w-7 h-7
                rounded-2xl

                bg-emerald-500
                text-white

                shadow-[0_10px_24px_rgba(16,185,129,0.22)]
              "
            >
              ↓
            </div>
          </div>
        </motion.button>

        {/* ===================================================== */}
        {/* SAÍDAS */}
        {/* ===================================================== */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();

            openModal("saida");
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.995 }}
          className="
            group
            relative
            overflow-hidden

            rounded-[16px]

            border border-red-200

            bg-[linear-gradient(135deg,#fff1f2,#ffffff)]

            px-3
            py-2

            text-left

            transition-all
            duration-300

            hover:shadow-[0_16px_35px_rgba(239,68,68,0.14)]
          "
        >

          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* LEFT */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-red-500" />

                <span className="text-[10px] uppercase tracking-[0.22em] text-red-700">
                  Saídas
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-[20px] sm:text-[18px] font-semibold tracking-[-0.02em] text-red-600">
                  {loading
                    ? "..."
                    : formatCurrency(saidas)}
                </h3>

                <p className="text-[10px] text-red-600/70">
                  {percentualSaida.toFixed(1)}% do fluxo financeiro
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                flex items-center justify-center

                w-7 h-7
                rounded-2xl

                bg-red-500
                text-white

                shadow-[0_10px_24px_rgba(239,68,68,0.22)]
              "
            >
              ↑
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}