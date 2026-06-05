"use client";

import { motion } from "framer-motion";
import { useClientesResumo } from "../hooks/useClientes";

interface ClienteSelecionavel {
  id: string;

  nome: string;

  telefone?: string;
}

interface Props {
  onSelectCliente?: (cliente: ClienteSelecionavel) => void;

  clienteSelecionadoId?: string;
}

export function ClientesList({ onSelectCliente, clienteSelecionadoId }: Props) {
  const { clientes, loading } = useClientesResumo();

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="p-6 text-sm text-[color:var(--muted)]">
        Carregando clientes...
      </div>
    );
  }

  // ================= EMPTY =================
  if (!clientes.length) {
    return (
      <div
        className="
          flex flex-col items-center justify-center
          py-16 text-center space-y-3
        "
      >
        <div className="w-12 h-12 rounded-full bg-[color:var(--surface-200)] flex items-center justify-center text-[color:var(--muted-soft)]">
          —
        </div>

        <p className="text-sm text-[color:var(--muted)]">
          Nenhum cliente cadastrado
        </p>

        <span className="text-xs text-[color:var(--muted-soft)]">
          Cadastre clientes para iniciar operações
        </span>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-[var(--radius-lg)]
        border border-[color:var(--border-soft)]
        bg-[color:var(--surface-100)]
        overflow-hidden
      "
    >
      {/* ================= HEADER ================= */}
      <div
        className="
          relative

          px-5 py-4

          border-b
          border-[color:var(--border-soft)]

          overflow-hidden

          bg-gradient-to-b
          from-white
          to-[color:var(--surface-100)]
        "
      >
        {/* ================= BACKGROUND EFFECT ================= */}
        <div
          className="
    relative
    z-10

    flex
    flex-col

    md:flex-row

    items-start

    md:items-start

    justify-between

    gap-6
  "
        >
          {/* ================================================== */}
          {/* ESQUERDA */}
          {/* ================================================== */}

          <div className="space-y-4">
            {/* TITULAÇÃO */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold tracking-tight text-[color:var(--foreground)]">
                  Clientes
                </h2>

                <span
                  className="
                    px-2 py-[4px]

                    rounded-full

                    bg-emerald-100

                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]

                    text-emerald-700
                  "
                >
                  ERP
                </span>
              </div>

              <p className="text-[11px] leading-relaxed text-[color:var(--muted)]">
                Controle Operacional e Financeiro
              </p>
            </div>

            {/* KPI SUPERIOR */}
            <div className="flex flex-wrap items-center gap-3">
              {/* TOTAL CLIENTES */}
              <div
                className="
                  px-3 py-2

                  rounded-xl

                  border border-[color:var(--border-soft)]

                  bg-[color:var(--surface-200)]
                "
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-soft)]">
                  Clientes
                </p>

                <p className="text-[14px] font-semibold tracking-tight text-[color:var(--foreground)]">
                  {clientes.length.toLocaleString("pt-BR")}
                </p>
              </div>

              {/* MOVIMENTAÇÃO */}
              <div
                className="
                  px-3 py-2

                  rounded-xl

                  border border-[color:var(--border-soft)]

                  bg-[color:var(--surface-200)]
                "
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-[color:var(--muted-soft)]">
                  Movimentação
                </p>

                <p className="text-[14px] font-semibold tracking-tight text-[color:var(--foreground)]">
                  {clientes
                    .reduce((acc, cliente) => {
                      return (
                        acc + cliente.totalKgComprado + cliente.totalKgVendido
                      );
                    }, 0)
                    .toLocaleString("pt-BR")}{" "}
                  kg
                </p>
              </div>

              {/* PENDÊNCIAS */}
              <div
                className="
                  px-2.5 py-1.5

                  rounded-lg

                  border border-amber-200

                  bg-amber-50
                "
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-700/80">
                  Pendências
                </p>

                <p className="text-[14px] font-semibold tracking-tight text-amber-700">
                  {
                    clientes.filter((cliente) => cliente.totalPendente > 0)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* DIREITA */}
          {/* ================================================== */}

          <div className="flex flex-col sm:flex-row items-start gap-3 w-full lg:w-auto shrink-0">
            {/* TOTAL */}
            <span className="text-[11px] text-[color:var(--muted-soft)]">
              {clientes.length} registros
            </span>

            {/* STATUS GERAL */}
            <div
              className="
                px-3 py-1.5

                rounded-full

                border border-emerald-200

                bg-emerald-50

                text-[10px]
                font-semibold

                uppercase
                tracking-[0.14em]

                text-emerald-700
              "
            >
              Sistema operacional ativo
            </div>
          </div>
        </div>
      </div>

      {/* ================= LISTA ================= */}
      <div
        className="
    relative

    divide-y
    divide-[color:var(--border-soft)]

    max-h-[70dvh]
    overflow-y-auto

    scrollbar-thin
    scrollbar-thumb-[color:var(--border-soft)]
    scrollbar-track-transparent
  "
      >
        {clientes.map((cliente, i) => {
          const isSelected = cliente.id === clienteSelecionadoId;

          return (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelectCliente?.(cliente)}
              className={`
                group
                relative

                px-4 py-3

                flex
                items-start
                justify-between

                gap-4

                cursor-pointer

                transition-all
                duration-200

                overflow-hidden

                ${
                  isSelected
                    ? `
                      bg-emerald-50/70

                      border-l-[3px]
                      border-emerald-500

                      shadow-[0_6px_18px_rgba(16,185,129,0.05)]
                    `
                    : `
                      hover:bg-[color:var(--surface-200)]
                    `
                }
              `}
            >
              {/* ====================================================== */}
              {/* ESQUERDA */}
              {/* ====================================================== */}

              <div className="flex items-start gap-4 min-w-0">
                {/* ================= AVATAR ================= */}
                <div
                  className={`
                    w-10 h-10

                    rounded-xl

                    flex
                    items-center
                    justify-center

                    shrink-0

                    border

                    text-[14px]
                    font-semibold

                    transition-all
                    duration-200

                    ${
                      cliente.saldo >= 0
                        ? `
                          bg-emerald-100
                          border-emerald-200
                          text-emerald-700
                        `
                        : `
                          bg-red-100
                          border-red-200
                          text-red-700
                        `
                    }
                  `}
                >
                  {cliente.nome.charAt(0).toUpperCase()}
                </div>

                {/* ================= IDENTIFICAÇÃO ================= */}
                <div className="min-w-0 space-y-2">
                  {/* NOME */}
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold tracking-tight text-[color:var(--foreground)] truncate">
                      {cliente.nome}
                    </p>

                    {/* STATUS FINANCEIRO */}
                    <span
                      className={`
                        px-2 py-[4px]

                        rounded-full

                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]

                        ${
                          cliente.totalPendente > 0
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
                      {cliente.totalPendente > 0
                        ? "Com pendências"
                        : "Adimplente"}
                    </span>
                  </div>

                  {/* TELEFONE */}
                  <p className="text-[12px] text-[color:var(--muted)]">
                    {cliente.telefone || "Sem telefone"}
                  </p>

                  {/* BADGES OPERACIONAIS */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* KG */}
                    <span
                      className="
                        px-1.5 py-[3px]

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
                      kg movimentados
                    </span>

                    {/* PAGAMENTOS */}
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
                      Pago:{" "}
                      {cliente.totalPago.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>

                    {/* PENDÊNCIAS */}
                    {cliente.totalPendente > 0 && (
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
                        Pendente:{" "}
                        {cliente.totalPendente.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ====================================================== */}
              {/* DIREITA */}
              {/* ====================================================== */}

              <div
                className="
                  flex
                  items-start

                  gap-4

                  shrink-0
                "
              >
                {/* ================= MOVIMENTAÇÃO ================= */}
                <div className="text-left sm:text-right w-full sm:min-w-[110px]">
                  <p
                    className="
                      text-[10px]

                      uppercase
                      tracking-[0.12em]

                      text-[color:var(--muted-soft)]
                    "
                  >
                    Movimentado
                  </p>

                  <p className="text-[14px] font-semibold tracking-tight text-[color:var(--foreground)]">
                    {(
                      cliente.totalKgComprado + cliente.totalKgVendido
                    ).toLocaleString("pt-BR")}{" "}
                    kg
                  </p>

                  <p className="text-[10px] text-[color:var(--muted-soft)]">
                    Compra + venda
                  </p>
                </div>

                {/* ================= SALDO ================= */}
                <div className="text-left sm:text-right w-full sm:min-w-[130px]">
                  <p
                    className="
                      text-[10px]

                      uppercase
                      tracking-[0.12em]

                      text-[color:var(--muted-soft)]
                    "
                  >
                    Conta corrente
                  </p>

                  <p
                    className={`
                      text-[13px]
                      font-semibold
                      tracking-tight

                      ${
                        cliente.saldo >= 0 ? "text-emerald-600" : "text-red-500"
                      }
                    `}
                  >
                    {cliente.saldo.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>

                  <p className="text-[10px] text-[color:var(--muted-soft)]">
                    Saldo operacional
                  </p>
                </div>

                {/* ================= STATUS ================= */}
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <p
                    className="
                      text-[10px]

                      uppercase
                      tracking-[0.12em]

                      text-[color:var(--muted-soft)]
                    "
                  >
                    Status
                  </p>

                  <div className="flex justify-end">
                    <span
                      className={`
                        px-2 py-[3px]

                        rounded-full

                        text-[10px]
                        font-semibold

                        uppercase
                        tracking-[0.14em]

                        ${
                          cliente.saldo >= 0
                            ? `
                              bg-emerald-100
                              text-emerald-700
                            `
                            : `
                              bg-red-100
                              text-red-700
                            `
                        }
                      `}
                    >
                      {cliente.saldo >= 0 ? "Positivo" : "Pendente"}
                    </span>
                  </div>

                  <p className="text-[10px] text-[color:var(--muted-soft)] mt-1">
                    Financeiro
                  </p>
                </div>
              </div>

              {/* ====================================================== */}
              {/* FEEDBACK VISUAL */}
              {/* ====================================================== */}

              <div
                className={`
                  absolute
                  bottom-0
                  left-0

                  h-[1px]

                  transition-all
                  duration-300

                  ${
                    isSelected
                      ? `
                        w-full
                        bg-emerald-500
                      `
                      : `
                        w-0
                        bg-[color:var(--foreground)]
                        group-hover:w-full
                      `
                  }
                `}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
