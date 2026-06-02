"use client";

import { useMemo, useState } from "react";

import { api } from "@/core/http/api";

import { motion } from "framer-motion";

import { ClienteSelect } from "@/modules/clientes/components/ClienteSelect";

import { useClienteStore } from "@/modules/clientes/store/useClienteStore";

import { useVendas } from "../hooks/useVendas";

type ModeloCaminhaoVenda = "TRUCK" | "BITRUCK" | "CARRETA";

export function NovaVendaCard() {
  ////////////////////////////////////////////////////////////
  // CLIENTE
  ////////////////////////////////////////////////////////////

  const cliente = useClienteStore((state) => state.clienteSelecionado);

  ////////////////////////////////////////////////////////////
  // MUTATION
  ////////////////////////////////////////////////////////////

  const { createVenda, creating } = useVendas();

  ////////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  ////////////////////////////////////////////////////////////

  const [numeroPedido, setNumeroPedido] = useState("");

  const [dataVenda, setDataVenda] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  ////////////////////////////////////////////////////////////
  // ENTREGA
  ////////////////////////////////////////////////////////////

  const [localEntrega, setLocalEntrega] = useState("");

  const [cidade, setCidade] = useState("");

  ////////////////////////////////////////////////////////////
  // PRODUTO
  ////////////////////////////////////////////////////////////

  const [produto, setProduto] = useState("MELANCIA");

  const [qualidade, setQualidade] = useState("MANCHESTER");

  ////////////////////////////////////////////////////////////
  // MOTORISTA / CAMINHÃO
  ////////////////////////////////////////////////////////////

  const [motoristaNome, setMotoristaNome] = useState("");

  const [motoristaTelefone, setMotoristaTelefone] = useState("");

  const [telefone, setTelefone] = useState("");

  const [placa, setPlaca] = useState("");

  const [modeloCaminhao, setModeloCaminhao] = useState<
    ModeloCaminhaoVenda | ""
  >("");

  ////////////////////////////////////////////////////////////
  // PESAGEM
  ////////////////////////////////////////////////////////////

  const [pesoBruto, setPesoBruto] = useState("");

  const [pesoDesconto, setPesoDesconto] = useState("");

  const [quantidadeFrutas, setQuantidadeFrutas] = useState("");

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  const [precoMelanciaInput, setPrecoMelanciaInput] = useState("");

  const [freteTotalInput, setFreteTotalInput] = useState("");

  ////////////////////////////////////////////////////////////
  // STATUS
  ////////////////////////////////////////////////////////////

  const [statusPagamento, setStatusPagamento] = useState<
    "PAGO" | "PENDENTE" | "PARCIAL"
  >("PENDENTE");

  ////////////////////////////////////////////////////////////
  // OBS
  ////////////////////////////////////////////////////////////

  const [observacoes, setObservacoes] = useState("");

  ////////////////////////////////////////////////////////////
  // CONTROLE
  ////////////////////////////////////////////////////////////

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);

  ////////////////////////////////////////////////////////////
  // HELPERS
  ////////////////////////////////////////////////////////////

  function formatNumberBR(value: string): string {
    if (!value) {
      return "";
    }

    const numeric = Number(value.replace(/\D/g, ""));

    if (Number.isNaN(numeric)) {
      return "";
    }

    return numeric.toLocaleString("pt-BR");
  }

  function formatDecimalBR(value: number): string {
    if (!value || Number.isNaN(value)) {
      return "0,0";
    }

    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  function formatCurrencyInput(value: string): string {
    if (!value) {
      return "";
    }

    const numeric = Number(value.replace(/\D/g, ""));

    if (Number.isNaN(numeric)) {
      return "";
    }

    return (numeric / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
  }

  function parseNumber(value: string): number {
    if (!value) {
      return 0;
    }

    return Number(value.replace(/\D/g, ""));
  }

  function parseCurrency(value: string): number {
    if (!value) {
      return 0;
    }

    return Number(value.replace(/\D/g, "")) / 100;
  }

  function formatCurrency(value: number): string {
    return `R$ ${value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    })}`;
  }
  function formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, "");

    if (numbers.length <= 10) {
      return numbers.replace(
        /(\d{0,2})(\d{0,4})(\d{0,4})/,
        (_, ddd, parte1, parte2) => {
          let result = "";

          if (ddd) result += `(${ddd}`;
          if (ddd.length === 2) result += ") ";

          result += parte1;

          if (parte2) {
            result += `-${parte2}`;
          }

          return result;
        },
      );
    }

    return numbers.replace(
      /(\d{0,2})(\d{0,5})(\d{0,4})/,
      (_, ddd, parte1, parte2) => {
        let result = "";

        if (ddd) result += `(${ddd}`;
        if (ddd.length === 2) result += ") ";

        result += parte1;

        if (parte2) {
          result += `-${parte2}`;
        }

        return result;
      },
    );
  }

  ////////////////////////////////////////////////////////////
  // PARSED
  ////////////////////////////////////////////////////////////

  const pesoBrutoNumber = parseNumber(pesoBruto);

  const pesoDescontoNumber = parseNumber(pesoDesconto);

  const quantidadeFrutasNumber = parseNumber(quantidadeFrutas);

  const precoMelancia = parseCurrency(precoMelanciaInput);

  const freteTotal = parseCurrency(freteTotalInput);

  ////////////////////////////////////////////////////////////
  // PESO LÍQUIDO
  ////////////////////////////////////////////////////////////

  const pesoLiquido = useMemo(() => {
    const calculado = pesoBrutoNumber - pesoDescontoNumber;

    if (calculado <= 0) {
      return 0;
    }

    return calculado;
  }, [pesoBrutoNumber, pesoDescontoNumber]);

  ////////////////////////////////////////////////////////////
  // MÉDIA
  ////////////////////////////////////////////////////////////

  const mediaFruta = useMemo(() => {
    if (!pesoBrutoNumber || !quantidadeFrutasNumber) {
      return 0;
    }

    return Number((pesoBrutoNumber / quantidadeFrutasNumber).toFixed(1));
  }, [pesoBrutoNumber, quantidadeFrutasNumber]);

  ////////////////////////////////////////////////////////////
  // VALOR MELANCIA
  ////////////////////////////////////////////////////////////

  const valorMelancia = useMemo(() => {
    if (!pesoLiquido || !precoMelancia) {
      return 0;
    }

    return pesoLiquido * precoMelancia;
  }, [pesoLiquido, precoMelancia]);

  ////////////////////////////////////////////////////////////
  // TOTAL FINAL
  ////////////////////////////////////////////////////////////

  const valorTotal = useMemo(() => {
    const calculado = valorMelancia - freteTotal;

    if (calculado <= 0) {
      return 0;
    }

    return calculado;
  }, [valorMelancia, freteTotal]);

  ////////////////////////////////////////////////////////////
  // ESTOQUE
  ////////////////////////////////////////////////////////////

  const quantidadeKg = pesoBrutoNumber;

  ////////////////////////////////////////////////////////////
  // STATUS VISUAL
  ////////////////////////////////////////////////////////////

  const hasValue = valorTotal > 0;

  ////////////////////////////////////////////////////////////
  // AUTO PREENCHIMENTO OPERACIONAL
  ////////////////////////////////////////////////////////////

  const cidadePreenchida = cidade || cliente?.cidade || "";

  const telefonePreenchido = telefone || cliente?.telefone || "";

  const localEntregaPreenchido =
    localEntrega ||
    [cliente?.endereco, cliente?.bairro].filter(Boolean).join(" • ");

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function handleSubmit() {
    //////////////////////////////////////////////////////////
    // RESET
    //////////////////////////////////////////////////////////

    setError(null);

    setSuccess(false);

    //////////////////////////////////////////////////////////
    // CLIENTE
    //////////////////////////////////////////////////////////

    if (!cliente) {
      setError("Selecione um cliente");

      return;
    }

    //////////////////////////////////////////////////////////
    // PESO
    //////////////////////////////////////////////////////////

    if (!pesoBrutoNumber || pesoBrutoNumber <= 0) {
      setError("Informe o peso bruto");

      return;
    }

    //////////////////////////////////////////////////////////
    // FRUTAS
    //////////////////////////////////////////////////////////

    if (!quantidadeFrutasNumber || quantidadeFrutasNumber <= 0) {
      setError("Informe a quantidade de frutas");

      return;
    }

    //////////////////////////////////////////////////////////
    // PREÇO
    //////////////////////////////////////////////////////////

    if (!precoMelancia || precoMelancia <= 0) {
      setError("Informe o preço da melancia");

      return;
    }

    //////////////////////////////////////////////////////////
    // TOTAL
    //////////////////////////////////////////////////////////

    if (!valorTotal || valorTotal <= 0) {
      setError("Valor total inválido");

      return;
    }

    try {
      ////////////////////////////////////////////////////////
      // CREATE
      ////////////////////////////////////////////////////////

      const vendaCriada = await createVenda({
        //////////////////////////////////////////////////////
        // CLIENTE
        //////////////////////////////////////////////////////

        clienteId: cliente.id,

        //////////////////////////////////////////////////////
        // IDENTIFICAÇÃO
        //////////////////////////////////////////////////////

        numeroPedido,

        dataVenda,

        //////////////////////////////////////////////////////
        // ENTREGA
        //////////////////////////////////////////////////////

        localEntrega,

        cidade,

        //////////////////////////////////////////////////////
        // PRODUTO
        //////////////////////////////////////////////////////

        produto,

        qualidade,

        //////////////////////////////////////////////////////
        // TRANSPORTE
        //////////////////////////////////////////////////////

        placa,

        modeloCaminhao: modeloCaminhao || undefined,

        motoristaNome,

        motoristaTelefone,

        telefone,

        //////////////////////////////////////////////////////
        // PESAGEM
        //////////////////////////////////////////////////////

        pesoBruto: pesoBrutoNumber,

        pesoDesconto: pesoDescontoNumber,

        pesoLiquido,

        quantidadeFrutas: quantidadeFrutasNumber,

        mediaFruta,

        //////////////////////////////////////////////////////
        // ESTOQUE
        //////////////////////////////////////////////////////

        quantidadeKg,

        //////////////////////////////////////////////////////
        // FINANCEIRO
        //////////////////////////////////////////////////////

        precoMelancia,

        valorMelancia,

        freteTotal,

        valorTotal,

        //////////////////////////////////////////////////////
        // STATUS
        //////////////////////////////////////////////////////

        statusPagamento,

        //////////////////////////////////////////////////////
        // OBS
        //////////////////////////////////////////////////////

        observacoes,
      });

      ////////////////////////////////////////////////////////
      // RESET
      ////////////////////////////////////////////////////////

      setNumeroPedido("");

      setLocalEntrega("");

      setCidade("");

      setProduto("MELANCIA");

      setQualidade("MANCHESTER");

      setMotoristaNome("");

      setMotoristaTelefone("");

      setTelefone("");

      setPlaca("");

      setModeloCaminhao("");

      setPesoBruto("");

      setPesoDesconto("");

      setQuantidadeFrutas("");

      setPrecoMelanciaInput("");

      setFreteTotalInput("");

      setObservacoes("");

      setStatusPagamento("PENDENTE");

      ////////////////////////////////////////////////////////
      // SUCCESS
      ////////////////////////////////////////////////////////

      setSuccess(true);
      ////////////////////////////////////////////////////////
      // PDF
      ////////////////////////////////////////////////////////

      window.open(
        `${api.defaults.baseURL}/romaneios/venda/${vendaCriada.id}/pdf`,
        "_blank",
      );
    } catch (err: unknown) {
      console.error("ERRO COMPLETO VENDA:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const errorResponse = err as {
          response?: {
            data?: {
              message?: string | string[];
            };
          };
        };

        const backendMessage = errorResponse.response?.data?.message;

        if (Array.isArray(backendMessage)) {
          setError(backendMessage.join(", "));

          return;
        }

        if (backendMessage) {
          setError(backendMessage);

          return;
        }
      }

      setError("Erro ao registrar venda");
    }
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.992,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      transition={{
        duration: 0.32,
      }}
      className="
        group
        relative
        overflow-hidden

        rounded-[20px]

        border
        border-white/10

        bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(248,250,252,0.60))]

        backdrop-blur-xl

        shadow-[0_24px_80px_rgba(15,23,42,0.08)]

        hover:border-white/20

        hover:shadow-[0_34px_100px_rgba(15,23,42,0.12)]

        transition-all
        duration-300

        p-3
        xl:p-4

        space-y-4
      "
    >
      {/* ================================================= */}
      {/* CAMADA VISUAL */}
      {/* ================================================= */}

      <div className="absolute inset-0 pointer-events-none">
        {/* ================================================= */}
        {/* GLOW OPERACIONAL */}
        {/* ================================================= */}

        <div
          className={`
            absolute inset-0

            opacity-40

            transition-all
            duration-500

            ${
              hasValue
                ? `
                  bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.14),transparent_55%)]
                `
                : `
                  bg-[radial-gradient(circle_at_85%_12%,rgba(99,102,241,0.08),transparent_55%)]
                `
            }
          `}
        />

        {/* ================================================= */}
        {/* LIGHT LAYER */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0

            bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]

            opacity-60
          "
        />

        {/* ================================================= */}
        {/* TOP LINE */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-x-0
            top-0
            h-[1px]

            bg-gradient-to-r
            from-transparent
            via-white/30
            to-transparent
          "
        />

        {/* ================================================= */}
        {/* DEPTH SHADOW */}
        {/* ================================================= */}

        <div
          className="
            absolute
            inset-0

            bg-[linear-gradient(to_bottom,transparent,rgba(15,23,42,0.03))]
          "
        />
      </div>

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-10

          flex
          flex-col
          xl:flex-row

          xl:items-center
          justify-between

          gap-3
        "
      >
        {/* ============================================= */}
        {/* ESQUERDA */}
        {/* ============================================= */}

        <div className="min-w-0 space-y-2">
          {/* TOP BAR */}
          <div className="flex items-center gap-2.5">
            {/* INDICADOR */}
            <div className="relative">
              <div
                className="
                  w-[4px]
                  h-4

                  rounded-full

                  bg-emerald-500
                "
              />

              <div
                className="
                  absolute
                  inset-0

                  rounded-full

                  bg-emerald-500/60

                  blur-[6px]
                "
              />
            </div>

            {/* LABELS */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="
                  text-[9px]
                  uppercase

                  tracking-[0.26em]

                  text-[color:var(--muted-soft)]
                "
              >
                vendas
              </span>

              <div
                className="
                  w-[3px]
                  h-[3px]

                  rounded-full

                  bg-white/30
                "
              />

              <span
                className="
                  text-[9px]
                  uppercase

                  tracking-[0.18em]

                  text-emerald-600

                  font-medium
                "
              >
                operação ativa
              </span>
            </div>
          </div>

          {/* TITLE */}
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2
                className="
                  text-[20px]
                  xl:text-[22px]

                  leading-none

                  font-semibold

                  tracking-[-0.04em]

                  text-[color:var(--foreground)]
                "
              >
                Nova venda
              </h2>

              {/* BADGE */}
              <div
                className="
                  flex
                  items-center
                  gap-1.5

                  px-2.5
                  py-1

                  rounded-full

                  border
                  border-emerald-300/20

                  bg-emerald-500/10

                  backdrop-blur-xl
                "
              >
                <div
                  className="
                    relative

                    w-[6px]
                    h-[6px]
                  "
                >
                  <div
                    className="
                      w-full
                      h-full

                      rounded-full

                      bg-emerald-500
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0

                      rounded-full

                      bg-emerald-500

                      animate-ping

                      opacity-40
                    "
                  />
                </div>

                <span
                  className="
                    text-[10px]
                    font-medium

                    text-emerald-600
                  "
                >
                  sincronizado
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* STATUS */}
        {/* ============================================= */}

        <div
          className="
            flex
            items-center

            shrink-0
          "
        >
          <div
            className={`
              group
              relative
              overflow-hidden

              flex
              items-center
              gap-2.5

              h-[34px]

              px-3

              rounded-[12px]

              border

              backdrop-blur-xl

              transition-all
              duration-300

              ${
                hasValue
                  ? `
                    border-emerald-300/20

                    bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))]

                    shadow-[0_10px_30px_rgba(16,185,129,0.12)]
                  `
                  : `
                    border-white/10

                    bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,250,252,0.55))]

                    shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                  `
              }
            `}
          >
            {/* ================================================= */}
            {/* FX */}
            {/* ================================================= */}

            <div
              className="
                absolute
                inset-0

                opacity-0
                group-hover:opacity-100

                transition-all
                duration-500
              "
            >
              <div
                className={`
                  absolute
                  inset-0

                  ${
                    hasValue
                      ? `
                        bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.14),transparent_60%)]
                      `
                      : `
                        bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.08),transparent_60%)]
                      `
                  }
                `}
              />
            </div>

            {/* ================================================= */}
            {/* DOT */}
            {/* ================================================= */}

            <div className="relative z-10">
              <div
                className={`
                  w-[7px]
                  h-[7px]

                  rounded-full

                  ${
                    hasValue ? "bg-emerald-500" : "bg-[color:var(--muted-soft)]"
                  }
                `}
              />

              {hasValue && (
                <div
                  className="
                    absolute
                    inset-0

                    rounded-full

                    bg-emerald-500

                    animate-ping

                    opacity-40
                  "
                />
              )}
            </div>

            {/* ================================================= */}
            {/* TEXT */}
            {/* ================================================= */}

            <div
              className="
                relative
                z-10

                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[10px]
                  font-medium

                  tracking-tight

                  text-[color:var(--foreground)]
                "
              >
                {hasValue ? "Operação em cálculo" : "Pronto para venda"}
              </span>

              <div
                className="
                  w-[3px]
                  h-[3px]

                  rounded-full

                  bg-white/20
                "
              />

              <span
                className={`
                  text-[9px]

                  uppercase

                  tracking-[0.14em]

                  ${
                    hasValue
                      ? "text-emerald-600"
                      : "text-[color:var(--muted-soft)]"
                  }
                `}
              >
                live
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* ================================================= */}
      {/* CLIENTE */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-20

          space-y-1
        "
      >
        {/* ============================================= */}
        {/* HEADER */}
        {/* ============================================= */}

        <div
          className="
            flex
            items-center
            justify-between

            gap-2
          "
        >
          {/* ========================================= */}
          {/* TITLE */}
          {/* ========================================= */}

          <div className="flex items-center gap-2.5">
            {/* INDICADOR */}
            <div className="relative">
              <div
                className="
                  w-[6px]
                  h-[6px]

                  rounded-full

                  bg-[color:var(--brand)]
                "
              />

              <div
                className="
                  absolute
                  inset-0

                  rounded-full

                  bg-[color:var(--brand)]

                  blur-[4px]
                  opacity-50
                "
              />
            </div>

            {/* LABEL */}
            <span
              className="
                text-[9px]

                uppercase

                tracking-[0.22em]

                text-[color:var(--muted-soft)]
              "
            >
              cliente da venda
            </span>
          </div>

          {/* ========================================= */}
          {/* STATUS */}
          {/* ========================================= */}

          {cliente && (
            <div
              className="
                relative
                overflow-hidden

                flex
                items-center
                gap-1.5

                h-[24px]

                px-2.5

                rounded-full

                border
                border-emerald-300/20

                bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))]

                backdrop-blur-xl

                shadow-[0_8px_20px_rgba(16,185,129,0.10)]
              "
            >
              {/* GLOW */}
              <div
                className="
                  absolute
                  inset-0

                  bg-[radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.12),transparent_60%)]
                "
              />

              {/* DOT */}
              <div className="relative z-10">
                <div
                  className="
                    w-[6px]
                    h-[6px]

                    rounded-full

                    bg-emerald-500
                  "
                />

                <div
                  className="
                    absolute
                    inset-0

                    rounded-full

                    bg-emerald-500

                    animate-ping

                    opacity-40
                  "
                />
              </div>

              {/* TEXT */}
              <span
                className="
                  relative
                  z-10

                  text-[9px]
                  font-medium

                  tracking-[0.10em]

                  uppercase

                  text-emerald-600
                "
              >
                conectado
              </span>
            </div>
          )}
        </div>

        {/* ============================================= */}
        {/* CONTAINER */}
        {/* ============================================= */}

        <div
          className={`
    group
    relative

    overflow-visible

    rounded-[14px]

    border

    bg-white

    px-2.5
    py-1

    transition-all
    duration-200

    ${
      error && !cliente
        ? `
          border-red-300/50

          shadow-[0_10px_24px_rgba(239,68,68,0.10)]
        `
        : `
          border-slate-200/70

          shadow-[0_6px_20px_rgba(15,23,42,0.04)]
        `
    }

    hover:border-slate-300

    hover:shadow-[0_12px_28px_rgba(15,23,42,0.06)]

    focus-within:border-[color:var(--brand)]/40

    focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.14)]
  `}
        >
          {/* ================================================= */}
          {/* FX */}
          {/* ================================================= */}

          <div
            className="
              absolute
              inset-0

              pointer-events-none
            "
          >
            {/* GLOW */}
            <div
              className="
                absolute
                inset-0

                opacity-40

                transition-all
                duration-500
              "
            >
              <div
                className={`
                  absolute
                  inset-0

                  ${
                    cliente
                      ? `
                        bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                      `
                      : `
                        bg-[radial-gradient(circle_at_85%_12%,rgba(99,102,241,0.10),transparent_58%)]
                      `
                  }
                `}
              />
            </div>
          </div>
          {/* ============================================= */}
          {/* SELECT */}
          {/* ============================================= */}

          <div className="relative z-10">
            <ClienteSelect />
          </div>
        </div>

        {/* ================= ERRO ================= */}
        {error && !cliente && (
          <div
            className="
              flex items-center gap-2

              px-2.5 py-2

              rounded-[12px]

              border border-red-200

              bg-red-50

              text-[11px]
              text-red-600

              shadow-[0_6px_18px_rgba(239,68,68,0.08)]
            "
          >
            <span className="w-[5px] h-[5px] rounded-full bg-red-500" />

            <span>Selecione um cliente para continuar</span>
          </div>
        )}
      </div>
      {/* ================================================= */}
      {/* GRID OPERACIONAL */}
      {/* ================================================= */}

      <div
        className="
          relative
          z-10

          grid

          grid-cols-2
          md:grid-cols-4
          xl:grid-cols-12

          gap-2.5
          xl:gap-3

          items-start
        "
      >
        {/* ================================================= */}
        {/* DADOS DA VENDA */}
        {/* ================================================= */}

        <div
          className="
            col-span-12
            xl:col-span-8

            relative
            overflow-hidden

            min-h-[340px]

            rounded-[16px]

            border
            border-white/10

            bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,250,252,0.56))]

            backdrop-blur-xl

            p-2.5
            xl:p-3

            shadow-[0_6px_20px_rgba(15,23,42,0.05)]

            transition-all
            duration-300

            hover:border-white/20

            hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]
          "
        >
          {/* ================================================= */}
          {/* FX */}
          {/* ================================================= */}

          <div className="absolute inset-0 pointer-events-none">
            {/* GLOW */}
            <div
              className="
                absolute
                inset-0

                opacity-40
                
                transition-all
                duration-700

                bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_58%)]
              "
            />

            {/* LIGHT */}
            <div
              className="
                absolute
                inset-0

                bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%)]
              "
            />

            {/* TOP LINE */}
            <div
              className="
                absolute
                inset-x-0
                top-0
                h-[1px]

                bg-gradient-to-r
                from-transparent
                via-white/30
                to-transparent
              "
            />
          </div>

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div
            className="
              relative
              z-10

              flex
              flex-col
              sm:flex-row

              sm:items-center
              justify-between

              gap-2

              mb-2.5
            "
          >
            {/* ============================================= */}
            {/* LEFT */}
            {/* ============================================= */}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className="
                      w-[4px]
                      h-[4px]

                      rounded-full

                      bg-emerald-500
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0

                      rounded-full

                      bg-emerald-500/60

                      blur-[4px]
                    "
                  />
                </div>

                <p
                  className="
                    text-[10px]

                    uppercase

                    tracking-[0.18em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  dados operacionais
                </p>
              </div>

              <h3
                className="
                  mt-3

                  text-[18px]
                  xl:text-[20px]

                  font-semibold

                  tracking-[-0.04em]

                  text-[color:var(--foreground)]
                "
              >
                Fechamento da venda
              </h3>
            </div>

            {/* ============================================= */}
            {/* STATUS */}
            {/* ============================================= */}

            <div
              className="
                relative
                overflow-hidden

                flex
                items-center
                gap-2

                h-[34px]

                px-3

                rounded-full

                border
                border-emerald-300/16

                bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))]

                backdrop-blur-xl

                shadow-[0_10px_30px_rgba(16,185,129,0.08)]
              "
            >
              {/* FX */}
              <div
                className="
                  absolute
                  inset-0

                  bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                "
              />

              {/* DOT */}
              <div className="relative z-10">
                <div
                  className="
                    w-[6px]
                    h-[6px]

                    rounded-full

                    bg-emerald-500
                  "
                />

                <div
                  className="
                    absolute
                    inset-0

                    rounded-full

                    bg-emerald-500

                    animate-ping

                    opacity-40
                  "
                />
              </div>

              {/* TEXT */}
              <span
                className="
                  relative
                  z-10

                  text-[10px]
                  font-medium

                  tracking-[0.12em]

                  uppercase

                  text-emerald-600
                "
              >
                venda ativa
              </span>
            </div>
          </div>

          <div
            className="
              grid

              grid-cols-2
              md:grid-cols-4
              xl:grid-cols-12

              gap-1.5
              xl:gap-2
            "
          >
            {/* DATA */}
            <div className="col-span-1 xl:col-span-2 space-y-0.5">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Data
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[34px]

                  rounded-[16px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_2px_rgba(99,102,241,0.08)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-3

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* N PEDIDO */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Nº pedido
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={numeroPedido}
                  onChange={(e) => setNumeroPedido(e.target.value)}
                  placeholder="Automático"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* MOTORISTA */}
            <div className="col-span-1 xl:col-span-3 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Motorista
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={motoristaNome}
                  onChange={(e) => setMotoristaNome(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* TELEFONE MOTORISTA */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.20em] text-[color:var(--muted-soft)]">
                  Tel. motorista
                </span>
              </div>

              <div className="group relative overflow-hidden h-[36px] rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))] backdrop-blur-xl transition-all duration-300 hover:border-white/20 focus-within:border-[color:var(--brand)]/40 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]">
                <input
                  type="text"
                  value={motoristaTelefone}
                  onChange={(e) =>
                    setMotoristaTelefone(formatPhone(e.target.value))
                  }
                  className="relative z-10 w-full h-full bg-transparent px-4 text-[12px] font-medium tracking-tight text-[color:var(--foreground)] placeholder:text-[color:var(--muted-soft)] outline-none"
                />
              </div>
            </div>

            {/* PLACA */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Placa
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={placa}
                  onChange={(e) =>
                    setPlaca(
                      e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 7),
                    )
                  }
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-semibold

                    uppercase
                    tracking-[0.08em]

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* MODELO CAMINHÃO */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.20em] text-[color:var(--muted-soft)]">
                  Modelo
                </span>
              </div>

              <div className="group relative overflow-hidden h-[36px] rounded-[14px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))] backdrop-blur-xl transition-all duration-300 hover:border-white/20 focus-within:border-[color:var(--brand)]/40 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]">
                <select
                  value={modeloCaminhao}
                  onChange={(e) =>
                    setModeloCaminhao(
                      e.target.value as ModeloCaminhaoVenda | "",
                    )
                  }
                  className="relative z-10 w-full h-full bg-transparent px-4 text-[12px] font-semibold tracking-tight text-[color:var(--foreground)] outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="TRUCK">TRUCK</option>
                  <option value="BITRUCK">BITRUCK</option>
                  <option value="CARRETA">CARRETA</option>
                </select>
              </div>
            </div>

            {/* PRODUTO */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Produto
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                  placeholder="Melancia"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* CIDADE */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Cidade
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={cidadePreenchida}
                  onChange={(e) => setCidade(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* LOCAL DE ENTREGA */}
            <div className="col-span-1 xl:col-span-4 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Local de entrega
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={localEntregaPreenchido}
                  onChange={(e) => setLocalEntrega(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* QUALIDADE */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Qualidade
                </span>

                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.12em]

                    text-emerald-600
                  "
                ></span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={qualidade}
                  onChange={(e) => setQualidade(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* TELEFONE */}
            <div className="col-span-1 xl:col-span-2 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Telefone
                </span>
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[36px]

                  rounded-[14px]

                  border
                  border-white/10

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-white/20

                  focus-within:border-[color:var(--brand)]/40

                  focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-500

                      bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.08),transparent_60%)]
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
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                <input
                  type="text"
                  value={telefonePreenchido}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    px-4

                    text-[12px]
                    font-medium

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />
              </div>
            </div>

            {/* PESO BRUTO */}
            <div className="col-span-1 xl:col-span-3 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Peso bruto
                </span>

                {pesoBrutoNumber > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-emerald-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-emerald-600
                      "
                    >
                      estoque
                    </span>
                  </div>
                )}
              </div>

              {/* INPUT WRAPPER */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[40px]

                  rounded-[12px]

                  border
                  border-emerald-300/16

                  bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.72))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-emerald-300/28

                  focus-within:border-emerald-300/40

                  focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
                "
              >
                {/* ================================================= */}
                {/* FX */}
                {/* ================================================= */}

                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* LEFT ICON */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-6
                    h-6

                    rounded-full

                    bg-emerald-500/12

                    border
                    border-emerald-300/16
                  "
                >
                  <div
                    className="
                      w-[6px]
                      h-[6px]

                      rounded-full

                      bg-emerald-500
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* INPUT */}
                {/* ================================================= */}

                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberBR(pesoBruto)}
                  onChange={(e) =>
                    setPesoBruto(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    pl-12
                    pr-4

                    text-[15px]
                    font-semibold

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />

                {/* ================================================= */}
                {/* RIGHT UNIT */}
                {/* ================================================= */}

                {pesoBrutoNumber > 0 && (
                  <div
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      text-[10px]
                      font-medium

                      tracking-[0.12em]

                      uppercase

                      text-emerald-600
                    "
                  >
                    kg
                  </div>
                )}
              </div>
            </div>

            {/* PESO DESCONTO */}
            <div className="col-span-1 xl:col-span-3 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Peso desconto
                </span>

                {pesoDescontoNumber > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-amber-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-amber-600
                      "
                    >
                      ajuste
                    </span>
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[40px]

                  rounded-[12px]

                  border
                  border-amber-300/14

                  bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.72))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-amber-300/24

                  focus-within:border-amber-300/40

                  focus-within:shadow-[0_0_0_3px_rgba(251,191,36,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(251,191,36,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* LEFT ICON */}
                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-6
                    h-6

                    rounded-full

                    bg-amber-500/10

                    border
                    border-amber-300/16
                  "
                >
                  <div
                    className="
                      w-[6px]
                      h-[6px]

                      rounded-full

                      bg-amber-500
                    "
                  />
                </div>

                {/* INPUT */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberBR(pesoDesconto)}
                  onChange={(e) =>
                    setPesoDesconto(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    pl-12
                    pr-4

                    text-[15px]
                    font-semibold

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />

                {/* UNIT */}
                {pesoDescontoNumber > 0 && (
                  <div
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      text-[10px]
                      font-medium

                      tracking-[0.12em]

                      uppercase

                      text-amber-600
                    "
                  >
                    kg
                  </div>
                )}
              </div>
            </div>

            {/* FRUTAS */}
            <div className="col-span-1 xl:col-span-3 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Frutas
                </span>

                {quantidadeFrutasNumber > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-violet-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-violet-600
                      "
                    >
                      carga
                    </span>
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[40px]

                  rounded-[12px]

                  border
                  border-violet-300/14

                  bg-[linear-gradient(180deg,rgba(139,92,246,0.08),rgba(255,255,255,0.72))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-violet-300/24

                  focus-within:border-violet-300/40

                  focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(139,92,246,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* LEFT ICON */}
                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-6
                    h-6

                    rounded-full

                    bg-violet-500/10

                    border
                    border-violet-300/16
                  "
                >
                  <div
                    className="
                      w-[6px]
                      h-[6px]

                      rounded-full

                      bg-violet-500
                    "
                  />
                </div>

                {/* INPUT */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberBR(quantidadeFrutas)}
                  onChange={(e) =>
                    setQuantidadeFrutas(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    pl-12
                    pr-4

                    text-[15px]
                    font-semibold

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />

                {/* UNIT */}
                {quantidadeFrutasNumber > 0 && (
                  <div
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      text-[10px]
                      font-medium

                      tracking-[0.12em]

                      uppercase

                      text-violet-600
                    "
                  >
                    un
                  </div>
                )}
              </div>
            </div>
            {/* MÉDIA */}
            <div className="col-span-1 xl:col-span-3 space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Média
                </span>

                {mediaFruta > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-emerald-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-emerald-600
                      "
                    >
                      cálculo
                    </span>
                  </div>
                )}
              </div>

              {/* DISPLAY */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[40px]

                  rounded-[12px]

                  border
                  border-emerald-300/16

                  bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.72))]

                  backdrop-blur-xl

                  transition-all
                  duration-300

                  hover:border-emerald-300/28

                  hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)]
                "
              >
                {/* ================================================= */}
                {/* FX */}
                {/* ================================================= */}

                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* LEFT ICON */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-6
                    h-6

                    rounded-full

                    bg-emerald-500/12

                    border
                    border-emerald-300/16
                  "
                >
                  <div
                    className="
                      w-[6px]
                      h-[6px]

                      rounded-full

                      bg-emerald-500
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* VALUE */}
                {/* ================================================= */}

                <div
                  className="
                    relative
                    z-10

                    h-full

                    flex
                    items-center
                    gap-3

                    pl-12
                    pr-4
                  "
                >
                  <p
                    className="
                      text-[15px]
                      font-semibold

                      tracking-tight

                      text-[color:var(--foreground)]
                    "
                  >
                    {mediaFruta > 0 ? `${formatDecimalBR(mediaFruta)} kg` : "-"}
                  </p>

                  {mediaFruta > 0 && (
                    <span
                      className="
                        text-[9px]
                        font-medium

                        tracking-[0.10em]

                        uppercase

                        text-emerald-600
                      "
                    >
                      média
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* FINANCEIRO */}
        {/* ================================================= */}

        <div
          className="
            col-span-12
            xl:col-span-3

            relative
            overflow-hidden

            rounded-[16px]

            border
            border-white/10

            bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(248,250,252,0.56))]

            backdrop-blur-xl

            p-2.5
            xl:p-3

            shadow-[0_10px_30px_rgba(15,23,42,0.06)]

            transition-all
            duration-300

            hover:border-white/20

            hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)]
          "
        >
          {/* ================================================= */}
          {/* FX */}
          {/* ================================================= */}

          <div className="absolute inset-0 pointer-events-none">
            {/* GLOW */}
            <div
              className="
                absolute
                inset-0

                opacity-0
                group-hover:opacity-100

                transition-all
                duration-700

                bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.08),transparent_58%)]
              "
            />

            {/* LIGHT */}
            <div
              className="
                absolute
                inset-0

                bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%)]
              "
            />

            {/* TOP LINE */}
            <div
              className="
                absolute
                inset-x-0
                top-0
                h-[1px]

                bg-gradient-to-r
                from-transparent
                via-white/30
                to-transparent
              "
            />
          </div>

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div
            className="
              relative
              z-10

              flex
              flex-col
              sm:flex-row

              sm:items-center
              justify-between

              gap-2

              mb-2.5
            "
          >
            {/* ============================================= */}
            {/* LEFT */}
            {/* ============================================= */}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className="
                      w-[7px]
                      h-[7px]

                      rounded-full

                      bg-emerald-500
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0

                      rounded-full

                      bg-emerald-500/60

                      blur-[4px]
                    "
                  />
                </div>

                <p
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.22em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  fechamento
                </p>
              </div>

              <h3
                className="
                  mt-2

                  text-[18px]
                  xl:text-[20px]

                  font-semibold

                  tracking-[-0.04em]

                  text-[color:var(--foreground)]
                "
              >
                Valores da venda
              </h3>
            </div>

            {/* ============================================= */}
            {/* STATUS */}
            {/* ============================================= */}

            <div
              className="
                relative
                overflow-hidden

                flex
                items-center
                gap-2

                h-[34px]

                px-3

                rounded-full

                border
                border-emerald-300/16

                bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(16,185,129,0.06))]

                backdrop-blur-md

                shadow-[0_10px_30px_rgba(16,185,129,0.08)]
              "
            >
              {/* FX */}
              <div
                className="
                  absolute
                  inset-0

                  bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                "
              />

              {/* DOT */}
              <div className="relative z-10">
                <div
                  className="
                    w-[6px]
                    h-[6px]

                    rounded-full

                    bg-emerald-500
                  "
                />

                <div
                  className="
                    absolute
                    inset-0

                    rounded-full

                    bg-emerald-500

                    animate-ping

                    opacity-40
                  "
                />
              </div>

              {/* TEXT */}
              <span
                className="
                  relative
                  z-10

                  text-[10px]
                  font-medium

                  tracking-[0.12em]

                  uppercase

                  text-emerald-600
                "
              >
                financeiro
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* PREÇO DA MELANCIA */}
            <div className="space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Preço da melancia
                </span>

                {precoMelancia > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-emerald-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-emerald-600
                      "
                    >
                      financeiro
                    </span>
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[46px]

                  rounded-[18px]

                  border
                  border-emerald-300/16

                  bg-[linear-gradient(180deg,rgba(16,185,129,0.10),rgba(255,255,255,0.72))]

                  backdrop-blur-md

                  transition-all
                  duration-300

                  hover:border-emerald-300/28

                  focus-within:border-emerald-300/40

                  focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
                "
              >
                {/* ================================================= */}
                {/* FX */}
                {/* ================================================= */}

                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* LEFT ICON */}
                {/* ================================================= */}

                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-7
                    h-7

                    rounded-full

                    bg-emerald-500/12

                    border
                    border-emerald-300/16
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold

                      text-emerald-600
                    "
                  >
                    R$
                  </span>
                </div>

                {/* ================================================= */}
                {/* INPUT */}
                {/* ================================================= */}

                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(precoMelanciaInput)}
                  onChange={(e) =>
                    setPrecoMelanciaInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0,00"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    pl-14
                    pr-4

                    text-[16px]
                    font-semibold

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />

                {/* ================================================= */}
                {/* RIGHT LABEL */}
                {/* ================================================= */}

                {precoMelancia > 0 && (
                  <div
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      text-[10px]
                      font-medium

                      tracking-[0.12em]

                      uppercase

                      text-emerald-600
                    "
                  >
                    unitário
                  </div>
                )}
              </div>
            </div>

            {/* MELANCIA */}
            <div className="space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Melancia
                </span>

                {valorMelancia > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-emerald-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-emerald-600
                      "
                    >
                      parcial
                    </span>
                  </div>
                )}
              </div>

              {/* DISPLAY */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[46px]

                  rounded-[18px]

                  border
                  border-emerald-300/14

                  bg-[linear-gradient(180deg,rgba(16,185,129,0.08),rgba(255,255,255,0.72))]

                  backdrop-blur-md

                  transition-all
                  duration-300

                  hover:border-emerald-300/24

                  hover:shadow-[0_10px_30px_rgba(16,185,129,0.08)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* LEFT ICON */}
                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-7
                    h-7

                    rounded-full

                    bg-emerald-500/12

                    border
                    border-emerald-300/16
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold

                      text-emerald-600
                    "
                  >
                    R$
                  </span>
                </div>

                {/* VALUE */}
                <div
                  className="
                    relative
                    z-10

                    h-full

                    flex
                    items-center
                    justify-between

                    pl-14
                    pr-4
                  "
                >
                  <p
                    className="
                      text-[16px]
                      font-semibold

                      tracking-tight

                      text-[color:var(--foreground)]
                    "
                  >
                    {formatCurrency(valorMelancia)}
                  </p>

                  {valorMelancia > 0 && (
                    <span
                      className="
                        text-[10px]
                        font-medium

                        tracking-[0.12em]

                        uppercase

                        text-emerald-600
                      "
                    >
                      bruto
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* VALOR DO FRETE */}
            <div className="space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Valor do frete
                </span>

                {freteTotal > 0 && (
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <div
                      className="
                        w-[4px]
                        h-[4px]

                        rounded-full

                        bg-amber-500
                      "
                    />

                    <span
                      className="
                        text-[9px]

                        uppercase

                        tracking-[0.12em]

                        text-amber-600
                      "
                    >
                      logística
                    </span>
                  </div>
                )}
              </div>

              {/* INPUT */}
              <div
                className="
                  group
                  relative
                  overflow-hidden

                  h-[46px]

                  rounded-[18px]

                  border
                  border-amber-300/14

                  bg-[linear-gradient(180deg,rgba(251,191,36,0.08),rgba(255,255,255,0.72))]

                  backdrop-blur-md

                  transition-all
                  duration-300

                  hover:border-amber-300/24

                  focus-within:border-amber-300/40

                  focus-within:shadow-[0_0_0_3px_rgba(251,191,36,0.10)]
                "
              >
                {/* FX */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className="
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      bg-[radial-gradient(circle_at_85%_12%,rgba(251,191,36,0.12),transparent_58%)]
                    "
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* LEFT ICON */}
                <div
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    flex
                    items-center
                    justify-center

                    w-7
                    h-7

                    rounded-full

                    bg-amber-500/12

                    border
                    border-amber-300/16
                  "
                >
                  <span
                    className="
                      text-[11px]
                      font-semibold

                      text-amber-600
                    "
                  >
                    R$
                  </span>
                </div>

                {/* INPUT */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(freteTotalInput)}
                  onChange={(e) =>
                    setFreteTotalInput(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="0,00"
                  className="
                    relative
                    z-10

                    w-full
                    h-full

                    bg-transparent

                    pl-14
                    pr-4

                    text-[16px]
                    font-semibold

                    tracking-tight

                    text-[color:var(--foreground)]

                    placeholder:text-[color:var(--muted-soft)]

                    outline-none
                  "
                />

                {/* RIGHT LABEL */}
                {freteTotal > 0 && (
                  <div
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2

                      text-[10px]
                      font-medium

                      tracking-[0.12em]

                      uppercase

                      text-amber-600
                    "
                  >
                    frete
                  </div>
                )}
              </div>
            </div>
            {/* TOTAL */}
            <div className="space-y-1">
              {/* LABEL */}
              <div className="flex items-center justify-between">
                <span
                  className="
                    text-[9px]

                    uppercase

                    tracking-[0.20em]

                    text-[color:var(--muted-soft)]
                  "
                >
                  Total
                </span>

                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                  "
                >
                  <div
                    className={`
                      w-[4px]
                      h-[4px]

                      rounded-full

                      ${
                        hasValue
                          ? "bg-emerald-500"
                          : "bg-[color:var(--muted-soft)]"
                      }
                    `}
                  />

                  <span
                    className={`
                      text-[9px]

                      uppercase

                      tracking-[0.12em]

                      ${
                        hasValue
                          ? "text-emerald-600"
                          : "text-[color:var(--muted-soft)]"
                      }
                    `}
                  >
                    {hasValue ? "live" : "standby"}
                  </span>
                </div>
              </div>

              {/* TOTAL CARD */}
              <div
                className={`
                  group
                  relative
                  overflow-hidden

                  h-[62px]

                  rounded-[22px]

                  border

                  backdrop-blur-md

                  transition-all
                  duration-300

                  ${
                    hasValue
                      ? `
                        border-emerald-300/18

                        bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(255,255,255,0.78))]

                        shadow-[0_18px_50px_rgba(16,185,129,0.14)]

                        hover:border-emerald-300/30
                      `
                      : `
                        border-white/10

                        bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(248,250,252,0.62))]

                        shadow-[0_12px_34px_rgba(15,23,42,0.06)]

                        hover:border-white/20
                      `
                  }
                `}
              >
                {/* ================================================= */}
                {/* FX */}
                {/* ================================================= */}

                <div className="absolute inset-0 pointer-events-none">
                  {/* GLOW */}
                  <div
                    className={`
                      absolute
                      inset-0

                      opacity-0
                      group-hover:opacity-100

                      transition-all
                      duration-700

                      ${
                        hasValue
                          ? `
                            bg-[radial-gradient(circle_at_85%_12%,rgba(16,185,129,0.14),transparent_58%)]
                          `
                          : `
                            bg-[radial-gradient(circle_at_85%_12%,rgba(255,255,255,0.10),transparent_58%)]
                          `
                      }
                    `}
                  />

                  {/* LIGHT */}
                  <div
                    className="
                      absolute
                      inset-0

                      bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                    "
                  />

                  {/* TOP LINE */}
                  <div
                    className="
                      absolute
                      inset-x-0
                      top-0
                      h-[1px]

                      bg-gradient-to-r
                      from-transparent
                      via-white/30
                      to-transparent
                    "
                  />
                </div>

                {/* ================================================= */}
                {/* CONTENT */}
                {/* ================================================= */}

                <div
                  className="
                    relative
                    z-10

                    h-full

                    flex
                    items-center
                    justify-between

                    px-4
                  "
                >
                  {/* LEFT */}
                  <div className="flex items-center gap-3">
                    {/* ICON */}
                    <div
                      className={`
                        flex
                        items-center
                        justify-center

                        w-9
                        h-9

                        rounded-full

                        border

                        ${
                          hasValue
                            ? `
                              border-emerald-300/18
                              bg-emerald-500/12
                            `
                            : `
                              border-white/10
                              bg-white/10
                            `
                        }
                      `}
                    >
                      <span
                        className={`
                          text-[12px]
                          font-semibold

                          ${
                            hasValue
                              ? "text-emerald-600"
                              : "text-[color:var(--muted-soft)]"
                          }
                        `}
                      >
                        R$
                      </span>
                    </div>

                    {/* VALUE */}
                    <div>
                      <p
                        className={`
                          text-[20px]
                          font-semibold

                          tracking-[-0.05em]

                          ${
                            hasValue
                              ? "text-emerald-700"
                              : "text-[color:var(--foreground)]"
                          }
                        `}
                      >
                        {formatCurrency(valorTotal)}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div
                    className={`
                      flex
                      items-center
                      gap-2

                      px-2.5
                      py-1.5

                      rounded-full

                      border

                      ${
                        hasValue
                          ? `
                            border-emerald-300/18
                            bg-emerald-500/10
                          `
                          : `
                            border-white/10
                            bg-white/10
                          `
                      }
                    `}
                  >
                    {/* DOT */}
                    <div className="relative">
                      <div
                        className={`
                          w-[6px]
                          h-[6px]

                          rounded-full

                          ${
                            hasValue
                              ? "bg-emerald-500"
                              : "bg-[color:var(--muted-soft)]"
                          }
                        `}
                      />

                      {hasValue && (
                        <div
                          className="
                            absolute
                            inset-0

                            rounded-full

                            bg-emerald-500

                            animate-ping

                            opacity-40
                          "
                        />
                      )}
                    </div>

                    {/* TEXT */}
                    <span
                      className={`
                        text-[10px]
                        font-medium

                        tracking-[0.12em]

                        uppercase

                        ${
                          hasValue
                            ? "text-emerald-600"
                            : "text-[color:var(--muted-soft)]"
                        }
                      `}
                    >
                      {hasValue ? "calculado" : "aguardando"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================= */}
        {/* FEEDBACK */}
        {/* ============================================= */}

        <div
          className="
                col-span-1
                xl:col-span-3

                relative
                z-10

                flex
                flex-col
                justify-between

                gap-3
              "
        >
          {/* ========================================= */}
          {/* ERRO */}
          {/* ========================================= */}

          {error && (
            <div
              className="
                    relative
                    overflow-hidden

                    px-3
                    py-2.5

                    rounded-[18px]

                    border
                    border-red-200

                    bg-[linear-gradient(135deg,rgba(254,242,242,0.96),rgba(254,226,226,0.88))]

                    shadow-[0_10px_24px_rgba(239,68,68,0.10)]
                  "
            >
              {/* FX */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle,rgba(239,68,68,0.7)_1px,transparent_1px)] bg-[size:18px_18px]" />

                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-300/60 to-transparent" />
              </div>

              <div className="relative z-10 flex items-start gap-2.5">
                {/* DOT */}
                <div className="mt-[3px] relative shrink-0">
                  <div className="w-[7px] h-[7px] rounded-full bg-red-500" />

                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40" />
                </div>

                {/* CONTENT */}
                <div className="min-w-0">
                  <p
                    className="
                          text-[9px]
                          uppercase
                          tracking-[0.18em]

                          text-red-500/80
                        "
                  >
                    Erro operacional
                  </p>

                  <p
                    className="
                          mt-1

                          text-[11px]
                          leading-[1.45]

                          font-medium

                          text-red-700
                        "
                  >
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* SUCCESS */}
          {/* ========================================= */}

          {success && (
            <div
              className="
                    group
                    relative
                    overflow-hidden

                    rounded-[24px]

                    border
                    border-emerald-300/16

                    bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(255,255,255,0.74))]

                    backdrop-blur-sm

                    px-4
                    py-4

                    shadow-[0_18px_50px_rgba(16,185,129,0.12)]

                    transition-all
                    duration-500

                    hover:border-emerald-300/26
                    hover:shadow-[0_26px_70px_rgba(16,185,129,0.18)]
                  "
            >
              {/* ================================================= */}
              {/* FX */}
              {/* ================================================= */}

              <div className="absolute inset-0 pointer-events-none">
                {/* GLOW */}
                <div
                  className="
                        absolute
                        inset-0

                        opacity-40

                        transition-all
                        duration-700

                        bg-[radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.18),transparent_58%)]
                      "
                />

                {/* GRID */}
                <div
                  className="
                        absolute
                        inset-0

                        opacity-[0.025]

                        bg-[radial-gradient(circle,rgba(16,185,129,0.65)_1px,transparent_1px)]
                        bg-[size:18px_18px]
                      "
                />

                {/* LIGHT */}
                <div
                  className="
                        absolute
                        inset-0

                        bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_35%)]
                      "
                />

                {/* TOP LINE */}
                <div
                  className="
                        absolute
                        inset-x-0
                        top-0
                        h-[1px]

                        bg-gradient-to-r
                        from-transparent
                        via-emerald-300/60
                        to-transparent
                      "
                />
              </div>

              {/* ================================================= */}
              {/* CONTENT */}
              {/* ================================================= */}

              <div
                className="
                      relative
                      z-10

                      flex
                      items-start

                      gap-3
                    "
              >
                {/* ============================================= */}
                {/* STATUS ICON */}
                {/* ============================================= */}

                <div
                  className="
                        relative

                        flex
                        items-center
                        justify-center

                        shrink-0

                        w-10
                        h-10

                        rounded-full

                        border
                        border-emerald-300/18

                        bg-emerald-500/12
                      "
                >
                  {/* GLOW */}
                  <div
                    className="
                          absolute
                          inset-0

                          rounded-full

                          bg-emerald-500/18

                          blur-md
                        "
                  />

                  {/* DOT */}
                  <div className="relative z-10">
                    <div
                      className="
                            w-[8px]
                            h-[8px]

                            rounded-full

                            bg-emerald-500
                          "
                    />

                    <div
                      className="
                            absolute
                            inset-0

                            rounded-full

                            bg-emerald-500

                            animate-ping

                            opacity-40
                          "
                    />
                  </div>
                </div>

                {/* ============================================= */}
                {/* TEXT */}
                {/* ============================================= */}

                <div className="min-w-0 flex-1">
                  {/* TOP */}
                  <div className="flex items-center gap-2">
                    <span
                      className="
                            text-[9px]

                            uppercase

                            tracking-[0.18em]

                            text-emerald-600/80
                          "
                    >
                      Operação concluída
                    </span>

                    <div
                      className="
                            w-[4px]
                            h-[4px]

                            rounded-full

                            bg-emerald-500
                          "
                    />

                    <span
                      className="
                            text-[9px]

                            uppercase

                            tracking-[0.12em]

                            text-emerald-700/70
                          "
                    >
                      sincronizado
                    </span>
                  </div>

                  {/* TITLE */}
                  <p
                    className="
                          mt-2

                          text-[14px]
                          font-semibold

                          tracking-[-0.02em]

                          text-emerald-700
                        "
                  >
                    Venda operacional registrada com sucesso
                  </p>

                  {/* DESCRIPTION */}
                  <p
                    className="
                          mt-1.5

                          text-[11px]
                          leading-[1.45]

                          text-emerald-700/80
                        "
                  >
                    Estoque bruto atualizado, financeiro sincronizado e operação
                    vinculada ao histórico operacional do sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================= */}
        {/* BOTÃO FINAL */}
        {/* ============================================= */}

        <div
          className="
                col-span-1
                xl:col-span-3

                flex
                flex-col
                gap-3

                -translate-y-8
              "
        >
          <motion.button
            whileTap={{
              scale: 0.985,
            }}
            onClick={handleSubmit}
            disabled={
              creating ||
              !cliente ||
              !pesoBrutoNumber ||
              !precoMelancia ||
              !quantidadeFrutasNumber ||
              !valorTotal
            }
            className={`
                  group
                  relative
                  overflow-hidden

                  h-[50px]
                  w-[340px]

                  rounded-[16px]

                  border

                  backdrop-blur-sm

                  transition-all
                  duration-500

                  ${
                    creating ||
                    !cliente ||
                    !pesoBrutoNumber ||
                    !precoMelancia ||
                    !quantidadeFrutasNumber ||
                    !valorTotal
                      ? `
  border-white/10

  bg-[linear-gradient(135deg,#0f172a,#1e293b)]

  text-white

  shadow-[0_10px_28px_rgba(15,23,42,0.22)]

  opacity-[0.92]
`
                      : `
                        border-emerald-300/18

                        bg-[linear-gradient(135deg,#059669,#047857)]

                        text-white

                        shadow-[0_14px_36px_rgba(16,185,129,0.20)]

                        hover:translate-y-[-2px]

                        hover:shadow-[0_34px_90px_rgba(16,185,129,0.42)]

                        active:scale-[0.985]
                      `
                  }
                `}
          >
            {/* ================================================= */}
            {/* FX */}
            {/* ================================================= */}

            {!creating &&
              !(
                !cliente ||
                !pesoBrutoNumber ||
                !precoMelancia ||
                !quantidadeFrutasNumber ||
                !valorTotal
              ) && (
                <>
                  {/* SHINE */}
                  <div
                    className="
                          absolute
                          inset-0

                          opacity-0
                          group-hover:opacity-100

                          transition-all
                          duration-1000

                          bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]

                          translate-x-[-140%]
                          group-hover:translate-x-[140%]
                        "
                  />

                  {/* GLOW */}
                  <div
                    className="
                          absolute
                          inset-0

                          
                          group-hover:opacity-100

                          transition-all
                          duration-500

                          bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.22),transparent_60%)]
                        "
                  />

                  {/* TOP LIGHT */}
                  <div
                    className="
                          absolute
                          inset-x-0
                          top-0
                          h-[1px]

                          bg-gradient-to-r
                          from-transparent
                          via-white/50
                          to-transparent
                        "
                  />
                </>
              )}

            {/* ================================================= */}
            {/* GRID FX */}
            {/* ================================================= */}

            {/* ================================================= */}
            {/* CONTEÚDO */}
            {/* ================================================= */}

            <div
              className="
  relative
  z-10

  h-full

  flex
  items-center
  justify-between

  gap-4

  px-4
"
            >
              {/* ============================================= */}
              {/* TOP */}
              {/* ============================================= */}

              <div className="flex items-center justify-between gap-4">
                {/* STATUS */}
                <div className="flex items-center gap-2.5">
                  {/* DOT */}
                  <div
                    className={`
        w-[8px]
        h-[8px]

        rounded-full

        shrink-0

        ${creating ? "bg-white" : "bg-emerald-300"}
      `}
                  />

                  {/* LABEL */}
                  <div className="flex items-center gap-1 leading-none">
                    <span
                      className="
          text-[9px]

          uppercase

          tracking-[0.16em]

          text-white/72
        "
                    >
                      operação
                    </span>

                    <div
                      className="
          w-[3px]
          h-[3px]

          rounded-full

          bg-white/20
        "
                    />

                    <span
                      className="
          text-[10px]
          font-medium

          tracking-tight

          text-white/88
        "
                    >
                      pronto
                    </span>
                  </div>
                </div>

                {/* BADGE */}
                <div
                  className="
  shrink-0

  flex
  items-center
  gap-1

  h-[18px]

  px-1.8

  rounded-full

  border
  border-white/80

  bg-white/[0.04]
"
                >
                  <div
                    className="
        w-[3.5px]
        h-[3.5px]

        rounded-full

        bg-white/80
      "
                  />

                  <span
                    className="
        text-[8px]

        uppercase

        tracking-[0.12em]

        text-white/72
      "
                  >
                    venda
                  </span>
                </div>
              </div>

              {/* ============================================= */}
              {/* CENTER */}
              {/* ============================================= */}

              <div className="flex items-center gap-3">
                {/* LOADER */}
                {creating && (
                  <div
                    className="
                          shrink-0

                          w-4
                          h-4

                          border-[2px]
                          border-white/20
                          border-t-white

                          rounded-full

                          animate-spin
                        "
                  />
                )}

                {/* TEXT */}
                <div className="space-y-0">
                  <span
                    className="
                          block

                          text-[16px]
                          xl:text-[17px]

                          font-semibold

                          leading-none

                          tracking-tight
                        "
                  >
                    {creating ? "Registrando venda..." : "Finalizar venda"}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
