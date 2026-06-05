"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useEstoque } from "../hooks/useEstoque";

export function EstoqueCard() {
  const { resumo, loading } = useEstoque();
  const [open, setOpen] = useState(false);

  // ================= FORMATADORES =================
  function formatKg(value?: number | null): string {
    ////////////////////////////////////////////////////////////
    // FALLBACK
    ////////////////////////////////////////////////////////////

    if (value === undefined || value === null || Number.isNaN(value)) {
      return "0 kg";
    }

    ////////////////////////////////////////////////////////////
    // FORMAT
    ////////////////////////////////////////////////////////////

    return (
      value.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }) + " kg"
    );
  }

  function formatCurrency(value: number) {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  }

  function formatDate(value: string | Date) {
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR");
  }

  function formatTime(value: string | Date) {
    const date = new Date(value);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ================= DADOS =================
  const totalKg = resumo?.estoqueDisponivelKg ?? 0;

  const totalComprado = resumo?.valorComprado ?? 0;
  const totalVendido = resumo?.valorVendido ?? 0;
  const lucro = resumo?.lucro ?? 0;

  return (
    <>
      {/* ================= TRIGGER COMPACTO ================= */}
      <motion.div
        onClick={() => setOpen(true)}
        className="
  cursor-pointer

  w-full

  max-w-full

  sm:max-w-[420px]

  group
  relative
  overflow-hidden

  rounded-[var(--radius-md)]

  border border-[color:var(--border-soft)]

  bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

  px-4

  sm:px-4

  py-4

  sm:py-3

  flex items-center justify-between

  transition-[transform,box-shadow,border-color]
  duration-300

  hover:-translate-y-[1px]

  hover:border-[color:var(--brand)]

  hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]

  will-change-transform
"
      >
        {/* CAMADA VISUAL */}
        <div className="absolute inset-0 pointer-events-none">
          {/* textura leve */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,rgba(0,0,0,0.35)_1px,transparent_1px)] bg-[size:22px_22px]" />

          {/* glow contextual */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
            <div
              className={`
          absolute inset-0
          ${
            totalKg > 0
              ? "bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_60%)]"
              : "bg-[radial-gradient(circle_at_80%_10%,rgba(0,0,0,0.05),transparent_60%)]"
          }
        `}
            />
          </div>

          {/* linha topo */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        {/* ================= CONTEÚDO ================= */}
        <div className="relative z-10 flex items-center justify-between w-full">
          {/* ESQUERDA */}
          <div className="flex items-center gap-3">
            {/* ICON */}
            <div
              className={`
          relative
          w-9 h-9
          rounded-lg
          flex items-center justify-center

          border

          ${
            totalKg > 0
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-[color:var(--surface-200)] border-[color:var(--border-soft)] text-[color:var(--muted)]"
          }
        `}
            >
              {/* glow interno */}
              {totalKg > 0 && (
                <div className="absolute inset-0 rounded-lg opacity-40 pointer-events-none">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.25),transparent_70%)]" />
                </div>
              )}

              <span className="relative text-[14px]">📦</span>
            </div>

            {/* TEXTO */}
            <div className="space-y-[2px]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-soft)]">
                Estoque
              </p>

              <p className="text-[15px] font-semibold tracking-tight">
                {loading ? "..." : formatKg(totalKg)}
              </p>
            </div>
          </div>

          {/* DIREITA */}
          <div className="flex items-center gap-2">
            {/* STATUS */}
            <div
              className={`
          flex items-center gap-1.5

          px-2.5 py-[3px]
          rounded-full
          text-[10px]
          border
          transition-colors duration-300

          ${
            totalKg > 0
              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
              : "bg-[color:var(--surface-200)] border-[color:var(--border-soft)] text-[color:var(--muted)]"
          }
        `}
            >
              <span
                className={`
            w-[5px] h-[5px] rounded-full
            ${totalKg > 0 ? "bg-emerald-500 animate-pulse" : "bg-gray-400"}
          `}
              />

              {totalKg > 0 ? "disponível" : "zerado"}
            </div>

            {/* SETA */}
            <span className="text-[color:var(--muted-soft)] group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        </div>

        {/* BASE LINE */}
        <div
          className={`
      absolute bottom-0 left-0 h-[1.5px] w-full
      transition-colors duration-300

      ${
        totalKg > 0 ? "bg-emerald-500/60" : "bg-black/0 group-hover:bg-black/20"
      }
    `}
        />
      </motion.div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="
        fixed inset-0 z-50

        bg-black/40

        backdrop-blur-[3px]

        flex items-center justify-center

        p-4
      "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.16,
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="
          group
          relative
          overflow-hidden

          w-full
          max-w-[980px]

          max-h-[92dvh]

          overflow-y-auto

          rounded-[20px]

          sm:rounded-[20px]

          bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

          p-4

          sm:p-6
          space-y-6

          shadow-[0_50px_140px_rgba(0,0,0,0.30)]

          will-change-transform
        "
              initial={{
                y: 24,
                opacity: 0,
              }}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: 18,
                opacity: 0,
              }}
              transition={{
                duration: 0.18,
                ease: "easeOut",
              }}
            >
              {/* CAMADA VISUAL */}
              <div className="absolute inset-0 pointer-events-none">
                {/* textura */}
                <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle,rgba(0,0,0,0.4)_1px,transparent_1px)] bg-[size:24px_24px]" />

                {/* glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.10),transparent_60%)]" />
                </div>

                {/* linha topo */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              </div>

              {/* ================= HEADER ================= */}
              <div
                className="
                  relative z-10

                  flex
                  flex-col
                  sm:flex-row
                  sm:items-start

                  justify-between

                  gap-4
                "
              >
                {/* ================= LEFT ================= */}
                <div className="space-y-4">
                  {/* LABEL PREMIUM */}
                  <div className="flex items-center gap-3">
                    {/* INDICADOR */}
                    <div className="relative">
                      {/* CORE */}
                      <div
                        className="
                          w-[4px] h-6

                          rounded-full

                          bg-emerald-500

                          shadow-[0_0_22px_rgba(16,185,129,0.65)]
                        "
                      />

                      {/* GLOW */}
                      <div
                        className="
                          absolute inset-0

                          rounded-full

                          bg-emerald-500/60

                          blur-[8px]

                          opacity-70
                        "
                      />
                    </div>

                    {/* LABEL */}
                    <div
                      className="
                        flex items-center gap-2

                        px-3 py-1.5

                        rounded-full

                        border border-emerald-200/70

                        bg-emerald-50/80

                        backdrop-blur-md
                      "
                    >
                      {/* DOT */}
                      <span
                        className="
                          w-2 h-2

                          rounded-full

                          bg-emerald-500

                          animate-pulse
                        "
                      />

                      <span
                        className="
                          text-[9px]

                          uppercase

                          tracking-[0.34em]

                          font-semibold

                          text-emerald-700
                        "
                      >
                        Controle operacional
                      </span>
                    </div>
                  </div>

                  {/* TITLE */}
                  <div className="space-y-4">
                    <h2
                      className="
                        text-[20px]

                        sm:text-[28px]

                        md:text-[38px]

                        font-semibold

                        tracking-[-0.06em]

                        leading-[0.85]

                        text-[color:var(--foreground)]
                      "
                    >
                      Controle de estoque
                    </h2>

                    {/* SUBTEXT */}
                  </div>
                </div>

                {/* ================= RIGHT ================= */}
                <div
                  className="
                    flex w-full sm:w-auto items-center justify-between gap-3
                  "
                >
                  {/* STATUS */}
                  <div
                    className={`
                      relative

                      overflow-hidden

                      flex items-center gap-2.5

                      h-12

                      px-2

                      rounded-xl

                      border

                      backdrop-blur-xl

                      shadow-[0_12px_30px_rgba(0,0,0,0.05)]

                      transition-colors duration-100

                      ${
                        totalKg > 0
                          ? `
                            bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.75))]
                            border-emerald-200/80
                            text-emerald-700
                          `
                          : `
                            bg-[linear-gradient(135deg,rgba(0,0,0,0.04),rgba(255,255,255,0.75))]
                            border-[color:var(--border-soft)]
                            text-[color:var(--muted)]
                          `
                      }
                    `}
                  >
                    {/* GLOW */}
                    {totalKg > 0 && (
                      <div
                        className="
                          absolute inset-0

                          bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.16),transparent_70%)]

                          pointer-events-none
                        "
                      />
                    )}

                    {/* DOT */}
                    <span
                      className={`
                        relative z-10

                        w-[10px] h-[10px]

                        rounded-full

                        ${
                          totalKg > 0
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-gray-400"
                        }
                      `}
                    />

                    {/* TEXT */}
                    <span
                      className="
                        relative z-10

                        text-[10px]

                        font-semibold

                        tracking-[0.08em]
                      "
                    >
                      {totalKg > 0 ? "estoque disponível" : "sem estoque"}
                    </span>
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={() => setOpen(false)}
                    className="
    group

    relative

    w-9 h-9

    rounded-2xl

    flex items-center justify-center

    border border-white/70

    bg-white/80

    backdrop-blur-sm

    shadow-[0_12px_30px_rgba(0,0,0,0.05)]

    text-[color:var(--muted)]

    hover:text-[color:var(--foreground)]

    hover:border-[color:var(--border-strong)]

    hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]

    hover:scale-[1.02]

    active:scale-[0.98]

    transition-all
    duration-300

    will-change-transform

    overflow-hidden
  "
                  >
                    {/* LIGHT */}
                    <div
                      className="
                        absolute inset-x-0 top-0 h-[1px]

                        bg-gradient-to-r
                        from-transparent
                        via-white/90
                        to-transparent
                      "
                    />

                    {/* ICON */}
                    <span
                      className="
                        relative z-10

                        text-[16px]

                        transition-transform duration-300

                        group-hover:rotate-90
                      "
                    >
                      ✕
                    </span>
                  </button>
                </div>
              </div>

              {/* ================= KPIs ================= */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4">
                <Stat
                  label="Disponível"
                  value={formatKg(resumo?.estoqueDisponivelKg ?? 0)}
                />

                <Stat
                  label="Comprado"
                  value={formatCurrency(resumo?.valorComprado ?? 0)}
                />

                <Stat
                  label="Vendido"
                  value={formatCurrency(resumo?.valorVendido ?? 0)}
                />

                <Stat
                  label="Lucro"
                  value={formatCurrency(resumo?.lucro ?? 0)}
                />
              </div>

              {/* ================= TIMELINE ================= */}
              <div className="space-y-4 max-h-[50dvh] sm:max-h-[400px] overflow-auto pr-1">
                {/* EMPTY STATE */}
                {!resumo?.timeline || resumo.timeline.length === 0 ? (
                  <div
                    className="
        flex flex-col items-center justify-center
        py-12 text-center space-y-2
      "
                  >
                    <div
                      className="
          w-10 h-10 rounded-md
          flex items-center justify-center
          bg-[color:var(--surface-200)]
          text-[color:var(--muted-soft)]
        "
                    >
                      —
                    </div>

                    <p className="text-[12px] text-[color:var(--muted)]">
                      Nenhuma movimentação encontrada
                    </p>
                  </div>
                ) : (
                  resumo.timeline.map((item, i) => {
                    const isEntrada = item.tipo === "ENTRADA";

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.16,
                          ease: "easeOut",
                        }}
                        className="
    group
    relative

    flex

    flex-col

    sm:flex-row

    sm:items-center

    justify-between

    px-3 py-3

    sm:px-4

    rounded-[var(--radius-md)]

    border border-transparent

    hover:-translate-y-[2px]

    hover:border-[color:var(--border-soft)]

    hover:bg-[color:var(--surface-200)]

    transition-all
    duration-200

    will-change-transform

    gap-3
  "
                      >
                        {/* LINHA LATERAL (IMPACTO VISUAL) */}
                        <div
                          className={`
          absolute left-0 top-0 h-full w-[3px] rounded-l-md

          ${isEntrada ? "bg-emerald-500/60" : "bg-red-500/60"}
        `}
                        />

                        {/* ESQUERDA */}
                        <div className="flex items-center gap-3">
                          {/* ICON */}
                          <div
                            className={`
            w-9 h-9 rounded-md flex items-center justify-center

            ${
              isEntrada
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
            }
          `}
                          >
                            {isEntrada ? "↑" : "↓"}
                          </div>

                          {/* INFO */}
                          <div className="space-y-[2px]">
                            <p className="text-[13px] font-medium leading-tight">
                              {isEntrada
                                ? "Compra registrada"
                                : "Venda realizada"}
                            </p>

                            <p className="text-[12px] text-[color:var(--foreground)] font-medium break-words">
                              {isEntrada
                                ? `Fornecedor: ${item.cliente}`
                                : `Cliente: ${item.cliente}`}
                            </p>

                            <p className="text-[11px] text-[color:var(--muted-soft)]">
                              {formatDate(item.data)} • {formatTime(item.data)}
                            </p>
                          </div>
                        </div>

                        {/* DIREITA */}
                        <div className="text-left sm:text-right space-y-[2px]">
                          <p
                            className={`
            text-[13px] font-semibold tracking-tight
            ${isEntrada ? "text-emerald-600" : "text-red-500"}
          `}
                          >
                            {isEntrada ? "+" : "-"}{" "}
                            {formatKg(
                              isEntrada ? item.kgBruto : item.pesoBruto,
                            )}
                          </p>

                          <p className="text-[12px] font-medium text-[color:var(--foreground)]">
                            {formatCurrency(item.valor)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="
    group
    relative
    overflow-hidden

    px-4

    sm:px-6

    xl:px-8

    py-5

    sm:py-6

    xl:py-8

    rounded-[var(--radius-md)]

    border border-[color:var(--border-soft)]

    bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

    space-y-1

    transition-all
    duration-100

    hover:-translate-y-[1px]

    hover:border-[color:var(--border-strong)]

    hover:shadow-[0_8px_18px_rgba(0,0,0,0.05)]

    will-change-transform
  "
    >
      {/* 🔥 GLOW SUAVE */}
      <div
        className="
    absolute inset-0

    opacity-0
    group-hover:opacity-100

    transition-opacity
    duration-100

    pointer-events-none
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

      blur-[20px]
    "
        />
      </div>

      {/* LABEL */}
      <p
        className="
          text-[10px]

          sm:text-[11px]
          
          uppercase
          tracking-[0.30em]
          text-[color:var(--muted-soft)]
        "
      >
        {label}
      </p>

      {/* VALOR */}
      <p
        className="
          text-[14px]

          sm:text-[16px]

          font-semibold
          tracking-tight

          text-[color:var(--foreground)]

          transition-colors duration-100
        "
      >
        {value}
      </p>

      {/* LINHA VISUAL INFERIOR */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}
