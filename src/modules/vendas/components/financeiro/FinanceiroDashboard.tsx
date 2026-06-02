"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import { FinanceiroResumo } from "../FinanceiroResumo";
import { FinanceiroModal } from "../FinanceiroModal";
import { useFinanceiroModalStore } from "@/core/stores/useFinanceiroModalStore";

import { AdminOperacoesResumo } from "../AdminOperacoesResumo";
import { FinanceiroVendasTable } from "./FinanceiroVendasTable";
import { FinanceiroComprasTable } from "./FinanceiroComprasTable";

type FinanceiroTab = "vendas" | "compras" | "fluxo";

export function FinanceiroDashboard() {
  const [tab, setTab] = useState<FinanceiroTab>("vendas");

  const { openModal } = useFinanceiroModalStore();

  return (
    <>
      <div className="space-y-3">
        {/* ================= HEADER ================= */}
        <div
          className="
    flex
    items-center
    justify-between

  "
        >
          <div
            className="
    flex
    items-center
    justify-between

    gap-2
  "
          >
            <div
              className="
                w-10 h-10 rounded-[20px]
                bg-gradient-to-br from-purple-400 to-indigo-600
                flex items-center justify-center
                text-white text-sm
                shadow-[0_10px_24px_rgba(99,102,241,0.18)]
              "
            >
              ↗
            </div>

            <div className="flex flex-col">
              <h2 className="text-[28px] font-semibold tracking-tight text-[color:var(--foreground)]">
                Financeiro
              </h2>
            </div>
          </div>
        </div>

        {/* ================= CARD PRINCIPAL ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="
            rounded-[var(--radius-md)]
            border border-[color:var(--border-soft)]
            bg-[color:var(--surface-100)]
            shadow-[var(--shadow-card)]
            overflow-hidden
          "
        >
          {/* ================= RESUMO ================= */}
          <div className="p-2.5 pb-2">
            <FinanceiroResumo />
          </div>

          <div className="h-px bg-[color:var(--border-soft)]" />

          {/* ================= TABS ================= */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-1 relative overflow-hidden">
              {(
                [
                  { id: "vendas", label: "Vendas", icon: "🛒" },
                  { id: "compras", label: "Compras", icon: "🚚" },
                  { id: "fluxo", label: "Fluxo", icon: "↻" },
                ] as {
                  id: FinanceiroTab;
                  label: string;
                  icon: string;
                }[]
              ).map((item) => {
                const active = tab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`
                      relative flex items-center gap-1.5
                      px-2 py-1
                      text-[12px]
                      rounded-[var(--radius-sm)]
                      whitespace-nowrap
                      transition-all
                      ${
                        active
                          ? "text-[color:var(--foreground)]"
                          : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                      }
                    `}
                  >
                    <span className="text-[11px] opacity-80">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>

                    {active && (
                      <motion.div
                        layoutId="financeiro-tab-indicator"
                        className="
                          absolute bottom-[-4px] left-0 right-0
                          h-[2px]
                          bg-[color:var(--brand)]
                          rounded-full
                        "
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= CONTEÚDO ================= */}
          <div className="border-t border-[color:var(--border-soft)]">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <h3 className="text-[14px] font-semibold text-[color:var(--foreground)]">
                  {tab === "vendas" && "Vendas"}
                  {tab === "compras" && "Compras"}
                  {tab === "fluxo" && "Fluxo"}
                </h3>

                <p className="text-[11px] text-[color:var(--muted)]">
                  {tab === "vendas" && "Histórico de vendas"}
                  {tab === "compras" && "Controle de compras"}
                  {tab === "fluxo" && "Movimentações financeiras"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(tab === "vendas" || tab === "compras" || tab === "fluxo") && (
                  <>
                    <button
                      className="
                        flex items-center gap-1.5
                        w-8 h-8
                        justify-center
                        text-[11px]
                        rounded-[var(--radius-sm)]
                        border border-[color:var(--border-soft)]
                        bg-[color:var(--surface-100)]
                        hover:border-[color:var(--border-strong)]
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]
                        active:scale-[0.98]
                        transition
                      "
                    >
                      ⚙
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="px-4 pb-4 pt-3">
              {tab === "vendas" && (
                <motion.div
                  key="vendas"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FinanceiroVendasTable />
                </motion.div>
              )}

              {tab === "compras" && (
                <motion.div
                  key="compras"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FinanceiroComprasTable />
                </motion.div>
              )}

              {tab === "fluxo" && (
                <motion.div
                  key="fluxo"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AdminOperacoesResumo />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <FinanceiroModal />
    </>
  );
}
