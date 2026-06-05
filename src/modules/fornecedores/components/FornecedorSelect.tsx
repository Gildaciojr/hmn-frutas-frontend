"use client";

import { useMemo, useState } from "react";

import { Check, Search } from "lucide-react";

import { useFornecedores } from "../hooks/useFornecedores";

import type { Fornecedor } from "../services/fornecedores.service";

{
  /* TYPES */
}

interface Props {
  fornecedorSelecionadoId?: string;

  onSelectFornecedor?: (fornecedor: Fornecedor) => void;
}

{
  /* COMPONENT */
}

export function FornecedorSelect({
  fornecedorSelecionadoId,
  onSelectFornecedor,
}: Props) {
  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  const { fornecedores, loading } = useFornecedores();

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  const [search, setSearch] = useState("");

  ////////////////////////////////////////////////////////////
  // SELECTED
  ////////////////////////////////////////////////////////////

  const fornecedorSelecionado = useMemo(() => {
    return fornecedores.find(
      (fornecedor) => fornecedor.id === fornecedorSelecionadoId,
    );
  }, [fornecedores, fornecedorSelecionadoId]);

  ////////////////////////////////////////////////////////////
  // FILTER
  ////////////////////////////////////////////////////////////

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return fornecedores.filter((fornecedor) => {
      const nome = fornecedor.nome.toLowerCase();

      const sobrenome = (fornecedor.sobrenome ?? "").toLowerCase();

      const telefone = (fornecedor.telefone ?? "").toLowerCase();

      return (
        nome.includes(term) ||
        sobrenome.includes(term) ||
        telefone.includes(term)
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
          h-[46px]

          rounded-xl

          border

          border-[color:var(--border-soft)]

          bg-[color:var(--surface-100)]

          flex
          items-center

          px-4

          text-sm

          text-[color:var(--muted)]
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
    <div className="space-y-2 w-full min-w-0">
      {/* DROPDOWN */}
      <div
        className="
    mt-1

    w-full
    min-w-0

    overflow-hidden

    rounded-xl
    sm:rounded-2xl

    border

    border-[color:var(--border-soft)]

    bg-white

    shadow-[0_12px_30px_rgba(0,0,0,0.08)]
  "
      >
        {/* SEARCH */}
        <div className="p-3">
          <div
            className="
                relative
              "
          >
            <Search
              size={16}
              className="
                  absolute

                  left-3
                  top-1/2

                  -translate-y-1/2

                  text-[color:var(--muted)]
                "
            />

            <input
              value={
                search ||
                (fornecedorSelecionado
                  ? `${fornecedorSelecionado.nome}${fornecedorSelecionado.sobrenome ? ` ${fornecedorSelecionado.sobrenome}` : ""}`
                  : "")
              }
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fornecedor"
              className="
                  w-full

                  h-[46px]

                  sm:h-[40px]

                  pl-9
                  pr-3

                  rounded-xl

                  border

                  border-[color:var(--border-soft)]

                  outline-none

                  text-[16px]
                  md:text-sm
                "
            />
          </div>
        </div>
        {/* LISTA */}
        {search.trim().length >= 2 && (
          <div
            className="
      max-h-[220px]
      sm:max-h-[280px]
      overflow-y-auto
    "
          >
            {filtered.length === 0 && (
              <div
                className="
                  px-4
                  py-8

                  text-center

                  text-sm

                  text-[color:var(--muted)]
                "
              >
                Nenhum fornecedor encontrado
              </div>
            )}

            {filtered.map((fornecedor) => {
              const active = fornecedor.id === fornecedorSelecionadoId;

              return (
                <button
                  key={fornecedor.id}
                  type="button"
                  onClick={() => {
                    onSelectFornecedor?.(fornecedor);

                    setSearch("");
                  }}
                  className="
                      w-full

                      px-4
                      py-3.5

                      flex
                      items-center
                      justify-between

                      text-left

                      hover:bg-black/[0.03]

                      transition
                    "
                >
                  <div
                    className="
                        flex
                        flex-col
                      "
                  >
                    <span
                      className="
                          text-[14px]

                          sm:text-sm
                          font-medium
                          truncate
                        "
                    >
                      {fornecedor.nome} {fornecedor.sobrenome}
                    </span>

                    {fornecedor.telefone && (
                      <span
                        className="
                            text-[11px]

                            text-[color:var(--muted)]
                          "
                      >
                        {fornecedor.telefone}
                      </span>
                    )}
                  </div>

                  {active && <Check size={16} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
