"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import { ArrowRight, CalendarDays, ReceiptText } from "lucide-react";

import { useDespesasOperacionais } from "../hooks/useDespesasOperacionais";

interface Props {
  open: boolean;

  onClose: () => void;
}

////////////////////////////////////////////////////////////
// FORMATAÇÃO MONETÁRIA
////////////////////////////////////////////////////////////

function formatarValorDespesa(valor: string): string {
  const numeros = valor.replace(/\D/g, "");

  if (!numeros) {
    return "";
  }

  //////////////////////////////////////////////////////////
  // COMEÇOU COM ZERO = CENTAVOS
  //////////////////////////////////////////////////////////

  if (numeros.length > 1 && numeros.startsWith("0")) {
    const centavos = Number(numeros) / 100;

    return centavos.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  //////////////////////////////////////////////////////////
  // REAIS
  //////////////////////////////////////////////////////////

  return Number(numeros).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

////////////////////////////////////////////////////////////
// CONVERSÃO PARA NUMBER
////////////////////////////////////////////////////////////

function converterValorDespesa(valor: string): number {
  if (!valor) {
    return 0;
  }

  //////////////////////////////////////////////////////////
  // COMEÇOU COM ZERO = CENTAVOS
  //////////////////////////////////////////////////////////

  if (valor.length > 1 && valor.startsWith("0")) {
    return Number(valor) / 100;
  }

  //////////////////////////////////////////////////////////
  // REAIS
  //////////////////////////////////////////////////////////

  return Number(valor);
}

export function DespesaOperacionalModal({ open, onClose }: Props) {
  const { createDespesa, creating } = useDespesasOperacionais();

  const hoje = new Date().toISOString().split("T")[0];

  const [data, setData] = useState(hoje);

  const [atividade, setAtividade] = useState("");

  const [valorRaw, setValorRaw] = useState("");

  const [observacoes, setObservacoes] = useState("");

  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // SALVAR
  ////////////////////////////////////////////////////////////

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (!atividade.trim()) {
      setError("Informe a atividade");

      return;
    }

    const valorNumerico = converterValorDespesa(valorRaw);

    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setError("Informe um valor válido");

      return;
    }

    try {
      await createDespesa({
        data,

        atividade: atividade.trim(),

        valor: valorNumerico,

        observacoes: observacoes.trim() || undefined,
      });

      setAtividade("");

      setValorRaw("");

      setObservacoes("");

      onClose();
    } catch {
      setError("Erro ao registrar despesa");
    }
  }

  return (
    <div
      className="
        fixed inset-0 z-[999]

        flex items-center justify-center

        bg-[rgba(15,23,42,0.52)]
          backdrop-blur-[6px]


        px-4
      "
    >
      <div
        className="
          w-full
          max-w-[580px]

          rounded-[22px]

          relative

          border
          border-amber-200/30

          bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,251,235,0.94))]

          shadow-[0_30px_90px_rgba(251,191,36,0.10)]
          backdrop-blur-xl

          overflow-hidden
        "
      >
        {/* ========================================= */}
        {/* FX BACKGROUND */}
        {/* ========================================= */}

        <div
          className="
    absolute

    top-[-60px]
    right-[-60px]

    w-[220px]
    h-[220px]

    rounded-full

    bg-amber-400/10

    blur-[70px]
  "
        />

        <div
          className="
    absolute inset-0

    opacity-[0.03]

    bg-[linear-gradient(rgba(0,0,0,0.4)_1px,transparent_1px),
        linear-gradient(90deg,rgba(0,0,0,0.4)_1px,transparent_1px)]

    bg-[size:24px_24px]
  "
        />
        {/* HEADER */}

        <div
          className="
    relative

    px-6
    py-5

    border-b
    border-amber-100/60
  "
        >
          <div className="flex items-start gap-4">
            {/* ICON */}

            <div className="relative">
              <div
                className="
          absolute inset-0

          rounded-[22px]

          bg-amber-400/25

          blur-xl
        "
              />

              <div
                className="
          relative

          flex
          items-center
          justify-center

          w-14
          h-14

          rounded-[22px]

          border
          border-amber-200/50

          bg-[linear-gradient(180deg,rgba(251,191,36,0.20),rgba(251,146,60,0.16))]
        "
              >
                <ReceiptText size={24} className="text-amber-700" />
              </div>
            </div>

            {/* TEXT */}

            <div className="flex-1">
              <div
                className="
          inline-flex

          items-center

          gap-2

          rounded-full

          border
          border-amber-300/40

          bg-amber-400/10

          px-3
          py-1

          text-[10px]
          font-semibold

          uppercase
          tracking-[0.16em]

          text-amber-700
        "
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Operacional
              </div>

              <h2
                className="
          mt-3

          text-[28px]
          font-semibold

          tracking-[-0.04em]

          text-[color:var(--foreground)]
        "
              >
                Nova Despesa
              </h2>

              <p
                className="
          mt-1

          text-[13px]

          leading-relaxed

          text-[color:var(--muted)]
        "
              >
                Registre movimentações financeiras operacionais da empresa.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="

            relative z-10

            p-5

            space-y-4
          "
        >
          <div
            className="
    grid

    grid-cols-1
    md:grid-cols-12

    gap-4
  "
          >
            {/* DATA */}

            <div className="md:col-span-3">
              <label
                className="
        block

        text-sm
        font-medium

        mb-2
      "
              >
                Data
              </label>

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="
        w-full

rounded-[16px]

border
border-[color:var(--border-soft)]

bg-white/70

px-4
py-3

text-[14px]

shadow-[0_4px_14px_rgba(15,23,42,0.03)]

outline-none

transition-all
duration-200

focus:border-amber-400
focus:ring-4
focus:ring-amber-500/10
      "
              />
            </div>

            {/* VALOR */}

            <div className="md:col-span-3">
              <label
                className="
        block

        text-sm
        font-medium

        mb-2
      "
              >
                Valor
              </label>

              <input
                value={formatarValorDespesa(valorRaw)}
                inputMode="numeric"
                onChange={() => {}}
                onKeyDown={(e) => {
                  if (/^\d$/.test(e.key)) {
                    e.preventDefault();

                    setValorRaw((atual) => `${atual}${e.key}`);

                    return;
                  }

                  if (e.key === "Backspace") {
                    e.preventDefault();

                    setValorRaw((atual) => atual.slice(0, -1));

                    return;
                  }

                  if (e.key === "Delete") {
                    e.preventDefault();

                    setValorRaw("");

                    return;
                  }

                  if (
                    e.key === "Tab" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight"
                  ) {
                    return;
                  }

                  e.preventDefault();
                }}
                placeholder="0,00"
                className="
    w-full
rounded-[16px]

border
border-[color:var(--border-soft)]

bg-white/70

px-4
py-3

text-[14px]

shadow-[0_4px_14px_rgba(15,23,42,0.03)]

outline-none

transition-all
duration-200

focus:border-amber-400
focus:ring-4
focus:ring-amber-500/10
  "
              />
            </div>

            {/* ATIVIDADE */}

            <div className="md:col-span-6">
              <label
                className="
        block

        text-sm
        font-medium

        mb-2
      "
              >
                Atividade
              </label>

              <input
                value={atividade}
                onChange={(e) => setAtividade(e.target.value)}
                placeholder="Ex: combustível, manutenção, alimentação..."
                className="
        w-full

rounded-[16px]

border
border-[color:var(--border-soft)]

bg-white/70

px-4
py-3

text-[14px]

shadow-[0_4px_14px_rgba(15,23,42,0.03)]

outline-none

transition-all
duration-200

focus:border-amber-400
focus:ring-4
focus:ring-amber-500/10
      "
              />
            </div>
          </div>

          <div>
            <label
              className="
                block

                text-sm
                font-medium

                mb-2
              "
            >
              Observações
            </label>

            <textarea
              rows={1}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="
  w-full

  rounded-[16px]

  border
  border-[color:var(--border-soft)]

  bg-white/70

  px-4
  py-3

  text-[14px]

  resize-none

  shadow-[0_4px_14px_rgba(15,23,42,0.03)]

  outline-none

  transition-all
  duration-200

  focus:border-amber-400
  focus:ring-4
  focus:ring-amber-500/10
"
            />
          </div>

          {error && (
            <div
              className="
                rounded-xl

                border
                border-red-200

                bg-red-50

                px-4
                py-3

                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* FOOTER */}

          <div
            className="
    flex
    justify-end

    gap-3

    pt-5
  "
          >
            <button
              type="button"
              onClick={onClose}
              className="
      px-5
      py-3

      rounded-[16px]

      border
      border-[color:var(--border-soft)]

      bg-white/70

      text-[13px]
      font-medium

      transition-all
      duration-200

      hover:bg-white
    "
            >
              Cancelar
            </button>

            <motion.button
              whileTap={{
                scale: 0.985,
              }}
              type="submit"
              disabled={creating}
              className="
      group
      relative

      overflow-hidden

      px-6
      py-3

      rounded-[16px]

      border
      border-amber-300/40

      bg-[linear-gradient(135deg,#f59e0b,#f97316)]

      text-[13px]
      font-semibold

      text-white

      shadow-[0_14px_35px_rgba(249,115,22,0.24)]

      transition-all
      duration-300

      hover:shadow-[0_18px_45px_rgba(249,115,22,0.34)]
    "
            >
              <div
                className="
        absolute inset-0

        opacity-0

        bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.20),transparent)]

        translate-x-[-120%]

        transition-all
        duration-500

        group-hover:translate-x-[120%]
        group-hover:opacity-100
      "
              />

              <div
                className="
        relative z-10

        flex
        items-center

        gap-2
      "
              >
                {creating ? "Salvando..." : "Salvar Despesa"}

                {!creating && <ArrowRight size={15} />}
              </div>
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
