"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { login } from "@/modules/auth/services/login";
import { useAuthStore } from "@/core/stores/useAuthStore";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: Props) {
  // ================= STATES =================
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [loading, setLoading] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  const [focusedField, setFocusedField] = useState<"email" | "senha" | null>(
    null,
  );

  // ================= REFS =================
  const emailRef = useRef<HTMLInputElement | null>(null);

  // ================= AUTO FOCUS =================
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      emailRef.current?.focus();
    }, 180);

    return () => clearTimeout(timer);
  }, [open]);

  // ================= ESC CLOSE =================
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, loading, onClose]);

  // ================= SUBMIT =================
  async function handleLogin() {
    try {
      // ================= VALIDATION =================
      if (!email.trim()) {
        setErro("Informe o e-mail de acesso");
        return;
      }

      if (!senha.trim()) {
        setErro("Informe sua senha");
        return;
      }

      // ================= LOADING =================
      setLoading(true);

      // ================= RESET =================
      setErro(null);

      // ================= AUTH =================
      const token = await login(email.trim(), senha);

      // ================= STORE =================
      useAuthStore.getState().setToken(token);

      // ================= COOKIE =================
      document.cookie = `token=${token}; path=/`;

      // ================= RESET FORM =================
      setEmail("");
      setSenha("");

      // ================= SUCCESS =================
      onSuccess();
    } catch (err) {
      console.error("ERRO LOGIN:", err);

      setErro("Credenciais inválidas");
    } finally {
      // ================= FINALIZE =================
      setLoading(false);
    }
  }

  // ================= ENTER SUBMIT =================
  async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!loading) {
        await handleLogin();
      }
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.22,
          }}
          className="
  fixed inset-0 z-[120]

  flex items-center justify-center

  p-3
  sm:p-4

  overflow-y-auto

  overscroll-contain
"
        >
          {/* ================= BACKDROP ================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              absolute inset-0
              bg-black/55
              backdrop-blur-[4px]
            "
          />

          {/* ================= AMBIENT LIGHT ================= */}
          <div
            className="
              absolute
              w-[320px]
              h-[320px]

              md:w-[720px]
              md:h-[720px]

              rounded-full
              bg-[radial-gradient(circle,rgba(239,68,68,0.12),transparent_68%)]
              blur-[600px]
              top-[-260px]
              right-[-180px]
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              w-[280px]
              h-[280px]

              md:w-[620px]
              md:h-[620px]

              rounded-full
              bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_68%)]
              blur-[50px]
              bottom-[-260px]
              left-[-160px]
              pointer-events-none
            "
          />

          {/* ================= MODAL ================= */}
          <motion.div
            initial={{
              opacity: 0,
              y: 36,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 26,
              scale: 0.96,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
            }}
            className="
              relative z-10
              w-full
              max-w-[400px]

              max-h-[92vh]

              overflow-y-auto

              overflow-x-hidden

              rounded-[32px]

              border border-white/10

              bg-[rgba(255,255,255,0.88)]
              backdrop-blur-sm

              shadow-[0_40px_140px_rgba(0,0,0,0.32)]
            "
          >
            {/* ================= VISUAL LAYERS ================= */}
            <div className="absolute inset-0 pointer-events-none">
              {/* BASE PREMIUM */}
              <div
                className="
                  absolute inset-0
                  bg-[linear-gradient(145deg,rgba(220,252,231,0.98)_0%,rgba(209,250,229,0.96)_18%,rgba(240,253,244,0.94)_38%,rgba(255,255,255,0.96)_62%,rgba(255,255,255,0.99)_100%)]
                "
              />

              {/* GREEN PRIMARY */}
              <div
                className="
                  absolute inset-0
                  opacity-100
                  bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_34%)]
                "
              />

              {/* GREEN SECONDARY */}
              <div
                className="
                  absolute inset-0
                  opacity-90
                  bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_40%)]
                "
              />

              {/* SOFT DEPTH */}
              <div
                className="
                  absolute inset-0
                  bg-[linear-gradient(to_bottom,rgba(255,255,255,0.48),rgba(255,255,255,0.10))]
                "
              />

              {/* TOP LIGHT LINE */}
              <div
                className="
                  absolute inset-x-0 top-0 h-px
                  bg-gradient-to-r
                  from-transparent
                  via-white
                  to-transparent
                "
              />
            </div>

            {/* ================= CONTENT ================= */}
            <div className="relative z-10 p-5 sm:p-6">
              {/* ================= HEADER ================= */}
              <div className="space-y-5">
                {/* ================================================= */}
                {/* TOP */}
                {/* ================================================= */}

                <div className="flex items-start justify-between gap-4">
                  {/* LEFT */}
                  <div className="flex-1">
                    <div
                      className="
      flex
      flex-col
      items-center

      text-center

      space-y-5
    "
                    >
                      {/* BADGE */}
                      <div
                        className="
            mx-auto inline-flex items-center gap-2

            rounded-full

            border border-black/5

            bg-white/72

            px-3 py-1.5

            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
          "
                      >
                        <div className="relative">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />

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

              uppercase

              tracking-[0.24em]

              text-gray-500

              font-medium
            "
                        >
                          Ambiente seguro
                        </span>
                      </div>

                      {/* LOGO */}
                      <div
                        className="
    relative

    flex
    justify-center

    w-full
  "
                      >
                        {/* GLOW */}
                        <div
                          className="
      absolute

      inset-0

      flex
      justify-center

      pointer-events-none
    "
                        >
                          <div
                            className="
        w-[150px]

        sm:w-[180px]
        md:w-[220px]

        rounded-full

        bg-[radial-gradient(circle,rgba(34,197,94,0.18),transparent_72%)]

        blur-[36px]

        opacity-90
      "
                          />
                        </div>

                        {/* LOGO IMAGE */}
                        <img
                          src="${process.env.NEXT_PUBLIC_UPLOADS_URL}/empresa/logo-hmn.png"
                          alt="Logo HMN Frutas"
                          className="
      relative
      z-10

      w-[150px]

      sm:w-[180px]
      md:w-[220px]

      object-contain

      drop-shadow-[0_12px_34px_rgba(0,0,0,0.12)]

      select-none
      pointer-events-none
    "
                        />
                      </div>

                      {/* TEXT */}
                      <div className="space-y-1">
                        <h2
                          className="
              text-[24px] sm:text-[26px] md:text-[30px]

              leading-[0.94]

              tracking-[-0.08em]

              font-semibold

              text-black
            "
                        >
                          Faça seu login
                        </h2>

                        <p
                          className="
              text-[15px]

              text-gray-500

              tracking-[-0.02em]
            "
                        >
                          Acesse sua conta para continuar.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CLOSE */}
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="
        group
        relative

        shrink-0

        w-11
        h-11

        md:w-10
        md:h-10

        rounded-full

        flex
        items-center
        justify-center

        border border-black/5

        bg-white/60

        text-gray-400

        transition-all
        duration-300

        hover:text-black
        hover:bg-white
        hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]

        disabled:opacity-40
      "
                  >
                    {/* FX */}
                    <div
                      className="
          absolute
          inset-0

          rounded-full

          opacity-0
          group-hover:opacity-100

          transition-all
          duration-300

          bg-[radial-gradient(circle_at_50%_20%,rgba(239,68,68,0.10),transparent_65%)]
        "
                    />

                    <span className="relative z-10 text-[15px]">✕</span>
                  </button>
                </div>
              </div>

              {/* ================= FORM ================= */}
              <div className="mt-8 space-y-5">
                {/* EMAIL */}
                <div className="space-y-2">
                  <label
                    className="
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-gray-400
                    "
                  >
                    E-mail
                  </label>

                  <div
                    className={`
                      relative overflow-visible
                      rounded-2xl

                      border

                      transition-all duration-300

                      ${
                        focusedField === "email"
                          ? `
                            border-black/30
                            bg-white
                            shadow-[0_15px_40px_rgba(0,0,0,0.08)]
                          `
                          : `
                            border-black/8
                            bg-white/70
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-[15px]
                      "
                    >
                      @
                    </div>

                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      disabled={loading}
                      autoComplete="email"
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setEmail(e.target.value)}
                      className="
                        w-full
                        bg-transparent
                        pl-12 pr-4 py-3.5

                        text-[14px]
                        text-black

                        placeholder:text-gray-400

                        outline-none
                      "
                    />
                  </div>
                </div>

                {/* SENHA */}
                <div className="space-y-2">
                  <label
                    className="
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.18em]
                      text-gray-400
                    "
                  >
                    Senha
                  </label>

                  <div
                    className={`
                      relative overflow-hidden
                      rounded-2xl

                      border

                      transition-all duration-300

                      ${
                        focusedField === "senha"
                          ? `
                            border-black/30
                            bg-white
                            shadow-[0_15px_40px_rgba(0,0,0,0.08)]
                          `
                          : `
                            border-black/8
                            bg-white/70
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        absolute left-4 top-1/2
                        -translate-y-1/2
                        text-gray-400
                        text-[14px]
                      "
                    >
                      •
                    </div>

                    <input
                      type="password"
                      value={senha}
                      disabled={loading}
                      autoComplete="current-password"
                      onFocus={() => setFocusedField("senha")}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={handleKeyDown}
                      onChange={(e) => setSenha(e.target.value)}
                      className="
                        w-full
                        bg-transparent
                        pl-12 pr-4 py-3.5

                        text-[14px]
                        text-black

                        placeholder:text-gray-400

                        outline-none
                      "
                    />
                  </div>
                </div>

                {/* ================= ERROR ================= */}
                <AnimatePresence mode="wait">
                  {erro && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: -4,
                      }}
                      className="
                        rounded-2xl
                        border border-red-200
                        bg-red-50/80
                        px-4 py-3.5

                        text-[13px]
                        text-red-600

                        backdrop-blur-sm
                      "
                    >
                      {erro}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ================= ACTIONS ================= */}
                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className={`
      relative overflow-hidden

      w-full

      rounded-2xl

      py-3

      text-[14px]
      font-semibold

      transition-all
      duration-300

      hover:scale-[1.01]
      active:scale-[0.985]

      will-change-transform

      ${
        loading
          ? `
            bg-gray-200
            text-gray-500
            cursor-not-allowed
          `
          : `
            bg-black
            text-white

            shadow-[0_20px_50px_rgba(0,0,0,0.24)]

            hover:shadow-[0_28px_70px_rgba(0,0,0,0.32)]
          `
      }
    `}
                  >
                    {!loading && (
                      <div
                        className="
          absolute inset-0

          opacity-40

          bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.16),transparent)]
        "
                      />
                    )}

                    <span
                      className="
        relative z-10

        flex items-center justify-center gap-3
      "
                    >
                      {loading && (
                        <div
                          className="
            w-4 h-4

            rounded-full

            border-2 border-gray-400
            border-t-transparent

            animate-spin
          "
                        />
                      )}

                      {loading
                        ? "Autenticando acesso..."
                        : "Entrar no ambiente"}
                    </span>
                  </button>

                  {/* CANCEL */}
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="
    group
    relative overflow-hidden

    w-full

    rounded-2xl

    border border-red-200/70

    bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(254,242,242,0.92))]

    px-4 py-3.5

    shadow-[0_10px_30px_rgba(239,68,68,0.08)]

    transition-all
    duration-300

    hover:border-red-300
    hover:shadow-[0_18px_45px_rgba(239,68,68,0.14)]

    hover:scale-[1.01]
    active:scale-[0.985]

    will-change-transform

    disabled:opacity-40
  "
                  >
                    {/* RED AMBIENT */}
                    <div
                      className="
      absolute inset-0

      opacity-0
      group-hover:opacity-100

      transition-opacity duration-300

      bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),transparent_70%)]
    "
                    />

                    <span
                      className="
      relative z-10

      flex items-center justify-center gap-2

      text-[13px]
      font-semibold

      text-red-500
      group-hover:text-red-600

      transition-colors
    "
                    >
                      <span className="text-[15px]">✕</span>
                      Cancelar operação
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
