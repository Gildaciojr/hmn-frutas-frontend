"use client";

import { useState } from "react";

import { CreditCard, Landmark, Wallet, X } from "lucide-react";

import { useFornecedorFinanceiroCompleto } from "../hooks/useFornecedorFinanceiro";

import type { RegistrarPagamentoFornecedorPayload } from "../services/financeiro-fornecedor.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  open: boolean;

  fornecedorId: string;

  fornecedorNome: string;

  onClose: () => void;
}

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

function currency(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dateBR(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedorFinanceiroModal({
  open,
  fornecedorId,
  fornecedorNome,
  onClose,
}: Props) {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [valor, setValor] = useState("");

  const [formaPagamento, setFormaPagamento] =
    useState<RegistrarPagamentoFornecedorPayload["formaPagamento"]>("PIX");

  const [observacoes, setObservacoes] = useState("");

  ////////////////////////////////////////////////////////////
  // HOOK
  ////////////////////////////////////////////////////////////

  const {
    financeiro,
    financeiroLoading,

    pagamentos,
    pagamentosLoading,

    registrarPagamentoFornecedor,

    registrandoPagamento,
  } = useFornecedorFinanceiroCompleto(fornecedorId);

  ////////////////////////////////////////////////////////////
  // GUARD
  ////////////////////////////////////////////////////////////

  if (!open) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function handlePagamento() {
    const valorNumerico = Number(valor.replace(",", "."));

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      return;
    }

    await registrarPagamentoFornecedor({
      valor: valorNumerico,

      formaPagamento,

      observacoes: observacoes.trim() || undefined,
    });

    setValor("");

    setObservacoes("");
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      className="
        fixed
        inset-0

        isolate

        z-[99999]

        bg-black/40

        flex
        items-center
        justify-center

        p-4
      "
    >
      <div
        className="
          w-full

          max-w-6xl

          max-h-[90vh]

          overflow-visible

          rounded-3xl

          bg-white

          border

          shadow-[0_25px_80px_rgba(0,0,0,0.18)]
        "
      >
        {/* HEADER */}

        <div
          className="
            px-6
            py-5

            border-b

            flex
            items-center
            justify-between
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-semibold
              "
            >
              Financeiro
            </h2>

            <p
              className="
                text-sm

                text-[color:var(--muted)]
              "
            >
              {fornecedorNome}
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              w-10
              h-10

              rounded-xl

              border

              flex
              items-center
              justify-center
            "
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="
    overflow-y-auto

    max-h-[calc(90vh-92px)]

    px-6
    py-5

    space-y-5
  "
        >
          {/* RESUMO */}

          {!financeiroLoading && financeiro && (
            <div
              className="
                  grid

                  grid-cols-2
                  xl:grid-cols-4

                  gap-3
                "
            >
              <CardResumo
                icon={<Wallet size={18} />}
                title="Comprado"
                value={currency(financeiro.resumo.totalComprado)}
              />

              <CardResumo
                icon={<CreditCard size={18} />}
                title="Pago"
                value={currency(financeiro.resumo.totalPago)}
              />

              <CardResumo
                icon={<Landmark size={18} />}
                title="Saldo"
                value={currency(financeiro.resumo.saldoDevedor)}
              />

              <CardResumo
                icon={<Wallet size={18} />}
                title="% Limite"
                value={`${financeiro.resumo.percentualLimite.toFixed(1)}%`}
              />
            </div>
          )}

          <div
            className="
    grid

    xl:grid-cols-[340px_1fr]

    gap-5

    items-start
  "
          >
            {/* PAGAMENTO */}

            <div
              className="
    relative
    overflow-hidden

    rounded-[24px]

    border
    border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))]

    px-5
    py-4

    space-y-4

    shadow-[0_10px_30px_rgba(15,23,42,0.05)]

    transition-all
    duration-300
  "
            >
              <h3
                className="
                text-[20px]

                font-semibold
                tracking-[-0.03em]

                text-[color:var(--foreground)]
              "
              >
                Registrar Pagamento
              </h3>

              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="Valor"
                className="
  w-full

  h-[46px]

  px-4

  rounded-[16px]

  border
  border-[color:var(--border-soft)]

  bg-white/80

  outline-none

  text-[15px]
  font-medium

  transition-all
  duration-300

  focus:border-emerald-300

  focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
"
              />

              <select
                value={formaPagamento}
                onChange={(e) =>
                  setFormaPagamento(
                    e.target
                      .value as RegistrarPagamentoFornecedorPayload["formaPagamento"],
                  )
                }
                className="
  w-full

  h-[46px]

  px-4

  rounded-[16px]

  border
  border-[color:var(--border-soft)]

  bg-white/80

  outline-none

  text-[14px]

  transition-all
  duration-300

  focus:border-emerald-300

  focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
"
              >
                <option value="PIX">PIX</option>

                <option value="DINHEIRO">Dinheiro</option>

                <option value="TRANSFERENCIA">Transferência</option>

                <option value="BOLETO">Boleto</option>

                <option value="CHEQUE">Cheque</option>

                <option value="PROMISSORIA">Promissória</option>

                <option value="OUTRO">Outro</option>
              </select>

              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações"
                className="
  w-full

  rounded-[16px]

  border
  border-[color:var(--border-soft)]

  bg-white/80

  p-4

  outline-none

  resize-none

  text-[14px]

  transition-all
  duration-300

  focus:border-emerald-300

  focus:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
"
              />

              <button
                onClick={handlePagamento}
                disabled={registrandoPagamento}
                className="
  h-[46px]

  w-full

  rounded-[16px]

  bg-[linear-gradient(135deg,#059669,#047857)]

  text-white

  text-[14px]
  font-semibold

  shadow-[0_14px_34px_rgba(16,185,129,0.24)]

  transition-all
  duration-300

  hover:translate-y-[-1px]

  hover:shadow-[0_20px_44px_rgba(16,185,129,0.34)]

  disabled:opacity-60
"
              >
                {registrandoPagamento
                  ? "Registrando..."
                  : "Registrar Pagamento"}
              </button>
            </div>

            <div className="space-y-5">
              {/* TRANSAÇÕES */}

              <div className="space-y-3">
                <h3
                  className="
                font-semibold
              "
                >
                  Débitos
                </h3>

                {financeiro?.transacoes.map((transacao) => (
                  <div
                    key={transacao.id}
                    className="
                    border

                    rounded-2xl

                    p-4
                  "
                  >
                    <div className="font-medium">{transacao.descricao}</div>

                    <div className="text-sm text-[color:var(--muted)]">
                      Vencimento: {dateBR(transacao.vencimento)}
                    </div>

                    <div className="text-sm">
                      Valor: {currency(transacao.valor)}
                    </div>

                    <div className="text-sm">
                      Pago: {currency(transacao.valorPago)}
                    </div>

                    <div className="text-sm">
                      Restante: {currency(transacao.valorRestante)}
                    </div>

                    <div className="text-xs mt-2">
                      {transacao.statusFinanceiro}
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGAMENTOS */}

              <div className="space-y-3">
                <h3
                  className="
                text-[18px]

                font-semibold

                tracking-[-0.03em]

                text-[color:var(--foreground)]
              "
                >
                  Histórico de Pagamentos
                </h3>

                {!pagamentosLoading &&
                  pagamentos?.pagamentos.map((pagamento) => (
                    <div
                      key={pagamento.id}
                      className="
                    group
                    relative
                    overflow-hidden

                    rounded-[20px]

                    border
                    border-[color:var(--border-soft)]

                    bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.84))]

                    px-4
                    py-3.5

                    shadow-[0_8px_24px_rgba(15,23,42,0.04)]

                    transition-all
                    duration-300

                    hover:translate-y-[-2px]

                    hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]
                  "
                    >
                      <div
                        className="
                      flex
                      items-start
                      justify-between

                      gap-4
                    "
                      >
                        <div className="space-y-1">
                          <div
                            className="
                          text-[18px]

                          font-semibold

                          tracking-[-0.03em]
                        "
                          >
                            {currency(pagamento.valor)}
                          </div>

                          <div
                            className="
                          text-[12px]

                          uppercase

                          tracking-[0.16em]

                          text-[color:var(--muted-soft)]
                        "
                          >
                            {pagamento.formaPagamento}
                          </div>
                        </div>

                        <div
                          className="
                        text-[12px]

                        text-[color:var(--muted)]
                      "
                        >
                          {dateBR(pagamento.pagoEm)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// CARD
////////////////////////////////////////////////////////////

function CardResumo({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;

  title: string;

  value: string;
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden

        rounded-[20px]

        border
        border-[color:var(--border-soft)]

        bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))]

        px-4
        py-3.5

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]

        transition-all
        duration-300

        hover:translate-y-[-2px]

        hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]
      "
    >
      {/* FX */}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute
            top-0
            right-0

            w-[90px]
            h-[90px]

            rounded-full

            bg-emerald-400/8

            blur-[24px]
          "
        />

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[1px]

            bg-gradient-to-r
            from-transparent
            via-black/10
            to-transparent
          "
        />
      </div>

      {/* CONTENT */}

      <div className="relative z-10">
        <div
          className="
            flex
            items-center
            gap-2.5
          "
        >
          {/* ICON */}

          <div
            className="
              flex
              items-center
              justify-center

              w-9
              h-9

              rounded-[12px]

              bg-emerald-50

              text-emerald-600
            "
          >
            {icon}
          </div>

          {/* TITLE */}

          <span
            className="
              text-[11px]

              font-medium

              uppercase

              tracking-[0.16em]

              text-[color:var(--muted-soft)]
            "
          >
            {title}
          </span>
        </div>

        {/* VALUE */}

        <div
          className="
            mt-3

            text-[24px]

            font-semibold

            tracking-[-0.04em]

            text-[color:var(--foreground)]
          "
        >
          {value}
        </div>
      </div>
    </div>
  );
}
