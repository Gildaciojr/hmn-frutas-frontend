"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ClienteForm } from "./ClienteForm";
import { ClienteFinanceiroModal } from "./ClienteFinanceiroModal";

import {
  getClienteHistorico,
  ClienteHistoricoResponse,
  parseDecimal,
} from "../services/clientes.service";

// ================= TYPES =================
interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
}

// ================= HELPERS =================
function formatCurrency(value: number | string | null | undefined): string {
  const parsed = parseDecimal(value);

  return `R$ ${parsed.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

// ================= COMPONENT =================
export function ClienteModal({ open, onClose, cliente }: Props) {
  const isViewMode = !!cliente;

  const [isEditMode, setIsEditMode] = useState(false);

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  const [financeiroOpen, setFinanceiroOpen] = useState(false);

  const [financeiroTransacao, setFinanceiroTransacao] = useState<
    ClienteHistoricoResponse["transacoes"][number] | null
  >(null);

  const portalTarget = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return document.body;
  }, []);

  ////////////////////////////////////////////////////////////
  // BODY SCROLL CONTROL
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // 🔥 QUERY ROBUSTA (TIPADA + SEGURA)
  const { data, isLoading, error } = useQuery<ClienteHistoricoResponse>({
    queryKey: ["cliente-historico", cliente?.id],

    queryFn: () => {
      if (!cliente?.id) {
        throw new Error("Cliente ID não informado");
      }

      return getClienteHistorico(cliente.id);
    },

    enabled: !!cliente,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,
  });

  ////////////////////////////////////////////////////////////
  // PAGAMENTOS POR TRANSAÇÃO
  ////////////////////////////////////////////////////////////

  const pagamentos = data?.pagamentos ?? [];

  const pagamentosPorTransacao = useMemo(() => {
    const map = new Map<string, typeof pagamentos>();

    for (const pagamento of pagamentos) {
      const transacaoId = pagamento.transacaoId;

      if (!map.has(transacaoId)) {
        map.set(transacaoId, []);
      }

      map.get(transacaoId)?.push(pagamento);
    }

    return map;
  }, [pagamentos]);

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <>
      <AnimatePresence>
        {open && (
          <div
            key="cliente-modal-root"
            className="
            fixed
            inset-0
            z-[9999]

            flex
            items-center
            justify-center

            overflow-hidden

            px-4
            py-6

            sm:px-6
          "
          >
            {/* ================================================= */}
            {/* OVERLAY */}
            {/* ================================================= */}
            <motion.div
              style={{
                isolation: "isolate",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.22,
              }}
              onClick={onClose}
              className="
              absolute
              inset-0

              bg-[rgba(2,6,23,0.58)]

              backdrop-blur-[08px]
            "
            />

            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}
            <motion.div
              initial={{
                opacity: 0,
                y: 26,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 18,
                scale: 0.985,
              }}
              transition={{
                duration: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
              relative
              z-10

              w-full
              max-w-[1040px]
              max-h-[92vh]

              flex
              flex-col

              rounded-[20px]

              border
              border-white/10

              bg-[rgba(255,255,255,0.96)]

              shadow-[0_24px_70px_rgba(0,0,0,0.18)]

              overflow-hidden

              backdrop-blur-2xl
            "
            >
              {/* ================= HEADER ================= */}
              <div
                className="
    relative
    px-4 py-3
    border-b border-[color:var(--border-soft)]
    flex items-center justify-between
    gap-6

    bg-gradient-to-b from-white to-[color:var(--surface-100)]
  "
              >
                {/* ESQUERDA */}
                <div className="flex items-center gap-4">
                  {/* AVATAR / IDENTIDADE */}
                  <div
                    className="
        w-9 h-9
        rounded-xl
        bg-[color:var(--surface-200)]
        flex items-center justify-center
        text-[15px] font-semibold
        border border-[color:var(--border-soft)]
      "
                  >
                    {isViewMode ? cliente?.nome?.charAt(0).toUpperCase() : "+"}
                  </div>

                  {/* TEXTOS */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-[17px] font-semibold tracking-tight text-[color:var(--foreground)]">
                        {isViewMode ? cliente?.nome : "Novo cliente"}
                      </h2>

                      {/* STATUS (SOMENTE VIEW) */}
                      {isViewMode && (
                        <span
                          className="
              text-[10px]
              px-2 py-[3px]
              rounded-full
              bg-emerald-100
              text-emerald-600
              font-medium
            "
                        >
                          Ativo
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-[color:var(--muted)]">
                      {isViewMode
                        ? "Visão consolidada de operações, saldo e histórico financeiro"
                        : "Cadastro de cliente para operações comerciais"}
                    </p>
                  </div>
                </div>

                {/* DIREITA */}
                <div className="flex items-center gap-2">
                  {/* BOTÃO EDITAR */}
                  {isViewMode && (
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="
        hidden sm:flex items-center gap-2
        px-3 py-1.5
        text-[12px]
        rounded-[var(--radius-sm)]
        border border-[color:var(--border-soft)]
        text-[color:var(--muted)]
        hover:text-[color:var(--foreground)]
        hover:border-[color:var(--border-strong)]
        transition
      "
                    >
                      ✎ Editar
                    </button>
                  )}

                  {/* FECHAR */}
                  <button
                    onClick={() => {
                      setIsEditMode(false);
                      onClose();
                    }}
                    className="
      w-7 h-7
      flex items-center justify-center
      rounded-lg

      border border-[color:var(--border-soft)]

      text-[color:var(--muted)]

      hover:text-[color:var(--foreground)]
      hover:border-[color:var(--border-strong)]
      hover:bg-[color:var(--surface-200)]

      transition
    "
                  >
                    ✕
                  </button>
                </div>

                {/* LINHA VISUAL (FEEDBACK PREMIUM) */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/0 group-hover:bg-black/20 transition" />
              </div>

              {/* BODY */}
              <div
                className="
    flex-1

    overflow-y-auto
    scrollbar-thin

    px-5
    py-5

    min-h-0
  "
              >
                {/* 🔴 VISUALIZAÇÃO */}
                {isViewMode && !isEditMode && (
                  <div className="space-y-6">
                    {/* ================= LOADING ================= */}
                    {isLoading && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="
                          h-[70px]
                          rounded-xl
                          bg-[color:var(--surface-200)]
                          animate-pulse
                        "
                          />
                        ))}
                      </div>
                    )}

                    {/* ================= ERROR ================= */}
                    {!isLoading && error && (
                      <div
                        className="
                      px-3 py-2
                      rounded-[var(--radius-sm)]
                      border border-red-200
                      bg-red-50
                      text-sm text-red-600
                    "
                      >
                        Erro ao carregar dados do cliente
                      </div>
                    )}

                    {/* ================= KPI ================= */}
                    {!isLoading &&
                      data &&
                      (() => {
                        ////////////////////////////////////////////////////////
                        // FINANCEIRO
                        ////////////////////////////////////////////////////////

                        const totalPago = data.transacoes.reduce(
                          (acc, transacao) => {
                            return acc + parseDecimal(transacao.valorPago);
                          },
                          0,
                        );

                        const totalRestante = data.transacoes.reduce(
                          (acc, transacao) => {
                            return acc + parseDecimal(transacao.valorRestante);
                          },
                          0,
                        );

                        const totalPendentes = data.transacoes.filter(
                          (transacao) => transacao.statusFinanceiro !== "PAGO",
                        ).length;

                        return (
                          <div className="space-y-4">
                            {/* ================================================= */}
                            {/* KPI SUPERIOR */}
                            {/* ================================================= */}

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              {/* COMPRAS */}
                              <div
                                className="
                              p-3 rounded-xl
                              bg-[color:var(--surface-200)]
                              border border-[color:var(--border-soft)]

                              transition-all duration-200

                              hover:shadow-sm
                            "
                              >
                                <p className="text-[11px] text-[color:var(--muted-soft)]">
                                  Compras
                                </p>

                                <p className="text-[15px] font-semibold tracking-tight">
                                  {formatCurrency(data.resumo.totalCompras)}
                                </p>
                              </div>

                              {/* VENDAS */}
                              <div
                                className="
                              p-3 rounded-xl
                              bg-[color:var(--surface-200)]
                              border border-[color:var(--border-soft)]

                              transition-all duration-200

                              hover:shadow-sm
                            "
                              >
                                <p className="text-[11px] text-[color:var(--muted-soft)]">
                                  Vendas
                                </p>

                                <p className="text-[15px] font-semibold tracking-tight">
                                  {formatCurrency(data.resumo.totalVendas)}
                                </p>
                              </div>

                              {/* TOTAL PAGO */}
                              <div
                                className="
                              p-3 rounded-xl
                              border border-emerald-200

                              bg-emerald-50

                              transition-all duration-200

                              hover:shadow-sm
                            "
                              >
                                <p className="text-[11px] text-emerald-700/80">
                                  Total pago
                                </p>

                                <p className="text-[15px] font-semibold tracking-tight text-emerald-600">
                                  {formatCurrency(totalPago)}
                                </p>
                              </div>

                              {/* RESTANTE */}
                              <div
                                className={`
                              p-3 rounded-xl
                              border

                              transition-all duration-200

                              hover:shadow-sm

                              ${
                                totalRestante > 0
                                  ? `
                                    bg-amber-50
                                    border-amber-200
                                  `
                                  : `
                                    bg-emerald-50
                                    border-emerald-200
                                  `
                              }
                            `}
                              >
                                <p className="text-[11px] text-[color:var(--muted-soft)]">
                                  Restante
                                </p>

                                <p
                                  className={`
                                text-[15px]
                                font-semibold
                                tracking-tight

                                ${
                                  totalRestante > 0
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }
                              `}
                                >
                                  {formatCurrency(totalRestante)}
                                </p>
                              </div>
                            </div>

                            {/* ================================================= */}
                            {/* CONTA CORRENTE */}
                            {/* ================================================= */}

                            <div
                              className={`
                            relative overflow-hidden

                            rounded-xl
                            border

                            px-4 py-3

                            ${
                              data.resumo.saldo >= 0
                                ? `
                                  border-emerald-200
                                  bg-gradient-to-br
                                  from-emerald-50
                                  to-white
                                `
                                : `
                                  border-red-200
                                  bg-gradient-to-br
                                  from-red-50
                                  to-white
                                `
                            }
                          `}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--muted-soft)]">
                                    Conta corrente
                                  </p>

                                  <p
                                    className={`
                                  text-[20px]
                                  font-bold
                                  tracking-tight

                                  ${
                                    data.resumo.saldo >= 0
                                      ? "text-emerald-600"
                                      : "text-red-500"
                                  }
                                `}
                                  >
                                    {formatCurrency(data.resumo.saldo)}
                                  </p>

                                  <p className="text-[12px] text-[color:var(--muted)]">
                                    {data.resumo.saldo >= 0
                                      ? "Cliente possui saldo positivo"
                                      : "Cliente possui pendências financeiras"}
                                  </p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <span
                                    className={`
                                  px-3 py-1

                                  rounded-full

                                  text-[10px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.14em]

                                  ${
                                    totalPendentes > 0
                                      ? `
                                        bg-amber-100
                                        text-amber-700
                                      `
                                      : `
                                        bg-emerald-100
                                        text-emerald-700
                                      `
                                  }
                                `}
                                  >
                                    {totalPendentes > 0
                                      ? `${totalPendentes} pendência(s)`
                                      : "Tudo quitado"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    {/* ================= HISTÓRICO ================= */}
                    {!isLoading && data && (
                      <div className="space-y-3 pt-1 border-t border-[color:var(--border-soft)]">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h3 className="text-[14px] font-semibold text-[color:var(--foreground)]">
                              Histórico financeiro
                            </h3>

                            <p className="text-[11px] text-[color:var(--muted)]">
                              Movimentações vinculadas a este cliente
                            </p>
                          </div>

                          <span className="text-[11px] text-[color:var(--muted-soft)]">
                            {data.transacoes.length.toLocaleString("pt-BR")}{" "}
                            registros
                          </span>
                        </div>

                        <div className="space-y-2 pr-1 pb-2">
                          {data.transacoes.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3">
                              <div className="w-11 h-11 rounded-xl bg-[color:var(--surface-200)] border border-[color:var(--border-soft)] flex items-center justify-center text-[color:var(--muted-soft)]">
                                —
                              </div>

                              <p className="text-[13px] text-[color:var(--muted)]">
                                Nenhuma movimentação encontrada
                              </p>

                              <span className="text-[11px] text-[color:var(--muted-soft)]">
                                Compras e vendas aparecerão aqui automaticamente
                              </span>
                            </div>
                          )}

                          {data.transacoes.map((t, i) => {
                            ////////////////////////////////////////////////////
                            // TIPO
                            ////////////////////////////////////////////////////

                            const isEntrada = t.tipo === "ENTRADA";

                            ////////////////////////////////////////////////////
                            // STATUS
                            ////////////////////////////////////////////////////

                            const status = t.statusFinanceiro ?? "PENDENTE";

                            ////////////////////////////////////////////////////
                            // VALORES
                            ////////////////////////////////////////////////////

                            const valor = parseDecimal(t.valor);

                            const valorPago = parseDecimal(t.valorPago);

                            const valorRestante = parseDecimal(t.valorRestante);

                            ////////////////////////////////////////////////////
                            // PAGAMENTOS DA TRANSAÇÃO
                            ////////////////////////////////////////////////////

                            const pagamentosTransacao =
                              pagamentosPorTransacao.get(t.id) || [];

                            ////////////////////////////////////////////////////
                            // STATUS UI
                            ////////////////////////////////////////////////////

                            const statusConfig =
                              status === "PAGO"
                                ? {
                                    label: "Pago",

                                    className:
                                      "bg-emerald-100 text-emerald-700",
                                  }
                                : status === "PARCIAL"
                                  ? {
                                      label: "Parcial",

                                      className: "bg-amber-100 text-amber-700",
                                    }
                                  : {
                                      label: "Pendente",

                                      className: "bg-red-100 text-red-700",
                                    };

                            return (
                              <motion.div
                                key={`${t.id || "transacao"}-${i}`}
                                initial={{
                                  opacity: 0,
                                  y: 6,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                }}
                                transition={{
                                  delay: Math.min(i * 0.01, 0.12),
                                }}
                                className="
    group

    relative overflow-hidden

    px-4 py-3

    rounded-[14px]

    border border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.90))]

    hover:border-black/8

    hover:bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(248,250,252,0.96))]

    hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]

    transition-all duration-200
  "
                              >
                                {/* FX */}
                                <div className="absolute inset-0 pointer-events-none"></div>

                                <div className="relative z-10 flex flex-col lg:flex-row gap-3">
                                  {/* ====================================== */}
                                  {/* ESQUERDA */}
                                  {/* ====================================== */}

                                  <div className="flex items-start gap-3 min-w-0 flex-1">
                                    {/* ICON */}
                                    <div
                                      className={`
      w-7 h-7 rounded-xl

      flex items-center justify-center

      text-[11px]
      font-semibold

      shrink-0

      border

      ${
        isEntrada
          ? `
            bg-emerald-50
            border-emerald-200
            text-emerald-600
          `
          : `
            bg-red-50
            border-red-200
            text-red-500
          `
      }
    `}
                                    >
                                      {isEntrada ? "↗" : "↘"}
                                    </div>

                                    {/* INFO */}
                                    <div className="min-w-0 flex-1 space-y-1">
                                      {/* HEADER */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[12px] font-semibold text-[color:var(--foreground)]">
                                          {isEntrada
                                            ? "Entrada (Venda)"
                                            : "Saída (Compra)"}
                                        </span>

                                        <span
                                          className={`
        px-2 py-[2px]

        rounded-full

        text-[8px]
        font-semibold
        uppercase
        tracking-[0.14em]

        ${statusConfig.className}
      `}
                                        >
                                          {statusConfig.label}
                                        </span>

                                        <span className="text-[10px] text-[color:var(--muted-soft)]">
                                          {new Date(t.createdAt).toLocaleString(
                                            "pt-BR",
                                          )}
                                        </span>
                                      </div>

                                      {/* DESCRIÇÃO */}
                                      {t.descricao && (
                                        <p
                                          className="
        text-[11px]

        leading-snug

        text-[color:var(--muted)]

        line-clamp-2
      "
                                        >
                                          {t.descricao}
                                        </p>
                                      )}

                                      {/* META */}
                                      <div className="flex flex-wrap items-center gap-2">
                                        {t.referencia && (
                                          <span
                                            className="
          px-2 py-[3px]

          rounded-lg

          text-[9px]

          bg-[color:var(--surface-200)]

          border border-[color:var(--border-soft)]

          text-[color:var(--muted-soft)]
        "
                                          >
                                            Ref: {t.referencia}
                                          </span>
                                        )}

                                        {t.formaPagamento && (
                                          <span
                                            className="
          px-2 py-[3px]

          rounded-lg

          text-[9px]

          bg-emerald-50

          border border-emerald-200

          text-emerald-700
        "
                                          >
                                            {t.formaPagamento}
                                          </span>
                                        )}
                                      </div>

                                      {/* ===================================================== */}
                                      {/* DETALHES OPERACIONAIS — COMPRA */}
                                      {/* ===================================================== */}

                                      {t.compra && (
                                        <div
                                          className="
      mt-3

      rounded-xl

      border border-red-100

      bg-gradient-to-br
      from-red-50/80
      to-white

      px-3 py-2

      space-y-2
    "
                                        >
                                          {/* HEADER */}
                                          <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-red-500" />

                                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-red-600">
                                                Compra registrada
                                              </span>
                                            </div>

                                            {t.compra.numeroFolha && (
                                              <span className="text-[10px] text-[color:var(--muted-soft)]">
                                                Pedido #{t.compra.numeroFolha}
                                              </span>
                                            )}
                                          </div>

                                          {/* GRID */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Safra
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {t.compra.safra || "—"}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Modelo
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {t.compra.modeloCaminhao || "—"}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Placa
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {t.compra.placa || "—"}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Peso bruto
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {Number(
                                                  t.compra.kgBruto ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Peso líquido
                                              </p>

                                              <p className="text-[12px] font-medium text-emerald-600">
                                                {Number(
                                                  t.compra.kgLiquido ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Desconto
                                              </p>

                                              <p className="text-[12px] font-medium text-amber-600">
                                                {Number(
                                                  t.compra
                                                    .descontoKgCalculado ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Frutas
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {Number(
                                                  t.compra.quantidadeFrutas ??
                                                    0,
                                                ).toLocaleString("pt-BR")}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Média
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {Number(
                                                  t.compra.mediaFruta ?? 0,
                                                ).toLocaleString("pt-BR")}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Preço/KG
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {formatCurrency(
                                                  t.compra.precoKg,
                                                )}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Total bruto
                                              </p>

                                              <p className="text-[12px] font-medium">
                                                {formatCurrency(
                                                  t.compra.totalBruto,
                                                )}
                                              </p>
                                            </div>

                                            <div>
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Valor final
                                              </p>

                                              <p className="text-[12px] font-semibold text-red-500">
                                                {formatCurrency(
                                                  t.compra.valorTotal,
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* ===================================================== */}
                                      {/* DETALHES OPERACIONAIS — VENDA */}
                                      {/* ===================================================== */}

                                      {t.venda && (
                                        <div
                                          className="
      mt-2

      rounded-[14px]

      border border-red-100

      bg-gradient-to-br
      from-red-50/75
      to-white

      px-3
      sm:px-4

      py-3

      space-y-2

      overflow-hidden
    "
                                        >
                                          {/* HEADER */}
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 rounded-full bg-emerald-500" />

                                              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                                                Venda registrada
                                              </span>
                                            </div>

                                            {t.venda.id && (
                                              <span className="text-[10px] text-[color:var(--muted-soft)]">
                                                Venda #{t.venda.id.slice(0, 8)}
                                              </span>
                                            )}
                                          </div>

                                          {/* GRID */}
                                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-3">
                                            {/* DATA */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Data venda
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.dataVenda
                                                  ? new Date(
                                                      t.venda.dataVenda,
                                                    ).toLocaleDateString(
                                                      "pt-BR",
                                                    )
                                                  : "—"}
                                              </p>
                                            </div>

                                            {/* PEDIDO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Nº pedido
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.numeroPedido || "—"}
                                              </p>
                                            </div>

                                            {/* ROMANEIO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Romaneio
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.numeroRomaneio || "—"}
                                              </p>
                                            </div>

                                            {/* MODELO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Modelo
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.modeloCaminhao || "—"}
                                              </p>
                                            </div>

                                            {/* PLACA */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Placa
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.placa || "—"}
                                              </p>
                                            </div>

                                            {/* DESTINO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Destino
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.destino || "—"}
                                              </p>
                                            </div>

                                            {/* LOCAL ENTREGA */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Entrega
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.localEntrega || "—"}
                                              </p>
                                            </div>

                                            {/* TIPO FRETE */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Tipo frete
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.tipoFrete || "—"}
                                              </p>
                                            </div>

                                            {/* PESO BRUTO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Peso bruto
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {Number(
                                                  t.venda.pesoBruto ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            {/* DESCONTO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Desconto
                                              </p>

                                              <p className="text-[12px] font-medium text-amber-600 break-words leading-tight">
                                                {Number(
                                                  t.venda.pesoDesconto ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            {/* PESO LÍQUIDO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Peso líquido
                                              </p>

                                              <p className="text-[12px] font-medium text-emerald-600 break-words leading-tight">
                                                {Number(
                                                  t.venda.pesoLiquido ?? 0,
                                                ).toLocaleString("pt-BR")}{" "}
                                                kg
                                              </p>
                                            </div>

                                            {/* QUANTIDADE */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Frutas
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {Number(
                                                  t.venda.quantidadeFrutas ?? 0,
                                                ).toLocaleString("pt-BR")}
                                              </p>
                                            </div>

                                            {/* MÉDIA */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Média
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {Number(
                                                  t.venda.mediaFruta ?? 0,
                                                ).toLocaleString("pt-BR")}
                                              </p>
                                            </div>

                                            {/* PREÇO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Preço melancia
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {formatCurrency(
                                                  Number(
                                                    t.venda.precoMelancia ?? 0,
                                                  ),
                                                )}
                                              </p>
                                            </div>

                                            {/* FRETE */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Frete
                                              </p>

                                              <p className="text-[12px] font-medium text-amber-600">
                                                {formatCurrency(
                                                  t.venda.freteTotal,
                                                )}
                                              </p>
                                            </div>

                                            {/* TOTAL */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Valor venda
                                              </p>

                                              <p className="text-[12px] font-semibold text-emerald-600 break-words leading-tight">
                                                {formatCurrency(
                                                  t.venda.valorTotal,
                                                )}
                                              </p>
                                            </div>

                                            {/* STATUS */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Status
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.statusPagamento || "—"}
                                              </p>
                                            </div>

                                            {/* REGISTRO */}
                                            <div className="min-w-0">
                                              <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                Registrada em
                                              </p>

                                              <p className="text-[12px] font-medium break-words leading-tight">
                                                {t.venda.createdAt
                                                  ? new Date(
                                                      t.venda.createdAt,
                                                    ).toLocaleDateString(
                                                      "pt-BR",
                                                    )
                                                  : "—"}
                                              </p>
                                            </div>
                                          </div>

                                          {/* ===================================================== */}
                                          {/* PDF / ROMANEIO */}
                                          {/* ===================================================== */}

                                          <div className="pt-3 mt-2 border-t border-emerald-100">
                                            <button
                                              onClick={() => {
                                                window.open(
                                                  `${process.env.NEXT_PUBLIC_API_URL}/romaneios/venda/${t.venda?.id}/pdf`,
                                                  "_blank",
                                                );
                                              }}
                                              className="
      group/pdf

      relative

      inline-flex
      items-center
      gap-2

      h-11

      px-3

      rounded-lg

      border border-emerald-200

      bg-gradient-to-b
      from-emerald-50
      to-white

      text-[12px]
      font-semibold

      tracking-[0.04em]

      text-emerald-700

      shadow-[0_8px_22px_rgba(16,185,129,0.08)]

      hover:border-emerald-300

      hover:shadow-[0_14px_30px_rgba(16,185,129,0.14)]

      transition-all duration-300

      overflow-hidden
    "
                                            >
                                              {/* LIGHT */}
                                              <div
                                                className="
        absolute inset-x-0 top-0 h-[1px]

        bg-gradient-to-r
        from-transparent
        via-white
        to-transparent
      "
                                              />

                                              {/* ICON */}
                                              <div
                                                className="
        w-7 h-7

        rounded-md

        flex
        items-center
        justify-center

        bg-emerald-200

        text-[9px]

        shrink-0
      "
                                              >
                                                PDF
                                              </div>

                                              <span className="relative z-10">
                                                Abrir Romaneio
                                              </span>
                                            </button>
                                          </div>

                                          {/* OBSERVAÇÕES */}
                                          {t.venda.observacoes && (
                                            <div
                                              className="
          pt-3
          border-t border-emerald-100
        "
                                            >
                                              <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-soft)] mb-1">
                                                Observações
                                              </p>

                                              <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
                                                {t.venda.observacoes}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* PAGAMENTO */}
                                      {(valorPago > 0 || valorRestante > 0) && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                          {valorPago > 0 && (
                                            <span className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                              Pago: {formatCurrency(valorPago)}
                                            </span>
                                          )}

                                          {valorRestante > 0 && (
                                            <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                              Restante:{" "}
                                              {formatCurrency(valorRestante)}
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      {/* ===================================================== */}
                                      {/* PAGAMENTOS GRANULARES */}
                                      {/* ===================================================== */}

                                      {pagamentosTransacao.length > 0 && (
                                        <div
                                          className="
      mt-3

      rounded-xl

      border border-emerald-100

      bg-emerald-50/60

      px-3 py-2

      space-y-2
    "
                                        >
                                          <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                                              Pagamentos realizados
                                            </p>

                                            <span className="text-[10px] text-[color:var(--muted-soft)]">
                                              {pagamentosTransacao.length}{" "}
                                              baixa(s)
                                            </span>
                                          </div>

                                          <div className="space-y-1.5">
                                            {pagamentosTransacao.map(
                                              (pagamento, pagamentoIndex) => (
                                                <div
                                                  key={`${pagamento.id || "pagamento"}-${pagamentoIndex}`}
                                                  className="
              flex
              items-center
              justify-between

              gap-3

              rounded-lg

              border border-emerald-100

              bg-white/80

              px-2.5 py-2
            "
                                                >
                                                  <div className="space-y-0.5">
                                                    <p className="text-[11px] font-medium text-emerald-700">
                                                      {pagamento.formaPagamento}
                                                    </p>

                                                    <p className="text-[10px] text-[color:var(--muted-soft)]">
                                                      {pagamento.pagoEm
                                                        ? new Date(
                                                            pagamento.pagoEm,
                                                          ).toLocaleDateString(
                                                            "pt-BR",
                                                          )
                                                        : "Sem data"}
                                                    </p>
                                                  </div>

                                                  <div className="text-right">
                                                    <p className="text-[11px] font-semibold text-emerald-700">
                                                      {formatCurrency(
                                                        pagamento.valor,
                                                      )}
                                                    </p>

                                                    {parseDecimal(
                                                      pagamento.valorRestanteApos,
                                                    ) > 0 && (
                                                      <p className="text-[10px] text-amber-600">
                                                        Restante:{" "}
                                                        {formatCurrency(
                                                          pagamento.valorRestanteApos,
                                                        )}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* FORMA PAGAMENTO */}
                                      {t.formaPagamento && (
                                        <div className="text-[10px] text-[color:var(--muted-soft)]">
                                          Forma pagamento: {t.formaPagamento}
                                        </div>
                                      )}

                                      {/* VENCIMENTO */}
                                      {t.vencimento && (
                                        <div className="text-[10px] text-[color:var(--muted-soft)]">
                                          Vencimento:{" "}
                                          {new Date(
                                            t.vencimento,
                                          ).toLocaleDateString("pt-BR")}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* ====================================== */}
                                  {/* DIREITA */}
                                  {/* ====================================== */}

                                  {/* ====================================== */}
                                  {/* BOTÃO FINANCEIRO */}
                                  {/* ====================================== */}

                                  {status !== "PAGO" && (
                                    <button
                                      onClick={() => {
                                        setFinanceiroTransacao(t);

                                        setFinanceiroOpen(true);
                                      }}
                                      className="
      group/financeiro

      w-10 h-10

      rounded-lg

      flex
      items-center
      justify-center

      border

      border-emerald-200

      bg-gradient-to-b
      from-emerald-50
      to-white

      text-emerald-700

      shadow-[0_8px_18px_rgba(16,185,129,0.10)]

      hover:border-emerald-300
      hover:shadow-[0_14px_28px_rgba(16,185,129,0.18)]

      hover:-translate-y-[1px]

      transition-all duration-200
    "
                                    >
                                      <span className="text-[10px] font-bold">
                                        Registrar Pagamento
                                      </span>
                                    </button>
                                  )}

                                  <div
                                    className="
    text-left
    lg:text-right

    w-full
    
    lg:w-auto

    shrink-0

    space-y-1
  "
                                  >
                                    <span
                                      className={`
                                      text-[15px]
                                      font-semibold
                                      tracking-tight

                                      ${
                                        isEntrada
                                          ? "text-emerald-600"
                                          : "text-red-500"
                                      }
                                    `}
                                    >
                                      {isEntrada ? "+" : "-"}{" "}
                                      {formatCurrency(valor)}
                                    </span>

                                    <p className="text-[10px] text-[color:var(--muted-soft)]">
                                      {isEntrada ? "Entrada" : "Saída"}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🟢 CRIAÇÃO */}
                {(!isViewMode || isEditMode) && (
                  <ClienteForm
                    initialData={
                      isEditMode && data
                        ? {
                            id: data.cliente.id,

                            tipoCliente: data.cliente.tipoCliente,

                            nome: data.cliente.nome,

                            cpf: data.cliente.cpf ?? undefined,

                            cnpj: data.cliente.cnpj ?? undefined,

                            razaoSocial: data.cliente.razaoSocial ?? undefined,

                            nomeFantasia:
                              data.cliente.nomeFantasia ?? undefined,

                            proprietarioNome:
                              data.cliente.proprietarioNome ?? undefined,

                            telefone: data.cliente.telefone ?? "",

                            email: data.cliente.email ?? undefined,

                            endereco: data.cliente.endereco ?? undefined,

                            cep: data.cliente.cep ?? undefined,

                            cidade: data.cliente.cidade ?? undefined,

                            estado: data.cliente.estado ?? undefined,

                            observacoes: data.cliente.observacoes ?? undefined,

                            descontoPercentual: data.cliente.descontoPercentual,
                          }
                        : null
                    }
                    onSuccess={() => {
                      setIsEditMode(false);
                      onClose();
                    }}
                  />
                )}
              </div>

              {/* FOOTER */}
              <div className="px-5 py-3 border-t border-[color:var(--border-soft)] flex justify-between items-center">
                {/* CONTEXTO */}
                <span className="text-[11px] text-[color:var(--muted-soft)]">
                  {isViewMode
                    ? "Visualização do cliente"
                    : "Cadastro de novo cliente"}
                </span>

                {/* AÇÃO */}
                <button
                  onClick={onClose}
                  className="
                  px-4 py-2
                  rounded-[var(--radius-sm)]
                  text-[12px]
                  text-[color:var(--muted)]
                  border border-[color:var(--border-soft)]
                  hover:text-black
                  hover:border-[color:var(--border-strong)]
                  hover:bg-[color:var(--surface-200)]
                  transition
                "
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ClienteFinanceiroModal
        open={financeiroOpen}
        clienteId={cliente?.id || ""}
        transacao={financeiroTransacao}
        onClose={() => {
          setFinanceiroOpen(false);

          setFinanceiroTransacao(null);
        }}
      />
    </>,
    document.body,
  );
}
