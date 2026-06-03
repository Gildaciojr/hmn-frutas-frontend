"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import { ArrowRight, Plus } from "lucide-react";

import { FornecedorForm } from "./FornecedorForm";

import { useCreateFazenda, useFornecedores } from "../hooks/useFornecedores";

export function NovoFornecedorCard() {
  const [open, setOpen] = useState(false);

  const { createFornecedor, creating } = useFornecedores();

  const { createFazenda } = useCreateFazenda();

  async function handleCreateFornecedor(data: {
    nome: string;
    sobrenome?: string;
    telefone?: string;
    estado?: string;
    observacoes?: string;

    criarFazenda?: boolean;

    nomeFazenda?: string;
    cidadeFazenda?: string;
    estadoFazenda?: string;
  }) {
    const fornecedor = await createFornecedor({
      nome: data.nome,
      sobrenome: data.sobrenome,
      telefone: data.telefone,
      estado: data.estado,
      observacoes: data.observacoes,
    });

    if (data.criarFazenda && data.nomeFazenda?.trim()) {
      await createFazenda({
        fornecedorId: fornecedor.id,
        payload: {
          nome: data.nomeFazenda.trim(),
          cidade: data.cidadeFazenda?.trim(),
          estado: data.estadoFazenda?.trim().toUpperCase(),
        },
      });
    }

    setOpen(false);
  }

  return (
    <>
      {/* ====================================================== */}
      {/* CARD */}
      {/* ====================================================== */}

      <motion.div
        whileHover={{
          y: -4,
        }}
        transition={{
          duration: 0.22,
        }}
        className="
          group
          relative

          overflow-hidden

          rounded-[26px]

          border
          border-emerald-200/40

          bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(236,253,245,0.92))]

          px-4
          
          sm:px-5

          py-3

          shadow-[0_14px_45px_rgba(16,185,129,0.08)]

          backdrop-blur-xl
        "
      >
        {/* ================================================ */}
        {/* GLOW */}
        {/* ================================================ */}

        <div
          className="
            absolute

            top-[-40px]
            right-[-40px]

            w-[120px]
            h-[120px]

            rounded-full

            bg-emerald-400/12

            blur-[60px]

            transition-all
            duration-500

            group-hover:bg-emerald-400/18
          "
        />

        {/* ================================================ */}
        {/* GRID */}
        {/* ================================================ */}

        <div
          className="
            absolute inset-0

            opacity-[0.03]

            bg-[linear-gradient(rgba(0,0,0,0.4)_1px,transparent_1px),
                linear-gradient(90deg,rgba(0,0,0,0.4)_1px,transparent_1px)]

            bg-[size:24px_24px]
          "
        />

        {/* ================================================ */}
        {/* BORDER LIGHT */}
        {/* ================================================ */}

        <div
          className="
            absolute inset-0

            rounded-[32px]

            ring-1
            ring-white/40

            pointer-events-none
          "
        />

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div className="relative z-10">
          {/* TAG */}

          <div
            className="
              inline-flex

              items-center

              gap-2

              rounded-full

              border
              border-emerald-300/40

              bg-emerald-400/10

              px-2
              py-1

              text-[10px]
              font-semibold

              uppercase
              tracking-[0.18em]

              text-emerald-700
            "
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Cadastro
          </div>

          {/* INFO */}

          <div className="mt-3 flex items-start gap-3">
            {/* ICON */}

            <div className="relative">
              {/* GLOW */}

              <div
                className="
                  absolute inset-0

                  rounded-[22px]

                  bg-emerald-400/20

                  blur-xl
                "
              />

              {/* ICON BOX */}

              <div
                className="
                  relative

                  flex

                  h-11
                  w-11

                  md:h-10
                  md:w-10

                  items-center
                  justify-center

                  rounded-[16px]

                  border
                  border-emerald-200/50

                  bg-[linear-gradient(180deg,rgba(16,185,129,0.20),rgba(5,150,105,0.16))]

                  shadow-[0_12px_28px_rgba(16,185,129,0.14)]
                "
              >
                <Plus size={18} className="text-emerald-700" />
              </div>
            </div>

            {/* TEXT */}

            <div className="flex-1">
              <h3
                className="
                  text-[20px]

                  sm:text-[18px]

                  font-semibold

                  tracking-[-0.03em]

                  text-[color:var(--foreground)]
                "
              >
                Novo Fornecedor
              </h3>
            </div>
          </div>

          {/* CTA */}

          <motion.button
            whileTap={{
              scale: 0.985,
            }}
            onClick={() => setOpen(true)}
            className="
              group/button
              relative

              mt-4

              w-full

              overflow-hidden

              rounded-[20px]

              border
              border-emerald-300/40

              bg-[linear-gradient(135deg,#10b981,#059669)]

              py-3

              text-[14px]
              font-semibold

              text-white

              shadow-[0_14px_35px_rgba(16,185,129,0.22)]

              transition-all
              duration-300

              hover:shadow-[0_18px_45px_rgba(16,185,129,0.32)]
            "
          >
            {/* LIGHT FX */}

            <div
              className="
                absolute inset-0

                opacity-0

                bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)]

                translate-x-[-120%]

                transition-all
                duration-700

                group-hover/button:translate-x-[120%]
                group-hover/button:opacity-100
              "
            />

            {/* CONTENT */}

            <div
              className="
                relative z-10

                flex
                items-center
                justify-center

                gap-2
              "
            >
              Novo Fornecedor
              <ArrowRight
                size={16}
                className="
                  transition-transform
                  duration-300

                  group-hover/button:translate-x-1
                "
              />
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* ====================================================== */}
      {/* MODAL */}
      {/* ====================================================== */}

      {open && (
        <div
          className="
            fixed
            inset-0

            z-[999]

            bg-[rgba(15,23,42,0.52)]

            backdrop-blur-[6px]

            flex

            items-center
            md:items-center

            justify-center

            overflow-y-auto

            p-2
            sm:p-3
          "
        >
          <div
            className="
              relative

              overflow-y-auto
              overflow-x-hidden

              w-full

              max-w-[680px]

              max-h-[95vh]

              rounded-[32px]

              border
              border-emerald-200/40

              bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(236,253,245,0.94))]

              p-4

              sm:p-6

              shadow-[0_30px_90px_rgba(16,185,129,0.12)]

              backdrop-blur-xl
            "
          >
            {/* ============================================== */}
            {/* FX */}
            {/* ============================================== */}

            <div
              className="
                absolute

                top-[-80px]
                right-[-80px]

                w-[140px]
                h-[140px]

                md:w-[240px]
                md:h-[240px]

                rounded-full

                bg-emerald-400/10

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

            {/* ============================================== */}
            {/* HEADER */}
            {/* ============================================== */}

            <div className="relative z-10 mb-5">
              <div
                className="
                  inline-flex

                  items-center

                  gap-2

                  rounded-full

                  border
                  border-emerald-300/40

                  bg-emerald-400/10

                  px-3
                  py-1.5

                  text-[10px]
                  font-semibold

                  uppercase
                  tracking-[0.18em]

                  text-emerald-700
                "
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Cadastro
              </div>

              <h2
                className="
                  mt-3

                  text-[22px]

                  sm:text-[28px]

                  font-semibold

                  tracking-[-0.04em]

                  text-[color:var(--foreground)]
                "
              >
                Novo Fornecedor
              </h2>

              <p
                className="
                  mt-2

                  text-[14px]

                  leading-snug

                  text-[color:var(--muted)]
                "
              >
                Configure fornecedores e fazendas.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
    absolute

    top-0
    right-0

    h-11
    w-11

    md:h-10
    md:w-10

    rounded-xl

    border
    border-[color:var(--border-soft)]

    bg-white/70

    flex
    items-center
    justify-center

    transition-all
    duration-200

    hover:bg-white
  "
              >
                ✕
              </button>
            </div>

            {/* ============================================== */}
            {/* FORM */}
            {/* ============================================== */}

            <div className="relative z-10">
              <FornecedorForm
                loading={creating}
                onSubmit={handleCreateFornecedor}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
