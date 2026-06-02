"use client";

import { useState } from "react";

import { useAppStore } from "@/core/stores/useAppStore";
import { useAuthStore } from "@/core/stores/useAuthStore";

import { useRouter } from "next/navigation";

import Image from "next/image";

import { motion } from "framer-motion";

import { LoginModal } from "@/modules/auth/components/LoginModal";

export default function SelectMode() {
  const setMode = useAppStore((state) => state.setMode);

  const router = useRouter();

  ////////////////////////////////////////////////////////////
  // AUTH
  ////////////////////////////////////////////////////////////

  const token = useAuthStore((state) => state.token);

  const hydrated = useAuthStore((state) => state.hydrated);

  const logout = useAuthStore((state) => state.logout);

  ////////////////////////////////////////////////////////////
  // MODAL
  ////////////////////////////////////////////////////////////

  const [modalOpen, setModalOpen] = useState(false);

  ////////////////////////////////////////////////////////////
  // MODO PENDENTE
  ////////////////////////////////////////////////////////////

  const [pendingMode, setPendingMode] = useState<
    "COMPRAS" | "VENDAS" | "FINANCEIRO" | null
  >(null);

  ////////////////////////////////////////////////////////////
  // AGUARDA HIDRATAÇÃO
  ////////////////////////////////////////////////////////////

  if (!hydrated) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // SELECT MODE
  ////////////////////////////////////////////////////////////

  function handleSelect(mode: "COMPRAS" | "VENDAS" | "FINANCEIRO") {
    //////////////////////////////////////////////////////////
    // USUÁRIO JÁ AUTENTICADO
    //////////////////////////////////////////////////////////

    if (token) {
      if (mode === "COMPRAS" || mode === "VENDAS") {
        setMode(mode);
      }

      if (mode === "FINANCEIRO") {
        router.push("/financeiro");

        return;
      }

      router.push("/dashboard");

      return;
    }

    //////////////////////////////////////////////////////////
    // LOGIN NECESSÁRIO
    //////////////////////////////////////////////////////////

    setPendingMode(mode);

    setModalOpen(true);
  }

  ////////////////////////////////////////////////////////////
  // LOGIN SUCCESS
  ////////////////////////////////////////////////////////////

  function handleSuccess() {
    if (!pendingMode) {
      return;
    }

    if (pendingMode === "COMPRAS" || pendingMode === "VENDAS") {
      setMode(pendingMode);
    }

    setModalOpen(false);

    const destino = pendingMode;

    setPendingMode(null);

    if (destino === "FINANCEIRO") {
      router.push("/financeiro");

      return;
    }

    router.push("/dashboard");
  }

  ////////////////////////////////////////////////////////////
  // LOGOUT
  ////////////////////////////////////////////////////////////

  function handleLogout() {
    logout();

    setModalOpen(false);

    setPendingMode(null);

    router.refresh();
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <>
      <div className="h-screen flex items-center justify-center px-4 relative overflow-hidden">
        {/* BACKGROUND BASE */}
        <div className="absolute inset-0 bg-[#fafafa]" />

        {/* GRADIENT LAYER */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_40%)]" />

        {/* RED LIGHT (FOCO) */}
        <div
          className="
    absolute

    w-[520px]
    h-[520px]

    bg-red-500/8

    blur-[90px]

    rounded-full

    top-[10%]
    right-[-120px]

    pointer-events-none
  "
        />

        <div className="relative z-10 w-full max-w-5xl space-y-3">
          {/* HEADER PREMIUM */}
          <div className="relative text-center space-y-2">
            {/* AMBIENT LIGHT */}
            <div
              className="
                pointer-events-none
                absolute
                left-1/2 top-[-220px]
                h-[620px] w-[1100px]
                -translate-x-1/2

                bg-[radial-gradient(circle,rgba(239,68,68,0.16),transparent_70%)]

                blur-[70px]
                opacity-90
              "
            />

            {/* LIGHT CENTER */}
            <div
              className="
                pointer-events-none
                absolute
                left-1/2 top-[-40px]
                h-[260px] w-[720px]
                -translate-x-1/2

                bg-[radial-gradient(circle,rgba(255,255,255,0.92),transparent_72%)]

                blur-[90px]
                opacity-90
              "
            />

            {/* LABEL */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: "easeOut",
              }}
              className="
                relative z-10
                inline-flex items-center gap-3

                rounded-full

                border border-white/50

                bg-white/50

                px-5 py-2

                backdrop-blur-2xl

                shadow-[0_14px_45px_rgba(0,0,0,0.05)]
              "
            >
              {/* STATUS DOT */}
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />

                <div
                  className="
                    absolute
                    w-2 h-2
                    rounded-full
                    bg-emerald-400
                    animate-ping
                    opacity-75
                  "
                />
              </div>

              <span
                className="
                  text-[10px]
                  font-medium
                  tracking-[0.34em]
                  uppercase

                  text-gray-500
                "
              >
                Sistema Operacional
              </span>
            </motion.div>

            {/* TITLES */}
            <div className="relative z-10">
              {/* TITLE */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="
    relative
    z-10

    flex
    justify-center

    py-4
  "
              >
                <Image
                  src="/logo-hmn.png"
                  alt="HMN Frutas"
                  width={700}
                  height={300}
                  priority
                  className="
      w-auto

      h-[180px]
      md:h-[240px]

      object-contain

      drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)]
    "
                />
              </motion.div>
            </div>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-[1100px] mx-auto">
            {/* COMPRAS */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleSelect("COMPRAS")}
              className="
    group
    relative

    cursor-pointer

    p-5

    rounded-[20px]

    bg-white

    border border-gray-200

    shadow-[0_20px_60px_rgba(0,0,0,0.06)]

    transition-all
    duration-300

    hover:-translate-y-2

    active:scale-[0.98]

    hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)]

    will-change-transform
  "
            >
              {/* glow interno */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.04),transparent_60%)]" />
              </div>

              {/* linha lateral viva */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-black rounded-l-[28px] opacity-0 group-hover:opacity-100 transition" />

              <div className="relative z-10 space-y-2">
                {/* topo */}
                <div className="space-y-2">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-gray-400">
                    Operação
                  </span>

                  <h2
                    className="
          text-[20px] md:text-[26px]
           font-semibold text-black
          leading-tight tracking-tight
        "
                  >
                    Compras
                  </h2>
                </div>

                {/* descrição */}

                {/* CTA */}
                <div
                  className="
        flex items-center justify-between
        pt-3 border-t border-gray-100
      "
                >
                  <span className="text-sm text-gray-400 group-hover:text-black transition">
                    Acessar módulo
                  </span>

                  <span
                    className="
          text-lg
          transform group-hover:translate-x-2 transition
        "
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.div>

            {/* VENDAS */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => handleSelect("VENDAS")}
              className="
    group
    relative

    cursor-pointer

    p-5

    rounded-[20px]

    bg-white

    border border-gray-200

    shadow-[0_20px_60px_rgba(0,0,0,0.06)]

    transition-all
    duration-300

    hover:-translate-y-2

    active:scale-[0.98]

    hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)]

    will-change-transform
  "
            >
              {/* glow vermelho */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_80%_20%,rgba(239,68,68,0.12),transparent_60%)]" />
              </div>

              {/* linha lateral */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-red-500 rounded-l-[28px] opacity-0 group-hover:opacity-100 transition" />

              <div className="relative z-10 space-y-2">
                {/* topo */}
                <div className="space-y-2">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-gray-400">
                    Gestão
                  </span>

                  <h2
                    className="
          text-[20px] md:text-[26px] font-bold text-black
          leading-tight tracking-tight
        "
                  >
                    Vendas
                  </h2>
                </div>

                {/* descrição */}

                {/* CTA */}
                <div
                  className="
        flex items-center justify-between
        pt-3 border-t border-gray-100
      "
                >
                  <span className="text-sm text-red-400 group-hover:text-red-500 transition">
                    Painel estratégico
                  </span>

                  <span
                    className="
          text-lg
          transform group-hover:translate-x-2 transition
        "
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.div>

            {/* FINANCEIRO */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => handleSelect("FINANCEIRO")}
              className="
    group
    relative

    cursor-pointer

    p-5

    rounded-[20px]

    bg-white

    border border-gray-200

    shadow-[0_20px_60px_rgba(0,0,0,0.06)]

    transition-all
    duration-300

    hover:-translate-y-2

    active:scale-[0.98]

    hover:shadow-[0_35px_90px_rgba(0,0,0,0.12)]

    will-change-transform
  "
            >
              {/* glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <div className="absolute inset-0 rounded-[28px] bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.12),transparent_60%)]" />
              </div>

              {/* linha lateral */}
              <div className="absolute left-0 top-0 h-full w-[3px] bg-indigo-500 rounded-l-[28px] opacity-0 group-hover:opacity-100 transition" />

              <div className="relative z-10 space-y-2">
                {/* topo */}
                <div className="space-y-2">
                  <span className="text-[11px] tracking-[0.25em] uppercase text-gray-400">
                    Financeiro
                  </span>

                  <h2
                    className="
          text-[20px]
          md:text-[20px]

          font-semibold

          text-black

          leading-tight
          tracking-tight
        "
                  >
                    Financeiro
                  </h2>
                </div>

                {/* descrição */}

                {/* CTA */}
                <div
                  className="
        flex items-center justify-between

        pt-3

        border-t border-gray-100
      "
                >
                  <span className="text-sm text-indigo-500 group-hover:text-indigo-700 transition">
                    Abrir módulo
                  </span>

                  <span
                    className="
          text-lg

          transform
          group-hover:translate-x-2

          transition
        "
                  >
                    →
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* BOTÃO VOLTAR PREMIUM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex justify-center"
          >
            <button
              onClick={handleLogout}
              className="
      group px-8 py-3 rounded-full
      bg-white
      border border-gray-200
      text-sm font-medium text-gray-500
      shadow-[0_10px_25px_rgba(0,0,0,0.05)]
      hover:text-black
      hover:border-black
      hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)]
      active:scale-[0.96]
      transition-all duration-300
    "
            >
              <span className="flex items-center gap-2">
                ⎋ Encerrar sessão
                <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition">
                  Logout
                </span>
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      <LoginModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPendingMode(null);
        }}
        onSuccess={() => {
          handleSuccess();
          setModalOpen(false);
          setPendingMode(null);
        }}
      />
    </>
  );
}
