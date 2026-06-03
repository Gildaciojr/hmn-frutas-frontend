"use client";

import { useState } from "react";

import { FazendaSelect } from "@/modules/fornecedores/components/FazendaSelect";
import { FornecedorSelect } from "@/modules/fornecedores/components/FornecedorSelect";

import type {
  FazendaFornecedor,
  Fornecedor,
} from "@/modules/fornecedores/services/fornecedores.service";

import type { SearchCompraParams } from "../services/compras-relatorios.service";

interface Props {
  loading?: boolean;

  onSearch: (filters: SearchCompraParams) => void;

  onClear: () => void;
}

export function ComprasFiltersCard({ loading, onSearch, onClear }: Props) {
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);

  const [fazenda, setFazenda] = useState<FazendaFornecedor | null>(null);

  const [placa, setPlaca] = useState<string>("");

  const [numeroFolha, setNumeroFolha] = useState<string>("");

  const [status, setStatus] = useState<string>("");

  const [dataInicio, setDataInicio] = useState<string>("");

  const [dataFim, setDataFim] = useState<string>("");

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  function handleSearch() {
    onSearch({
      fornecedor: fornecedor?.nome,
      fornecedorId: fornecedor?.id,

      fazenda: fazenda?.nome,
      fazendaId: fazenda?.id,

      placa: placa || undefined,

      numeroFolha: numeroFolha || undefined,

      status: status || undefined,

      dataInicio: dataInicio || undefined,

      dataFim: dataFim || undefined,
    });
  }

  function handleClear() {
    setFornecedor(null);

    setFazenda(null);

    setPlaca("");

    setNumeroFolha("");

    setStatus("");

    setDataInicio("");

    setDataFim("");

    setShowAdvancedFilters(false);

    onClear();
  }

  return (
    <section
      className="
        soft-card
        relative
        overflow-visible

        max-w-[1400px]
        mx-auto

        rounded-[24px]

        px-4
        sm:px-5

        py-4

        space-y-3
      "
    >
      <div
        className="
          flex
          flex-col
          md:flex-row

          md:items-center
          justify-between

          gap-2
        "
      >
        <div className="space-y-0">
          <h2 className="text-[15px] sm:text-[16px] font-bold tracking-tight text-[color:var(--foreground)]">
            Central de relatórios
          </h2>

          <p className="text-[11px] sm:text-[12px] text-[color:var(--muted)]">
            Gere relatórios gerenciais por fornecedor, fazenda e período.
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2

            text-[10px]
            text-[color:var(--muted-soft)]
          "
        >
          <span className="w-[6px] h-[6px] rounded-full bg-emerald-500" />

          <span className="uppercase tracking-[0.18em]">Compras</span>
        </div>
      </div>

      <div
        className="
    grid

    grid-cols-1

    md:flex
    md:flex-wrap

    items-end

    gap-3
  "
      >
        <div
          className="
  space-y-1

  w-full

  md:w-[280px]
"
        >
          <label className="label-base">Fornecedor</label>

          <FornecedorSelect
            fornecedorSelecionadoId={fornecedor?.id}
            onSelectFornecedor={(novoFornecedor) => {
              setFornecedor(novoFornecedor);

              setFazenda(null);
            }}
          />
        </div>

        <div
          className="
  space-y-1

  w-full

  md:w-[280px]
"
        >
          <label className="label-base">Fazenda</label>

          <FazendaSelect
            fornecedorId={fornecedor?.id}
            fazendaSelecionadaId={fazenda?.id}
            onSelectFazenda={setFazenda}
          />
        </div>

        <div
          className="
  space-y-1

  w-full

  sm:w-[220px]

  md:w-[150px]
"
        >
          <label className="label-base">Data inicial</label>

          <input
            className="input-base"
            type="date"
            value={dataInicio}
            onChange={(event) => setDataInicio(event.target.value)}
          />
        </div>

        <div className="space-y-1 w-[150px]">
          <label className="label-base">Data final</label>

          <input
            className="input-base"
            type="date"
            value={dataFim}
            onChange={(event) => setDataFim(event.target.value)}
          />
        </div>
      </div>

      <div
        className="
    flex

    flex-col

    md:flex-row

    md:items-center

    md:justify-between

    gap-3

    pt-1
  "
      >
        <button
          type="button"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="
            h-[42px]
            px-4

            rounded-[var(--radius-md)]

            border border-[color:var(--border-soft)]

            bg-[color:var(--surface-200)]

            text-[11px]
            font-semibold
            text-[color:var(--muted)]

            transition-all

            hover:border-[color:var(--brand)]
            hover:text-[color:var(--foreground)]
          "
        >
          {showAdvancedFilters
            ? "Ocultar filtros avançados"
            : "Filtros avançados"}
        </button>

        <div
          className="
    flex

    w-full

    md:w-auto

    gap-2
  "
        >
          <button
            type="button"
            onClick={handleClear}
            className="
              h-[42px]
              px-5

              rounded-[var(--radius-md)]

              border border-[color:var(--border-soft)]

              bg-[color:var(--surface-200)]

              text-[11px]
              font-semibold
              text-[color:var(--muted)]

              transition-all

              hover:border-[color:var(--border-strong)]
              hover:text-[color:var(--foreground)]
            "
          >
            Limpar
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSearch}
            className="
              btn-primary

              h-[42px]

              flex-1

              md:flex-none

              px-5

              text-[12px]
              font-semibold
            "
          >
            {loading ? "Gerando..." : "Gerar relatório"}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div
          className="
            grid

            grid-cols-1
            md:grid-cols-3

            gap-2

            pt-2

            border-t
            border-[color:var(--border-soft)]
          "
        >
          <div className="space-y-1">
            <label className="label-base">Placa</label>

            <input
              className="input-base"
              value={placa}
              onChange={(event) =>
                setPlaca(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 7),
                )
              }
              placeholder="Ex: ABC1D23"
            />
          </div>

          <div className="space-y-1">
            <label className="label-base">Número da folha</label>

            <input
              className="input-base"
              value={numeroFolha}
              onChange={(event) => setNumeroFolha(event.target.value)}
              placeholder="Romaneio / folha"
            />
          </div>

          <div className="space-y-1">
            <label className="label-base">Status</label>

            <select
              className="input-base"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Todos</option>

              <option value="ABERTA">Aberta</option>

              <option value="FECHADA">Fechada</option>

              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
