"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Boxes,
  CalendarDays,
  ChevronRight,
  Loader2,
  PackageOpen,
  ReceiptText,
  ShoppingCart,
  X,
} from "lucide-react";
import { CompraEditModal } from "@/modules/compras/components/CompraEditModal";
import { VendaEditModal } from "@/modules/vendas/components/VendaEditModal";
import {
  getVenda,
  type Venda,
} from "@/modules/vendas/services/vendas.service";
import {
  useEstoque,
  type EstoqueTimelineItem,
} from "../hooks/useEstoque";

export function EstoqueCard() {
  const { resumo, loading } = useEstoque();
  const [open, setOpen] = useState(false);
  const [selectedCompraId, setSelectedCompraId] = useState<string | null>(null);
  const [selectedVenda, setSelectedVenda] = useState<Venda | null>(null);
  const [loadingVendaId, setLoadingVendaId] = useState<string | null>(null);
  const vendaRequestRef = useRef(0);

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

  function getStatusPagamentoClasses(
    status: string | null | undefined,
  ): string {
    if (status === "PAGO") {
      return "border border-emerald-100 bg-emerald-50 text-emerald-700";
    }

    if (status === "PARCIAL") {
      return "border border-amber-100 bg-amber-50 text-amber-700";
    }

    if (status === "PENDENTE") {
      return "border border-rose-100 bg-rose-50 text-rose-700";
    }

    return "border border-slate-200 bg-slate-100 text-slate-600";
  }

  // ================= DADOS =================
  const totalKg = resumo?.estoqueDisponivelKg ?? 0;

  const totalComprado = resumo?.valorComprado ?? 0;
  const totalVendido = resumo?.valorVendido ?? 0;
  const lucro = resumo?.lucro ?? 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function handleCloseEstoque() {
    vendaRequestRef.current += 1;

    setLoadingVendaId(null);

    setSelectedCompraId(null);

    setSelectedVenda(null);

    setOpen(false);
  }

  async function handleOpenMovimentacao(item: EstoqueTimelineItem) {
    if (item.tipo === "ENTRADA") {
      vendaRequestRef.current += 1;

      setLoadingVendaId(null);

      setSelectedVenda(null);

      setSelectedCompraId(item.id);
      return;
    }

    const requestId = ++vendaRequestRef.current;

    try {
      setLoadingVendaId(item.id);

      const venda = await getVenda(item.id);

      if (requestId !== vendaRequestRef.current) {
        return;
      }

      setSelectedVenda(venda);
    } catch (error) {
      if (requestId !== vendaRequestRef.current) {
        return;
      }

      console.error("Erro ao carregar venda:", error);

      alert("Não foi possível carregar esta venda.");
    } finally {
      if (requestId === vendaRequestRef.current) {
        setLoadingVendaId(null);
      }
    }
  }

  return (
    <>
      {/* ================= TRIGGER COMPACTO ================= */}
      <motion.div
        onClick={() => setOpen(true)}
        className="
  cursor-pointer

  w-full
  max-w-full

  group
  relative
  overflow-hidden

  rounded-[20px]
  sm:rounded-[22px]

  border border-emerald-200/60

  bg-white
  sm:bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(236,253,245,0.78))]

  p-4
  sm:p-5

  shadow-[0_6px_20px_rgba(15,23,42,0.04)]
  sm:shadow-[0_14px_36px_rgba(16,185,129,0.08)]

  transition-[transform,box-shadow,border-color]
  duration-300

  sm:hover:-translate-y-[1px]

  sm:hover:border-emerald-300

  sm:hover:shadow-[0_18px_44px_rgba(16,185,129,0.12)]

  sm:will-change-transform
"
      >
        {/* CAMADA VISUAL */}
        <div className="absolute inset-0 pointer-events-none">
          {/* textura leve */}
          <div className="absolute inset-0 hidden opacity-[0.03] bg-[radial-gradient(circle,rgba(0,0,0,0.35)_1px,transparent_1px)] bg-[size:22px_22px] sm:block" />

          {/* glow contextual */}
          <div className="absolute inset-0 hidden opacity-0 transition duration-500 sm:block sm:group-hover:opacity-100">
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
        <div className="relative z-10 w-full space-y-5">
          {/* HEADER */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`
                  w-11 h-11
                  sm:w-10 sm:h-10

                  rounded-[14px]

                  flex items-center justify-center

                  border

                  ${
                    totalKg > 0
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-[color:var(--surface-200)] border-[color:var(--border-soft)] text-[color:var(--muted)]"
                  }
                `}
              >
                <Boxes size={20} />
              </div>

              <p className="truncate text-[10px] uppercase tracking-[0.20em] font-semibold text-[color:var(--muted-soft)]">
                Controle de estoque
              </p>
            </div>

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
                  ${totalKg > 0 ? "bg-emerald-500 sm:animate-pulse" : "bg-gray-400"}
                `}
              />

              {totalKg > 0 ? "Disponível" : "Zerado"}
            </div>
          </div>

          {/* VALOR PRINCIPAL */}
          <div className="space-y-2">
            <p className="text-[26px] sm:text-[30px] xl:text-[34px] leading-none font-semibold tracking-[-0.045em] text-[color:var(--foreground)]">
              {loading ? "..." : formatKg(totalKg)}
            </p>

            <p className="text-[11px] sm:text-[12px] text-[color:var(--muted)]">
              Estoque disponível
            </p>
          </div>

          {/* MICRO KPIS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-emerald-100/80 pt-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[color:var(--muted-soft)]">
                <ArrowDownToLine size={13} className="text-emerald-600" />
                <span className="text-[9px] uppercase tracking-[0.16em]">
                  Entradas
                </span>
              </div>

              <p className="text-[12px] sm:text-[13px] font-semibold text-[color:var(--foreground)]">
                {formatKg(resumo?.totalKgComprado ?? 0)}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[color:var(--muted-soft)]">
                <ArrowUpFromLine size={13} className="text-rose-500" />
                <span className="text-[9px] uppercase tracking-[0.16em]">
                  Saídas
                </span>
              </div>

              <p className="text-[12px] sm:text-[13px] font-semibold text-[color:var(--foreground)]">
                {formatKg(resumo?.totalKgVendido ?? 0)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 space-y-1">
              <div className="flex items-center gap-1.5 text-[color:var(--muted-soft)]">
                <Activity size={13} className="text-indigo-500" />
                <span className="text-[9px] uppercase tracking-[0.16em]">
                  Movimentações
                </span>
              </div>

              <p className="text-[12px] sm:text-[13px] font-semibold text-[color:var(--foreground)]">
                {(resumo?.totalCompras ?? 0) + (resumo?.totalVendas ?? 0)}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-end gap-1.5 text-[11px] font-medium text-emerald-700">
            Ver movimentações
            <ArrowRight
              size={14}
              className="transition-transform duration-300 sm:group-hover:translate-x-1"
            />
          </div>
        </div>

        {/* BASE LINE */}
        <div
          className={`
      absolute bottom-0 left-0 h-[1.5px] w-full
      transition-colors duration-300

      ${
        totalKg > 0 ? "bg-emerald-500/60" : "bg-black/0 sm:group-hover:bg-black/20"
      }
    `}
        />
      </motion.div>

      {/* ================= MODAL ================= */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <AnimatePresence>
              {open && (
          <motion.div
            className="
        fixed inset-0 z-[100]

        bg-black/45

        backdrop-blur-none
        sm:backdrop-blur-[3px]

        flex items-center justify-center

        p-2 sm:p-4
      "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.16,
            }}
            onClick={handleCloseEstoque}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="
          group
          relative
          overflow-hidden

          w-full
          max-w-[1040px]

          h-[calc(100dvh-1rem)]
          sm:h-auto
          sm:max-h-[92dvh]

          flex
          flex-col

          rounded-[24px]
          sm:rounded-[28px]

          bg-white

          border
          border-white/70

          shadow-[0_20px_56px_rgba(0,0,0,0.20)]
          sm:shadow-[0_50px_140px_rgba(0,0,0,0.30)]

          sm:will-change-transform
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
                <div className="absolute inset-0 hidden opacity-[0.025] bg-[radial-gradient(circle,rgba(0,0,0,0.4)_1px,transparent_1px)] bg-[size:24px_24px] sm:block" />

                {/* glow */}
                <div className="absolute inset-0 hidden opacity-0 transition duration-500 sm:block sm:group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.10),transparent_60%)]" />
                </div>

                {/* linha topo */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
              </div>

              {/* ================= HEADER ================= */}
              <div
                className="
                  relative z-10

                  shrink-0

                  px-4
                  sm:px-6

                  py-4
                  sm:py-5

                  border-b
                  border-[color:var(--border-soft)]

                  flex
                  flex-col
                  sm:flex-row
                  sm:items-start

                  justify-between

                  gap-3
                "
              >
                {/* ================= LEFT ================= */}
                <div className="space-y-3">
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

                          hidden
                          sm:block

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

                        backdrop-blur-none
                        sm:backdrop-blur-md
                      "
                    >
                      {/* DOT */}
                      <span
                        className="
                          w-2 h-2

                          rounded-full

                          bg-emerald-500

                          sm:animate-pulse
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
                  <div className="space-y-2">
                    <h2
                      className="
                        text-[22px]

                        sm:text-[28px]

                        font-semibold

                        tracking-[-0.045em]

                        leading-none

                        text-[color:var(--foreground)]
                      "
                    >
                      Controle de estoque
                    </h2>

                    <p className="text-[11px] sm:text-[12px] text-[color:var(--muted)]">
                      Visão consolidada das entradas, saídas e movimentações recentes.
                    </p>
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

                      backdrop-blur-none
                      sm:backdrop-blur-xl

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

                          hidden
                          sm:block

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
                            ? "bg-emerald-500 sm:animate-pulse"
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
                      {totalKg > 0 ? "Estoque disponível" : "Sem estoque"}
                    </span>
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={handleCloseEstoque}
                    className="
    group

    relative

    w-11 h-11
    sm:w-9 sm:h-9

    rounded-2xl

    flex items-center justify-center

    border border-white/70

    bg-white/80

    backdrop-blur-none
    sm:backdrop-blur-sm

    shadow-[0_12px_30px_rgba(0,0,0,0.05)]

    text-[color:var(--muted)]

    sm:hover:text-[color:var(--foreground)]

    sm:hover:border-[color:var(--border-strong)]

    sm:hover:shadow-[0_18px_40px_rgba(0,0,0,0.08)]

    sm:hover:scale-[1.02]

    active:scale-[0.98]

    transition-all
    duration-300

    sm:will-change-transform

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

                    <X size={18} className="relative z-10" />
                  </button>
                </div>
              </div>

              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y [-webkit-overflow-scrolling:touch] px-4 sm:px-6 py-4 sm:py-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                <div className="space-y-5">
              {/* ================= HERO ================= */}
              <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/60 p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-emerald-700">
                  Estoque disponível
                </p>
                <p className="mt-2 text-[28px] sm:text-[34px] font-semibold tracking-[-0.045em] leading-none text-[color:var(--foreground)]">
                  {formatKg(totalKg)}
                </p>
                <p className="mt-2 text-[11px] sm:text-[12px] text-[color:var(--muted)]">
                  {resumo.timeline.length} movimentações recentes
                </p>
              </div>

              {/* ================= KPIs ================= */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat
                  label="Disponível"
                  value={formatKg(totalKg)}
                />

                <Stat
                  label="Comprado"
                  value={formatCurrency(totalComprado)}
                />

                <Stat
                  label="Vendido"
                  value={formatCurrency(totalVendido)}
                />

                <Stat
                  label="Lucro"
                  value={formatCurrency(lucro)}
                />
              </div>

              {/* ================= TIMELINE ================= */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                  <div>
                    <h3 className="text-[16px] font-semibold tracking-[-0.025em] text-[color:var(--foreground)]">
                      Movimentações recentes
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-[12px] text-[color:var(--muted)]">
                      Compras e vendas que impactaram o estoque.
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-[color:var(--muted-soft)]">
                    {resumo.timeline.length} registros
                  </span>
                </div>

                {/* EMPTY STATE */}
                {resumo.timeline.length === 0 ? (
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
                  resumo.timeline.map((item) => {
                    const isEntrada = item.tipo === "ENTRADA";
                    const isLoadingVenda = loadingVendaId === item.id;

                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => handleOpenMovimentacao(item)}
                        disabled={isLoadingVenda}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.16,
                          ease: "easeOut",
                        }}
                        className="
    group
    relative

    w-full
    text-left

    flex flex-col sm:flex-row sm:items-center justify-between

    p-4

    rounded-[18px]

    border border-[color:var(--border-soft)]
    bg-white

    shadow-[0_4px_14px_rgba(15,23,42,0.04)]

    sm:hover:-translate-y-[1px]
    sm:hover:border-emerald-200
    sm:hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]

    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-emerald-300

    disabled:cursor-wait
    disabled:opacity-70

    transition-all
    duration-200

    sm:will-change-transform

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
            w-10 h-10 rounded-[14px] flex items-center justify-center

            ${
              isEntrada
                ? "bg-emerald-100 text-emerald-600"
                : "bg-red-100 text-red-500"
            }
          `}
                          >
                            {isEntrada ? <PackageOpen size={18} /> : <ShoppingCart size={18} />}
                          </div>

                          {/* INFO */}
                          <div className="min-w-0 space-y-1">
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

                            <p className="flex items-center gap-1.5 text-[11px] text-[color:var(--muted-soft)]">
                              <CalendarDays size={12} />
                              {formatDate(item.data)} • {formatTime(item.data)}
                            </p>

                            <div className="flex flex-wrap gap-1.5">
                              {isEntrada && item.numeroFolha && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">Folha {item.numeroFolha}</span>}
                              {!isEntrada && item.numeroPedido && <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-700">Pedido {item.numeroPedido}</span>}
                              {item.placa && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">{item.placa}</span>}
                              {isEntrada && item.modeloCaminhao && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">{item.modeloCaminhao}</span>}
                              {!isEntrada && item.statusPagamento && <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${getStatusPagamentoClasses(item.statusPagamento)}`}>{item.statusPagamento}</span>}
                            </div>
                          </div>
                        </div>

                        {/* DIREITA */}
                        <div className="flex items-end justify-between gap-3 sm:block sm:text-right space-y-1">
                          <div>
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

                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            {isLoadingVenda ? <Loader2 size={14} className="animate-spin" /> : <ReceiptText size={14} />}
                            {isLoadingVenda ? "Abrindo..." : isEntrada ? "Abrir compra" : "Abrir venda"}
                            {!isLoadingVenda && <ChevronRight size={14} />}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
              )}
            </AnimatePresence>

            <CompraEditModal
              compraId={selectedCompraId}
              open={selectedCompraId !== null}
              onClose={() => setSelectedCompraId(null)}
            />

            <VendaEditModal
              venda={selectedVenda}
              open={selectedVenda !== null}
              onClose={() => setSelectedVenda(null)}
            />
          </>,
          document.body,
        )}
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

    sm:hover:-translate-y-[1px]

    sm:hover:border-[color:var(--border-strong)]

    sm:hover:shadow-[0_8px_18px_rgba(0,0,0,0.05)]

    sm:will-change-transform
  "
    >
      {/* 🔥 GLOW SUAVE */}
      <div
        className="
    absolute inset-0

    hidden
    sm:block

    opacity-0
    sm:group-hover:opacity-100

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
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/0 sm:group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}
