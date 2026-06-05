"use client";

import { useState } from "react";

import { createPortal } from "react-dom";

import { motion } from "framer-motion";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Check, ChevronDown } from "lucide-react";

import {
  ClienteHistoricoResponse,
  parseDecimal,
  registrarPagamento,
} from "../services/clientes.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  open: boolean;

  onClose: () => void;

  clienteId: string;

  transacao: ClienteHistoricoResponse["transacoes"][number] | null;
}

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

function formatCurrency(value: number | string | null | undefined): string {
  const parsed = parseDecimal(value);

  return `R$ ${parsed.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function ClienteFinanceiroModal({
  open,
  onClose,
  clienteId,
  transacao,
}: Props) {
  ////////////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////////////

  const [valorPagamento, setValorPagamento] = useState("");

  const [formaPagamento, setFormaPagamento] = useState<
    | "DINHEIRO"
    | "PIX"
    | "TRANSFERENCIA"
    | "BOLETO"
    | "CARTAO"
    | "CHEQUE"
    | "PROMISSORIA"
    | "OUTRO"
  >("PIX");

  const [formaPagamentoOpen, setFormaPagamentoOpen] = useState(false);

  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [observacoesPagamento, setObservacoesPagamento] = useState("");

  const portalTarget = typeof window !== "undefined" ? document.body : null;

  ////////////////////////////////////////////////////////////
  // QUERY CLIENT
  ////////////////////////////////////////////////////////////

  const queryClient = useQueryClient();

  ////////////////////////////////////////////////////////////
  // MUTATION
  ////////////////////////////////////////////////////////////

  const pagamentoMutation = useMutation({
    mutationFn: ({
      transacaoId,
      payload,
    }: {
      transacaoId: string;

      payload: {
        valor: number;

        formaPagamento:
          | "DINHEIRO"
          | "PIX"
          | "TRANSFERENCIA"
          | "BOLETO"
          | "CARTAO"
          | "CHEQUE"
          | "PROMISSORIA"
          | "OUTRO";

        pagoEm?: string;

        observacoes?: string;
      };
    }) => registrarPagamento(transacaoId, payload),

    onSuccess: async () => {
      ////////////////////////////////////////////////////////
      // INVALIDATE
      ////////////////////////////////////////////////////////

      await queryClient.invalidateQueries({
        queryKey: ["cliente-historico", clienteId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["cliente-resumo", clienteId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["financeiro-resumo"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["financeiro-fluxo"],
      });

      ////////////////////////////////////////////////////////
      // RESET
      ////////////////////////////////////////////////////////

      setValorPagamento("");

      setFormaPagamento("PIX");

      setDataPagamento(new Date().toISOString().slice(0, 10));

      setObservacoesPagamento("");

      ////////////////////////////////////////////////////////
      // CLOSE
      ////////////////////////////////////////////////////////

      onClose();
    },
  });

  ////////////////////////////////////////////////////////////
  // GUARD
  ////////////////////////////////////////////////////////////

  if (!open || !transacao) {
    return null;
  }
  if (!open || !transacao || !portalTarget) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // VALUES
  ////////////////////////////////////////////////////////////

  const valorRestante = parseDecimal(transacao.valorRestante);

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return createPortal(
    <motion.div
      style={{
        isolation: "isolate",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="
        fixed inset-0 z-[10050]

        bg-black/50
        backdrop-blur-[2px]

        flex
        items-center
        justify-center

        p-4
      "
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 10,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 10,
        }}
        transition={{
          duration: 0.2,
        }}
        className="
          w-full
          max-w-[500px]

          max-h-[92dvh]

          rounded-[20px]

          border
        border-white/20

          bg-white


          bg-[color:var(--surface-0)]

          shadow-[0_18px_50px_rgba(0,0,0,0.22)]

          overflow-hidden flex flex-col

          relative isolate
        "
      >
        {/* HEADER */}

        <div
          className="
            px-3 py-1

            border-b

            border-[color:var(--border)]
          "
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3
                className="
                  text-[15px]
                  sm:text-[14px]

                  font-bold
                  text-[color:var(--foreground)]
                "
              >
                Registrar pagamento
              </h3>

              <p
                className="
                  text-[10px]
                  text-[color:var(--muted-soft)]
                "
              >
                Controle financeiro da transação
              </p>
            </div>

            <button
              onClick={onClose}
              className="
                w-8 h-8

                rounded-lg

                border

                border-[color:var(--border)]

                hover:bg-black/5

                transition-all
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* BODY */}

        <div className="p-4 space-y-2 overflow-y-auto scrollbar-thin">
          {/* RESUMO */}

          <div
            className="
              rounded-xl

              border border-emerald-100

              bg-emerald-50/60

              p-1
            "
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-8">
              <div>
                <p className="text-[10px] text-emerald-700">Valor total</p>

                <p className="text-[14px] font-bold text-emerald-700">
                  {formatCurrency(transacao.valor)}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-amber-700">Restante</p>

                <p className="text-[14px] font-bold text-amber-700">
                  {formatCurrency(valorRestante)}
                </p>
              </div>
            </div>
          </div>

          {/* VALOR */}

          <div className="space-y-1.5">
            <label
              className="
                text-[11px]
                font-medium
                text-[color:var(--muted-foreground)]
              "
            >
              Valor do pagamento
            </label>

            <div className="relative">
              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2

                  text-[13px]
                  font-medium

                  text-emerald-600
                "
              >
                R$
              </span>

              <input
                type="text"
                inputMode="decimal"
                value={valorPagamento}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");

                  const numericValue = Number(onlyNumbers) / 100;

                  setValorPagamento(
                    numericValue.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }),
                  );
                }}
                className="
                  w-full

                  h-[44px]

                  rounded-[14px]

                  border
                  border-[color:var(--border)]

                  bg-white

                  pl-12
                  pr-4

                  text-[15px]
                  font-medium

                  tracking-[-0.01em]

                  text-[color:var(--foreground)]

                  outline-none

                  transition-all
                  duration-200

                  focus:border-emerald-400
                  focus:ring-4
                  focus:ring-emerald-100
                "
                placeholder="0,00"
              />
            </div>

            {Number(valorPagamento.replace(/\./g, "").replace(",", ".")) >
              valorRestante && (
              <p className="text-[11px] text-red-500">
                O valor informado é maior que o restante da transação.
              </p>
            )}
          </div>

          {/* FORMA */}

          <div className="space-y-1.5">
            <label
              className="
                text-[11px]
                font-medium
                text-[color:var(--muted-foreground)]
              "
            >
              Forma de pagamento
            </label>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFormaPagamentoOpen(!formaPagamentoOpen)}
                className="
                  w-full

                  h-[44px]

                  rounded-[14px]

                  border
                  border-[color:var(--border)]

                  bg-white

                  px-4

                  flex
                  items-center
                  justify-between

                  text-[14px]
                  font-medium

                  text-[color:var(--foreground)]

                  outline-none

                  transition-all
                  duration-200

                  hover:border-emerald-300

                  focus:border-emerald-400
                  focus:ring-4
                  focus:ring-emerald-100
                "
              >
                <span>
                  {
                    {
                      PIX: "PIX",
                      DINHEIRO: "Dinheiro",
                      TRANSFERENCIA: "Transferência",
                      BOLETO: "Boleto",
                      CARTAO: "Cartão",
                      CHEQUE: "Cheque",
                      PROMISSORIA: "Promissória",
                      OUTRO: "Outro",
                    }[formaPagamento]
                  }
                </span>

                <ChevronDown
                  size={16}
                  className={`
                    transition-transform
                    duration-200

                    ${formaPagamentoOpen ? "rotate-180" : ""}
                  `}
                />
              </button>

              {formaPagamentoOpen && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -6,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.98,
                  }}
                  transition={{
                    duration: 0.16,
                  }}
                  className="
  absolute
  top-[calc(100%+8px)]
  left-0
  right-0

  z-[200]

  max-h-[40dvh]

  overflow-y-auto
  overflow-x-hidden

  overscroll-contain

  rounded-[16px]

  border
  border-[color:var(--border)]

  bg-white

  shadow-[0_18px_40px_rgba(0,0,0,0.12)]

  scrollbar-thin
"
                >
                  {[
                    {
                      value: "PIX",
                      label: "PIX",
                    },
                    {
                      value: "DINHEIRO",
                      label: "Dinheiro",
                    },
                    {
                      value: "TRANSFERENCIA",
                      label: "Transferência",
                    },
                    {
                      value: "BOLETO",
                      label: "Boleto",
                    },
                    {
                      value: "CARTAO",
                      label: "Cartão",
                    },
                    {
                      value: "CHEQUE",
                      label: "Cheque",
                    },
                    {
                      value: "PROMISSORIA",
                      label: "Promissória",
                    },
                    {
                      value: "OUTRO",
                      label: "Outro",
                    },
                  ].map((option) => {
                    const active = formaPagamento === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFormaPagamento(
                            option.value as typeof formaPagamento,
                          );

                          setFormaPagamentoOpen(false);
                        }}
                        className={`
                          w-full

                          px-4
                          py-3

                          flex
                          items-center
                          justify-between

                          text-left

                          text-[13px]
                          font-medium

                          transition-all
                          duration-150

                          ${
                            active
                              ? `
                                bg-emerald-50

                                text-emerald-700
                              `
                              : `
                                text-[color:var(--foreground)]

                                hover:bg-[color:var(--surface-100)]
                              `
                          }
                        `}
                      >
                        <span>{option.label}</span>

                        {active && (
                          <Check size={15} className="text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* DATA */}

          <div className="space-y-2">
            <label className="text-[11px] font-medium">Data do pagamento</label>

            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="
                w-full

                h-[44px]

                rounded-xl

                border

                border-[color:var(--border)]

                bg-white

                px-4

                text-[13px]

                outline-none

                focus:border-emerald-400
              "
            />
          </div>

          {/* OBS */}

          <div className="space-y-2">
            <label className="text-[11px] font-medium">Observações</label>

            <textarea
              value={observacoesPagamento}
              onChange={(e) => setObservacoesPagamento(e.target.value)}
              rows={3}
              className="
                w-full

                rounded-xl

                border

                border-[color:var(--border)]

                bg-white

                px-4 py-2

                text-[12px]

                outline-none

                resize-none

                focus:border-emerald-400
              "
              placeholder="Informações adicionais..."
            />
          </div>
        </div>

        {/* FOOTER */}

        <div
          className="
            px-4 py-3

            border-t

            border-[color:var(--border)]

            flex
            justify-stretch
            sm:justify-end
          "
        >
          <button
            disabled={pagamentoMutation.isPending}
            onClick={() => {
              if (!valorPagamento) {
                return;
              }

              const valorNumerico = Number(
                valorPagamento.replace(/\./g, "").replace(",", "."),
              );

              if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
                return;
              }

              if (valorNumerico > valorRestante) {
                return;
              }

              pagamentoMutation.mutate({
                transacaoId: transacao.id,

                payload: {
                  valor: valorNumerico,

                  formaPagamento,

                  pagoEm: dataPagamento,

                  observacoes: observacoesPagamento,
                },
              });
            }}
            className="
              h-[42px]

              w-full

              sm:w-auto

              rounded-xl

              px-4

              bg-emerald-600

              text-white

              text-[12px]
              font-medium

              shadow-[0_8px_18px_rgba(16,185,129,0.16)]

              hover:bg-emerald-500

              disabled:opacity-60

              transition-all
            "
          >
            {pagamentoMutation.isPending
              ? "Registrando..."
              : "Registrar pagamento"}
          </button>
        </div>
      </motion.div>
    </motion.div>,
    portalTarget,
  );
}
