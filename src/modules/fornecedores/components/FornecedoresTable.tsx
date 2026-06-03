"use client";

import { useMemo, useState } from "react";

import { Building2, Landmark, Search } from "lucide-react";

import { useFornecedores } from "../hooks/useFornecedores";

import { useFornecedorResumo } from "../hooks/useFornecedores";

import { FornecedorModal } from "./FornecedorModal";

import { FornecedorFinanceiroModal } from "./FornecedorFinanceiroModal";

import type { Fornecedor } from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

function currency(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

////////////////////////////////////////////////////////////
// ROW
////////////////////////////////////////////////////////////

function FornecedorRow({
  fornecedor,
  onOpenFornecedor,
  onOpenFinanceiro,
}: {
  fornecedor: Fornecedor;

  onOpenFornecedor: (fornecedor: Fornecedor) => void;

  onOpenFinanceiro: (fornecedor: Fornecedor) => void;
}) {
  ////////////////////////////////////////////////////////////
  // MODAIS
  ////////////////////////////////////////////////////////////

  ////////////////////////////////////////////////////////////
  // RESUMO
  ////////////////////////////////////////////////////////////

  const { data } = useFornecedorResumo(fornecedor.id);

  const resumo = data?.resumo;

  ////////////////////////////////////////////////////////////
  // LIMITES
  ////////////////////////////////////////////////////////////

  const totalCompras = resumo?.totalCompras ?? 0;

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <tr
      className="
          border-b border-[color:rgba(15,23,42,0.04)]

          hover:bg-slate-50/70
          transition-colors
duration-200
        "
    >
      <td className="px-5 py-4">
        <div>
          <div
            className="
    text-[15px]
    font-semibold

    tracking-[-0.02em]

    text-[color:var(--foreground)]
  "
          >
            {fornecedor.nome} {fornecedor.sobrenome}
          </div>

          <div
            className="
                text-[14px]

                text-[color:var(--muted-soft)]
              "
          >
            {fornecedor.telefone}
          </div>
        </div>
      </td>

      <td className="px-4 py-4">{fornecedor.estado || "-"}</td>

      <td className="px-4 py-4">{resumo?.quantidadeFazendas ?? 0}</td>

      <td className="px-4 py-4">{totalCompras}</td>

      <td className="px-4 py-4">{resumo?.alertasAtivos ?? 0}</td>

      <td className="px-4 py-4">
        <div
          className="
              flex

              flex-col

              sm:flex-row
              sm:items-center

              gap-3

              w-full
              lg:w-auto
            "
        >
          <button
            onClick={() => onOpenFornecedor(fornecedor)}
            className="
  h-[42px]
  md:h-[36px]

  px-3

  rounded-[12px]

  border
  border-[color:var(--border-soft)]

  bg-white

  flex
  items-center
  gap-2

  text-[13px]
  font-medium

  transition-all
  duration-300

  hover:border-indigo-200
  hover:bg-indigo-50/70
"
          >
            <Building2 size={14} />
            Detalhes
          </button>

          <button
            onClick={() => onOpenFinanceiro(fornecedor)}
            className="
                h-[42px]
                md:h-9

                px-3

                rounded-xl

                border

                flex
                items-center
                gap-2

                hover:border-emerald-400
hover:bg-emerald-50/20
              "
          >
            <Landmark size={14} />
            Financeiro
          </button>
        </div>
      </td>
    </tr>
  );
}

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedoresTable() {
  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const { fornecedores, loading } = useFornecedores();

  ////////////////////////////////////////////////////////////
  // SEARCH
  ////////////////////////////////////////////////////////////

  const [search, setSearch] = useState("");

  const [fornecedorSelecionado, setFornecedorSelecionado] =
    useState<Fornecedor | null>(null);

  const [fornecedorModalOpen, setFornecedorModalOpen] = useState(false);

  const [financeiroFornecedor, setFinanceiroFornecedor] =
    useState<Fornecedor | null>(null);

  ////////////////////////////////////////////////////////////
  // FILTER
  ////////////////////////////////////////////////////////////

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return fornecedores;
    }

    return fornecedores.filter((fornecedor) => {
      return (
        fornecedor.nome.toLowerCase().includes(term) ||
        (fornecedor.sobrenome ?? "").toLowerCase().includes(term) ||
        (fornecedor.telefone ?? "").toLowerCase().includes(term)
      );
    });
  }, [fornecedores, search]);

  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  if (loading) {
    return (
      <div
        className="
          py-16

          text-center
        "
      >
        Carregando fornecedores...
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      className="
    group
    relative
    overflow-visible

    rounded-[22px]

    border
    border-[color:var(--border-soft)]

    bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.92))]

    shadow-[0_12px_40px_rgba(15,23,42,0.05)]

    backdrop-blur-xl
  "
    >
      {/* HEADER */}

      <div
        className="
          px-4

          sm:px-5
          py-4

          border-b border-[color:var(--border-soft)]

          flex
          flex-col
          lg:flex-row

          lg:items-center
          justify-between

          gap-3
        "
      >
        <div>
          <h2
            className="
      text-[20px]
      sm:text-[18px]

      font-semibold

      tracking-[-0.03em]
    "
          >
            Fornecedores cadastrados
          </h2>
        </div>

        <div
          className="
    flex
    items-center

    gap-3
  "
        >
          <div
            className="
      relative

      w-full
      sm:w-[260px]
    "
          >
            <Search
              size={16}
              className="
        absolute

        left-3
        top-1/2

        -translate-y-1/2

        text-[color:var(--muted-soft)]
      "
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fornecedor..."
              className="
        w-full

        h-[46px]
        sm:h-[42px]

        pl-10
        pr-4

        rounded-[14px]

        border
        border-[color:var(--border-soft)]

        bg-white/80

        text-[16px]
        md:text-[14px]

        outline-none

        transition-all
        duration-300

        focus:border-indigo-300

        focus:shadow-[0_0_0_3px_rgba(99,102,241,0.10)]
      "
            />
          </div>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="lg:hidden p-3 space-y-3">
        {filtered.map((fornecedor) => (
          <div
            key={fornecedor.id}
            className="
        rounded-2xl
        border border-[color:var(--border-soft)]
        bg-white
        p-4
        space-y-3
        shadow-[0_8px_24px_rgba(15,23,42,0.05)]
      "
          >
            <div>
              <p className="text-[15px] font-semibold text-[color:var(--foreground)]">
                {fornecedor.nome} {fornecedor.sobrenome}
              </p>

              <p className="text-[13px] text-[color:var(--muted-soft)]">
                {fornecedor.telefone || "Sem telefone"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MobileInfo label="UF" value={fornecedor.estado || "-"} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setFornecedorSelecionado(fornecedor);
                  setFornecedorModalOpen(true);
                }}
                className="
            h-[44px]
            rounded-xl
            border border-[color:var(--border-soft)]
            bg-white
            flex items-center justify-center gap-2
            text-[13px] font-medium
          "
              >
                <Building2 size={14} />
                Detalhes
              </button>

              <button
                onClick={() => setFinanceiroFornecedor(fornecedor)}
                className="
            h-[44px]
            rounded-xl
            border border-emerald-200
            bg-emerald-50/50
            flex items-center justify-center gap-2
            text-[13px] font-medium text-emerald-700
          "
              >
                <Landmark size={14} />
                Financeiro
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-10 text-center text-[color:var(--muted)]">
            Nenhum fornecedor encontrado
          </div>
        )}
      </div>

      {/* TABLE */}

      <div className="hidden lg:block overflow-x-auto">
        <table
          className="
            w-full

            min-w-[980px]
          "
        >
          <thead>
            <tr
              className="
    bg-slate-50/80

    border-b
    border-[color:rgba(15,23,42,0.04)]
  "
            >
              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                Fornecedor
              </th>

              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                UF
              </th>

              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                Fazendas
              </th>

              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                Compras
              </th>

              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                Alertas
              </th>

              <th
                className="
      px-5
      py-3

      text-left

      text-[11px]

      uppercase

      tracking-[0.18em]

      font-medium

      text-[color:var(--muted-soft)]
    "
              >
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((fornecedor) => (
              <FornecedorRow
                key={fornecedor.id}
                fornecedor={fornecedor}
                onOpenFornecedor={(item) => {
                  setFornecedorSelecionado(item);
                  setFornecedorModalOpen(true);
                }}
                onOpenFinanceiro={(item) => {
                  setFinanceiroFornecedor(item);
                }}
              />
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="
                    py-16

                    text-center

                    text-[color:var(--muted)]
                  "
                >
                  Nenhum fornecedor encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <FornecedorModal
        open={fornecedorModalOpen}
        fornecedor={fornecedorSelecionado}
        onClose={() => {
          setFornecedorModalOpen(false);
          setFornecedorSelecionado(null);
        }}
      />

      {financeiroFornecedor && (
        <FornecedorFinanceiroModal
          open={Boolean(financeiroFornecedor)}
          fornecedorId={financeiroFornecedor.id}
          fornecedorNome={`${financeiroFornecedor.nome} ${
            financeiroFornecedor.sobrenome ?? ""
          }`}
          onClose={() => setFinanceiroFornecedor(null)}
        />
      )}
    </div>
  );
}
function MobileInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[color:var(--muted)]">{label}</p>
      <p className="text-sm font-medium text-[color:var(--foreground)]">
        {value}
      </p>
    </div>
  );
}
