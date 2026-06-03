"use client";

import { useMemo, useState } from "react";

import { Check, MapPin, Search } from "lucide-react";

import { useFazendasFornecedor } from "../hooks/useFornecedores";

import type { FazendaFornecedor } from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  fornecedorId?: string;

  fazendaSelecionadaId?: string;

  onSelectFazenda?: (fazenda: FazendaFornecedor) => void;
}

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FazendaSelect({
  fornecedorId,
  fazendaSelecionadaId,
  onSelectFazenda,
}: Props) {
  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  const { fazendas, loading } = useFazendasFornecedor(fornecedorId);

  ////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////

  const [search, setSearch] = useState("");

  ////////////////////////////////////////////////////////////
  // SELECTED
  ////////////////////////////////////////////////////////////

  const fazendaSelecionada = useMemo(() => {
    return fazendas.find((fazenda) => fazenda.id === fazendaSelecionadaId);
  }, [fazendas, fazendaSelecionadaId]);

  ////////////////////////////////////////////////////////////
  // FILTER
  ////////////////////////////////////////////////////////////

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return [];
    }

    return fazendas.filter((fazenda) => {
      return (
        fazenda.nome.toLowerCase().includes(term) ||
        (fazenda.cidade ?? "").toLowerCase().includes(term) ||
        (fazenda.estado ?? "").toLowerCase().includes(term)
      );
    });
  }, [fazendas, search]);

  ////////////////////////////////////////////////////////////
  // SEM FORNECEDOR
  ////////////////////////////////////////////////////////////

  if (!fornecedorId) {
    return (
      <div
        className="
          h-[46px]

          rounded-xl

          border

          border-dashed

          border-[color:var(--border-soft)]

          bg-[color:var(--surface-100)]

          flex
          items-center

          px-4

          text-[14px]
          sm:text-sm

          text-[color:var(--muted)]
        "
      >
        Selecione um fornecedor primeiro
      </div>
    );
  }

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
          
          text-[14px]
          sm:text-sm

          text-[color:var(--muted)]
        "
      >
        Carregando fazendas...
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div className="space-y-2">
      <div
        className="
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
          <div className="relative">
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fazenda..."
              className="
                  w-full

                  h-[46px]

                  sm:h-[40px]

                  pl-9
                  pr-3

                  rounded-lg

                  border

                  border-[color:var(--border-soft)]

                  outline-none

                  text-[16px]

                  md:text-sm
                "
            />
          </div>
        </div>

        {/* LIST */}

        {search.trim().length >= 2 && (
          <div
            className="
      max-h-[260px]
      sm:max-h-[320px]

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
                Nenhuma fazenda encontrada
              </div>
            )}

            {filtered.map((fazenda) => {
              const active = fazenda.id === fazendaSelecionadaId;

              return (
                <button
                  key={fazenda.id}
                  type="button"
                  onClick={() => {
                    onSelectFazenda?.(fazenda);

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
              gap-1
            "
                  >
                    <span
                      className="
                      text-[14px]
                sm:text-sm
                font-medium
              "
                    >
                      {fazenda.nome}
                    </span>

                    <div
                      className="
                flex
                items-center
                gap-1

                text-[11px]

                text-[color:var(--muted)]
              "
                    >
                      <MapPin size={12} />

                      {[fazenda.cidade, fazenda.estado]
                        .filter(Boolean)
                        .join(" - ")}
                    </div>
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
