"use client";

import { memo, useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { NovaVendaCard } from "./NovaVendaCard";

import type { Venda } from "../services/vendas.service";

interface Props {
  venda: Venda | null;

  open: boolean;

  onClose: () => void;
}

export const VendaEditModal = memo(function VendaEditModal({
  venda,
  open,
  onClose,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setReady(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setReady(true);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [open]);

  return (
    <AnimatePresence>
      {open && venda && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="
            fixed
            inset-0

            z-[9999]

            bg-black/50
            backdrop-blur-[2px]

            flex
            items-center
            justify-center

            p-2
            sm:p-4
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
              y: 10,
            }}
            transition={{
              duration: 0.18,
            }}
            onClick={(event) => event.stopPropagation()}
            className="
              w-full

              max-w-[1400px]

              h-[96dvh]
              sm:h-[95dvh]

              bg-white

              rounded-2xl
              sm:rounded-3xl

              shadow-2xl

              overflow-hidden

              flex
              flex-col
            "
          >
            {/* HEADER */}
            <div
              className="
                shrink-0

                px-4
                py-4

                sm:px-6
                sm:py-5

                border-b

                bg-white
              "
            >
              <h2
                className="
                  text-lg
                  sm:text-xl

                  font-semibold
                "
              >
                Editar Venda
              </h2>

              <p
                className="
                  mt-1

                  text-xs
                  sm:text-sm

                  text-gray-500
                "
              >
                Pedido: {venda.numeroPedido ?? "-"} • Romaneio:{" "}
                {venda.numeroRomaneio ?? "-"}
              </p>
            </div>

            {/* BODY */}
            <div
              className="
                flex-1

                overflow-y-auto
                overscroll-contain
                touch-pan-y

                px-2
                py-2

                sm:px-5
                sm:py-5
              "
            >
              {ready ? (
                <NovaVendaCard mode="edit" venda={venda} onSuccess={onClose} />
              ) : (
                <div
                  className="
                    h-full

                    flex
                    items-center
                    justify-center
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3

                      text-sm

                      text-slate-500
                    "
                  >
                    <div
                      className="
                        h-4
                        w-4

                        rounded-full

                        border-2
                        border-slate-300
                        border-t-slate-600

                        animate-spin
                      "
                    />
                    Carregando venda...
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div
              className="
                shrink-0

                border-t

                bg-white

                p-3
                sm:p-4

                flex
                justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  h-11

                  px-5

                  rounded-xl

                  border

                  text-sm
                  font-medium

                  hover:bg-gray-50

                  transition
                "
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
