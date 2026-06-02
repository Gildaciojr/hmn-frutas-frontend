"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // ================= REDIRECT =================
  // 🔥 ENTRADA OFICIAL DO SISTEMA
  // Toda autenticação agora acontece
  // no fluxo modal-first em /select-mode
  useEffect(() => {
    router.replace("/select-mode");
  }, [router]);

  // 🔥 ESTA ROTA NÃO RENDERIZA MAIS INTERFACE
  // O sistema agora inicia diretamente
  // na seleção de operação.
  return (
    <div className="h-screen w-full flex items-center justify-center px-4 relative overflow-hidden">
      {/* BACKGROUND GLOBAL */}
      <div className="absolute inset-0 bg-[#fafafa]" />

      {/* LIGHT EFFECT */}
      <div
        className="
  absolute
  top-[-40px]
  left-[-40px]

  w-[320px]
  h-[320px]

  rounded-full

  bg-indigo-500/10

  blur-[40px]

  pointer-events-none
"
      />

      {/* REDIRECT FEEDBACK */}
      <div
        className="
    relative z-10
    w-full max-w-md
    rounded-[var(--radius-lg)]
    border border-[color:var(--border-soft)]
    bg-[color:var(--surface-100)]

    shadow-[0_10px_30px_rgba(0,0,0,0.08)]

    p-10
    overflow-hidden

    will-change-transform

    animate-[fadeIn_.22s_ease-out]
  "
      >
        {/* CAMADA VISUAL */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/[0.015] to-black/[0.03]" />

          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>

        {/* CONTEÚDO */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-5">
          {/* INDICADOR */}
          <div
            className="
              w-12 h-12 rounded-full
              border-2 border-black/10
              border-t-black
              animate-spin
            "
          />

          {/* TEXTO */}
          <div className="space-y-2">
            <div className="text-[10px] tracking-[0.28em] uppercase text-[color:var(--muted-soft)]">
              Inicializando
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
              Controle de Frutas
            </h1>

            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              Redirecionando para o ambiente operacional...
            </p>
          </div>

          {/* FOOTER */}
          <div className="pt-4 text-xs text-[color:var(--muted-soft)]">
            Plataforma operacional • v1.0
          </div>
        </div>
      </div>
    </div>
  );
}
