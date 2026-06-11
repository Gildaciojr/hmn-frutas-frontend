"use client";

import { AnimatePresence, motion } from "framer-motion";

import { NovaVendaCard } from "./NovaVendaCard";

import type { Venda } from "../services/vendas.service";

interface Props {
  venda: Venda | null;

  open: boolean;

  onClose: () => void;
}

export function VendaEditModal({ venda, open, onClose }: Props) {
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
            z-[999]

            bg-black/40

            flex
            items-center
            justify-center

            p-3
            sm:p-4
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
            onClick={(event) => event.stopPropagation()}
            className="
              w-full
              max-w-6xl

              max-h-[95vh]

              overflow-y-auto

              rounded-3xl

              bg-white

              shadow-2xl
            "
          >
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-xl font-semibold">Editar Venda</h2>

              <p className="text-sm text-gray-500">
                Pedido: {venda.numeroPedido ?? "-"} • Romaneio:{" "}
                {venda.numeroRomaneio ?? "-"}
              </p>
            </div>

            <div className="p-3 sm:p-5">
              <NovaVendaCard mode="edit" venda={venda} onSuccess={onClose} />
            </div>

            <div className="border-t p-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4
                  py-2

                  rounded-xl

                  border
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
}
