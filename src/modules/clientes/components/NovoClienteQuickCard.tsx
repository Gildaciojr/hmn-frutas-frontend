"use client";

import { motion } from "framer-motion";

import { useClienteStore } from "../store/useClienteStore";

interface Props {
  onClick?: () => void;
}

export function NovoClienteQuickCard({ onClick }: Props) {
  const openCreateModal = useClienteStore((state) => state.openCreateModal);

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        onClick?.();
        openCreateModal();
      }}
      className="
        group
        relative
        overflow-hidden

        h-full
        min-h-[78px]

        w-full

        rounded-[22px]

        border
        border-[color:var(--border-soft)]

        bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))]

        px-5
        py-4

        text-left

        shadow-[0_10px_35px_rgba(0,0,0,0.05)]

        transition-all
        duration-300

        hover:border-emerald-300/40
        hover:shadow-[0_18px_50px_rgba(16,185,129,0.12)]
      "
    >
      {/* FX */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="
            absolute
            inset-0

            opacity-0
            group-hover:opacity-100

            transition-all
            duration-500

            bg-[radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.12),transparent_60%)]
          "
        />

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

      <div className="relative z-10 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* ICON */}
          <div
            className="
              relative

              flex
              items-center
              justify-center

              w-11
              h-11

              rounded-2xl

              bg-emerald-50

              border
              border-emerald-100
            "
          >
            <div
              className="
                absolute
                inset-0

                rounded-2xl

                bg-emerald-500/10

                blur-xl
              "
            />

            <span
              className="
                relative

                text-[20px]
                font-light

                text-emerald-600
              "
            >
              +
            </span>
          </div>

          {/* TEXT */}
          <div className="space-y-1">
            <p
              className="
                text-[11px]

                uppercase

                tracking-[0.18em]

                text-[color:var(--muted-soft)]
              "
            >
              ação rápida
            </p>

            <h3
              className="
                text-[15px]
                font-semibold

                tracking-tight

                text-[color:var(--foreground)]
              "
            >
              Novo cliente
            </h3>
          </div>
        </div>

        {/* ARROW */}
        <div
          className="
            flex
            items-center
            justify-center

            w-9
            h-9

            rounded-full

            bg-white

            border
            border-[color:var(--border-soft)]

            text-[18px]

            text-[color:var(--muted)]

            transition-all
            duration-300

            group-hover:text-emerald-600
            group-hover:border-emerald-200
          "
        >
          →
        </div>
      </div>
    </motion.button>
  );
}
