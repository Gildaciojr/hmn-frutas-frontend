"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ClienteModal } from "./ClienteModal";
import { getClientesResumo } from "../services/clientes.service";
import { WhatsappButton } from "@/modules/whatsapp/components/WhatsappButton";
import type { ClienteResumoItem } from "../services/clientes.service";
import { useClienteStore } from "../store/useClienteStore";

// ================= HELPERS =================
function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

export function ClientesTable() {
  const {
    data: clientes = [],
    isLoading,
    error,
  } = useQuery<ClienteResumoItem[]>({
    queryKey: ["clientes-resumo"],

    queryFn: getClientesResumo,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,

    retry: 1,
  });

  // 🔥 CONTROLE DE MODAL
  const [selectedCliente, setSelectedCliente] =
    useState<ClienteResumoItem | null>(null);

  const [createMode, setCreateMode] = useState(false);

  const createModalOpen = useClienteStore((state) => state.createModalOpen);

  const closeCreateModal = useClienteStore((state) => state.closeCreateModal);

  // 🔍 BUSCA
  const [search, setSearch] = useState("");

  // ================= FILTRO =================
  const filteredClientes = useMemo(() => {
    const normalized = search
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    if (!normalized) {
      return clientes;
    }

    const searchPhone = normalized.replace(/\D/g, "");

    return clientes.filter((cliente) => {
      const nome = (cliente.nome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const proprietarioNome = (cliente.proprietarioNome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const nomeFantasia = (cliente.nomeFantasia || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const telefone = (cliente.telefone || "").replace(/\D/g, "");

      return (
        nome.includes(normalized) ||
        proprietarioNome.includes(normalized) ||
        nomeFantasia.includes(normalized) ||
        telefone.includes(searchPhone)
      );
    });
  }, [clientes, search]);

  console.log("SEARCH:", search);
  console.log("FILTRADOS:", filteredClientes.length);

  ////////////////////////////////////////////////////////////
  // ORDENAÇÃO ERP
  ////////////////////////////////////////////////////////////

  const orderedClientes = useMemo(() => {
    return [...filteredClientes].sort((a, b) => {
      ////////////////////////////////////////////////////////
      // PENDENTE DESC
      ////////////////////////////////////////////////////////

      if (a.totalPendente !== b.totalPendente) {
        return b.totalPendente - a.totalPendente;
      }

      ////////////////////////////////////////////////////////
      // SALDO ASC
      ////////////////////////////////////////////////////////

      return a.saldo - b.saldo;
    });
  }, [filteredClientes]);

  return (
    <div
      className="
      relative
      overflow-visible
    "
    >
      {/* ================= ERROR ================= */}
      {error && (
        <div className="px-6 py-6 text-sm text-red-500">
          Erro ao carregar clientes
        </div>
      )}

      {/* ================= ACTION BAR ================= */}
      <div
        className="
    relative
    z-20

    px-6
    py-4

    flex
    items-center
    justify-between

    gap-4
  "
      >
        {/* ESQUERDA — IDENTIDADE + CONTEXTO */}
        <div className="flex items-center gap-4">
          {/* IDENTIDADE VISUAL */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[color:var(--brand)]" />

            <span className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              Base de clientes
            </span>
          </div>

          {/* CONTADOR */}
          <span className="text-[13px] text-[color:var(--foreground)] font-medium">
            {orderedClientes.length.toLocaleString("pt-BR")} registros
          </span>
        </div>

        {/* DIREITA — CONTROLES */}
        <div className="flex items-center gap-3">
          {/* 🔍 BUSCA (PREPARAÇÃO PARA ESCALA) */}
          <div
            className="
    relative
    z-30

    hidden
    md:flex

    items-center
    gap-2

    min-w-[280px]

    px-3
    py-2

    rounded-[var(--radius-sm)]

    border
    border-[color:var(--border-soft)]

    bg-white

    text-[12px]
    text-[color:var(--muted)]

    shadow-sm
  "
          >
            <span
              className="
      opacity-60
      pointer-events-none
      shrink-0
    "
            >
              🔍
            </span>

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Buscar cliente..."
              className="
      flex-1
      min-w-[220px]

      bg-transparent

      text-[13px]
      text-[color:var(--foreground)]

      outline-none

      placeholder:text-[color:var(--muted-soft)]
    "
            />
          </div>

          {/* BOTÃO PRINCIPAL */}
          <button
            onClick={() => {
              setCreateMode(true);
              setSelectedCliente(null);
            }}
            className="
        flex items-center gap-2
        px-4 py-2.5
        rounded-[var(--radius-md)]
        text-[13px] font-medium
        bg-black text-white
        hover:opacity-90
        transition
        shadow-[0_10px_25px_rgba(0,0,0,0.12)]
      "
          >
            <span className="text-[14px]">+</span>
            Novo cliente
          </button>
        </div>
      </div>

      <div className="h-px bg-[color:var(--border-soft)]" />

      {/* ================= HEADER TABELA ================= */}
      <div
        className="
    relative

    grid

    grid-cols-[minmax(280px,2.2fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(220px,0.9fr)]

    items-center

    gap-6

    px-6 py-2

    overflow-hidden
  "
      >
        {/* BACKGROUND */}
        <div
          className="
      absolute inset-0

      bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(248,250,252,0.72))]

      backdrop-blur-md
    "
        />

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

        {/* CLIENTE */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="
        w-1.5 h-5

        rounded-full

        bg-violet-500

        shadow-[0_0_16px_rgba(139,92,246,0.45)]
      "
          />

          <span
            className="
        text-[10px]

        font-semibold

        uppercase

        tracking-[0.26em]

        text-violet-600
      "
          >
            Cliente
          </span>
        </div>

        {/* COMPRAS */}
        <span
          className="
      relative z-10

      text-[10px]

      font-semibold

      uppercase

      tracking-[0.26em]

      text-emerald-600
    "
        >
          Compras
        </span>

        {/* VENDAS */}
        <span
          className="
      relative z-10

      text-[10px]

      font-semibold

      uppercase

      tracking-[0.26em]

      text-blue-600
    "
        >
          Vendas
        </span>

        {/* SALDO */}
        <span
          className="
      relative z-10

      text-[10px]

      font-semibold

      uppercase

      tracking-[0.26em]

      text-amber-600
    "
        >
          Saldo
        </span>

        {/* OPERAÇÕES */}
        <div className="relative z-10 flex justify-end pr-3">
          <span
            className="
        text-[10px]

        font-semibold

        uppercase

        tracking-[0.26em]

        text-rose-500
      "
          >
            Operações
          </span>
        </div>
      </div>

      {/* ================= LISTA ================= */}
      <div
        className="
    px-2
    py-2

    max-h-[560px]

    overflow-y-auto
    overflow-x-hidden

    space-y-2

    pr-1

    scrollbar-thin
    scrollbar-thumb-[rgba(15,23,42,0.10)]
    scrollbar-track-transparent
  "
      >
        {/* LOADING */}
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="
                h-[72px]
                rounded-[var(--radius-md)]
                bg-[color:var(--surface-200)]
                animate-pulse
              "
            />
          ))}

        {/* LISTAGEM */}
        <AnimatePresence mode="popLayout">
          {!isLoading &&
            orderedClientes.map((cliente, i) => {
              const isPositivo = cliente.saldo >= 0;

              return (
                <motion.div
                  layout
                  key={cliente.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    setSelectedCliente(cliente);
                    setCreateMode(false);
                  }}
                  className="
                  group
                  relative
                  grid
                  grid-cols-[minmax(280px,2.2fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(140px,1fr)_minmax(220px,0.9fr)]
                  items-center
                  gap-6
                  px-5 py-3
                  rounded-[20px]
                  bg-[color:var(--surface-100)]
                  border border-[color:var(--border-soft)]
                  shadow-[0_8px_24px_rgba(0,0,0,0.04)]
                  hover:border-[color:var(--border-strong)]
                  hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]
                  transition-all duration-300
                  cursor-pointer
                  overflow-hidden
                "
                >
                  {/* CLIENTE */}
                  <div className="flex items-center gap-4 relative z-10 min-w-0">
                    {/* AVATAR */}
                    <div
                      className={`
                      w-12 h-12

                      rounded-2xl

                      flex
                      items-center
                      justify-center

                      shrink-0

                      border

                      text-[14px]
                      font-semibold

                      transition-all
                      duration-300

                      ${
                        cliente.totalPendente > 0 || cliente.saldo < 0
                          ? `
                            bg-amber-100
                            border-amber-200
                            text-amber-700
                          `
                          : `
                            bg-emerald-100
                            border-emerald-200
                            text-emerald-700
                          `
                      }
                    `}
                    >
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>

                    {/* CONTEÚDO */}
                    <div className="flex flex-col min-w-0 gap-1.5">
                      {/* NOME + STATUS */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="
                          text-[14px]
                          font-semibold
                          tracking-tight

                          text-[color:var(--foreground)]

                          truncate
                        "
                        >
                          {cliente.nome}
                        </span>

                        {/* STATUS FINANCEIRO */}
                        <span
                          className={`
                          px-2 py-[3px]

                          rounded-full

                          text-[9px]
                          font-semibold

                          uppercase
                          tracking-[0.12em]

                          ${
                            cliente.totalPendente > 0 || cliente.saldo < 0
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
                          {cliente.totalPendente > 0 || cliente.saldo < 0
                            ? "Pendências"
                            : "Adimplente"}
                        </span>
                      </div>

                      {/* TELEFONE */}
                      <span className="text-[11px] text-[color:var(--muted)]">
                        {cliente.telefone || "Sem telefone"}
                      </span>

                      {/* BADGES ERP */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* KG */}
                        <span
                          className="
                          px-2 py-1

                          rounded-lg

                          border border-[color:var(--border-soft)]

                          bg-[color:var(--surface-200)]

                          text-[10px]
                          font-medium

                          text-[color:var(--muted)]
                        "
                        >
                          {(
                            cliente.totalKgComprado + cliente.totalKgVendido
                          ).toLocaleString("pt-BR")}{" "}
                          kg
                        </span>

                        {/* PAGO */}
                        <span
                          className="
                          px-2 py-1

                          rounded-lg

                          border border-emerald-200

                          bg-emerald-50

                          text-[10px]
                          font-medium

                          text-emerald-700
                        "
                        >
                          Pago {formatCurrency(cliente.totalPago)}
                        </span>

                        {/* PENDENTE */}
                        {(cliente.totalPendente > 0 || cliente.saldo < 0) && (
                          <span
                            className="
                            px-2 py-1

                            rounded-lg

                            border border-amber-200

                            bg-amber-50

                            text-[10px]
                            font-medium

                            text-amber-700
                          "
                          >
                            Pendente {formatCurrency(cliente.totalPendente)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* COMPRAS */}
                  <div className="text-[13px]">
                    {formatCurrency(cliente.totalCompras)}
                  </div>

                  {/* VENDAS */}
                  <div className="text-[13px]">
                    {formatCurrency(cliente.totalVendas)}
                  </div>

                  {/* SALDO */}
                  <div
                    className={`text-[13px] font-semibold ${
                      isPositivo ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {formatCurrency(cliente.saldo)}
                  </div>

                  {/* STATUS + AÇÕES */}
                  <div
                    className="
                    flex items-center justify-end gap-3

                    min-w-[210px]
                  "
                  >
                    {/* STATUS */}
                    <div className="flex justify-end">
                      <span
                        className={`
                        inline-flex items-center justify-center

                        h-8

                        px-3

                        rounded-full

                        text-[10px]
                        font-semibold

                        tracking-[0.08em]
                        uppercase

                        whitespace-nowrap

                        transition-all duration-300

                        ${
                          isPositivo
                            ? `
                              bg-emerald-50
                              text-emerald-600
                              border border-emerald-200/80
                            `
                            : `
                              bg-red-50
                              text-red-500
                              border border-red-200/80
                            `
                        }
                      `}
                      >
                        <span
                          className={`
                          w-1.5 h-1.5 rounded-full mr-2

                          ${isPositivo ? "bg-emerald-500" : "bg-red-500"}
                        `}
                        />

                        {isPositivo ? "Saudável" : "Em débito"}
                      </span>
                    </div>

                    {/* AÇÕES */}
                    <div className="flex items-center gap-2">
                      {/* WHATSAPP */}
                      <WhatsappButton clienteId={cliente.id} />

                      {/* VISUALIZAR */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();

                          setSelectedCliente(cliente);

                          setCreateMode(false);
                        }}
                        className="
                        group

                        relative

                        h-9

                        px-4

                        rounded-xl

                        border border-[color:var(--border-soft)]

                        bg-white

                        text-[11px]
                        font-semibold

                        tracking-[0.04em]

                        text-[color:var(--foreground)]

                        hover:border-[color:var(--border-strong)]

                        hover:bg-[color:var(--surface-200)]

                        hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]

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
                          via-white/70
                          to-transparent

                          opacity-70
                        "
                        />

                        <span className="relative z-10">Ver</span>
                      </button>
                    </div>
                  </div>

                  {/* LINHA DE HOVER (FEEDBACK VISUAL) */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-black/0 group-hover:bg-black/30 transition" />
                </motion.div>
              );
            })}
        </AnimatePresence>
        {/* EMPTY STATE PROFISSIONAL */}
        {!isLoading && filteredClientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 space-y-6">
            {/* ÍCONE MAIS SOFISTICADO */}
            <div
              className="
        w-16 h-16 rounded-2xl
        bg-[color:var(--surface-200)]
        flex items-center justify-center
        text-[color:var(--muted-soft)]
        text-xl
        border border-[color:var(--border-soft)]
        shadow-[0_10px_30px_rgba(0,0,0,0.04)]
      "
            >
              +
            </div>

            {/* TEXTO */}
            <div className="text-center space-y-2 max-w-[320px]">
              <p className="text-[16px] font-semibold text-[color:var(--foreground)]">
                Nenhum cliente encontrado
              </p>

              <p className="text-[13px] text-[color:var(--muted)] leading-relaxed">
                Comece cadastrando clientes para acompanhar compras, vendas e
                desempenho financeiro individual.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                setCreateMode(true);
                setSelectedCliente(null);
              }}
              className="
        flex items-center gap-2
        px-5 py-2.5
        rounded-[var(--radius-md)]
        text-[13px] font-medium
        bg-black text-white
        hover:opacity-90
        transition
        shadow-[0_10px_25px_rgba(0,0,0,0.12)]
      "
            >
              + Criar primeiro cliente
            </button>
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {(selectedCliente || createMode || createModalOpen) && (
        <ClienteModal
          open={true}
          cliente={createMode || createModalOpen ? null : selectedCliente}
          onClose={() => {
            setSelectedCliente(null);

            setCreateMode(false);

            closeCreateModal();
          }}
        />
      )}
    </div>
  );
}
