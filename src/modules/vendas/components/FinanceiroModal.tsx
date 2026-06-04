"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { useFinanceiroModalStore } from "@/core/stores/useFinanceiroModalStore";
import { useFluxoFinanceiro } from "@/modules/vendas/hooks/useFinanceiro";
import { api } from "@/core/http/api";

import { useMutation, useQueryClient } from "@tanstack/react-query";

function formatCurrency(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

export function FinanceiroModal() {
  const { open, closeModal, tipo } =
    useFinanceiroModalStore();

  const { fluxo } = useFluxoFinanceiro();

  const queryClient = useQueryClient();

  const [valor, setValor] = useState("");

  const [descricao, setDescricao] = useState("");

  const isEntrada = tipo === "entrada";

  const isSaida = tipo === "saida";

  const isGeral = !tipo;

  // =========================================================
  // MUTATION
  // =========================================================
  const createMutation = useMutation({
    mutationFn: async () => {
      const numericValue = Number(
        valor.replace(",", "."),
      );

      return api.post("/financeiro", {
        tipo: isEntrada ? "ENTRADA" : "SAIDA",

        valor: numericValue,

        descricao,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["financeiro-resumo"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["financeiro-fluxo"],
        }),
      ]);

      setValor("");

      setDescricao("");

      closeModal();
    },
  });

  // =========================================================
  // FILTRO
  // =========================================================
  const dataFiltrada = useMemo(() => {
    return fluxo?.filter((t) => {
      if (isEntrada) return t.tipo === "ENTRADA";

      if (isSaida) return t.tipo === "SAIDA";

      return true;
    });
  }, [fluxo, isEntrada, isSaida]);

  // =========================================================
  // ESC
  // =========================================================
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
      }
    }

    if (open) {
      window.addEventListener("keydown", handleKey);

      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKey);

      document.body.style.overflow = "auto";
    };
  }, [open, closeModal]);

  // =========================================================
  // SUBMIT
  // =========================================================
  async function handleSubmit() {
    const numericValue = Number(
      valor.replace(",", "."),
    );

    if (!numericValue || numericValue <= 0) {
      return;
    }

    await createMutation.mutateAsync();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ===================================================== */}
          {/* BACKDROP */}
          {/* ===================================================== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="
              fixed inset-0 z-[90]

              bg-black/45
              backdrop-blur-[6px]
            "
          />

          {/* ===================================================== */}
          {/* MODAL */}
          {/* ===================================================== */}
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 16,
              scale: 0.98,
            }}
            transition={{
              duration: 0.22,
            }}
            className="
              fixed
              z-[100]

              left-1/2
              top-1/2

              -translate-x-1/2
              -translate-y-1/2

              w-[98%]

              sm:w-[96%]

              max-w-[980px]

              max-h[95vh]

              overflow-hidden

              rounded-[20px]

              sm:rounded-[26px]

              border border-white/20

              bg-[color:var(--surface-100)]

              shadow-[0_40px_120px_rgba(0,0,0,0.30)]
            "
          >
            {/* ================================================= */}
            {/* BACKGROUND FX */}
            {/* ================================================= */}
            <div className="absolute inset-0 pointer-events-none">
              {/* textura */}
              <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle,rgba(0,0,0,0.45)_1px,transparent_1px)] bg-[size:24px_24px]" />

              {/* glow */}
              <div
                className={`
                  absolute inset-0

                  ${
                    isEntrada
                      ? "bg-[radial-gradient(circle_at_90%_0%,rgba(16,185,129,0.14),transparent_45%)]"
                      : isSaida
                        ? "bg-[radial-gradient(circle_at_90%_0%,rgba(239,68,68,0.14),transparent_45%)]"
                        : "bg-[radial-gradient(circle_at_90%_0%,rgba(99,102,241,0.12),transparent_45%)]"
                  }
                `}
              />
            </div>

            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}
            <div
              className="
                relative z-10

                flex

                flex-col

                sm:flex-row

                sm:items-start

                justify-between

                px-4

                sm:px-5

                py-4

                gap-4

                border-b border-[color:var(--border-soft)]
              "
            >
              {/* LEFT */}
              <div className="space-y-2">
                {/* TOP */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`
                      w-1 h-5 rounded-full

                      ${
                        isEntrada
                          ? "bg-emerald-500"
                          : isSaida
                            ? "bg-red-500"
                            : "bg-[color:var(--brand)]"
                      }
                    `}
                  />

                  <span className="text-[10px] uppercase tracking-[0.30em] text-[color:var(--muted-soft)]">
                    Financeiro
                  </span>
                </div>

                {/* TITLE */}
                <div className="space-y-1">
                  <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
                    {isEntrada && "Nova entrada"}

                    {isSaida && "Nova saída"}

                    {isGeral && "Painel financeiro"}
                  </h2>

                  <p className="text-[11px] text-[color:var(--muted)]">
                    {isEntrada &&
                      "Registro manual de entrada financeira"}

                    {isSaida &&
                      "Registro manual de saída financeira"}

                    {isGeral &&
                      "Visão consolidada do fluxo financeiro"}
                  </p>
                </div>
              </div>

              {/* CLOSE */}
              <button
                onClick={closeModal}
                className="
                  flex items-center justify-center

                  w-9 h-9
                  rounded-xl

                  border border-[color:var(--border-soft)]

                  bg-[color:var(--surface-200)]

                  text-[18px]
                  text-[color:var(--muted)]

                  transition-all duration-200

                  hover:border-[color:var(--border-strong)]
                  hover:bg-white
                  hover:text-[color:var(--foreground)]
                  hover:rotate-90
                "
              >
                ✕
              </button>
            </div>

            {/* ================================================= */}
            {/* BODY */}
            {/* ================================================= */}
            <div className="relative z-10 p-4 sm:p-6 xl:p-7 space-y-5">
              {/* ============================================= */}
              {/* FORM */}
              {/* ============================================= */}
              {(isEntrada || isSaida) && (
                <div
                  className="
                    grid 
                    grid-cols-1
                    xl:grid-cols-[1fr_1fr_auto]
                    gap-4
                  "
                >
                  {/* VALOR */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
                      Valor
                    </span>

                    <div className="relative group">
                      <span className="absolute left-4 top-[13px] text-[12px] text-[color:var(--muted)]">
                        R$
                      </span>

                      <input
                        value={valor}
                        onChange={(e) =>
                          setValor(e.target.value)
                        }
                        placeholder="0,00"
                        className="
                          w-full

                          h-[48px]

                          pl-10
                          pr-4

                          rounded-2xl

                          border border-[color:var(--border-soft)]

                          bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

                          text-[16px]
                          md:text-[14px]

                          text-[color:var(--foreground)]

                          outline-none

                          transition-all duration-200

                          hover:border-[color:var(--border-strong)]
                          hover:shadow-[0_6px_14px_rgba(0,0,0,0.04)]

                          focus:border-[color:var(--brand)]
                          focus:ring-4
                          focus:ring-[rgba(99,102,241,0.12)]
                        "
                      />

                      {/* glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_85%_15%,rgba(99,102,241,0.10),transparent_60%)]" />
                      </div>
                    </div>
                  </div>

                  {/* DESCRIÇÃO */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
                      Descrição
                    </span>

                    <input
                      value={descricao}
                      onChange={(e) =>
                        setDescricao(e.target.value)
                      }
                      placeholder="Ex: Frete, ajuste, receita..."
                      className="
                        w-full

                        h-[42px]

                        px-4

                        rounded-[14px]

                        border border-[color:var(--border-soft)]

                        bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

                        text-[16px]

                        md:text-[14px]

                        outline-none

                        transition-all duration-200

                        hover:border-[color:var(--border-strong)]
                        hover:shadow-[0_6px_14px_rgba(0,0,0,0.04)]

                        focus:border-[color:var(--brand)]
                        focus:ring-4
                        focus:ring-[rgba(99,102,241,0.12)]
                      "
                    />
                  </div>

                  {/* BUTTON */}
                  <div className="flex items-end">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        createMutation.isPending
                      }
                      className={`
                        w-full

                        xl:w-auto

                        h-[46px]

                        xl:h-[42px]

                        px-5

                        rounded-[14px]

                        text-[13px]
                        font-medium
                        text-white

                        transition-all duration-200

                        disabled:opacity-60
                        disabled:cursor-not-allowed

                        ${
                          isEntrada
                            ? `
                              bg-emerald-600

                              hover:bg-emerald-500

                              shadow-[0_14px_28px_rgba(16,185,129,0.22)]
                            `
                            : `
                              bg-red-500

                              hover:bg-red-400

                              shadow-[0_14px_28px_rgba(239,68,68,0.22)]
                            `
                        }
                      `}
                    >
                      {createMutation.isPending
                        ? "Salvando..."
                        : "Salvar"}
                    </button>
                  </div>
                </div>
              )}

              {/* ============================================= */}
              {/* LISTA */}
              {/* ============================================= */}
              <div className="space-y-3">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-semibold tracking-tight">
                      Movimentações
                    </h3>

                    <p className="text-[12px] text-[color:var(--muted)]">
                      Histórico financeiro recente
                    </p>
                  </div>

                  <div className="text-[11px] text-[color:var(--muted-soft)]">
                    {dataFiltrada?.length ?? 0} registros
                  </div>
                </div>

                {/* LIST */}
                <div
                  className="
                    max-h-[300px]

                    sm:max-h-[380px]
                    
                    overflow-auto

                    space-y-2

                    pr-1
                  "
                >
                  {dataFiltrada?.map((item) => {
                    const isItemEntrada =
                      item.tipo === "ENTRADA";

                    return (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -1 }}
                        className="
                          group/item

                          relative

                          flex

                          flex-col

                          sm:flex-row

                          sm:items-center

                          justify-between

                          px-4
                          py-3

                          gap-3

                          rounded-2xl

                          border border-[color:var(--border-soft)]

                          bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

                          transition-all duration-200

                          hover:border-[color:var(--border-strong)]
                          hover:shadow-[0_10px_24px_rgba(0,0,0,0.06)]
                        "
                      >
                        {/* glow */}
                        <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition pointer-events-none">
                          <div
                            className={`
                              absolute inset-0 rounded-2xl

                              ${
                                isItemEntrada
                                  ? "bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.10),transparent_60%)]"
                                  : "bg-[radial-gradient(circle_at_85%_15%,rgba(239,68,68,0.10),transparent_60%)]"
                              }
                            `}
                          />
                        </div>

                        {/* LEFT */}
                        <div className="relative z-10 flex items-center gap-3">
                          {/* ICON */}
                          <div
                            className={`
                              flex items-center justify-center

                              w-10 h-10
                              rounded-2xl

                              ${
                                isItemEntrada
                                  ? `
                                    bg-emerald-100
                                    text-emerald-600
                                  `
                                  : `
                                    bg-red-100
                                    text-red-500
                                  `
                              }
                            `}
                          >
                            {isItemEntrada ? "↓" : "↑"}
                          </div>

                          {/* INFO */}
                          <div className="space-y-0.5">
                            <p className="text-[13px] font-medium text-[color:var(--foreground)]">
                              {item.descricao ||
                                "Movimentação financeira"}
                            </p>

                            <span className="text-[11px] text-[color:var(--muted-soft)]">
                              {new Date(
                                item.createdAt,
                              ).toLocaleString("pt-BR")}
                            </span>
                          </div>
                        </div>

                        {/* VALUE */}
                        <div
                          className={`
                            relative z-10

                            text-[16px]

                            sm:text-[14px]

                            font-semibold
                            tracking-tight

                            ${
                              isItemEntrada
                                ? "text-emerald-600"
                                : "text-red-500"
                            }
                          `}
                        >
                          {formatCurrency(
                            Number(item.valor),
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* EMPTY */}
                  {!dataFiltrada?.length && (
                    <div
                      className="
                        flex flex-col items-center justify-center

                        py-14

                        text-center
                        space-y-2
                      "
                    >
                      <div
                        className="
                          flex items-center justify-center

                          w-12 h-12
                          rounded-2xl

                          bg-[color:var(--surface-200)]

                          text-[18px]
                          text-[color:var(--muted-soft)]
                        "
                      >
                        —
                      </div>

                      <div className="space-y-1">
                        <p className="text-[13px] font-medium text-[color:var(--foreground)]">
                          Nenhuma movimentação encontrada
                        </p>

                        <p className="text-[11px] text-[color:var(--muted)]">
                          As movimentações financeiras aparecerão aqui
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}