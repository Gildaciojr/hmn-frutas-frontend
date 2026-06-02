"use client";

import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string;
  delta?: number;
  highlight?: boolean; // 🔥 NOVO
}

export function KpiCard({ label, value, delta, highlight }: Props) {
  const hasValue =
    value !== "0" && value !== "R$ 0,00" && value !== "0 kg" && value !== "0";

  const isPositive = typeof delta === "number" ? delta >= 0 : null;

  return (
    <motion.div
      className={`
    group
    relative
    overflow-hidden

    ${highlight ? "px-3.5 py-3.5" : "px-3 py-2.5"}

    rounded-[var(--radius-md)]

    border

    transition-all
    duration-300

    hover:-translate-y-[3px]

    will-change-transform

    ${
      highlight
        ? `
          border-emerald-300/30

          bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(17,24,39,0.94))]

          shadow-[0_14px_38px_rgba(16,185,129,0.12)]

          hover:shadow-[0_18px_50px_rgba(16,185,129,0.18)]

          backdrop-blur-sm
        `
        : `
          border-white/8

          bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.58))]

          backdrop-blur-sm

          shadow-[0_8px_22px_rgba(15,23,42,0.06)]

          hover:border-white/16

          hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.70))]

          hover:shadow-[0_14px_34px_rgba(15,23,42,0.10)]
        `
    }
  `}
    >
      {/* ================= CAMADA VISUAL ================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* GRADIENT BASE */}
        <div
          className="
      absolute inset-0

      bg-gradient-to-br
      from-transparent
      via-black/[0.015]
      to-black/[0.03]
    "
        />

        {/* 🔥 GLOW */}
        <div
          className="
      absolute inset-0

      opacity-0
      group-hover:opacity-100

      transition-opacity
      duration-300

      pointer-events-none
    "
        >
          <div
            className={`
        absolute

        top-0
        right-0

        w-[120px]
        h-[120px]

        rounded-full

        blur-[24px]

        ${
          highlight
            ? "bg-emerald-400/16"
            : hasValue
              ? "bg-emerald-400/10"
              : "bg-black/5"
        }
      `}
          />
        </div>

        {/* LINHA SUPERIOR */}
        <div
          className="
      absolute inset-x-0 top-0 h-[1px]

      bg-gradient-to-r
      from-transparent
      via-black/10
      to-transparent

      opacity-40
    "
        />
      </div>

      {/* ================= CONTEÚDO ================= */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <p
            className={`
              text-[9px]
              uppercase tracking-[0.18em]

              ${
                highlight
                  ? "text-emerald-600"
                  : "text-[color:var(--muted-soft)]"
              }
            `}
          >
            {label}
          </p>

          <div className="flex items-center gap-1.5">
            {/* DOT */}
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                transition-all duration-300

                ${
                  hasValue
                    ? "bg-emerald-500 opacity-100"
                    : "bg-transparent opacity-0"
                }
              `}
            />

            {/* DELTA */}
            {typeof delta === "number" && (
              <span
                className={`
                  text-[9px] font-medium

                  ${isPositive ? "text-emerald-600" : "text-red-500"}
                `}
              >
                {isPositive ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* VALOR */}
        <div className="mt-2 flex items-end justify-between">
          <p
            className={`
              ${highlight ? "text-[21px]" : "text-[17px]"}

              font-semibold
              tracking-tight

              ${
                hasValue
                  ? "text-[color:var(--foreground)]"
                  : "text-[color:var(--muted)]"
              }
            `}
          >
            {value}
          </p>
        </div>
      </div>

      {/* ================= BASE LINE ================= */}
      <div
        className={`
    absolute bottom-0 left-0

    h-[1.5px]
    w-full

    transition-colors
    duration-300

    ${
      highlight
        ? "bg-emerald-500"
        : hasValue
          ? "bg-emerald-500/60"
          : "bg-black/0 group-hover:bg-black/20"
    }
  `}
      />
    </motion.div>
  );
}
