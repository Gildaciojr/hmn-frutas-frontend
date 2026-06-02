"use client";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CircleAlert,
  Info,
} from "lucide-react";

import { useAlertas } from "@/modules/alertas/hooks/useAlertas";

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { ativos, naoLidos, marcarComoLido, loading } = useAlertas();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {/* ================================================= */}
      {/* BOTÃO */}
      {/* ================================================= */}

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen((v) => !v)}
        className="
          group
          relative

          w-10
          h-10

          flex
          items-center
          justify-center

          rounded-[16px]

          border
          border-white/10

          bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,250,252,0.70))]

          text-[color:var(--muted)]

          shadow-[0_8px_24px_rgba(15,23,42,0.05)]

          backdrop-blur-xl

          transition-all
          duration-300

          hover:border-white/20

          hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))]

          hover:text-[color:var(--foreground)]

          hover:shadow-[0_16px_40px_rgba(15,23,42,0.10)]
        "
      >
        {/* FX */}
        <div className="absolute inset-0 overflow-hidden rounded-[16px]">
          <div
            className="
              absolute
              top-0
              right-0

              w-[60px]
              h-[60px]

              rounded-full

              bg-indigo-500/8

              blur-[18px]
            "
          />
        </div>

        {/* ICON */}
        <Bell
          size={16}
          className="
            relative
            z-10
          "
        />

        {/* BADGE */}
        {naoLidos > 0 && (
          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
      absolute
      -top-1
      -right-1

      min-w-[18px]
      h-[18px]

      px-1

      flex
      items-center
      justify-center

      rounded-full

      bg-[linear-gradient(135deg,#ef4444,#dc2626)]

      text-[9px]
      font-bold

      text-white

      shadow-[0_8px_20px_rgba(239,68,68,0.35)]
    "
          >
            {naoLidos > 99 ? "99+" : naoLidos}
          </motion.div>
        )}
      </motion.button>

      {/* ================================================= */}
      {/* DROPDOWN */}
      {/* ================================================= */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 10,
              scale: 0.98,
            }}
            transition={{
              duration: 0.18,
            }}
            className="
              absolute
              right-0
              top-[52px]

              z-[9999]

              w-[360px]

              overflow-hidden

              rounded-[26px]

              border
              border-white/10

              bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]

              backdrop-blur-2xl

              shadow-[0_30px_90px_rgba(15,23,42,0.18)]
            "
          >
            {/* ============================================= */}
            {/* HEADER */}
            {/* ============================================= */}

            <div
              className="
                relative

                overflow-hidden

                border-b
                border-black/5

                px-5
                py-4
              "
            >
              {/* FX */}
              <div
                className="
                  absolute
                  top-0
                  right-0

                  w-[120px]
                  h-[120px]

                  rounded-full

                  bg-indigo-500/8

                  blur-[32px]
                "
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="
                        text-[10px]

                        uppercase

                        tracking-[0.20em]

                        text-[color:var(--muted-soft)]
                      "
                    >
                      central operacional
                    </p>

                    <h3
                      className="
                        mt-1

                        text-[16px]

                        font-semibold

                        tracking-[-0.03em]

                        text-[color:var(--foreground)]
                      "
                    >
                      Alertas do sistema
                    </h3>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      justify-center

                      min-w-[34px]
                      h-[34px]

                      px-2

                      rounded-full

                      bg-red-50

                      text-[11px]
                      font-semibold

                      text-red-600
                    "
                  >
                    {naoLidos}
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================= */}
            {/* BODY */}
            {/* ============================================= */}

            <div
              className="
                max-h-[420px]

                overflow-y-auto custom-scrollbar

                p-3

                space-y-2
              "
            >
              {/* LOADING */}
              {loading && (
                <div
                  className="
                    py-10

                    text-center

                    text-[12px]

                    text-[color:var(--muted)]
                  "
                >
                  Carregando alertas...
                </div>
              )}

              {/* EMPTY */}
              {!loading && ativos.length === 0 && (
                <div
                  className="
                    py-10

                    flex
                    flex-col
                    items-center
                    justify-center

                    text-center
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      justify-center

                      w-14
                      h-14

                      rounded-full

                      bg-emerald-50

                      text-emerald-600
                    "
                  >
                    <CheckCircle2 size={22} />
                  </div>

                  <h4
                    className="
                      mt-4

                      text-[14px]
                      font-semibold

                      text-[color:var(--foreground)]
                    "
                  >
                    Nenhum alerta ativo
                  </h4>

                  <p
                    className="
                      mt-1

                      text-[12px]

                      text-[color:var(--muted)]
                    "
                  >
                    Seu sistema está operando normalmente.
                  </p>
                </div>
              )}

              {/* ALERTAS */}
              {!loading &&
                ativos.map((alerta) => {
                  const isCritico = alerta.severidade === "CRITICA";

                  const isAlta = alerta.severidade === "ALTA";

                  const isMedia = alerta.severidade === "MEDIA";

                  return (
                    <motion.button
                      key={alerta.id}
                      whileHover={{
                        y: -1,
                      }}
                      onClick={async () => {
                        await marcarComoLido(alerta.id);

                        setOpen(false);
                      }}
                      className="
                        group
                        relative

                        w-full

                        overflow-hidden

                        rounded-[20px]

                        border
                        border-white/10

                        bg-white/70

                        p-3.5

                        text-left

                        transition-all
                        duration-300

                        hover:border-white/20

                        hover:bg-white/90

                        hover:shadow-[0_14px_36px_rgba(15,23,42,0.08)]
                      "
                    >
                      {/* FX */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div
                          className={`
                            absolute
                            top-0
                            right-0

                            w-[100px]
                            h-[100px]

                            rounded-full

                            blur-[28px]

                            ${
                              isCritico
                                ? "bg-red-500/10"
                                : isAlta
                                  ? "bg-orange-500/10"
                                  : isMedia
                                    ? "bg-amber-500/10"
                                    : "bg-blue-500/10"
                            }
                          `}
                        />
                      </div>

                      <div className="relative z-10 flex items-start gap-3">
                        {/* ICON */}
                        <div
                          className={`
                            flex
                            items-center
                            justify-center

                            w-10
                            h-10

                            rounded-[14px]

                            shrink-0

                            ${
                              isCritico
                                ? "bg-red-100 text-red-600"
                                : isAlta
                                  ? "bg-orange-100 text-orange-600"
                                  : isMedia
                                    ? "bg-amber-100 text-amber-600"
                                    : "bg-blue-100 text-blue-600"
                            }
                          `}
                        >
                          {isCritico ? (
                            <CircleAlert size={18} />
                          ) : isAlta ? (
                            <AlertTriangle size={18} />
                          ) : isMedia ? (
                            <Info size={18} />
                          ) : (
                            <CheckCircle2 size={18} />
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h4
                              className="
                                text-[13px]

                                font-semibold

                                leading-tight

                                text-[color:var(--foreground)]
                              "
                            >
                              {alerta.titulo}
                            </h4>

                            {!alerta.lido && (
                              <div
                                className="
                                  mt-1

                                  w-2
                                  h-2

                                  rounded-full

                                  bg-red-500

                                  shrink-0
                                "
                              />
                            )}
                          </div>

                          <p
                            className="
                              mt-1.5

                              text-[11px]

                              leading-relaxed

                              text-[color:var(--muted)]
                            "
                          >
                            {alerta.mensagem}
                          </p>

                          <div
                            className="
    mt-2

    text-[10px]

    text-[color:var(--muted-soft)]
  "
                          >
                            {new Date(alerta.createdAt).toLocaleString("pt-BR")}
                          </div>

                          {(alerta.cliente || alerta.fornecedor) && (
                            <div
                              className="
                                mt-3

                                flex
                                items-center
                                gap-2

                                text-[10px]

                                uppercase

                                tracking-[0.14em]

                                text-[color:var(--muted-soft)]
                              "
                            >
                              <span>
                                {alerta.cliente
                                  ? alerta.cliente.nome
                                  : alerta.fornecedor?.nome}
                              </span>

                              <span>•</span>

                              <span>
                                {alerta.categoria.replaceAll("_", " ")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
