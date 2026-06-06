"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { useCompras } from "@/modules/compras/hooks/useCompras";

function formatCurrency(value: number | string) {
  return `R$ ${Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("pt-BR");
}

// =========================================================
// META FINANCEIRA
// =========================================================
function getCompraMeta(desconto: number, custoPorKg: number) {
  if (desconto > 1000) {
    return {
      label: "Alto desconto",

      className: `
        border-amber-200
        bg-amber-50
        text-amber-700
      `,
    };
  }

  if (desconto > 0) {
    return {
      label: "Com desconto",

      className: `
        border-blue-200
        bg-blue-50
        text-blue-700
      `,
    };
  }

  if (custoPorKg > 0) {
    return {
      label: "Operação válida",

      className: `
        border-emerald-200
        bg-emerald-50
        text-emerald-700
      `,
    };
  }

  return {
    label: "Sem cálculo",

    className: `
      border-gray-200
      bg-gray-100
      text-gray-600
    `,
  };
}

export function FinanceiroComprasTable() {
  const { compras, loading } = useCompras();

  // =========================================================
  // PROCESSAMENTO
  // =========================================================
  const comprasProcessadas = useMemo(() => {
    return compras.map((compra) => {
      const valorTotal = Number(compra.valorTotal);

      // 🔥 NOVA REGRA
      // valor bruto agora usa valorTotal
      // pois valorPorKg não existe mais
      const valorBruto = valorTotal;

      const descontoFinanceiro = 0;

      const custoPorKgReal =
        Number(compra.kgLiquido) > 0
          ? valorTotal / Number(compra.kgLiquido)
          : 0;

      return {
        ...compra,

        valorBruto,

        descontoFinanceiro,

        custoPorKgReal,
      };
    });
  }, [compras]);

  return (
    <div className="space-y-4">
      {/* ===================================================== */}
      {/* CONTAINER */}
      {/* ===================================================== */}
      <div
        className="
          group
          relative
          overflow-hidden

          rounded-[20px]

          border border-[color:var(--border-soft)]

          bg-[color:var(--surface-100)]

          shadow-[0_8px_24px_rgba(0,0,0,0.04)]
        "
      >
        {/* ================================================= */}
        {/* FX */}
        {/* ================================================= */}
        <div className="absolute inset-0 pointer-events-none"></div>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}
        <div
          className="
            relative z-10

            flex items-center justify-between

            px-5
            py-4

            border-b border-[color:var(--border-soft)]
          "
        >
          {/* LEFT */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[color:var(--brand)]" />

              <span className="text-[10px] uppercase tracking-[0.20em] text-[color:var(--muted-soft)]">
                Financeiro
              </span>
            </div>

            <h2 className="text-[20px] sm:text-[18px] font-semibold tracking-tight text-[color:var(--foreground)]">
              Compras registradas
            </h2>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <p className="text-[20px] sm:text-[18px] font-semibold tracking-tight">
              {compras.length}
            </p>

            <p className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              registros
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* TABLE HEADER */}
        {/* ================================================= */}
        <div
          className="
            relative
            z-10

            hidden

            lg:block

            px-5
            py-2.5


            border-b

            border-[color:var(--border-soft)]

            bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))]
          "
        >
          {/* ================================================= */}
          {/* GRID */}
          {/* ================================================= */}
          <div
            className="
              relative
              z-10

              grid

              grid-cols-[2.2fr_0.9fr_0.8fr_1.1fr_1fr_1.2fr_1.1fr]

              items-center
              gap-4
            "
          >
            {/* ============================================= */}
            {/* FORNECEDOR */}
            {/* ============================================= */}
            <div className="flex items-center gap-2">
              <div
                className="
                  w-1 h-4 rounded-full

                  bg-indigo-500

                  shadow-[0_0_12px_rgba(99,102,241,0.55)]
                "
              />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]

                  text-[color:var(--muted-soft)]
                "
              >
                Fornecedor
              </span>
            </div>

            {/* ============================================= */}
            {/* KG */}
            {/* ============================================= */}
            <div className="flex items-center">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                KG
              </span>
            </div>

            {/* ============================================= */}
            {/* CAMINHÕES */}
            {/* ============================================= */}
            <div className="flex items-center">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Cam.
              </span>
            </div>

            {/* ============================================= */}
            {/* BRUTO */}
            {/* ============================================= */}
            <div className="flex items-center">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Bruto
              </span>
            </div>

            {/* ============================================= */}
            {/* DESCONTO */}
            {/* ============================================= */}
            <div className="flex items-center">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Desc.
              </span>
            </div>

            {/* ============================================= */}
            {/* LÍQUIDO */}
            {/* ============================================= */}
            <div className="flex items-center">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Líquido
              </span>
            </div>

            {/* ============================================= */}
            {/* STATUS */}
            {/* ============================================= */}
            <div className="flex items-center justify-start">
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Status
              </span>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* BODY */}
        {/* ================================================= */}
        <div
          className="
    relative
    z-10

    max-h-[70vh]

    lg:max-h-[520px]

    overflow-auto
  "
        >
          {/* ============================================= */}
          {/* LOADING */}
          {/* ============================================= */}
          {loading && (
            <div className="p-6 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="
                    h-[68px]

                    rounded-2xl

                    bg-[color:var(--surface-200)]

                    animate-pulse
                  "
                />
              ))}
            </div>
          )}

          {/* ============================================= */}
          {/* ROWS */}
          {/* ============================================= */}
          {!loading &&
            comprasProcessadas.map((compra, i) => {
              const meta = getCompraMeta(
                compra.descontoFinanceiro,
                compra.custoPorKgReal,
              );

              return (
                <motion.div
                  key={compra.id}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.015,
                  }}
                  whileHover={{
                    y: -1,
                  }}
                  className="
                    group/row
                    relative

                    grid

                    grid-cols-1

                    lg:grid-cols-[1.8fr_0.7fr_0.7fr_1fr_1fr_1fr_1fr]

                    items-start

                    lg:items-center

                    px-4

                    sm:px-5

                    py-4
                    sm:py-3

                    border-b border-[color:var(--border-soft)]

                    transition-all duration-200

                    hover:bg-[color:var(--surface-200)]

                    gap-3

                    lg:gap-0
                  "
                >
                  {/* ===================================== */}
                  {/* FORNECEDOR */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex flex-col gap-1 leading-tight lg:col-auto">
                    <span className="text-[12px] font-semibold text-[color:var(--foreground)]">
                      {compra.fornecedor?.nome ??
                        compra.cliente?.nome ??
                        "Sem fornecedor"}
                    </span>

                    <span className="text-[10px] text-[color:var(--muted-soft)]">
                      {formatDate(compra.createdAt)}
                    </span>

                    {compra.usuarioResponsavelNome && (
                      <span className="text-[10px] text-[color:var(--muted-soft)]">
                        Por: {compra.usuarioResponsavelNome}
                      </span>
                    )}
                  </div>

                  {/* ===================================== */}
                  {/* KG */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block">
                    <span className="text-[11px] text-[color:var(--muted-soft)] lg:hidden font-medium">
                      {Number(compra.kgLiquido).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {/* ===================================== */}
                  {/* CAMINHÕES */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block">
                    <span className="text-[11px] text-[color:var(--muted-soft)] lg:hidden font-medium">
                      {compra.caminhoes ?? "—"}
                    </span>
                  </div>

                  {/* ===================================== */}
                  {/* BRUTO */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block">
                    <span className="text-[11px] text-[color:var(--muted-soft)] lg:hidden font-medium">
                      {formatCurrency(compra.valorBruto)}
                    </span>
                  </div>

                  {/* ===================================== */}
                  {/* DESCONTO */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block">
                    {compra.descontoFinanceiro > 0 ? (
                      <span className="text-[11px] text-[color:var(--muted-soft)] lg:hidden font-medium text-red-500">
                        - {formatCurrency(compra.descontoFinanceiro)}
                      </span>
                    ) : (
                      <span className="text-[12px] text-[color:var(--muted-soft)]">
                        —
                      </span>
                    )}
                  </div>

                  {/* ===================================== */}
                  {/* LÍQUIDO */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block flex-col gap-1">
                    <span className="text-[12px] font-semibold">
                      {formatCurrency(compra.valorTotal)}
                    </span>

                    <span className="text-[10px] flex justify-between lg:block text-[color:var(--muted-soft)]">
                      {formatCurrency(compra.custoPorKgReal)}
                      /kg
                    </span>
                  </div>

                  {/* ===================================== */}
                  {/* STATUS */}
                  {/* ===================================== */}
                  <div className="relative z-10 flex justify-between lg:block">
                    <span
                      className={`
                        inline-flex items-center

                        px-2
                        py-[3px]

                        rounded-full

                        text-[11px]
                        sm:text-[9px]
                        
                        font-medium

                        border

                        ${meta.className}
                      `}
                    >
                      {meta.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}

          {/* ============================================= */}
          {/* EMPTY */}
          {/* ============================================= */}
          {!loading && compras.length === 0 && (
            <div
              className="
                flex flex-col items-center justify-center

                py-12

                text-center
                space-y-4
              "
            >
              <div
                className="
                  flex items-center justify-center

                  w-10 h-10

                  rounded-2xl

                  bg-[color:var(--surface-200)]

                  text-[20px]

                  sm:text-[18px]
                "
              >
                🚚
              </div>

              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[color:var(--foreground)]">
                  Nenhuma compra registrada
                </p>

                <p className="text-[12px] text-[color:var(--muted)]">
                  Registre compras para visualizar o fluxo operacional
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
