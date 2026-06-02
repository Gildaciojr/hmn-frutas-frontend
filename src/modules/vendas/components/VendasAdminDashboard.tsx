"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { AdminKpiGrid } from "./AdminKpiGrid";
import { ClientesTable } from "@/modules/clientes/components/ClientesTable";
import { NovaVendaCard } from "./NovaVendaCard";
import { useClientes } from "@/modules/clientes/hooks/useClientes";
import { EstoqueCard } from "@/modules/estoque/components/EstoqueCard";
import { NovoClienteQuickCard } from "@/modules/clientes/components/NovoClienteQuickCard";

export function VendasAdminDashboard() {
  const { clientes } = useClientes();

  return (
    <>
      <div
        className="
          space-y-10
          max-w-[1400px]
          mx-auto
        "
      >
        {/* ================= ZONA 1 — ESTOQUE ================= */}
        <section className="space-y-4">
          <div
            className="
    flex
    flex-col
    items-center

    gap-3

    pb-2
  "
          >
            <Image
              src="/logo-hmn.png"
              alt="HMN Frutas"
              width={260}
              height={100}
              priority
              className="
      h-[100px]
      w-auto

      object-contain

      opacity-95
    "
            />

            <div className="flex items-center gap-3">
              <div className="w-1 h-4 rounded-full bg-[color:var(--danger)]" />

            </div>
          </div>

          {/* 🔥 ESTOQUE (POSIÇÃO ESTRATÉGICA) */}
          <div
            className="
    grid
    grid-cols-1
    lg:grid-cols-[1fr_320px]
    gap-4
  "
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EstoqueCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <NovoClienteQuickCard />
            </motion.div>
          </div>
        </section>

        {/* ================= ZONA 2 — OPERAÇÃO ================= */}
        <section
          className="
            grid grid-cols-1
            xl:grid-cols-12
            gap-5
          "
        >
          {/* ================= COLUNA PRINCIPAL ================= */}
          <div className="xl:col-span-12 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NovaVendaCard />
            </motion.div>
          </div>
        </section>

        {/* ================= ZONA 3 — CLIENTES ================= */}
        <section
          className="
            relative

            overflow-hidden

            rounded-[32px]

            border border-[color:var(--border-soft)]

            bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]

            shadow-[0_25px_80px_rgba(0,0,0,0.06)]

            backdrop-blur-xl

            p-7

            space-y-6
          "
        >
          {/* ================= BACKGROUND FX ================= */}
          <div className="absolute inset-0 pointer-events-none">
            {/* GLOW TOP RIGHT */}
            <div
              className="
                absolute

                top-[-120px]
                right-[-120px]

                w-[320px]
                h-[320px]

                rounded-full

                bg-emerald-500/10

                blur-[90px]
              "
            />

            {/* GLOW LEFT */}
            <div
              className="
                absolute

                bottom-[-140px]
                left-[-120px]

                w-[280px]
                h-[280px]

                rounded-full

                bg-black/5

                blur-[100px]
              "
            />

            {/* GRID */}
            <div
              className="
                absolute inset-0

                opacity-[0.025]

                bg-[linear-gradient(rgba(0,0,0,0.4)_1px,transparent_1px),
                    linear-gradient(90deg,rgba(0,0,0,0.4)_1px,transparent_1px)]

                bg-[size:42px_42px]
              "
            />

            {/* LIGHT TOP */}
            <div
              className="
                absolute inset-x-0 top-0 h-[1px]

                bg-gradient-to-r
                from-transparent
                via-white/80
                to-transparent
              "
            />
          </div>

          {/* ================= HEADER ================= */}
          <div className="relative z-10 flex items-end justify-between">
            {/* LEFT */}
            <div className="space-y-3">
              {/* LABEL */}
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-1.5 h-5

                    rounded-full

                    bg-emerald-500

                    shadow-[0_0_18px_rgba(16,185,129,0.45)]
                  "
                />

                <span
                  className="
                    text-[10px]

                    uppercase

                    tracking-[0.28em]

                    text-emerald-600

                    font-semibold
                  "
                >
                  Gestão de relacionamento
                </span>
              </div>

              {/* TITLE */}
              <div className="space-y-2">
                <h2
                  className="
                    text-[28px]

                    font-semibold

                    tracking-[-0.04em]

                    text-[color:var(--foreground)]

                    leading-none
                  "
                >
                  Clientes
                </h2>

                <p
                  className="
                    text-[13px]

                    leading-relaxed

                    text-[color:var(--muted)]

                    max-w-[520px]
                  "
                >
                  Visão financeira consolidada, operações, saldo operacional e
                  comunicação estratégica integrada.
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div
              className="
                flex flex-col items-end justify-center

                min-w-[120px]

                rounded-2xl

                border border-white/60

                bg-white/70

                px-5 py-4

                shadow-[0_10px_30px_rgba(0,0,0,0.05)]

                backdrop-blur-md
              "
            >
              <p
                className="
                  text-[28px]

                  font-semibold

                  tracking-tight

                  text-[color:var(--foreground)]

                  leading-none
                "
              >
                {clientes?.length ?? 0}
              </p>

              <p
                className="
                  mt-1

                  text-[10px]

                  uppercase

                  tracking-[0.22em]

                  text-[color:var(--muted-soft)]
                "
              >
                registros
              </p>
            </div>
          </div>

          {/* ================= DIVIDER ================= */}
          <div
            className="
              relative z-10

              h-px

              bg-gradient-to-r
              from-transparent
              via-[color:var(--border-soft)]
              to-transparent
            "
          />

          {/* ================= TABELA ================= */}
          <div className="relative z-10">
            <ClientesTable />
          </div>
        </section>
      </div>
    </>
  );
}
