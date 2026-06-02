"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { login } from "@/modules/auth/services/login";
import { useAuthStore } from "@/core/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleLogin() {
    try {
      setLoading(true);

      setErro(null);

      const token = await login(email, senha);

      // 🔥 ZUSTAND (estado local)
      useAuthStore.getState().setToken(token);

      // 🔥 COOKIE (OBRIGATÓRIO PARA MIDDLEWARE)
      document.cookie = `token=${token}; path=/`;

      // 🔥 REDIRECIONAMENTO
      router.replace("/select-mode");
    } catch {
      setErro("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        relative

        min-h-screen

        overflow-hidden

        bg-[#f6f8fb]

        flex
        items-center
        justify-center

        px-4
        py-10
      "
    >
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      {/* BASE */}
      <div className="absolute inset-0 bg-[#f7fafc]" />

      {/* GRID */}
      <div
        className="
          absolute
          inset-0

          opacity-[0.035]

          bg-[radial-gradient(circle,rgba(0,0,0,0.4)_1px,transparent_1px)]
          bg-[size:26px_26px]
        "
      />

      {/* GLOW RED */}
      <div
        className="
          absolute

          w-[520px]
          h-[520px]

          rounded-full

          bg-red-500/12

          blur-[140px]

          -top-40
          -right-32
        "
      />

      {/* GLOW GREEN */}
      <div
        className="
          absolute

          w-[420px]
          h-[420px]

          rounded-full

          bg-emerald-500/10

          blur-[120px]

          -bottom-32
          -left-24
        "
      />

      {/* ================================================= */}
      {/* CARD */}
      {/* ================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 32,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.4,
        }}
        className="
          group
          relative
          overflow-hidden

          z-10

          w-full
          max-w-[460px]

          rounded-[36px]

          border
          border-white/20

          bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.76))]

          backdrop-blur-2xl

          shadow-[0_40px_120px_rgba(15,23,42,0.12)]

          p-7
          sm:p-8

          transition-all
          duration-500
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

              bg-[radial-gradient(circle_at_82%_18%,rgba(239,68,68,0.12),transparent_58%)]
            "
          />

          {/* LIGHT */}
          <div
            className="
              absolute
              inset-0

              bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_35%)]
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
              via-white/60
              to-transparent
            "
          />
        </div>

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="relative z-10 text-center">
          {/* LOGO */}
          <div className="flex justify-center">
            <div
              className="
                relative

                flex
                items-center
                justify-center

                w-[120px]
                h-[120px]

                rounded-[30px]

                border
                border-white/20

                bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(248,250,252,0.72))]

                backdrop-blur-xl

                shadow-[0_20px_60px_rgba(0,0,0,0.08)]
              "
            >
              {/* GLOW */}
              <div
                className="
                  absolute
                  inset-0

                  rounded-[30px]

                  bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,68,0.10),transparent_60%)]
                "
              />

              <Image
                src="${process.env.NEXT_PUBLIC_UPLOADS_URL}/empresa/logo-hmn.png"
                alt="HMN"
                width={88}
                height={88}
                priority
                className="
                  relative
                  z-10

                  object-contain

                  drop-shadow-[0_8px_24px_rgba(0,0,0,0.10)]
                "
              />
            </div>
          </div>

          {/* TITLES */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div
                className="
                  w-[5px]
                  h-[5px]

                  rounded-full

                  bg-emerald-500
                "
              />

              <span
                className="
                  text-[10px]

                  uppercase

                  tracking-[0.28em]

                  text-[color:var(--muted-soft)]
                "
              >
                Sistema operacional
              </span>
            </div>

            <h1
              className="
                text-[32px]
                sm:text-[36px]

                font-semibold

                tracking-[-0.05em]

                text-[color:var(--foreground)]
              "
            >
              Acesso ao sistema
            </h1>

            <p
              className="
                text-[14px]

                leading-relaxed

                text-[color:var(--muted)]

                max-w-[320px]

                mx-auto
              "
            >
              Entre com suas credenciais para acessar o painel operacional de
              compras, vendas e controle financeiro.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* INPUTS */}
        {/* ================================================= */}

        <div className="relative z-10 mt-8 space-y-4">
          {/* EMAIL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[9px]

                  uppercase

                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                E-mail
              </span>
            </div>

            <div
              className="
                group/input
                relative
                overflow-hidden

                h-[52px]

                rounded-[18px]

                border
                border-white/10

                bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                backdrop-blur-xl

                transition-all
                duration-300

                hover:border-white/20

                focus-within:border-emerald-300/40

                focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
              "
            >
              <div
                className="
                  absolute
                  inset-0

                  opacity-0
                  group-hover/input:opacity-100

                  transition-all
                  duration-500

                  bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.08),transparent_60%)]
                "
              />

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  relative
                  z-10

                  w-full
                  h-full

                  bg-transparent

                  px-5

                  text-[14px]
                  font-medium

                  tracking-tight

                  text-[color:var(--foreground)]

                  placeholder:text-[color:var(--muted-soft)]

                  outline-none
                "
              />
            </div>
          </div>

          {/* SENHA */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className="
                  text-[9px]

                  uppercase

                  tracking-[0.20em]

                  text-[color:var(--muted-soft)]
                "
              >
                Senha
              </span>
            </div>

            <div
              className="
                group/input
                relative
                overflow-hidden

                h-[52px]

                rounded-[18px]

                border
                border-white/10

                bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.68))]

                backdrop-blur-xl

                transition-all
                duration-300

                hover:border-white/20

                focus-within:border-emerald-300/40

                focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.10)]
              "
            >
              <div
                className="
                  absolute
                  inset-0

                  opacity-0
                  group-hover/input:opacity-100

                  transition-all
                  duration-500

                  bg-[radial-gradient(circle_at_85%_10%,rgba(239,68,68,0.08),transparent_60%)]
                "
              />

              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="
                  relative
                  z-10

                  w-full
                  h-full

                  bg-transparent

                  px-5

                  text-[14px]
                  font-medium

                  tracking-tight

                  text-[color:var(--foreground)]

                  placeholder:text-[color:var(--muted-soft)]

                  outline-none
                "
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERRO */}
        {/* ================================================= */}

        {erro && (
          <div
            className="
              relative
              z-10

              mt-5

              rounded-[18px]

              border
              border-red-200

              bg-red-50/80

              px-4
              py-3

              text-center
            "
          >
            <p
              className="
                text-[13px]
                font-medium

                text-red-600
              "
            >
              {erro}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* BOTÃO */}
        {/* ================================================= */}

        <div className="relative z-10 mt-6">
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`
              group
              relative
              overflow-hidden

              w-full
              h-[60px]

              rounded-[22px]

              border

              transition-all
              duration-500

              ${
                loading
                  ? `
                    border-white/10

                    bg-[linear-gradient(135deg,#d1d5db,#cbd5e1)]

                    text-gray-500

                    cursor-not-allowed
                  `
                  : `
                    border-emerald-300/18

                    bg-[linear-gradient(135deg,#10b981,#059669)]

                    text-white

                    shadow-[0_18px_50px_rgba(16,185,129,0.28)]

                    hover:translate-y-[-2px]

                    hover:shadow-[0_26px_70px_rgba(16,185,129,0.36)]
                  `
              }
            `}
          >
            {/* FX */}
            {!loading && (
              <>
                <div
                  className="
                    absolute
                    inset-0

                    opacity-0
                    group-hover:opacity-100

                    transition-all
                    duration-700

                    bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)]

                    translate-x-[-120%]
                    group-hover:translate-x-[120%]
                  "
                />

                <div
                  className="
                    absolute
                    inset-0

                    opacity-0
                    group-hover:opacity-100

                    transition-all
                    duration-500

                    bg-[radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.22),transparent_60%)]
                  "
                />
              </>
            )}

            {/* CONTENT */}
            <div
              className="
                relative
                z-10

                h-full

                flex
                items-center
                justify-center

                gap-3
              "
            >
              {loading && (
                <div
                  className="
                    w-5
                    h-5

                    border-[2px]
                    border-white/20
                    border-t-white

                    rounded-full

                    animate-spin
                  "
                />
              )}

              <span
                className="
                  text-[16px]
                  font-semibold

                  tracking-[-0.03em]
                "
              >
                {loading ? "Entrando..." : "Entrar no sistema"}
              </span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}