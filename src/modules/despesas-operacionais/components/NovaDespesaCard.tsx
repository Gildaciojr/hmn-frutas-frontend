"use client";

import { useState } from "react";

import { ReceiptText } from "lucide-react";

import { DespesaOperacionalModal } from "./DespesaOperacionalModal";

export function NovaDespesaCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="
          relative

          overflow-hidden

          rounded-[20px]
          sm:rounded-[28px]

          border
          border-[color:var(--border-soft)]

          bg-[color:var(--surface-100)]

          shadow-[0_10px_35px_rgba(0,0,0,0.05)]

          px-4 py-3

          transition-all
          duration-300

          hover:-translate-y-1
          hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]
        "
      >
        <div
          className="
            absolute

            right-[-20px]
            top-[-20px]

            w-[100px]
            h-[100px]

            rounded-full

            bg-amber-500/5
          "
        />

        <div className="relative z-10">
          <div
            className="
              inline-flex

              items-center

              rounded-full

              bg-amber-500/10

              px-2
              py-1

              text-[11px]
              sm:text-[10px]

              font-medium

              uppercase

              tracking-[0.16em]

              text-amber-700
            "
          >
            Operação
          </div>

          <div
            className="
              mt-3

              flex
              items-center

              gap-2
            "
          >
            <div
              className="
                flex
                items-center
                justify-center

                w-11
                h-11

                sm:w-10
                sm:h-10

                rounded-xl

                bg-amber-500/10
              "
            >
              <ReceiptText
                size={20}
                className="text-amber-700"
              />
            </div>

            <div>
              <h3
                className="
                  text-[18px]
                  sm:text-base
                  font-bold

                  text-[color:var(--foreground)]
                "
              >
                Nova Despesa
              </h3>
            </div>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="
              mt-4

              w-full

              rounded-[18px]

              h-[48px]

              px-4

              text-[15px]

              bg-amber-500
              shadow-[0_10px_25px_rgba(245,158,11,0.18)]

              py-2.5

              sm:text-sm
              font-medium

              text-white

              transition-all

              hover:bg-amber-600
              hover:shadow-[0_14px_35px_rgba(245,158,11,0.28)]
              hover:-translate-y-[1px]

            "
          >
            Nova Despesa
          </button>
        </div>
      </div>

      <DespesaOperacionalModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}