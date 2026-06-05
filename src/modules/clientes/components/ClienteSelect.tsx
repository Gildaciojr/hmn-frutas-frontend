"use client";

import { useState, useMemo, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { useQuery } from "@tanstack/react-query";

import { useClienteStore } from "../store/useClienteStore";

import { getClientes, type Cliente } from "../services/clientes.service";

export function ClienteSelect() {
  const selecionarCliente = useClienteStore((state) => state.selecionarCliente);

  const limparSelecionado = useClienteStore((state) => state.limparSelecionado);

  const clienteSelecionado = useClienteStore(
    (state) => state.clienteSelecionado,
  );

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ["clientes"],

    queryFn: getClientes,

    staleTime: 1000 * 15,

    refetchOnWindowFocus: false,
  });

  const [busca, setBusca] = useState("");

  const [open, setOpen] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ================= SINCRONIZAÇÃO =================
  useEffect(() => {
    if (!clienteSelecionado) {
      return;
    }

    if (!clientes.length) {
      return;
    }

    const existeNaBase = clientes.some(
      (cliente) => cliente.id === clienteSelecionado.id,
    );

    if (!existeNaBase) {
      limparSelecionado();
    }
  }, [clientes, clienteSelecionado, limparSelecionado]);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ================= FILTRO =================
  const filtrados = useMemo(() => {
    const normalizedBusca = busca
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    return clientes.filter((cliente) => {
      const nomeNormalizado = (cliente.nome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const proprietarioNormalizado = (cliente.proprietarioNome || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const fantasiaNormalizado = (cliente.nomeFantasia || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      const telefoneNormalizado = (cliente.telefone || "")
        .replace(/\D/g, "")
        .toLowerCase();

      const buscaTelefone = normalizedBusca.replace(/\D/g, "");

      const matchNome =
        normalizedBusca.length > 0 && nomeNormalizado.includes(normalizedBusca);

      const matchProprietario =
        normalizedBusca.length > 0 &&
        proprietarioNormalizado.includes(normalizedBusca);

      const matchFantasia =
        normalizedBusca.length > 0 &&
        fantasiaNormalizado.includes(normalizedBusca);

      const matchTelefone =
        buscaTelefone.length > 0 && telefoneNormalizado.includes(buscaTelefone);

      return matchNome || matchProprietario || matchFantasia || matchTelefone;
    });
  }, [clientes, busca]);

  // ================= SAFE INDEX =================
  const safeActiveIndex =
    filtrados.length === 0 ? 0 : Math.min(activeIndex, filtrados.length - 1);

  useEffect(() => {
    const activeElement = itemRefs.current[safeActiveIndex];

    if (activeElement) {
      activeElement.scrollIntoView({
        block: "nearest",
      });
    }
  }, [safeActiveIndex]);

  // ================= SELECT =================

  function handleSelect(cliente: Cliente) {
    selecionarCliente(cliente);

    setBusca("");

    setOpen(false);

    inputRef.current?.blur();

    setActiveIndex(0);
  }
  return (
    <div ref={containerRef} className="relative space-y-2">
      {/* INPUT */}
      <div
        className="
        relative
        rounded-[var(--radius-md)]
        border border-[color:var(--border-soft)]
        bg-[color:var(--surface-100)]

        px-3 py-2

        transition-all
        focus-within:border-[color:var(--brand)]
        focus-within:ring-1 focus-within:ring-[rgba(99,102,241,0.15)]
      "
      >
        {/* CLIENTE SELECIONADO */}
        {clienteSelecionado && !open && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[13px] font-medium truncate">
              {clienteSelecionado.nome}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[color:var(--muted-soft)]">
                {clienteSelecionado.descontoPercentual}% desc.
              </span>

              <button
                onClick={() => {
                  limparSelecionado();
                  setBusca("");
                  setOpen(true);
                }}
                className="
                text-[11px]
                px-2 py-[2px]
                rounded
                border border-[color:var(--border-soft)]
                hover:bg-[color:var(--surface-200)]
                transition
              "
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* INPUT */}
        <input
          ref={inputRef}
          value={busca}
          disabled={!!clienteSelecionado && !open}
          onChange={(e) => {
            const value = e.target.value;

            setBusca(value);

            if (!open) setOpen(true);
            if (activeIndex !== 0) setActiveIndex(0);
          }}
          onFocus={() => {
            if (!open) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) =>
                Math.min(prev + 1, filtrados.length - 1),
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) => Math.max(prev - 1, 0));
            }

            if (e.key === "Enter") {
              e.preventDefault();

              const cliente = filtrados[safeActiveIndex];

              if (cliente) {
                handleSelect(cliente);
                return;
              }

              if (busca.length >= 2) {
                setOpen(false);
              }
            }

            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={
            clienteSelecionado && !open ? "" : "Buscar ou criar cliente..."
          }
          className={`
          w-full bg-transparent outline-none min-w-0
          text-[13px]
          placeholder:text-[color:var(--muted-soft)]

          ${clienteSelecionado && !open ? "cursor-default" : ""}
        `}
        />
      </div>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={{
              duration: 0.18,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              absolute

              left-0 right-0
              top-[calc(100%+10px)]

              z-[120]

              rounded-[14px]

              border border-[rgba(15,23,42,0.08)]

              bg-[rgba(255,255,255,0.995)]

              backdrop-blur-sm

              shadow-[0_12px_28px_rgba(15,23,42,0.10)]

              overflow-hidden
              isolate
            "
            style={{
              width: "100%",
            }}
          >
            {/* FX */}
            <div className="absolute inset-0 pointer-events-none">
              {/* GLOW */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.04),transparent_60%)]" />
            </div>
            {/* LISTA */}
            <div
              className="
    relative z-30

    flex
    md:flex
    items-center

    max-h-[65dvh]

    overflow-y-auto
    overflow-x-hidden
    overscroll-contain

    p-1

    scrollbar-thin
  "
            >
              {filtrados.map((cliente, i) => {
                const active = i === safeActiveIndex;

                const movimentado = 0;

                const possuiPendencia = false;

                const clienteEmpresa =
                  cliente.tipoCliente === "PESSOA_JURIDICA";

                const cidadeEstado = [cliente.cidade, cliente.estado]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <motion.div
                    key={cliente.id}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    onClick={() => handleSelect(cliente)}
                    onMouseEnter={() => setActiveIndex(i)}
                    transition={{ duration: 0.14 }}
                    className={`
    group/item

    relative overflow-hidden

    mb-1

    px-3 py-2.5

    rounded-[12px]

    flex
    items-center
    justify-between

    gap-4

    cursor-pointer

    transition-all
    duration-200

    ${
      active
        ? `
          bg-[color:var(--brand)]

          text-white

          shadow-[0_8px_18px_rgba(99,102,241,0.18)]
        `
        : `
          text-[color:var(--foreground)]

          hover:bg-[color:var(--surface-200)]
        `
    }
  `}
                  >
                    {/* BG FX */}
                    {active && (
                      <div className="absolute inset-0 opacity-40 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.25),transparent_60%)]" />
                      </div>
                    )}

                    {/* ================================================= */}
                    {/* ESQUERDA */}
                    {/* ================================================= */}

                    <div className="relative flex items-center gap-3 min-w-0">
                      {/* AVATAR */}
                      <div
                        className={`
                          w-9 h-9

                          rounded-xl

                          flex
                          items-center
                          justify-center

                          shrink-0

                          text-[13px]
                          font-semibold

                          border

                          transition-all
                          duration-200

                          ${
                            active
                              ? `
                                bg-white/15
                                border-white/10
                                text-white
                              `
                              : possuiPendencia
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

                      {/* INFO */}
                      <div className="min-w-0 flex flex-col gap-1">
                        {/* NOME */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="truncate text-[13px] font-semibold tracking-tight">
                            {cliente.nome}
                          </p>

                          {/* STATUS */}
                          <span
                            className={`
                              px-1.5 py-[2px]

                              rounded-full

                              text-[9px]
                              font-semibold

                              uppercase
                              tracking-[0.12em]

                              ${
                                active
                                  ? `
                                    bg-white/15
                                    text-white
                                  `
                                  : possuiPendencia
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
                            {possuiPendencia ? "Pendente" : "Ativo"}
                          </span>
                        </div>

                        {/* TELEFONE */}
                        <p
                          className={`
                            text-[11px]

                            truncate

                            ${
                              active
                                ? "text-white/70"
                                : "text-[color:var(--muted)]"
                            }
                          `}
                        >
                          {cliente.telefone || "Sem telefone"}
                        </p>
                        {cidadeEstado && (
                          <p
                            className={`
      text-[10px]

      ${active ? "text-white/60" : "text-[color:var(--muted-soft)]"}
    `}
                          >
                            {cidadeEstado}
                          </p>
                        )}

                        {/* BADGES */}
                        <div className="flex items-center gap-2 flex-wrap pt-0.5">
                          {/* KG */}
                          <span
                            className={`
                              px-2 py-[3px]

                              rounded-lg

                              text-[10px]
                              font-medium

                              ${
                                active
                                  ? `
                                    bg-white/10
                                    text-white
                                  `
                                  : `
                                    bg-[color:var(--surface-100)]

                                    border border-[color:var(--border-soft)]

                                    text-[color:var(--muted)]
                                  `
                              }
                            `}
                          >
                            {clienteEmpresa ? "PJ" : "PF"}
                          </span>

                          {/* PAGO */}
                          <span
                            className={`
                              px-2 py-[3px]

                              rounded-lg

                              text-[10px]
                              font-medium

                              ${
                                active
                                  ? `
                                    bg-white/10
                                    text-white
                                  `
                                  : `
                                    bg-emerald-50

                                    border border-emerald-200

                                    text-emerald-700
                                  `
                              }
                            `}
                          >
                            Pago
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* DIREITA */}
                    {/* ================================================= */}

                    <div className="relative flex flex-col items-end gap-1 shrink-0">
                      {/* SALDO */}
                      <div className="text-right">
                        <p
                          className={`
                            text-[10px]

                            uppercase
                            tracking-[0.12em]

                            ${
                              active
                                ? "text-white/60"
                                : "text-[color:var(--muted-soft)]"
                            }
                          `}
                        >
                          Tipo
                        </p>

                        <p
                          className={`
    text-[12px]
    font-semibold

    tracking-tight

    ${active ? "text-white" : "text-emerald-600"}
  `}
                        >
                          {clienteEmpresa ? "Empresa" : "Cliente"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* CREATE */}
              {!filtrados.length && !isLoading && busca.length >= 2 && (
                <div className="p-3">
                  <div
                    className="
                      relative overflow-hidden

                      rounded-[14px]

                      border border-dashed border-[color:var(--border-soft)]

                      bg-[linear-gradient(135deg,#ffffff,#f8fafc)]

                      px-4 py-4

                      shadow-[0_10px_24px_rgba(0,0,0,0.04)]
                    "
                  >
                    <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* ESQUERDA */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="
                              w-9 h-9

                              rounded-xl

                              flex
                              items-center
                              justify-center

                              bg-[color:var(--brand)]

                              text-white

                              shadow-[0_10px_24px_rgba(99,102,241,0.28)]
                            "
                          >
                            +
                          </div>

                          <div>
                            <p className="text-[13px] font-semibold tracking-tight text-[color:var(--foreground)]">
                              Cliente não encontrado
                            </p>

                            <p className="text-[11px] text-[color:var(--muted)]">
                              Cadastre um novo cliente no ERP
                            </p>
                          </div>
                        </div>

                        {/* NOME */}
                        <div
                          className="
                            inline-flex

                            px-3 py-1.5

                            rounded-full

                            border border-[color:var(--border-soft)]

                            bg-white

                            text-[11px]
                            font-medium

                            text-[color:var(--foreground)]
                          "
                        >
                          {busca}
                        </div>
                      </div>

                      {/* DIREITA */}
                      <button
                        onClick={() => {
                          setOpen(false);
                        }}
                        className="
                          w-full

                          sm:w-auto
                          
                          shrink-0

                          px-3 py-2

                          rounded-[12px]

                          text-[12px]
                          font-semibold

                          bg-[color:var(--brand)]
                          text-white

                          shadow-[0_12px_28px_rgba(99,102,241,0.28)]

                          transition-all
                          duration-200

                          hover:shadow-[0_18px_40px_rgba(99,102,241,0.36)]
                        "
                      >
                        Novo cliente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* EMPTY */}
              {!filtrados.length && !isLoading && busca.length < 2 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-[12px] text-[color:var(--muted)]">
                    Digite ao menos 2 caracteres
                  </p>
                </div>
              )}

              {/* LOADING */}
              {isLoading && (
                <div className="px-4 py-8 text-center">
                  <p className="text-[12px] text-[color:var(--muted)]">
                    Carregando clientes...
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
