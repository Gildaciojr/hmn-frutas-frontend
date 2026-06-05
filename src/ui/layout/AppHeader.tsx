"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/core/stores/useAppStore";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { NotificationBell } from "@/ui/notifications/NotificationBell";
import { UserAvatar } from "@/ui/user/UserAvatar";

export function AppHeader() {
  const mode = useAppStore((state) => state.mode);
  const logout = useAppStore((state) => state.logout);

  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/");
  }

  const isCompras = mode === "COMPRAS";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        group relative

        w-full

        h-[64px]

        sm:h-[58px]

        flex items-center justify-between

        px-3

        sm:px-5 

        md:px-6

        bg-[color:var(--surface-100)]/70 backdrop-blur-xl

        border-b border-[color:var(--border-soft)]

        shadow-[0_4px_18px_rgba(0,0,0,0.04)]
      "
    >
      {/* ================= CAMADA PREMIUM ================= */}
      <div className="absolute inset-0 pointer-events-none">
        {/* GRADIENT VIVO */}
        <div
          className={`
            absolute inset-0 rounded-b-[var(--radius-lg)]
            opacity-0 group-hover:opacity-100
            transition duration-500

            ${
              isCompras
                ? "bg-[radial-gradient(circle_at_20%_0%,rgba(0,0,0,0.05),transparent_60%)]"
                : "bg-[radial-gradient(circle_at_20%_0%,rgba(239,68,68,0.08),transparent_60%)]"
            }
          `}
        />

        {/* LIGHT TOP EDGE */}
        <div
          className="
          absolute inset-x-0 top-0 h-[1px]
          bg-gradient-to-r from-transparent via-black/10 to-transparent
          opacity-50
        "
        />
      </div>

      {/* ================= ESQUERDA ================= */}
      <div className="relative z-10 flex items-center sm:gap-5 min-w-0">
        {/* INDICADOR ATIVO (MAIS FORTE) */}
        <div className="relative flex items-center justify-center">
          <div
            className={`
              w-[3px] h-5 rounded-full

              ${
                isCompras
                  ? "bg-[color:var(--brand)]"
                  : "bg-[color:var(--danger)]"
              }
            `}
          />

          {/* GLOW REAL */}
          <div
            className={`
              absolute w-3 h-6 blur-md opacity-25 rounded-full

              ${
                isCompras
                  ? "bg-[color:var(--brand)]"
                  : "bg-[color:var(--danger)]"
              }
            `}
          />
        </div>

        {/* TEXTO */}
        <div className="flex flex-col leading-tight min-w-0">
          {/* IDENTIDADE */}
          <span
            className="
            text-[8px]

            sm:text-[9px]
            
            tracking-[0.32em]
            uppercase
            text-[color:var(--muted-soft)]
          "
          >
            Sistema
          </span>

          <div className="flex items-center gap-2.5">
            {/* MODO */}
            <span
              className="
              text-[13px] sm:text-[14px] font-semibold tracking-tight
              text-[color:var(--foreground)]
            "
            >
              {mode}
            </span>

            {/* BADGE PREMIUM */}
            <span
              className={`
                relative overflow-hidden

                px-2.5
                py-[2px]
                rounded-full

                text-[10px] font-medium

                border

                ${
                  isCompras
                    ? `
                      bg-[color:var(--surface-200)]
                      text-[color:var(--foreground)]
                      border-[color:var(--border-soft)]
                    `
                    : `
                      bg-[color:var(--danger-soft)]
                      text-[color:var(--danger)]
                      border-[color:var(--danger)]
                    `
                }
              `}
            >
              {/* shimmer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.5),transparent)] animate-[shimmer_2s_linear_infinite]" />
              </span>

              <span className="relative">ativo</span>
            </span>
          </div>
        </div>
      </div>

      {/* ================= DIREITA ================= */}
      <div className="relative z-10 flex items-center gap-2 shrink-0">
        {/* 🔔 NOTIFICAÇÕES */}
        <NotificationBell />

        {/* 👤 AVATAR */}
        <UserAvatar name="HMN" />

        {/* ================= BOTÃO SAIR ================= */}
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleLogout}
          className="
      group relative flex items-center gap-2

      px-2.5
      sm:px-3

      h-[40px]

      rounded-[var(--radius-md)]

      border border-[color:var(--border-soft)]
      bg-[color:var(--surface-100)]

      text-[13px] font-medium
      text-[color:var(--muted)]

      transition-all duration-200

      hover:border-[color:var(--border-strong)]
      hover:bg-[color:var(--surface-200)]
      hover:text-[color:var(--foreground)]

      hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
      active:scale-[0.98]
    "
        >
          {/* 🔥 GLOW INTERNO PREMIUM */}
          <div
            className="
      absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300
      rounded-[var(--radius-md)]
      bg-[radial-gradient(circle_at_50%_0%,rgba(0,0,0,0.06),transparent_70%)]
    "
          />

          {/* ÍCONE */}
          <LogOut
            size={15}
            className="
        relative
        opacity-70
        group-hover:opacity-100
        transition
      "
          />

          {/* TEXTO */}
          <span className="relative hidden sm:block">
            Sair
          </span>

          {/* LINHA BASE INTERATIVA */}
          <div
            className="
      absolute bottom-0 left-0 w-full h-[2px]
      bg-transparent group-hover:bg-black/40
      transition
    "
          />
        </motion.button>
      </div>
    </motion.header>
  );
}
