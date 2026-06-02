"use client";

import { useMemo, useState, useCallback } from "react";

import { AxiosError } from "axios";

import { motion, AnimatePresence } from "framer-motion";

import { useFornecedorStore } from "@/modules/fornecedores/store/useFornecedorStore";

import { FornecedorSelect } from "@/modules/fornecedores/components/FornecedorSelect";

import { FazendaSelect } from "@/modules/fornecedores/components/FazendaSelect";

import { FazendaForm } from "@/modules/fornecedores/components/FazendaForm";

import { useFazendasFornecedor } from "@/modules/fornecedores/hooks/useFornecedores";

import { useCompras } from "./hooks/useCompras";

import type { ModeloCaminhao, TipoDescontoCompra } from "./hooks/useCompras";

export function NovaCompraCard() {
  ////////////////////////////////////////////////////////////
  // FORNECEDOR / FAZENDA
  ////////////////////////////////////////////////////////////

  const fornecedor = useFornecedorStore((state) => state.fornecedorSelecionado);

  const fazenda = useFornecedorStore((state) => state.fazendaSelecionada);

  const selecionarFornecedor = useFornecedorStore(
    (state) => state.selecionarFornecedor,
  );

  const selecionarFazenda = useFornecedorStore(
    (state) => state.selecionarFazenda,
  );

  const limparFazenda = useFornecedorStore((state) => state.limparFazenda);

  ////////////////////////////////////////////////////////////
  // HOOKS
  ////////////////////////////////////////////////////////////

  const { createCompra, creating } = useCompras();

  const { createFazenda, creating: creatingFazenda } = useFazendasFornecedor(
    fornecedor?.id,
  );

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  const [open, setOpen] = useState(false);

  ////////////////////////////////////////////////////////////
  /// FAZENDA
  ////////////////////////////////////////////////////////////
  const [mostrarNovaFazenda, setMostrarNovaFazenda] = useState<boolean>(false);

  ////////////////////////////////////////////////////////////
  // IDENTIFICAÇÃO
  ////////////////////////////////////////////////////////////

  const [safra, setSafra] = useState<string>("");

  const [dataCompra, setDataCompra] = useState<string>(
    new Date().toISOString().split("T")[0] ?? "",
  );

  const numeroFolha = "Gerado automaticamente";

  ////////////////////////////////////////////////////////////
  // CAMINHÃO
  ////////////////////////////////////////////////////////////

  const [modeloCaminhao, setModeloCaminhao] = useState<ModeloCaminhao>("TRUCK");

  const [placa, setPlaca] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // PESAGEM
  ////////////////////////////////////////////////////////////

  const [kgBruto, setKgBruto] = useState<string>("");

  const [quantidadeFrutas, setQuantidadeFrutas] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // DESCONTO
  ////////////////////////////////////////////////////////////

  const [tipoDesconto, setTipoDesconto] =
    useState<TipoDescontoCompra>("AUTOMATICO_MODELO");

  const [descontoPercentualAplicado, setDescontoPercentualAplicado] =
    useState<string>("");

  const [descontoKgManual, setDescontoKgManual] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // FINANCEIRO
  ////////////////////////////////////////////////////////////

  const [precoKg, setPrecoKg] = useState<string>("");

  const [despesas, setDespesas] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // VALOR FINAL MANUAL
  ////////////////////////////////////////////////////////////

  const [editarValorFinal, setEditarValorFinal] = useState<boolean>(false);

  const [valorTotalManual, setValorTotalManual] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // LEGADO / COMPATIBILIDADE
  ////////////////////////////////////////////////////////////

  const [caminhoes, setCaminhoes] = useState<string>("1");

  ////////////////////////////////////////////////////////////
  // OBS
  ////////////////////////////////////////////////////////////

  const [observacoes, setObservacoes] = useState<string>("");

  ////////////////////////////////////////////////////////////
  // DESCONTO CLIENTE
  ////////////////////////////////////////////////////////////

  // O cálculo continua exatamente igual ao atual.
  // O domínio Fornecedor não possui descontoPercentual.
  const descontoFornecedor = 0;

  ////////////////////////////////////////////////////////////
  // HANDLERS
  ////////////////////////////////////////////////////////////
  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    if (!creating) {
      setOpen(false);
    }
  }, [creating]);

  ////////////////////////////////////////////////////////////
  // NORMALIZAÇÃO
  ////////////////////////////////////////////////////////////

  const parsed = useMemo(() => {
    const toNumber = (value: string): number => {
      ////////////////////////////////////////////////////////////
      // EMPTY
      ////////////////////////////////////////////////////////////

      if (!value || !value.trim()) {
        return 0;
      }

      ////////////////////////////////////////////////////////////
      // NORMALIZAÇÃO BR
      ////////////////////////////////////////////////////////////

      const normalized = value
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(,|$))/g, "")
        .replace(",", ".");

      ////////////////////////////////////////////////////////////
      // PARSE
      ////////////////////////////////////////////////////////////

      const parsed = Number(normalized);

      ////////////////////////////////////////////////////////////
      // FALLBACK
      ////////////////////////////////////////////////////////////

      if (Number.isNaN(parsed)) {
        return 0;
      }

      return parsed;
    };

    return {
      kgBruto: toNumber(kgBruto),

      quantidadeFrutas: toNumber(quantidadeFrutas),

      precoKg: toNumber(precoKg),

      despesas: toNumber(despesas),

      descontoPercentualAplicado: toNumber(descontoPercentualAplicado),

      descontoKgManual: toNumber(descontoKgManual),

      caminhoes: toNumber(caminhoes),
    };
  }, [
    kgBruto,
    quantidadeFrutas,
    precoKg,
    despesas,
    descontoPercentualAplicado,
    descontoKgManual,
    caminhoes,
  ]);

  ////////////////////////////////////////////////////////////
  // CÁLCULO
  ////////////////////////////////////////////////////////////

  const calculo = useMemo(() => {
    //////////////////////////////////////////////////////////
    // MÉDIA
    //////////////////////////////////////////////////////////

    const mediaFruta =
      parsed.quantidadeFrutas > 0
        ? Math.floor((parsed.kgBruto / parsed.quantidadeFrutas) * 10) / 10
        : 0;

    //////////////////////////////////////////////////////////
    // DESCONTO
    //////////////////////////////////////////////////////////

    let descontoKgCalculado = 0;

    //////////////////////////////////////////////////////////
    // AUTOMÁTICO MODELO
    //////////////////////////////////////////////////////////

    if (tipoDesconto === "AUTOMATICO_MODELO") {
      ////////////////////////////////////////////////////////
      // 2%
      ////////////////////////////////////////////////////////

      const descontoPercentual = parsed.kgBruto * 0.02;

      ////////////////////////////////////////////////////////
      // PESO PARCIAL
      ////////////////////////////////////////////////////////

      const pesoParcial = parsed.kgBruto - descontoPercentual;

      ////////////////////////////////////////////////////////
      // DESCONTO FIXO
      ////////////////////////////////////////////////////////

      let descontoFixo = 0;

      switch (modeloCaminhao) {
        //////////////////////////////////////////////////////
        // TRUCK
        //////////////////////////////////////////////////////

        case "TRUCK":
          descontoFixo = 1000;
          break;

        //////////////////////////////////////////////////////
        // BITRUCK
        //////////////////////////////////////////////////////

        case "BITRUCK":
          descontoFixo = 1500;
          break;

        //////////////////////////////////////////////////////
        // CARRETA
        //////////////////////////////////////////////////////

        case "CARRETA":
          descontoFixo = 2000;
          break;

        default:
          descontoFixo = 0;
          break;
      }

      ////////////////////////////////////////////////////////
      // DESCONTO FINAL
      ////////////////////////////////////////////////////////

      descontoKgCalculado = parsed.kgBruto - (pesoParcial - descontoFixo);

      ////////////////////////////////////////////////////////
      // ARREDONDAMENTO
      ////////////////////////////////////////////////////////

      descontoKgCalculado = Math.round(descontoKgCalculado);
    }

    //////////////////////////////////////////////////////////
    // PERCENTUAL
    //////////////////////////////////////////////////////////

    if (tipoDesconto === "PERCENTUAL") {
      descontoKgCalculado =
        parsed.kgBruto * (parsed.descontoPercentualAplicado / 100);
    }

    //////////////////////////////////////////////////////////
    // MANUAL KG
    //////////////////////////////////////////////////////////

    if (tipoDesconto === "MANUAL_KG") {
      descontoKgCalculado = parsed.descontoKgManual;
    }

    //////////////////////////////////////////////////////////
    // PESO
    //////////////////////////////////////////////////////////

    const kgLiquido = parsed.kgBruto - descontoKgCalculado;

    //////////////////////////////////////////////////////////
    // FINANCEIRO
    //////////////////////////////////////////////////////////

    const totalBruto = kgLiquido * parsed.precoKg;

    const valorTotal = totalBruto - parsed.despesas;

    //////////////////////////////////////////////////////////
    // RESULTADO
    //////////////////////////////////////////////////////////

    return {
      mediaFruta,

      descontoKgCalculado,

      kgLiquido,

      totalBruto,

      valorTotal,
    };
  }, [parsed, tipoDesconto, descontoFornecedor, modeloCaminhao]);

  ////////////////////////////////////////////////////////////
  // VALOR FINAL EFETIVO
  ////////////////////////////////////////////////////////////

  const valorFinalEfetivo = useMemo(() => {
    //////////////////////////////////////////////////////////
    // MANUAL
    //////////////////////////////////////////////////////////

    if (editarValorFinal) {
      const normalized = valorTotalManual
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(,|$))/g, "")
        .replace(",", ".");

      const parsedManual = Number(normalized);

      if (!Number.isNaN(parsedManual) && parsedManual > 0) {
        return parsedManual;
      }
    }

    //////////////////////////////////////////////////////////
    // AUTOMÁTICO
    //////////////////////////////////////////////////////////

    return calculo.valorTotal;
  }, [editarValorFinal, valorTotalManual, calculo.valorTotal]);

  ////////////////////////////////////////////////////////////
  // VALIDAÇÃO
  ////////////////////////////////////////////////////////////

  const isValid =
    parsed.kgBruto > 0 &&
    parsed.quantidadeFrutas > 0 &&
    parsed.precoKg > 0 &&
    !!placa &&
    !!dataCompra &&
    !!fornecedor &&
    !!fazenda;

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  const handleSubmit = useCallback(async () => {
    //////////////////////////////////////////////////////////
    // FORNECEDOR
    //////////////////////////////////////////////////////////

    if (!fornecedor) {
      return;
    }

    //////////////////////////////////////////////////////////
    // FAZENDA
    //////////////////////////////////////////////////////////

    if (!fazenda) {
      return;
    }

    //////////////////////////////////////////////////////////
    // VALIDAÇÃO
    //////////////////////////////////////////////////////////

    if (!isValid) {
      return;
    }

    try {
      const payload = {
        //////////////////////////////////////////////////////
        // FORNECEDOR
        //////////////////////////////////////////////////////

        fornecedorId: fornecedor?.id,

        fazendaFornecedorId: fazenda?.id,

        //////////////////////////////////////////////////////
        // IDENTIFICAÇÃO
        //////////////////////////////////////////////////////

        safra: safra || undefined,

        dataCompra,

        // numeroFolha removido.
        // Backend gera automaticamente.

        //////////////////////////////////////////////////////
        // CAMINHÃO
        //////////////////////////////////////////////////////

        modeloCaminhao,

        placa,

        //////////////////////////////////////////////////////
        // PESAGEM
        //////////////////////////////////////////////////////

        kgBruto: parsed.kgBruto,

        quantidadeFrutas: parsed.quantidadeFrutas,

        //////////////////////////////////////////////////////
        // DESCONTO
        //////////////////////////////////////////////////////

        tipoDesconto,

        descontoPercentualAplicado:
          tipoDesconto === "PERCENTUAL"
            ? parsed.descontoPercentualAplicado
            : undefined,

        descontoKgManual:
          tipoDesconto === "MANUAL_KG" ? parsed.descontoKgManual : undefined,

        //////////////////////////////////////////////////////
        // FINANCEIRO
        //////////////////////////////////////////////////////

        precoKg: parsed.precoKg,

        despesas: parsed.despesas,

        valorTotal: editarValorFinal ? valorFinalEfetivo : undefined,

        //////////////////////////////////////////////////////
        // LEGADO
        //////////////////////////////////////////////////////

        caminhoes: parsed.caminhoes,

        //////////////////////////////////////////////////////
        // OBS
        //////////////////////////////////////////////////////

        observacoes,
      };

      console.log("PAYLOAD FINAL:", payload);

      await createCompra(payload);

      ////////////////////////////////////////////////////////
      // RESET
      ////////////////////////////////////////////////////////

      setSafra("");

      setModeloCaminhao("TRUCK");

      setPlaca("");

      setKgBruto("");

      setQuantidadeFrutas("");

      setTipoDesconto("AUTOMATICO_MODELO");

      setDescontoPercentualAplicado("");

      setDescontoKgManual("");

      setPrecoKg("");

      setDespesas("");

      setEditarValorFinal(false);

      setValorTotalManual("");

      setCaminhoes("1");

      setObservacoes("");

      ////////////////////////////////////////////////////////
      // FORNECEDOR / FAZENDA
      ////////////////////////////////////////////////////////
      selecionarFornecedor(null);

      selecionarFazenda(null);

      setMostrarNovaFazenda(false);

      ////////////////////////////////////////////////////////
      // CLOSE
      ////////////////////////////////////////////////////////

      setTimeout(() => {
        handleClose();
      }, 250);
    } catch (error: unknown) {
      ////////////////////////////////////////////////////////
      // AXIOS
      ////////////////////////////////////////////////////////

      const axiosError = error as AxiosError;

      ////////////////////////////////////////////////////////
      // ERRO COMPLETO
      ////////////////////////////////////////////////////////

      console.error("ERRO COMPLETO:", axiosError);

      ////////////////////////////////////////////////////////
      // RESPONSE
      ////////////////////////////////////////////////////////

      console.error("RESPONSE:", axiosError.response);

      ////////////////////////////////////////////////////////
      // DATA
      ////////////////////////////////////////////////////////

      console.error("DATA:", axiosError.response?.data);

      ////////////////////////////////////////////////////////
      // STATUS
      ////////////////////////////////////////////////////////

      console.error("STATUS:", axiosError.response?.status);

      ////////////////////////////////////////////////////////
      // PAYLOAD
      ////////////////////////////////////////////////////////

      console.log("PAYLOAD ENVIADO:", {
        fornecedorId: fornecedor.id,

        fazendaFornecedorId: fazenda.id,

        safra: safra || undefined,

        dataCompra,

        // numeroFolha removido.
        // Backend gera automaticamente.

        modeloCaminhao,

        placa,

        kgBruto: parsed.kgBruto,

        quantidadeFrutas: parsed.quantidadeFrutas,

        tipoDesconto,

        descontoPercentualAplicado:
          tipoDesconto === "PERCENTUAL"
            ? parsed.descontoPercentualAplicado
            : undefined,

        descontoKgManual:
          tipoDesconto === "MANUAL_KG" ? parsed.descontoKgManual : undefined,

        precoKg: parsed.precoKg,

        despesas: parsed.despesas,

        caminhoes: parsed.caminhoes,

        observacoes,
      });
    }
  }, [
    fornecedor,
    fazenda,
    selecionarFornecedor,
    selecionarFazenda,
    isValid,
    safra,
    dataCompra,
    modeloCaminhao,
    placa,
    tipoDesconto,
    observacoes,
    parsed,
    valorFinalEfetivo,
    createCompra,
    handleClose,
  ]);

  return (
    <>
      {/* ================= HEADER + ACTION CARD ================= */}
      <div
        className="
    space-y-3

    animate-[fadeIn_.18s_ease-out]
  "
      >
        {/* HEADER INTEGRADO */}
        <div className="flex items-center justify-between">
          {/* ESQUERDA */}
          <div className="space-y-2">
            {/* IDENTIDADE VISUAL */}
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-[3px] h-4 rounded-full bg-[color:var(--brand)]" />
                <div className="absolute inset-0 blur-sm opacity-50 bg-[color:var(--brand)] rounded-full" />
              </div>

              <span className="text-[9px] uppercase tracking-[0.32em] text-[color:var(--muted-soft)]">
                Operação
              </span>
            </div>

            {/* TÍTULO */}
            <h3
              className="
        text-[12px]
        font-semibold
        tracking-[-0.01em]
        text-[color:var(--foreground)]
      "
            >
              Nova compra
            </h3>

            {/* DESCRIÇÃO */}
          </div>

          {/* DIREITA */}
          <div className="hidden md:flex items-center gap-2.5">
            <div
              className="
        relative

        px-3 py-[5px]

        rounded-full

        bg-[linear-gradient(135deg,var(--surface-200),#ffffff)]

        border border-[color:var(--border-soft)]

        text-[10px]
        font-medium

        text-[color:var(--muted)]

        shadow-[0_6px_18px_rgba(0,0,0,0.05)]

        transition-all duration-300

        group-hover:border-[color:var(--brand)]
        group-hover:text-[color:var(--foreground)]
      "
            >
              {/* GLOW */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_70%)] rounded-full" />
              </div>

              <span className="relative flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-[color:var(--brand)] animate-pulse" />
                ação rápida
              </span>
            </div>
          </div>
        </div>

        {/* ACTION CARD */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="
    group relative overflow-visible

    rounded-[var(--radius-lg)]

    border border-[color:var(--border-soft)]

    bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

    shadow-[0_22px_60px_rgba(0,0,0,0.10)]

    p-3

    transition-all duration-300

    hover:border-[color:var(--brand)]
    hover:shadow-[0_35px_90px_rgba(0,0,0,0.16)]
  "
        >
          {/* CAMADA VISUAL */}
          <div className="absolute inset-0 pointer-events-none">
            {/* GLOW PRINCIPAL */}
            <div
              className="
        absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
        bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.18),transparent_60%)]
      "
            />

            {/* GRADIENT BASE */}
            <div
              className="
        absolute bottom-0 left-0 w-full h-[40%]
        opacity-[0.08]
        bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.12))]
      "
            />

            {/* TOP LINE */}
            <div
              className="
        absolute inset-x-0 top-0 h-[1px]
        bg-gradient-to-r from-transparent via-black/15 to-transparent
      "
            />

            {/* TEXTURA */}
            <div
              className="
        absolute inset-0 opacity-[0.02]
        bg-[radial-gradient(circle,rgba(0,0,0,0.35)_1px,transparent_1px)]
        bg-[size:22px_22px]
      "
            />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            {/* ESQUERDA */}
            <div className="flex items-center gap-4">
              {/* ICON REFINADO */}
              <div
                className="
          relative
          w-12 h-12
          rounded-2xl
          flex items-center justify-center

          bg-[linear-gradient(135deg,var(--surface-200),#ffffff)]

          border border-[color:var(--border-soft)]

          text-[18px]

          transition-all duration-300

          group-hover:scale-105
          group-hover:border-[color:var(--brand)]
        "
              >
                <div
                  className="
            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition
            bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.25),transparent_70%)]
          "
                />

                <span className="relative font-light text-[color:var(--foreground)] group-hover:text-[color:var(--brand)]">
                  +
                </span>
              </div>

              {/* TEXTO REFINADO */}
              <div className="flex flex-col">
                <p className="text-[15px] font-semibold text-[color:var(--foreground)]">
                  Registrar nova compra
                </p>

                <p className="text-[12.5px] text-[color:var(--muted)]">
                  Atualize o fluxo financeiro em tempo real
                </p>
              </div>
            </div>

            {/* CTA MELHORADO */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleOpen}
              className="
        group relative overflow-visible

        px-5 py-2.5

        rounded-[12px]

        text-[13px]
        font-medium
        tracking-tight

        text-white

        bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))]

        shadow-[0_12px_30px_rgba(0,0,0,0.25)]

        transition-all duration-300

        hover:scale-[1.05]
        hover:shadow-[0_22px_60px_rgba(0,0,0,0.35)]

        active:scale-[0.97]
      "
            >
              {/* SHINE */}
              <div
                className="
          absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500
          bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.25),transparent)]
          translate-x-[-100%] group-hover:translate-x-[100%]
        "
              />

              <span className="relative">Nova compra</span>
            </motion.button>
          </div>

          {/* BASE LINE */}
          <div
            className="
      absolute bottom-0 left-0 w-full h-[2px]
      bg-gradient-to-r from-transparent via-[color:var(--brand)] to-transparent
      opacity-0 group-hover:opacity-100
      transition-all duration-300
    "
          />
        </motion.div>
      </div>

      {/* ================= MODAL ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="
              fixed inset-0 z-50

              bg-black/45
              backdrop-blur-[12px]

              flex items-end md:items-center justify-center

              p-3 md:p-4
            "
          >
            <motion.div
              initial={{ y: 48, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 36, opacity: 0, scale: 0.98 }}
              transition={{
                type: "spring",
                stiffness: 190,
                damping: 22,
              }}
              onClick={(e) => e.stopPropagation()}
              className="
                group relative overflow-hidden

                w-full
                max-w-[1120px]

                rounded-[24px]

                bg-[linear-gradient(180deg,#ffffff,#fbfbfb)]

                border border-[rgba(0,0,0,0.08)]

                shadow-[0_50px_140px_rgba(0,0,0,0.28)]

                flex flex-col

                transition-all duration-300
              "
            >
              {/* ================= CAMADAS VISUAIS ================= */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="
                    absolute inset-0 opacity-[0.025]
                    bg-[radial-gradient(circle,rgba(0,0,0,0.42)_1px,transparent_1px)]
                    bg-[size:22px_22px]
                  "
                />

                <div
                  className="
                    absolute inset-x-0 top-0 h-[1px]
                    bg-gradient-to-r from-transparent via-black/20 to-transparent
                  "
                />

                <div
                  className="
                    absolute -top-24 right-[-80px]
                    w-[360px] h-[360px]
                    rounded-full
                    bg-[radial-gradient(circle,rgba(99,102,241,0.13),transparent_65%)]
                  "
                />

                <div
                  className="
                    absolute -bottom-28 left-[-80px]
                    w-[320px] h-[320px]
                    rounded-full
                    bg-[radial-gradient(circle,rgba(16,185,129,0.10),transparent_65%)]
                  "
                />
              </div>

              {/* ================= HEADER ÚNICO ================= */}
              <div
                className="
                  relative z-10

                  px-6 md:px-8
                  py-5

                  border-b border-[rgba(0,0,0,0.07)]

                  bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.88))]

                  flex items-start justify-between
                  gap-4
                "
              >
                <div className="min-w-0 flex items-start gap-4">
                  <div className="relative mt-[5px] shrink-0">
                    <div className="w-[4px] h-9 rounded-full bg-[color:var(--brand)]" />
                    <div className="absolute inset-0 blur-sm opacity-45 bg-[color:var(--brand)] rounded-full" />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-[0.34em]
                          text-[color:var(--muted-soft)]
                        "
                      >
                        Compras
                      </span>

                      <span
                        className="
                          inline-flex items-center gap-1.5

                          px-2 py-[3px]

                          rounded-full

                          bg-emerald-50
                          border border-emerald-200

                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.14em]
                          text-emerald-700
                        "
                      >
                        <span className="w-[5px] h-[5px] rounded-full bg-emerald-500 animate-pulse" />
                        operação ativa
                      </span>
                    </div>

                    <h2
                      className="
                        text-[22px]
                        font-semibold
                        tracking-[-0.02em]
                        text-[color:var(--foreground)]
                      "
                    >
                      Nova compra
                    </h2>

                    <p
                      className="
                        text-[13px]
                        text-[color:var(--muted)]
                        leading-relaxed
                        max-w-[620px]
                      "
                    >
                      Registre a entrada da mercadoria com pesagem, desconto
                      técnico, transporte e cálculo financeiro em tempo real.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  disabled={creating}
                  className="
                    group/close relative

                    w-10 h-10

                    flex items-center justify-center

                    rounded-[14px]

                    border border-[rgba(0,0,0,0.08)]
                    bg-[linear-gradient(180deg,#ffffff,#f5f5f5)]

                    text-[color:var(--muted)]

                    transition-all duration-200

                    hover:border-[rgba(0,0,0,0.14)]
                    hover:text-[color:var(--foreground)]
                    hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)]

                    active:scale-[0.94]

                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  <div
                    className="
                      absolute inset-0 opacity-0 group-hover/close:opacity-100 transition
                      bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.06),transparent_70%)]
                      rounded-[14px]
                    "
                  />

                  <span
                    className="
                      relative
                      text-[13px]
                      transition-transform duration-200
                      group-hover/close:rotate-90
                    "
                  >
                    ✕
                  </span>
                </button>
              </div>

              {/* ================= BODY ================= */}
              <div
                className="
                  relative z-10

                  px-6 md:px-8
                  py-6

                  overflow-y-auto
                  max-h-[calc(100vh-210px)]
                "
              >
                <div className="space-y-3">
                  {/* ================= FORNECEDOR ================= */}
                  <section
                    className="
    relative overflow-visible

    rounded-[16px]

    border border-[rgba(0,0,0,0.07)]

    bg-[linear-gradient(180deg,#ffffff,#fafafa)]

    p-3

    shadow-[0_12px_34px_rgba(0,0,0,0.045)]
  "
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div
                        className="
        absolute inset-0 opacity-0 group-hover:opacity-100 transition
        bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.07),transparent_60%)]
      "
                      />
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-[3px] h-4 rounded-full bg-[color:var(--brand)]" />

                            <label className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                              Fornecedor
                            </label>
                          </div>

                          <p className="text-[12px] text-[color:var(--muted)]">
                            Selecione o fornecedor e a fazenda antes de
                            registrar a entrada da carga.
                          </p>
                        </div>

                        {!fornecedor && (
                          <span
                            className="
            shrink-0

            px-2.5 py-1

            rounded-full

            bg-red-50
            border border-red-100

            text-[10px]
            font-medium
            text-red-600
          "
                          >
                            obrigatório
                          </span>
                        )}
                      </div>

                      <div
                        className="
        relative

        rounded-[14px]

        border border-[color:var(--border-soft)]
        bg-[color:var(--surface-100)]

        px-4 py-3

        transition-all duration-200

        hover:border-[color:var(--border-strong)]

        focus-within:border-[color:var(--brand)]
        focus-within:shadow-[0_0_0_2px_var(--brand-soft)]
      "
                      >
                        <div
                          className="
          absolute inset-0 opacity-0 hover:opacity-100 transition pointer-events-none
          bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.07),transparent_70%)]
          rounded-[14px]
        "
                        />

                        <div className="relative z-10">
                          <FornecedorSelect
                            fornecedorSelecionadoId={fornecedor?.id}
                            onSelectFornecedor={(novoFornecedor) => {
                              selecionarFornecedor(novoFornecedor);

                              limparFazenda();
                            }}
                          />

                          {fornecedor && (
                            <div
                              className="
              mt-3

              rounded-[12px]

              border
              border-[color:var(--border-soft)]

              bg-white

              px-3
              py-2
            "
                            >
                              <p
                                className="
                text-[12px]
                font-medium

                text-[color:var(--foreground)]
              "
                              >
                                {fornecedor.nome} {fornecedor.sobrenome ?? ""}
                              </p>

                              <p
                                className="
                text-[11px]

                text-[color:var(--muted)]
              "
                              >
                                {fornecedor.telefone ?? "Sem telefone"}
                              </p>

                              {fazenda && (
                                <p
                                  className="
                  mt-1

                  text-[11px]
                  font-medium

                  text-emerald-600
                "
                                >
                                  Fazenda: {fazenda.nome}
                                </p>
                              )}
                            </div>
                          )}

                          {fornecedor && (
                            <div className="mt-4">
                              <FazendaSelect
                                fornecedorId={fornecedor.id}
                                fazendaSelecionadaId={fazenda?.id}
                                onSelectFazenda={(novaFazenda) => {
                                  selecionarFazenda(novaFazenda);
                                }}
                              />

                              {!mostrarNovaFazenda && (
                                <button
                                  type="button"
                                  onClick={() => setMostrarNovaFazenda(true)}
                                  className="
                  mt-3

                  text-[12px]
                  font-medium

                  text-[color:var(--brand)]

                  hover:underline
                "
                                >
                                  + Nova fazenda
                                </button>
                              )}

                              {mostrarNovaFazenda && (
                                <div
                                  className="
                  mt-3

                  rounded-[12px]

                  border border-[color:var(--border-soft)]

                  bg-[color:var(--surface-100)]

                  p-3
                "
                                >
                                  <FazendaForm
                                    loading={creatingFazenda}
                                    onSubmit={async (data) => {
                                      const novaFazenda = await createFazenda({
                                        fornecedorId: fornecedor.id,

                                        payload: data,
                                      });

                                      selecionarFazenda(novaFazenda);

                                      setMostrarNovaFazenda(false);
                                    }}
                                  />

                                  <button
                                    type="button"
                                    onClick={() => setMostrarNovaFazenda(false)}
                                    className="
                    mt-3

                    text-[12px]

                    text-[color:var(--muted)]

                    hover:underline
                  "
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ================= INPUTS ================= */}
                  <div className="space-y-5">
                    {/* ===================================================== */}
                    {/* IDENTIFICAÇÃO */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-visible

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      {/* CAMADA VISUAL */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div
                          className="
                            absolute inset-0 opacity-0 transition-opacity duration-300
                            group-hover:opacity-100

                            bg-[radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.06),transparent_60%)]
                          "
                        />

                        <div
                          className="
                            absolute inset-x-0 top-0 h-[1px]

                            bg-gradient-to-r
                            from-transparent
                            via-black/10
                            to-transparent
                          "
                        />
                      </div>

                      <div className="relative z-10 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-[3px] h-4 rounded-full bg-[color:var(--brand)]" />

                              <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                                Identificação da compra
                              </p>
                            </div>

                            <p className="text-[12px] leading-relaxed text-[color:var(--muted)]"></p>
                          </div>

                          <div
                            className="
                              shrink-0

                              flex items-center gap-2

                              px-2 py-[4px]

                              rounded-full

                              bg-emerald-50
                              border border-emerald-200

                              text-[10px]
                              font-medium
                              text-emerald-600
                            "
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                            <span>operação ativa</span>
                          </div>
                        </div>

                        <div
                          className="
    grid

    grid-cols-1

    md:grid-cols-[150px_220px_190px]

    gap-4
  "
                        >
                          <Input
                            label="Safra"
                            value={safra}
                            onChange={(value) => {
                              const uf = value
                                .replace(/[^a-zA-Z]/g, "")
                                .toUpperCase()
                                .slice(0, 2);

                              setSafra(uf);
                            }}
                          />

                          <Input
                            label="Data da compra"
                            value={dataCompra}
                            onChange={setDataCompra}
                            type="date"
                          />

                          <Input
                            label="Número da folha"
                            value="Gerado automaticamente"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* ===================================================== */}
                    {/* TRANSPORTE */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      {/* CAMADA VISUAL */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div
                          className="
                            absolute inset-0 opacity-0 transition-opacity duration-300
                            group-hover:opacity-100

                            bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.06),transparent_60%)]
                          "
                        />
                      </div>

                      <div className="relative z-10 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-[3px] h-4 rounded-full bg-emerald-500" />

                            <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                              Transporte
                            </p>
                          </div>

                          <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                            Controle do caminhão responsável pela coleta e
                            movimentação da carga.
                          </p>
                        </div>

                        <div
                          className="
    grid

    grid-cols-1

    md:grid-cols-[240px_180px]

    gap-3
  "
                        >
                          {/* MODELO */}
                          <div className="relative group">
                            <div
                              className="
                                relative

                                rounded-[14px]

                                border border-[color:var(--border-soft)]

                                bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                                transition-all duration-200

                                hover:border-[color:var(--border-strong)]

                                focus-within:border-[color:var(--brand)]
                                focus-within:shadow-[0_0_0_2px_var(--brand-soft)]
                              "
                            >
                              <div
                                className="
                                  absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none

                                  bg-[radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.035),transparent_60%)]
                                "
                              />

                              <label
                                className="
                                  absolute left-3 top-[8px]

                                  text-[10px]
                                  tracking-[0.16em]
                                  uppercase

                                  text-[color:var(--muted-soft)]

                                  pointer-events-none
                                "
                              >
                                Modelo do caminhão
                              </label>

                              <select
                                value={modeloCaminhao}
                                onChange={(e) =>
                                  setModeloCaminhao(
                                    e.target.value as ModeloCaminhao,
                                  )
                                }
                                className="
                                  relative z-10

                                  w-full h-[44px]

                                  px-3 pt-4

                                  rounded-[14px]

                                  bg-transparent

                                  text-[13px]
                                  font-semibold
                                  text-[color:var(--foreground)]

                                  outline-none

                                  appearance-none
                                "
                              >
                                <option value="TRUCK">Truck</option>

                                <option value="CARRETA">Carreta</option>

                                <option value="BITRUCK">Bitruck</option>
                              </select>

                              <div
                                className="
                                  absolute right-4 top-1/2 -translate-y-1/2

                                  text-[10px]
                                  text-[color:var(--muted)]

                                  pointer-events-none
                                "
                              >
                                ▾
                              </div>
                            </div>
                          </div>

                          {/* PLACA */}
                          <Input
                            label="Placa"
                            value={placa}
                            onChange={(value) => setPlaca(value.toUpperCase())}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ===================================================== */}
                    {/* PESAGEM */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      <div className="relative z-10 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-[3px] h-4 rounded-full bg-amber-500" />

                            <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                              Pesagem e carga
                            </p>
                          </div>

                          <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                            Cálculos automáticos.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <Input
                            label="KG Bruto"
                            value={kgBruto}
                            onChange={setKgBruto}
                          />

                          <Input
                            label="Qtd. Frutas"
                            value={quantidadeFrutas}
                            onChange={setQuantidadeFrutas}
                          />

                          <Input
                            label="Média fruta"
                            value={
                              calculo.mediaFruta > 0
                                ? calculo.mediaFruta.toFixed(1)
                                : ""
                            }
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* ===================================================== */}
                    {/* DESCONTO */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="w-[3px] h-4 rounded-full bg-rose-500" />

                              <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                                Política de desconto
                              </p>
                            </div>

                            <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                              Defina como o desconto técnico será aplicado na
                              carga desta operação.
                            </p>
                          </div>

                          <span
                            className="
                              shrink-0

                              px-2 py-[4px]

                              rounded-full

                              bg-emerald-50
                              border border-emerald-200

                              text-[10px]
                              font-semibold
                              text-emerald-600
                            "
                          >
                            fornecedor: {descontoFornecedor}%
                          </span>
                        </div>

                        {/* TIPO */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setTipoDesconto("AUTOMATICO_MODELO")}
                            className={`
                              group relative overflow-hidden

                              h-[48px]

                              rounded-[14px]

                              border

                              transition-all duration-300

                              ${
                                tipoDesconto === "AUTOMATICO_MODELO"
                                  ? `
                                    border-emerald-500
                                    bg-emerald-500/10
                                    text-emerald-700
                                    shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                                  `
                                  : `
                                    border-[color:var(--border-soft)]
                                    bg-[linear-gradient(180deg,#ffffff,#fafafa)]
                                    text-[color:var(--muted)]
                                  `
                              }
                            `}
                          >
                            <div
                              className="
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition

                                bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_70%)]
                              "
                            />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-semibold">
                                Automático
                              </span>

                              <span className="text-[10px] opacity-70">
                                modelo do caminhão
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTipoDesconto("PERCENTUAL")}
                            className={`
                              group relative overflow-hidden

                              h-[48px]

                              rounded-[14px]

                              border

                              transition-all duration-300

                              ${
                                tipoDesconto === "PERCENTUAL"
                                  ? `
                                    border-amber-500
                                    bg-amber-500/10
                                    text-amber-700
                                    shadow-[0_10px_30px_rgba(245,158,11,0.18)]
                                  `
                                  : `
                                    border-[color:var(--border-soft)]
                                    bg-[linear-gradient(180deg,#ffffff,#fafafa)]
                                    text-[color:var(--muted)]
                                  `
                              }
                            `}
                          >
                            <div
                              className="
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition

                                bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.08),transparent_70%)]
                              "
                            />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-semibold">
                                Percentual
                              </span>

                              <span className="text-[10px] opacity-70">
                                manual %
                              </span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTipoDesconto("MANUAL_KG")}
                            className={`
                              group relative overflow-hidden

                              h-[48px]

                              rounded-[14px]

                              border

                              transition-all duration-300

                              ${
                                tipoDesconto === "MANUAL_KG"
                                  ? `
                                    border-rose-500
                                    bg-rose-500/10
                                    text-rose-700
                                    shadow-[0_10px_30px_rgba(244,63,94,0.18)]
                                  `
                                  : `
                                    border-[color:var(--border-soft)]
                                    bg-[linear-gradient(180deg,#ffffff,#fafafa)]
                                    text-[color:var(--muted)]
                                  `
                              }
                            `}
                          >
                            <div
                              className="
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition

                                bg-[radial-gradient(circle_at_50%_0%,rgba(244,63,94,0.08),transparent_70%)]
                              "
                            />

                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <span className="text-[10px] font-semibold">
                                Manual KG
                              </span>

                              <span className="text-[10px] opacity-70">
                                desconto fixo
                              </span>
                            </div>
                          </button>
                        </div>

                        {/* INPUTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {tipoDesconto === "PERCENTUAL" && (
                            <Input
                              label="Desconto percentual"
                              value={descontoPercentualAplicado}
                              onChange={setDescontoPercentualAplicado}
                            />
                          )}

                          {tipoDesconto === "MANUAL_KG" && (
                            <Input
                              label="Desconto KG"
                              value={descontoKgManual}
                              onChange={setDescontoKgManual}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ===================================================== */}
                    {/* FINANCEIRO */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      <div className="relative z-10 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-[3px] h-4 rounded-full bg-indigo-500" />

                            <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                              Financeiro
                            </p>
                          </div>

                          <p className="text-[12px] leading-relaxed text-[color:var(--muted)]"></p>
                        </div>

                        <div
                          className="
    grid

    grid-cols-1

    md:grid-cols-[260px_260px]

    gap-4
  "
                        >
                          <Input
                            label="Preço por KG"
                            value={precoKg}
                            onChange={setPrecoKg}
                          />

                          <Input
                            label="Despesas"
                            value={despesas}
                            onChange={setDespesas}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ===================================================== */}
                    {/* OBSERVAÇÕES */}
                    {/* ===================================================== */}

                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-3

                        shadow-[0_12px_34px_rgba(0,0,0,0.045)]
                      "
                    >
                      <div className="relative z-10 space-y-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-[3px] h-4 rounded-full bg-slate-500" />

                            <label className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                              Observações
                            </label>
                          </div>

                          <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                            Informações adicionais da negociação, qualidade da
                            fruta ou carregamento.
                          </p>
                        </div>

                        <textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          className="
                            w-full min-h-[60px]

                            px-4 py-3

                            rounded-[10px]

                            border border-[color:var(--border-soft)]

                            bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                            text-[13px]
                            leading-relaxed

                            resize-none

                            transition-all duration-200

                            hover:border-[color:var(--border-strong)]

                            focus:border-[color:var(--brand)]
                            focus:shadow-[0_0_0_2px_var(--brand-soft)]

                            outline-none
                          "
                        />
                      </div>
                    </div>
                  </div>
                  {/* ================= RESULTADO ================= */}
                  <div className="space-y-3">
                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-[3px] h-4 rounded-full bg-emerald-500" />

                          <p className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--muted-soft)]">
                            Resultado operacional
                          </p>
                        </div>

                        <p className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                          Resultados e cálculos de forma automática.
                        </p>
                      </div>

                      <div
                        className="
                          hidden md:flex items-center gap-2

                          px-3 py-1.5

                          rounded-full

                          bg-emerald-50
                          border border-emerald-200

                          text-[10px]
                          font-medium
                          text-emerald-700
                        "
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                        <span>cálculo em tempo real</span>
                      </div>
                    </div>

                    {/* GRID */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                      {/* =============================================== */}
                      {/* KPIS */}
                      {/* =============================================== */}

                      <div className="xl:col-span-8">
                        <div
                          className="
    grid
    grid-cols-1
    md:grid-cols-3

    gap-5

    px-2
  "
                        >
                          <Result
                            label="KG desconto"
                            value={calculo.descontoKgCalculado}
                          />

                          <Result
                            label="KG líquido"
                            value={calculo.kgLiquido}
                          />

                          <Result
                            label="Média fruta"
                            value={calculo.mediaFruta}
                          />
                        </div>
                      </div>

                      {/* =============================================== */}
                      {/* TOTAL */}
                      {/* =============================================== */}

                      <div className="xl:col-span-4">
                        <div
                          className={`
                            group relative overflow-hidden

                            h-full min-h-[160px]

                            flex flex-col justify-between

                            rounded-[20px]

                            border

                            p-3

                            transition-all duration-500

                            ${
                              valorFinalEfetivo > 0
                                ? `
                                  bg-[linear-gradient(145deg,#064e3b,#059669,#10b981)]
                                  border-emerald-600

                                  shadow-[0_30px_90px_rgba(16,185,129,0.28)]
                                `
                                : `
                                  bg-[linear-gradient(180deg,#ffffff,#f7f7f7)]
                                  border-[color:var(--border-soft)]

                                  shadow-[0_18px_50px_rgba(0,0,0,0.05)]
                                `
                            }

                            hover:-translate-y-[2px]
                            hover:shadow-[0_38px_100px_rgba(0,0,0,0.12)]
                          `}
                        >
                          {/* =========================================== */}
                          {/* GLOW */}
                          {/* =========================================== */}

                          <div className="absolute inset-0 pointer-events-none">
                            <div
                              className="
                                absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500

                                bg-[radial-gradient(circle_at_75%_10%,rgba(255,255,255,0.22),transparent_60%)]
                              "
                            />

                            <div
                              className={`
                                absolute top-0 left-0 w-full h-[1px]

                                ${
                                  valorFinalEfetivo > 0
                                    ? "bg-white/20"
                                    : "bg-black/5"
                                }
                              `}
                            />

                            <div
                              className={`
                                absolute bottom-0 left-0 h-[3px] w-full

                                ${
                                  valorFinalEfetivo > 0
                                    ? "bg-white/25"
                                    : "bg-transparent"
                                }
                              `}
                            />
                          </div>

                          {/* =========================================== */}
                          {/* HEADER */}
                          {/* =========================================== */}

                          <div className="relative z-10 flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div
                                className={`
                                  inline-flex items-center gap-2

                                  px-2.5 py-1

                                  rounded-full

                                  border

                                  ${
                                    valorFinalEfetivo > 0
                                      ? "bg-white/10 border-white/15 text-white/80"
                                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                                  }
                                `}
                              >
                                <div
                                  className={`
                                    w-1.5 h-1.5 rounded-full

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "bg-white"
                                        : "bg-emerald-500"
                                    }
                                  `}
                                />

                                <span className="text-[10px] font-medium uppercase tracking-[0.18em]">
                                  fechamento
                                </span>
                              </div>

                              <div>
                                <p
                                  className={`
                                    text-[10px]
                                    uppercase
                                    tracking-[0.26em]

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "text-white/65"
                                        : "text-[color:var(--muted-soft)]"
                                    }
                                  `}
                                >
                                  Valor total
                                </p>

                                <p
                                  className={`
                                    mt-2

                                    text-[28px]
                                    leading-none
                                    font-semibold
                                    tracking-[-0.04em]

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "text-white"
                                        : "text-[color:var(--foreground)]"
                                    }
                                  `}
                                >
                                  {valorFinalEfetivo.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* BADGE */}
                            <div
                              className={`
                                shrink-0

                                flex flex-col items-end

                                ${
                                  valorFinalEfetivo > 0
                                    ? "text-white/70"
                                    : "text-[color:var(--muted)]"
                                }
                              `}
                            >
                              <span className="text-[10px] uppercase tracking-[0.20em]">
                                líquido
                              </span>

                              <span className="text-[12px] font-semibold mt-1">
                                operacional
                              </span>
                            </div>
                          </div>

                          {/* =========================================== */}
                          {/* DETALHAMENTO */}
                          {/* =========================================== */}

                          <div className="relative z-10 mt-6 space-y-3">
                            {/* ===================================================== */}
                            {/* EDITAR VALOR FINAL */}
                            {/* ===================================================== */}

                            <div className="space-y-3">
                              <button
                                type="button"
                                onClick={() => {
                                  //////////////////////////////////////////////////////
                                  // TOGGLE
                                  //////////////////////////////////////////////////////

                                  const next = !editarValorFinal;

                                  setEditarValorFinal(next);

                                  //////////////////////////////////////////////////////
                                  // PREENCHE AUTOMÁTICO
                                  //////////////////////////////////////////////////////

                                  if (next) {
                                    setValorTotalManual(
                                      calculo.valorTotal
                                        .toFixed(2)
                                        .replace(".", ","),
                                    );
                                  }
                                }}
                                className={`
      w-full

      h-[42px]

      rounded-[12px]

      border

      text-[12px]
      font-semibold

      transition-all duration-300

      ${
        editarValorFinal
          ? `
            border-amber-400
            bg-amber-500/10
            text-amber-700
          `
          : `
            border-white/10
            bg-white/5
            text-white/80
          `
      }
    `}
                              >
                                {editarValorFinal
                                  ? "Valor manual ativo"
                                  : "Editar valor final"}
                              </button>

                              {editarValorFinal && (
                                <Input
                                  label="Valor final manual"
                                  value={valorTotalManual}
                                  onChange={setValorTotalManual}
                                />
                              )}
                            </div>
                            <div
                              className={`
                                flex items-center justify-between

                                text-[12px]

                                ${
                                  valorFinalEfetivo > 0
                                    ? "text-white/85"
                                    : "text-[color:var(--foreground)]"
                                }
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`
                                    w-2 h-2 rounded-full

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "bg-white/70"
                                        : "bg-emerald-500"
                                    }
                                  `}
                                />

                                <span className="opacity-80">Total bruto</span>
                              </div>

                              <span className="font-semibold">
                                {calculo.totalBruto.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>

                            <div
                              className={`
                                flex items-center justify-between

                                text-[12px]

                                ${
                                  valorFinalEfetivo > 0
                                    ? "text-white/85"
                                    : "text-[color:var(--foreground)]"
                                }
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`
                                    w-2 h-2 rounded-full

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "bg-white/50"
                                        : "bg-amber-500"
                                    }
                                  `}
                                />

                                <span className="opacity-80">
                                  Despesas operacionais
                                </span>
                              </div>

                              <span className="font-semibold">
                                {parsed.despesas.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>

                            <div
                              className={`
                                mt-4 pt-4

                                border-t

                                ${
                                  valorFinalEfetivo > 0
                                    ? "border-white/15"
                                    : "border-[color:var(--border-soft)]"
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`
                                    text-[10px]
                                    uppercase
                                    tracking-[0.20em]

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "text-white/65"
                                        : "text-[color:var(--muted-soft)]"
                                    }
                                  `}
                                >
                                  Resultado final
                                </span>

                                <span
                                  className={`
                                    text-[15px]
                                    font-semibold

                                    ${
                                      valorFinalEfetivo > 0
                                        ? "text-white"
                                        : "text-emerald-600"
                                    }
                                  `}
                                >
                                  operação consolidada
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ================= AÇÃO ================= */}
                  <div
                    className="
                      sticky bottom-0 z-20

                      pt-4

                      bg-[linear-gradient(180deg,rgba(255,255,255,0),#ffffff_34%)]

                      border-t border-transparent
                    "
                  >
                    <div
                      className="
                        relative overflow-hidden

                        rounded-[16px]

                        border border-[rgba(0,0,0,0.07)]

                        bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                        p-4

                        shadow-[0_-10px_34px_rgba(0,0,0,0.05)]
                      "
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[12px] font-semibold text-[color:var(--foreground)]">
                            Finalizar lançamento da compra
                          </p>

                          <p className="text-[10px] leading-relaxed text-[color:var(--muted)]">
                            A operação será registrada, o financeiro será
                            atualizado e o estoque receberá a entrada
                            automaticamente.
                          </p>
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={
                            creating || !isValid || !fornecedor || !fazenda
                          }
                          className={`
                            group relative overflow-visible

                            w-full md:w-[260px]
                            h-[40px]

                            rounded-[12px]

                            text-[13.5px]
                            font-semibold
                            tracking-tight

                            transition-all duration-300

                            ${
                              creating
                                ? `
                                  bg-[color:var(--surface-300)]
                                  text-[color:var(--muted)]
                                  cursor-not-allowed
                                `
                                : isValid && fornecedor && fazenda
                                  ? `
                                    bg-[linear-gradient(135deg,var(--brand),var(--brand-strong))]
                                    text-white

                                    shadow-[0_14px_40px_rgba(0,0,0,0.24)]

                                    hover:-translate-y-[1px]
                                    hover:shadow-[0_20px_60px_rgba(0,0,0,0.34)]

                                    active:scale-[0.98]
                                  `
                                  : `
                                    bg-[color:var(--surface-200)]
                                    text-[color:var(--muted-soft)]
                                    cursor-not-allowed
                                  `
                            }
                          `}
                        >
                          {/* GLOW */}
                          <div
                            className="
                              absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
                              bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.22),transparent_70%)]
                            "
                          />

                          {/* SHINE */}
                          <div
                            className={`
                              absolute inset-0

                              ${
                                isValid && fornecedor && fazenda && !creating
                                  ? "opacity-0 group-hover:opacity-100"
                                  : "opacity-0"
                              }

                              transition duration-500
                              bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]
                              translate-x-[-100%] group-hover:translate-x-[100%]
                            `}
                          />

                          <span className="relative flex items-center justify-center gap-2">
                            {creating && (
                              <span
                                className="
                                  w-4 h-4
                                  border-2 border-white/40
                                  border-t-white
                                  rounded-full
                                  animate-spin
                                "
                              />
                            )}

                            <span>
                              {creating
                                ? "Salvando compra..."
                                : "Salvar compra"}
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ========================================================= */
/* FORMAT */
/* ========================================================= */

function formatBR(value: string): string {
  if (!value) {
    return "";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return value;
  }

  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/* ========================================================= */
/* INPUT */
/* ========================================================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;

  value: string;

  onChange?: (value: string) => void;

  placeholder?: string;

  disabled?: boolean;

  type?: "text" | "date";
}) {
  ////////////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////////////

  const hasValue = value !== "";

  ////////////////////////////////////////////////////////////
  // FIELD TYPE
  ////////////////////////////////////////////////////////////

  const normalizedLabel = label.toLowerCase();

  const isMoneyField =
    normalizedLabel.includes("valor") ||
    normalizedLabel.includes("r$") ||
    normalizedLabel.includes("preço") ||
    normalizedLabel.includes("despesa");

  ////////////////////////////////////////////////////////////
  // DECIMAL
  ////////////////////////////////////////////////////////////

  const isDecimalField = isMoneyField;

  ////////////////////////////////////////////////////////////
  // INTEGER
  ////////////////////////////////////////////////////////////

  const isIntegerField =
    !isDecimalField &&
    (normalizedLabel.includes("kg") ||
      normalizedLabel.includes("qtd") ||
      normalizedLabel.includes("quantidade") ||
      normalizedLabel.includes("média") ||
      normalizedLabel.includes("desconto") ||
      normalizedLabel.includes("folha") ||
      normalizedLabel.includes("caminhões"));

  ////////////////////////////////////////////////////////////
  // NUMERIC
  ////////////////////////////////////////////////////////////

  const isNumericField = isDecimalField || isIntegerField;

  ////////////////////////////////////////////////////////////
  // DISPLAY VALUE
  ////////////////////////////////////////////////////////////

  const displayValue =
    type === "date" ? value : isNumericField ? formatBR(value) : value;

  ////////////////////////////////////////////////////////////
  // CHANGE
  ////////////////////////////////////////////////////////////

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!onChange) {
      return;
    }

    let raw = event.target.value;

    //////////////////////////////////////////////////////////
    // DATE
    //////////////////////////////////////////////////////////

    if (type === "date") {
      onChange(raw);

      return;
    }

    ////////////////////////////////////////////////////////////
    // INTEGER
    ////////////////////////////////////////////////////////////

    if (isIntegerField) {
      raw = raw.replace(/\D/g, "");

      onChange(raw);

      return;
    }

    ////////////////////////////////////////////////////////////
    // DECIMAL
    ////////////////////////////////////////////////////////////

    if (isDecimalField) {
      //////////////////////////////////////////////////////////
      // REMOVE CARACTERES INVÁLIDOS
      //////////////////////////////////////////////////////////

      raw = raw.replace(/[^\d,]/g, "");

      //////////////////////////////////////////////////////////
      // APENAS UMA VÍRGULA
      //////////////////////////////////////////////////////////

      const commaParts = raw.split(",");

      if (commaParts.length > 2) {
        raw =
          commaParts[0] + "," + commaParts.slice(1).join("").replace(/,/g, "");
      }

      //////////////////////////////////////////////////////////
      // LIMITA CASAS DECIMAIS
      //////////////////////////////////////////////////////////

      if (raw.includes(",")) {
        const [integer, decimal] = raw.split(",");

        raw = `${integer},${decimal.slice(0, 2)}`;
      }

      //////////////////////////////////////////////////////////
      // UPDATE
      //////////////////////////////////////////////////////////

      onChange(raw);

      return;
    }

    //////////////////////////////////////////////////////////
    // TEXT
    //////////////////////////////////////////////////////////

    onChange(raw);
  }

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div className="relative group">
      <div
        className={`
          relative overflow-visible

          rounded-[14px]

          border

          transition-all duration-300

          ${
            disabled
              ? `
                opacity-70

                border-[color:var(--border-soft)]
                bg-[linear-gradient(180deg,#f7f7f7,#f1f1f1)]
              `
              : hasValue
                ? `
                  border-emerald-300

                  bg-[linear-gradient(180deg,#f0fdf4,#ecfdf5)]

                  shadow-[0_12px_34px_rgba(16,185,129,0.10)]
                `
                : `
                  border-[color:var(--border-soft)]

                  bg-[linear-gradient(180deg,#ffffff,#fafafa)]

                  shadow-[0_8px_26px_rgba(0,0,0,0.04)]
                `
          }

          hover:border-[color:var(--border-strong)]
          hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]

          focus-within:border-[color:var(--brand)]
          focus-within:shadow-[0_0_0_2px_var(--brand-soft)]

          group-hover:-translate-y-[1px]
        `}
      >
        {/* ================================================= */}
        {/* TOP LIGHT */}
        {/* ================================================= */}

        <div
          className="
            absolute top-0 left-0 w-full h-[1px]

            bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)]
          "
        />

        {/* ================================================= */}
        {/* GLOW */}
        {/* ================================================= */}

        <div
          className="
            absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none

            bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.07),transparent_60%)]
          "
        />

        {/* ================================================= */}
        {/* MONEY PREFIX */}
        {/* ================================================= */}

        {isMoneyField && (
          <span
            className="
              absolute left-4 top-[23px]

              text-[10px]
              font-semibold

              text-emerald-600

              pointer-events-none
            "
          >
            R$
          </span>
        )}

        {/* ================================================= */}
        {/* INPUT */}
        {/* ================================================= */}

        <input
          type={type}
          value={displayValue}
          disabled={disabled}
          placeholder={placeholder ?? " "}
          inputMode={
            isNumericField ? "decimal" : isIntegerField ? "numeric" : undefined
          }
          onChange={handleChange}
          className={`
            peer

            w-full

            ${isMoneyField ? "pl-10 pr-4" : "px-4"}

            pt-5 pb-2

            rounded-[14px]

            bg-transparent

            text-[13px]
            font-semibold
            tracking-[-0.01em]

            text-[color:var(--foreground)]

            outline-none

            disabled:cursor-not-allowed
          `}
        />

        {/* ================================================= */}
        {/* LABEL */}
        {/* ================================================= */}

        <label
          className={`
            absolute

            ${isMoneyField ? "left-10" : "left-4"}

            text-[10px]

            tracking-[0.18em]

            uppercase

            transition-all duration-200

            pointer-events-none

            ${
              hasValue || type === "date"
                ? `
                  top-[6px]

                  text-emerald-600
                `
                : `
                  top-1/2
                  -translate-y-1/2

                  text-[color:var(--muted-soft)]
                `
            }

            peer-focus:top-[6px]
            peer-focus:-translate-y-0
            peer-focus:text-[color:var(--brand)]
          `}
        >
          {label}
        </label>

        {/* ================================================= */}
        {/* STATUS DOT */}
        {/* ================================================= */}

        <div
          className={`
            absolute right-4 top-1/2 -translate-y-1/2

            w-[7px] h-[7px]

            rounded-full

            transition-all duration-300

            ${
              hasValue
                ? `
                  bg-emerald-500

                  opacity-100
                  scale-100

                  shadow-[0_0_10px_rgba(16,185,129,0.45)]
                `
                : `
                  opacity-0
                  scale-50
                `
            }

            group-hover:scale-125
          `}
        />

        {/* ================================================= */}
        {/* BOTTOM LINE */}
        {/* ================================================= */}

        <div
          className={`
            absolute bottom-0 left-0 h-[2px]

            transition-all duration-300

            ${
              hasValue
                ? `
                  w-full

                  bg-[linear-gradient(90deg,#10b981,#34d399)]
                `
                : `
                  w-0
                  bg-transparent
                `
            }
          `}
        />
      </div>
    </div>
  );
}
/* ========================================================= */
/* RESULT */
/* ========================================================= */

function Result({
  label,
  value,
  variant = "default",
}: {
  label: string;

  value: number;

  variant?: "default" | "success" | "danger";
}) {
  ////////////////////////////////////////////////////////////
  // STATES
  ////////////////////////////////////////////////////////////

  const hasValue = Math.abs(value) > 0;

  ////////////////////////////////////////////////////////////
  // FORMAT
  ////////////////////////////////////////////////////////////

  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  ////////////////////////////////////////////////////////////
  // COLORS
  ////////////////////////////////////////////////////////////

  const isDanger = variant === "danger";

  const isSuccess = variant === "success";

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  return (
    <div
      className={`
        group relative overflow-hidden

        min-h-[80px]

        p-4

        rounded-[14px]

        border

        transition-all duration-300

        ${
          hasValue
            ? isDanger
              ? `
                border-red-200

                bg-[linear-gradient(135deg,#fef2f2,#fff5f5)]

                shadow-[0_16px_40px_rgba(239,68,68,0.10)]
              `
              : `
                border-emerald-200

                bg-[linear-gradient(135deg,#ecfdf5,#f0fdf4)]

                shadow-[0_16px_40px_rgba(16,185,129,0.10)]
              `
            : `
              border-[color:var(--border-soft)]

              bg-[linear-gradient(180deg,#ffffff,#fafafa)]
            `
        }

        hover:border-[color:var(--border-strong)]

        hover:translate-y-[-2px]

        hover:shadow-[0_22px_60px_rgba(0,0,0,0.08)]
      `}
    >
      {/* ================================================= */}
      {/* LEFT ACCENT */}
      {/* ================================================= */}

      <div
        className={`
          absolute left-0 top-0 h-full w-[4px]

          transition-all duration-300

          ${
            hasValue
              ? isDanger
                ? "bg-red-500 opacity-100"
                : "bg-emerald-500 opacity-100"
              : "bg-transparent opacity-0"
          }
        `}
      />

      {/* ================================================= */}
      {/* GLOW */}
      {/* ================================================= */}

      <div
        className={`
          absolute inset-0

          opacity-0 group-hover:opacity-100

          transition duration-300

          pointer-events-none

          ${
            hasValue
              ? isDanger
                ? `
                  bg-[radial-gradient(circle_at_85%_15%,rgba(239,68,68,0.12),transparent_60%)]
                `
                : `
                  bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.12),transparent_60%)]
                `
              : `
                bg-[radial-gradient(circle_at_85%_15%,rgba(0,0,0,0.04),transparent_60%)]
              `
          }
        `}
      />

      {/* ================================================= */}
      {/* CONTENT */}
      {/* ================================================= */}

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* TOP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span
              className="
                text-[10px]
                uppercase
                tracking-[0.24em]

                text-[color:var(--muted-soft)]
              "
            >
              {label}
            </span>

            {hasValue && (
              <div
                className={`
                  flex items-center gap-1.5

                  px-2 py-[4px]

                  rounded-full

                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]

                  ${
                    isDanger
                      ? `
                        bg-red-100
                        text-red-600
                      `
                      : `
                        bg-emerald-100
                        text-emerald-700
                      `
                  }
                `}
              >
                <span
                  className={`
                    w-[5px] h-[5px]

                    rounded-full

                    animate-pulse

                    ${isDanger ? "bg-red-500" : "bg-emerald-500"}
                  `}
                />
                ativo
              </div>
            )}
          </div>

          <div
            className={`
              text-[24px]
              font-semibold
              tracking-[-0.03em]
              leading-none

              ${
                hasValue
                  ? isDanger
                    ? "text-red-600"
                    : "text-emerald-600"
                  : "text-[color:var(--muted)]"
              }
            `}
          >
            {formatted}
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-4">
          {hasValue ? (
            <div
              className={`
                inline-flex items-center gap-1.5

                text-[10px]
                font-medium

                ${isDanger ? "text-red-600/80" : "text-emerald-600/80"}
              `}
            >
              <span
                className={`
                  w-[4px] h-[4px]

                  rounded-full

                  ${isDanger ? "bg-red-500" : "bg-emerald-500"}
                `}
              />
              cálculo atualizado em tempo real
            </div>
          ) : (
            <div className="text-[10px] text-[color:var(--muted-soft)]">
              aguardando preenchimento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
