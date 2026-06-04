"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useVendas } from "@/modules/vendas/hooks/useVendas";

function formatCurrency(value: number | string) {
  return `R$ ${Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

// 🔥 STATUS VISUAL MELHORADO
function getStatusMeta(status: "PAGO" | "PENDENTE" | "PARCIAL") {
  switch (status) {
    case "PAGO":
      return {
        label: "Pago",
        className: "bg-emerald-100 text-emerald-600 border-emerald-200",
      };

    case "PARCIAL":
      return {
        label: "Parcial",
        className: "bg-yellow-100 text-yellow-600 border-yellow-200",
      };

    case "PENDENTE":
      return {
        label: "Pendente",
        className: "bg-red-100 text-red-600 border-red-200",
      };
  }
}

// 🔥 DETECÇÃO DE ATRASO (PREPARADO PRA BACK FUTURO)
function isAtrasado(createdAt: string): boolean {
  const data = new Date(createdAt);
  const now = new Date();

  const diffDays = (now.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays > 7; // 🔥 regra simples (ajustável depois)
}

export function FinanceiroVendasTable() {
  const { vendas, loading } = useVendas();

  const vendasProcessadas = useMemo(() => {
    return vendas.map((venda) => {
      const atraso =
        venda.statusPagamento !== "PAGO" && isAtrasado(venda.createdAt);

      return {
        ...venda,
        atraso,
      };
    });
  }, [vendas]);

  return (
    <div className="space-y-3">
      {/* 🔥 REMOVIDO HEADER DUPLICADO */}

      {/* TABELA */}
      <div
        className="
          overflow-y-auto
          overflow-x-auto
          overscroll-x-contain
          rounded-[16px]

          sm:rounded-[18px]

          border border-[color:var(--border-soft)]
          bg-[color:var(--surface-100)]
        "
      >
        {/* HEAD */}
        <div
          className="
            grid
            min-w-[920px]
             grid-cols-[minmax(180px,2fr)_90px_110px_130px_130px_110px_100px]

            px-3 py-2

            text-[10px]
            uppercase tracking-[0.14em]
            text-[color:var(--muted-soft)]
            border-b border-[color:var(--border-soft)]
          "
        >
          <span>Cliente</span>
          <span>KG</span>
          <span>R$/KG</span>
          <span>Total</span>
          <span>Status</span>
          <span>Data</span>
          <span className="text-right">Ações</span>
        </div>

        {/* BODY */}
        <div className="max-h-[360px] sm:max-h-[460px] overflow-auto overflow-x-auto">
          {/* LOADING */}
          {loading && (
            <div className="divide-y divide-[color:var(--border-soft)]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="
          relative
          overflow-hidden

          grid
          grid-cols-[minmax(180px,2fr)_90px_110px_130px_130px_110px_100px]

          items-center

          min-h-[58px]

          px-3
          py-2

          gap-4
        "
                >
                  {/* SHIMMER */}
                  <div
                    className="
            absolute
            inset-0

            -translate-x-full

            animate-[shimmer_1.8s_infinite]

            bg-gradient-to-r
            from-transparent
            via-white/40
            to-transparent
          "
                  />

                  {/* CLIENTE */}
                  <div className="space-y-2">
                    <div className="h-3 w-[140px] rounded bg-[color:var(--surface-200)]" />

                    <div className="h-2 w-[90px] rounded bg-[color:var(--surface-200)]" />
                  </div>

                  {/* KG */}
                  <div className="h-3 w-[60px] rounded bg-[color:var(--surface-200)]" />

                  {/* R$/KG */}
                  <div className="h-3 w-[70px] rounded bg-[color:var(--surface-200)]" />

                  {/* TOTAL */}
                  <div className="h-3 w-[90px] rounded bg-[color:var(--surface-200)]" />

                  {/* STATUS */}
                  <div className="h-5 w-[72px] rounded-full bg-[color:var(--surface-200)]" />

                  {/* DATA */}
                  <div className="h-3 w-[80px] rounded bg-[color:var(--surface-200)]" />

                  {/* AÇÕES */}
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-[42px] rounded-lg bg-[color:var(--surface-200)]" />

                    <div className="h-8 w-[52px] rounded-lg bg-[color:var(--surface-200)]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LISTA */}
          {!loading &&
            vendasProcessadas.map((venda, i) => {
              const statusMeta = getStatusMeta(venda.statusPagamento);

              return (
                <motion.div
                  key={venda.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  className="
                    grid grid-cols-[minmax(180px,2fr)_90px_110px_130px_130px_110px_100px]
                    px-3 py-2
                    text-[12px]
                    border-b border-[color:var(--border-soft)]

                    odd:bg-white
                    even:bg-[color:var(--surface-200)]/35

                    hover:bg-[rgba(99,102,241,0.04)]
                    transition
                    items-center
                  "
                >
                  {/* CLIENTE */}
                  <div className="flex flex-col leading-tight min-w-[180px]">
                    <span className="font-medium truncate text-[color:var(--foreground)]">
                      {venda.cliente?.nome ?? "Sem cliente"}
                    </span>

                    <span className="text-[11px] sm:text-[10px] text-[color:var(--muted-soft)]">
                      {venda.cliente?.telefone ?? "—"}
                    </span>

                    {venda.usuarioResponsavelNome && (
                      <span className="text-[10px] text-[color:var(--muted-soft)]">
                        Por: {venda.usuarioResponsavelNome}
                      </span>
                    )}
                  </div>

                  {/* KG */}
                  <span>{venda.quantidadeKg}</span>

                  {/* VALOR */}
                  {/* VALOR */}
                  <span>{formatCurrency(venda.valorPorKg ?? 0)}</span>

                  {/* TOTAL */}
                  <span className="font-medium">
                    {formatCurrency(venda.valorTotal)}
                  </span>

                  {/* STATUS */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`
                        px-2.5 py-1
                        font-medium
                        tracking-[0.04em]
                        rounded-full
                        text-[9px]
                        border
                        ${statusMeta.className}
                      `}
                    >
                      {statusMeta.label}
                    </span>

                    {venda.atraso && (
                      <span className="text-[10px] text-red-500">⚠</span>
                    )}
                  </div>

                  {/* DATA */}
                  <span className="text-[color:var(--muted)] text-[11px]">
                    {formatDate(venda.createdAt)}
                  </span>

                  {/* AÇÕES */}
                  <div className="flex justify-end gap-1.5">
                    <button
                      className="
    h-6
    px-2

    rounded-lg

    border border-[color:var(--border-soft)]

    bg-white

    text-[11px]
    font-medium

    text-[color:var(--muted)]

    transition-all duration-200

    hover:border-[color:var(--border-strong)]
    hover:text-[color:var(--foreground)]
    hover:bg-[color:var(--surface-200)]
  "
                    >
                      Ver
                    </button>

                    <button
                      className="
    h-6
    px-2

    rounded-lg

    border-amber-200

    bg-amber-50

    text-[11px]
    font-medium

    text-red-600

    transition-all duration-200

    hover:bg-amber-100
    hover:border-amber-300
  "
                    >
                      Editar
                    </button>
                  </div>
                </motion.div>
              );
            })}

          {/* EMPTY */}
          {!loading && vendas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div
                className="
                  w-12 h-12
                  rounded-xl
                  bg-[color:var(--surface-200)]
                  flex items-center justify-center
                  text-[color:var(--muted-soft)]
                "
              >
                📊
              </div>

              <div className="text-center space-y-1">
                <p className="text-[13px] font-medium">
                  Nenhuma venda registrada
                </p>

                <p className="text-[11px] text-[color:var(--muted)]">
                  Registre uma nova venda para começar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
