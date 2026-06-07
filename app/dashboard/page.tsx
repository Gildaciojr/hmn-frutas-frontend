"use client";

import { useState } from "react";

import { motion } from "framer-motion";

import { useAppStore } from "@/core/stores/useAppStore";
import { AppLayout } from "@/ui/layout/AppLayout";
import { NovaCompraCard } from "@/modules/compras/NovaCompraCard";
import { VendasAdminDashboard } from "@/modules/vendas/components/VendasAdminDashboard";
import { KpiCard } from "@/ui/dashboard/KpiCard";
import { NovoFornecedorCard } from "@/modules/fornecedores/components/NovoFornecedorCard";
import { useComprasDashboard } from "@/modules/dashboard/hooks/useDashboard";
import { ComprasFiltersCard } from "@/modules/compras-relatorios/components/ComprasFiltersCard";
import { ComprasRelatorioTable } from "@/modules/compras-relatorios/components/ComprasRelatorioTable";
import { ComprasResumoCard } from "@/modules/compras-relatorios/components/ComprasResumoCard";
import { NovaDespesaCard } from "@/modules/despesas-operacionais/components/NovaDespesaCard";
import { useComprasRelatorio } from "@/modules/compras-relatorios/hooks/useComprasRelatorio";
import { FornecedoresList } from "@/modules/fornecedores/components/FornecedoresList";
import { FornecedorHistorico } from "@/modules/fornecedores/components/FornecedorHistorico";

import type { SearchCompraParams } from "@/modules/compras-relatorios/services/compras-relatorios.service";

import type { Compra } from "@/modules/compras/hooks/useCompras";

import { useAuthStore } from "@/core/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const mode = useAppStore((state) => state.mode);
  const token = useAuthStore((state) => state.token);

  const router = useRouter();

  const [filters, setFilters] = useState<SearchCompraParams>({});

  const [searchFilters, setSearchFilters] = useState<SearchCompraParams | null>(
    null,
  );

  const [compraEditando, setCompraEditando] = useState<Compra | null>(null);

  const { compras, loading: relatorioLoading } = useComprasRelatorio(
    searchFilters ?? {},
    Boolean(searchFilters),
  );

  // ================= DASHBOARD DATA =================
  const { data: comprasDashboard, loading: dashboardLoading } =
    useComprasDashboard();

  useEffect(() => {
    // 🔐 SEM TOKEN → VOLTA PARA SELECT MODE
    if (!token) {
      router.replace("/select-mode");
      return;
    }

    // ⚠️ TOKEN EXISTE MAS NÃO TEM MODO → FORÇA ESCOLHA
    if (!mode) {
      router.replace("/select-mode");
      return;
    }
  }, [token, mode, router]);

  // ⛔ EVITA HYDRATION MISMATCH + ESTADO INCONSISTENTE
  if (mode === "COMPRAS" && dashboardLoading) {
    return null;
  }

  return (
    <AppLayout>
      <div
        className="
    space-y-5

    sm:space-y-6

    max-w-[1400px]

    mx-auto

    px-1
    sm:px-0
  "
      >
        {/* ================= HEADER (SOMENTE COMPRAS) ================= */}
        {mode === "COMPRAS" && (
          <div
            className="
      relative

      animate-[fadeIn_.20s_ease-out]
    "
          >
            {/* 🔥 HERO CONTAINER */}
            <div
              className="
        group
        relative
        overflow-visible

        rounded-[var(--radius-lg)]

        px-4
        sm:px-5

        py-4
        sm:py-5

        bg-[linear-gradient(135deg,#ffffff,rgba(255,255,255,0.92))]

        border border-[rgba(0,0,0,0.06)]

        shadow-[0_14px_34px_rgba(0,0,0,0.06)]

        transition-[box-shadow,border-color,transform]
        duration-300

        hover:shadow-[0_18px_44px_rgba(0,0,0,0.10)]

        will-change-transform
      "
            >
              {/* ================= CAMADAS VISUAIS ================= */}
              <div className="absolute inset-0 pointer-events-none">
                {/* GRADIENT DE PROFUNDIDADE */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/[0.02] to-black/[0.05]" />

                {/* TEXTURA MAIS FINA */}
                <div
                  className="
    absolute inset-0

    opacity-[0.012]

    bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)]

    bg-[size:40px_40px]
  "
                />

                {/* LINHA SUPERIOR MAIS SOFISTICADA */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-60" />

                {/* GLOW DE MARCA */}
                <div
                  className="
    absolute

    top-0
    right-0

    w-[120px]
    h-[120px]

    md:w-[210px]
    md:h-[210px]

    rounded-full

    blur-[50px]

    bg-indigo-400/10

    opacity-0
    group-hover:opacity-100

    transition-opacity
    duration-300

    pointer-events-none
  "
                />
              </div>
            </div>

            {/* ================= CONTEÚDO ================= */}
            <div
              className="
    relative z-10

    flex
    flex-col

    gap-4

    min-h-auto

    md:min-h-[210px]
  "
            >
              {/* ESQUERDA */}
              <div className="space-y-3.5">
                {/* IDENTIDADE */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-[3px] h-5 rounded-full bg-[color:var(--brand)]" />
                    <div className="absolute inset-0 blur-sm opacity-60 bg-[color:var(--brand)] rounded-full" />
                  </div>

                  <span className="text-[12px] uppercase tracking-[0.38em] text-[color:var(--muted-soft)]">
                    Operação
                  </span>
                </div>

                {/* TÍTULO */}
                <h1
                  className="
    text-[24px]

    sm:text-[30px]

    md:text-[36px]

    font-semibold

    tracking-[-0.01em]

    text-[color:var(--foreground)]
  "
                >
                  Compras
                </h1>

                {/* 🔥 STATUS OPERACIONAL (TEMPO REAL) */}
                <div
                  className="
  flex

  flex-col

  sm:flex-row

  sm:flex-wrap

  gap-1
  sm:gap-2

  text-[12px]

  text-[color:var(--muted)]
"
                >
                  <span className="font-medium text-[color:var(--foreground)]">
                    Hoje:
                  </span>

                  {/* TOTAL FINANCEIRO */}
                  <span>
                    R${" "}
                    {Number(comprasDashboard?.comprasHoje ?? 0).toLocaleString(
                      "pt-BR",
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>

                  <span className="hidden sm:inline opacity-40">•</span>

                  {/* KG MOVIMENTADO */}
                  <span>
                    {Number(
                      comprasDashboard?.kgMovimentado ?? 0,
                    ).toLocaleString("pt-BR")}{" "}
                    kg
                  </span>

                  <span className="hidden sm:inline opacity-40">•</span>

                  {/* TOTAL OPERAÇÕES */}
                  <span>
                    {Number(
                      comprasDashboard?.totalOperacoes ?? 0,
                    ).toLocaleString("pt-BR")}{" "}
                    operações
                  </span>

                  <span className="hidden sm:inline opacity-40">•</span>

                  {/* FORNECEDORES ATIVOS */}
                  <span>
                    {Number(
                      comprasDashboard?.fornecedoresAtivos ?? 0,
                    ).toLocaleString("pt-BR")}{" "}
                    fornecedores ativos
                  </span>
                </div>

                {/* DESCRIÇÃO */}
                <p
                  className="
        text-[13px]
        sm:text-[14px]
        text-[color:var(--muted)]

        max-w-full

        sm:max-w-[540px]

        leading-relaxed
      "
                >
                  Controle de informações rápidas.
                </p>
              </div>

              {/* DIREITA */}
              <div
                className="
    hidden

    md:flex

    absolute

    top-5
    right-5

    flex-col
    items-end

    gap-4
  "
              >
                {/* BADGE */}
                <div
                  className="
    relative

    px-3.5
    py-1.5

    rounded-full

    bg-[linear-gradient(135deg,var(--surface-200),#ffffff)]

    border border-[color:var(--border-soft)]

    text-[10.5px]
    font-medium

    text-[color:var(--muted)]

    shadow-[0_4px_12px_rgba(0,0,0,0.04)]

    transition-[border-color,color,box-shadow]
    duration-300

    group-hover:border-[color:var(--brand)]

    group-hover:text-[color:var(--foreground)]

    group-hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)]
  "
                >
                  {/* FX */}
                  <div
                    className="
    absolute

    top-0
    left-1/2

    -translate-x-1/2

    w-[70px]
    h-[70px]

    rounded-full

    bg-indigo-400/10

    blur-[16px]

    opacity-0
    group-hover:opacity-100

    transition-opacity
    duration-300

    pointer-events-none
  "
                  />

                  <span className="relative flex items-center gap-1.5">
                    <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 opacity-90" />
                    Tempo real
                  </span>
                </div>

                {/* LOGO */}
                <div
                  className="
      relative

      flex
      items-center
      justify-center

      w-[280px]
      h-[160px]

      xl:w-[320px]
      xl:h-[180px]

      rounded-[40px]

      border border-white/80

      bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,255,255,0.42))]

      backdrop-blur-sm

      shadow-[0_20px_50px_rgba(0,0,0,0.08)]

      overflow-hidden
    "
                >
                  {/* glow */}
                  <div
                    className="
    absolute

    top-0
    left-1/2

    -translate-x-1/2

    w-[120px]
    h-[120px]

    rounded-full

    bg-emerald-400/10

    blur-[24px]
  "
                  />

                  {/* light */}
                  <div
                    className="
        absolute
        top-[-20px]
        left-1/2

        h-[90px]
        w-[140px]

        -translate-x-1/2

        rounded-full

        bg-white/60

        blur-[18px]
      "
                  />

                  {/* logo */}
                  <img
                    src={`${process.env.NEXT_PUBLIC_UPLOADS_URL}/empresa/logo-hmn.png`}
                    alt="HMN Frutas"
                    className="
        relative z-10

        w-[170px]
        h-auto

        object-contain

        drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)]

        select-none
        pointer-events-none
      "
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "COMPRAS" && (
          <div
            className="
    flex
    flex-col

    gap-6

    w-full
  "
          >
            <ComprasFiltersCard
              loading={relatorioLoading}
              onSearch={(novoFiltro) => {
                setFilters(novoFiltro);

                setSearchFilters(novoFiltro);
              }}
              onClear={() => {
                setFilters({});

                setSearchFilters(null);
              }}
            />

            {searchFilters?.fornecedorId ? (
              <FornecedorHistorico fornecedorId={searchFilters.fornecedorId} />
            ) : (
              <>
                {searchFilters && <ComprasResumoCard compras={compras} />}

                <ComprasRelatorioTable
                  compras={compras}
                  onEditar={setCompraEditando}
                />
              </>
            )}

            {/* ================= AÇÕES RÁPIDAS ================= */}
            <div
              className="
    relative

    w-full

    animate-[fadeIn_.18s_ease-out]
  "
            >
              {/* 🔥 GLOW */}
              <div
                className="
      absolute

      top-0
      left-0

      -z-10

      w-[140px]
      h-[140px]

      rounded-full

      bg-indigo-400/10

      blur-[24px]

      pointer-events-none
    "
              />

              <div
                className="
      grid

      grid-cols-1

      md:grid-cols-3

      xl:grid-cols-3

      items-start

      gap-4
    "
              >
                <NovaCompraCard />

                <NovaDespesaCard />

                <NovoFornecedorCard />
              </div>
            </div>

            {/* ================= FORNECEDORES ================= */}

            <div
              className="
    relative
    overflow-visible

    rounded-[24px]

    border
    border-[rgba(0,0,0,0.06)]

    bg-[linear-gradient(180deg,#ffffff,#fafafa)]

    shadow-[0_18px_50px_rgba(0,0,0,0.05)]

    p-3

    sm:p-5

    space-y-5
  "
            >
              {/* FX */}
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="
        absolute
        top-0
        right-0

        w-[220px]
        h-[220px]

        rounded-full

        bg-indigo-400/10

        blur-[40px]
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
        via-black/10
        to-transparent
      "
                />
              </div>

              {/* HEADER */}
              <div
                className="
    relative z-10

    flex

    flex-col
    sm:flex-row

    leading-relaxed

    items-start
    sm:items-center

    gap-3

    justify-between
  "
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-[4px] h-4 rounded-full bg-indigo-500" />

                    <span
                      className="
            text-[10px]
            uppercase
            tracking-[0.24em]

            text-[color:var(--muted-soft)]
          "
                    >
                      fornecedores
                    </span>
                  </div>

                  <h2
                    className="
          text-[22px]
          sm:text-[20px]
          font-semibold

          tracking-[-0.03em]

          text-[color:var(--foreground)]
        "
                  >
                    Gestão de fornecedores
                  </h2>
                </div>

                <div
                  className="
        px-3
        py-1.5

        rounded-full

        border
        border-indigo-200

        bg-indigo-50

        text-[12px]
        sm:text-[11px]
        font-medium

        text-indigo-600
      "
                >
                  Fornecedores
                </div>
              </div>

              {/* TABELA */}
              <div className="relative z-10">
                <FornecedoresList />
              </div>
            </div>

            {/* ================= COLUNA LATERAL ================= */}
            <div className="space-y-6">
              <div
                className="
    group
    relative
    overflow-visible

    rounded-[var(--radius-lg)]

    bg-[linear-gradient(180deg,#ffffff,rgba(255,255,255,0.94))]

    border border-[rgba(0,0,0,0.06)]

    p-5

    shadow-[0_12px_30px_rgba(0,0,0,0.05)]

    transition-[box-shadow,border-color,transform]
    duration-300

    hover:-translate-y-[1px]

    hover:shadow-[0_18px_42px_rgba(0,0,0,0.08)]

    will-change-transform
  "
              >
                {/* ================= CAMADA VISUAL ================= */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* GRADIENT */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/[0.02] to-black/[0.05]" />

                  {/* TEXTURA */}
                  <div
                    className="
    absolute
    inset-0

    opacity-[0.015]

    bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)]

    bg-[size:40px_40px]
  "
                  />

                  {/* GLOW */}
                  <div
                    className="
    absolute

    top-0
    right-0

    w-[120px]
    h-[120px]

    rounded-full

    bg-indigo-400/10

    blur-[24px]

    opacity-0
    group-hover:opacity-100

    transition-opacity
    duration-300

    pointer-events-none
  "
                  />

                  {/* LINHA SUPERIOR */}
                  <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/20 to-transparent opacity-60" />
                </div>

                {/* ================= HEADER ================= */}
                <div
                  className="
    relative z-10

    flex
    flex-col
    sm:flex-row

    items-start
    sm:items-center

    justify-between

    gap-3

    mb-4
  "
                >
                  <div className="space-y-1">
                    <h2 className="text-[14px] font-semibold tracking-tight text-[color:var(--foreground)]">
                      Operações
                    </h2>

                    <p className="text-[11px] text-[color:var(--muted)]">
                      Fluxo recente de movimentações
                    </p>
                  </div>

                  <div
                    className="
              text-[9.5px] px-2.5 py-[3px] rounded-full

              bg-[color:var(--surface-200)]
              text-[color:var(--muted-soft)]

              border border-[color:var(--border-soft)]

              transition-colors duration-300

              group-hover:border-[color:var(--brand)]
              group-hover:text-[color:var(--foreground)]
            "
                  >
                    tempo real
                  </div>
                </div>
                {/* ================= OPERAÇÕES DO DIA ================= */}
                <div className="relative z-10">
                  {comprasDashboard.ultimasCompras.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                      {/* ÍCONE COM IDENTIDADE */}
                      <div
                        className="
  relative

  w-11
  h-11

  rounded-xl

  flex

  flex-col

  lg:flex-row

  lg:items-center

  justify-center

  gap-4

  bg-[linear-gradient(135deg,var(--surface-200),#ffffff)]

  border border-[color:var(--border-soft)]

  text-[color:var(--muted-soft)]

  shadow-[0_6px_16px_rgba(0,0,0,0.04)]

  transition-[border-color,transform,box-shadow,color]
  duration-300

  group-hover:-translate-y-[1px]

  group-hover:border-[color:var(--brand)]

  group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]

  will-change-transform
"
                      >
                        <span className="text-[16px]">⟲</span>

                        {/* glow */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.18),transparent_70%)] rounded-xl" />
                        </div>
                      </div>

                      {/* TEXTO */}
                      <div className="space-y-1.5">
                        <p className="text-[12px] font-semibold tracking-tight text-[color:var(--foreground)]">
                          Nenhuma operação registrada
                        </p>

                        <p className="text-[11px] text-[color:var(--muted)] max-w-[240px] leading-relaxed">
                          Comece registrando uma nova compra para visualizar o
                          fluxo operacional em tempo real.
                        </p>
                      </div>

                      {/* CTA DIRETO */}
                      <button
                        onClick={() => {
                          const el =
                            document.querySelector("[data-nova-compra]");

                          el?.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                          });
                        }}
                        className="
  mt-2

  px-2
  py-[4px]

  rounded-[var(--radius-sm)]

  text-[11px]
  font-medium

  bg-[color:var(--brand-soft)]
  text-[color:var(--brand)]

  border border-transparent

  transition-colors
  duration-200

  hover:bg-[color:var(--brand)]
  hover:text-white
"
                      >
                        Criar primeira compra
                      </button>
                    </div>
                  ) : (
                    <div
                      className="
    grid

    grid-cols-1

    gap-2

    max-h-[50dvh]
    sm:max-h-[620px]

    overflow-y-auto

    pr-1
  "
                    >
                      {comprasDashboard.ultimasCompras.map((compra, index) => {
                        const dataCompra = new Date(compra.createdAt);

                        return (
                          <div
                            key={compra.id}
                            className="
    group/item
    relative
    overflow-visible

    rounded-[20px]

    border border-[color:var(--border-soft)]

    bg-[linear-gradient(135deg,#ffffff,#fafafa)]

    px-3
    py-2

    transition-[transform,box-shadow,border-color]
    duration-300

    hover:-translate-y-[1px]

    hover:border-emerald-200

    hover:shadow-[0_10px_24px_rgba(16,185,129,0.08)]

    will-change-transform

    animate-[fadeIn_.18s_ease-out]
  "
                          >
                            {/* CAMADAS */}
                            <div className="absolute inset-0 pointer-events-none">
                              <div
                                className="
      absolute

      top-0
      right-0

      w-[120px]
      h-[120px]

      rounded-full

      bg-emerald-400/10

      blur-[24px]

      opacity-0
      group-hover/item:opacity-100

      transition-opacity
      duration-300

      pointer-events-none
    "
                              />

                              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 to-transparent" />
                            </div>

                            {/* CONTEÚDO */}
                            <div
                              className="
    relative
    z-10

  flex

  flex-col

  lg:flex-row

  lg:items-center

  lg:justify-between

  gap-4
  "
                            >
                              {/* ================================================= */}
                              {/* ESQUERDA */}
                              {/* ================================================= */}

                              <div className="flex items-center gap-4 min-w-0 flex-1">
                                {/* ICON */}
                                <div
                                  className="
  relative

  w-[22px]
  h-[22px]

  md:w-[26px]
  md:h-[26px]

  rounded-[10px]

  flex
  items-center
  justify-center

  bg-[linear-gradient(135deg,#ecfdf5,#d1fae5)]

  border
  border-emerald-200

  text-emerald-600

  shadow-[0_4px_12px_rgba(16,185,129,0.06)]

  shrink-0
"
                                >
                                  {/* FX */}
                                  <div
                                    className="
  absolute

  top-0
  left-1/2

  -translate-x-1/2

  w-[80px]
  h-[80px]

  rounded-full

  bg-emerald-400/14

  blur-[18px]

  opacity-0
  group-hover/item:opacity-100

  transition-opacity
  duration-300

  pointer-events-none
"
                                  />

                                  <span className="relative z-12 text-[17px]">
                                    ↓
                                  </span>
                                </div>

                                {/* INFO */}
                                <div className="min-w-0 flex-1">
                                  {/* TOP */}
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <p
                                      className="
            text-[15px]
            font-semibold

            tracking-[-0.03em]

            text-[color:var(--foreground)]

            truncate
          "
                                    >
                                      {compra.fornecedor?.nome ??
                                        compra.cliente?.nome ??
                                        "Fornecedor não informado"}
                                    </p>

                                    <span
                                      className="
            px-2.5 py-[4px]

            rounded-full

            border
            border-emerald-200

            bg-emerald-50

            text-[9px]
            font-semibold
            uppercase

            tracking-[0.20em]

            text-emerald-600
          "
                                    >
                                      Compra
                                    </span>
                                  </div>

                                  {/* DATA */}
                                  <p
                                    className="
          mt-1

          text-[12px]

          text-[color:var(--muted-soft)]
        "
                                  >
                                    {dataCompra.toLocaleDateString("pt-BR")} •{" "}
                                    {dataCompra.toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>

                                  {compra.usuarioResponsavelNome && (
                                    <p
                                      className="
                                        mt-1

                                        text-[11px]

                                        text-[color:var(--muted)]
                                      "
                                    >
                                      Registrado por:{" "}
                                      {compra.usuarioResponsavelNome}
                                    </p>
                                  )}

                                  {compra.fazendaFornecedor?.nome && (
                                    <p
                                      className="

      mt-1

      text-[11px]

      text-[color:var(--muted)]

    "
                                    >
                                      Fazenda: {compra.fazendaFornecedor.nome}
                                    </p>
                                  )}

                                  {/* TAGS */}
                                  <div
                                    className="
    mt-2

    flex
    flex-wrap
    items-center

    gap-2
  "
                                  >
                                    {/* KG BRUTO */}
                                    <span
                                      className="
      px-2 py-[4px]

      rounded-full

      bg-[color:var(--surface-200)]

      border
      border-[color:var(--border-soft)]

      text-[10px]
      sm:text-[11px]

      font-medium

      text-[color:var(--foreground)]
    "
                                    >
                                      {Number(compra.kgBruto).toLocaleString(
                                        "pt-BR",
                                      )}{" "}
                                      kg bruto
                                    </span>

                                    {/* KG LÍQUIDO */}
                                    <span
                                      className="
      px-2 py-[4px]

      rounded-full

      bg-[color:var(--surface-200)]

      border
      border-[color:var(--border-soft)]

      text-[10px]
      sm:text-[11px]
      
      font-medium

      text-[color:var(--foreground)]
    "
                                    >
                                      {Number(compra.kgLiquido).toLocaleString(
                                        "pt-BR",
                                      )}{" "}
                                      kg líquido
                                    </span>

                                    {/* CAMINHÃO */}
                                    <span
                                      className="
      px-2 py-[4px]

      rounded-full

      bg-[color:var(--surface-200)]

      border
      border-[color:var(--border-soft)]

      text-[11px]
      font-medium

      text-[color:var(--foreground)]
    "
                                    >
                                      {compra.modeloCaminhao}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* ================================================= */}
                              {/* DIREITA */}
                              {/* ================================================= */}

                              <div
                                className="
    flex
    flex-col

    w-full

    lg:w-auto

    items-start

    lg:items-end

    justify-center

    gap-2
    "
                              >
                                {/* VALOR */}
                                <div
                                  className="
  relative
  overflow-hidden

  rounded-[18px]

  border
  border-emerald-200

  bg-[linear-gradient(135deg,rgba(236,253,245,0.96),rgba(209,250,229,0.78))]

  w-full

  lg:w-auto

  px-3.5
  py-2.5

  shadow-[0_8px_18px_rgba(16,185,129,0.08)]

  transition-[transform,box-shadow,border-color]
  duration-300

  group-hover/item:-translate-y-[1px]

  group-hover/item:shadow-[0_12px_26px_rgba(16,185,129,0.12)]

  will-change-transform
"
                                >
                                  {/* FX */}
                                  <div className="absolute inset-0 pointer-events-none">
                                    <div
                                      className="
  absolute

  top-0
  right-0

  w-[100px]
  h-[100px]

  rounded-full

  bg-emerald-400/18

  blur-[22px]

  opacity-0
  group-hover/item:opacity-100

  transition-opacity
  duration-300

  pointer-events-none
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
            via-emerald-300/70
            to-transparent
          "
                                    />
                                  </div>

                                  {/* CONTENT */}
                                  <div className="relative z-10 text-right">
                                    <p
                                      className="
            text-[9px]
            uppercase

            tracking-[0.22em]

            text-emerald-600/80
          "
                                    >
                                      Valor operacional
                                    </p>

                                    <p
                                      className="
            mt-1

            text-[16px]
            sm:text-[22px]
            leading-none

            font-semibold

            tracking-[-0.05em]

            text-emerald-700
          "
                                    >
                                      {Number(
                                        compra.valorTotal ?? 0,
                                      ).toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                        minimumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {/* STATUS */}
                                <div
                                  className="
  inline-flex
  items-center
  gap-2

  px-2
  py-[4px]

  rounded-full

  bg-[color:var(--surface-200)]

  border
  border-[color:var(--border-soft)]

  text-[10px]
  font-medium
  uppercase

  tracking-[0.16em]

  text-[color:var(--muted-soft)]

  transition-colors
  duration-300

  group-hover/item:border-emerald-200

  group-hover/item:text-emerald-600
"
                                >
                                  <span className="w-[6px] h-[6px] rounded-full bg-emerald-500 opacity-90" />
                                  Entrada operacional
                                </div>
                              </div>
                            </div>

                            {/* BASE LINE ITEM */}
                            <div className="absolute bottom-0 left-0 h-[1.5px] w-full bg-emerald-500/0 transition-colors duration-300 group-hover/item:bg-emerald-500/60" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BASE LINE */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </div>
            </div>
          </div>
        )}

        {/* ================= VENDAS ================= */}
        {mode === "VENDAS" && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="
    relative
    w-full
  "
          >
            {/* CONTEXTO VISUAL (AGORA CONSISTENTE COM COMPRAS) */}
            <div
              className="
      space-y-6

      rounded-[var(--radius-lg)]

      border border-[color:var(--border-soft)]
      bg-[color:var(--surface-100)]

      p-3
      sm:p-4

      shadow-[var(--shadow-soft)]
    "
            >
              <VendasAdminDashboard />
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
