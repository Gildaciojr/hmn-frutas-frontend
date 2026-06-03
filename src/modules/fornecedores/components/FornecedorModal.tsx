"use client";

import { useEffect, useState } from "react";

import {
  Building2,
  ClipboardList,
  MapPinned,
  Pencil,
  Plus,
  User,
  X,
} from "lucide-react";

import {
  useFazendasFornecedor,
  useFornecedorResumo,
  useFornecedores,
} from "../hooks/useFornecedores";

import { FazendaForm } from "./FazendaForm";
import { FornecedorForm } from "./FornecedorForm";
import { FornecedorHistorico } from "./FornecedorHistorico";

import type {
  FazendaFornecedor,
  Fornecedor,
} from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  open: boolean;

  fornecedor: Fornecedor | null;

  onClose: () => void;
}

type Tab = "dados" | "fazendas" | "resumo" | "historico";

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedorModal({ open, fornecedor, onClose }: Props) {
  ////////////////////////////////////////////////////////////
  // STATE
  ////////////////////////////////////////////////////////////

  const [tab, setTab] = useState<Tab>("dados");

  const [editingFornecedor, setEditingFornecedor] = useState(false);

  const [creatingFazenda, setCreatingFazenda] = useState(false);

  ////////////////////////////////////////////////////////////
  // QUERIES
  ////////////////////////////////////////////////////////////

  const fornecedorId = fornecedor?.id;

  const resumoQuery = useFornecedorResumo(fornecedorId);

  const fazendasQuery = useFazendasFornecedor(fornecedorId);

  ////////////////////////////////////////////////////////////
  // MUTATIONS
  ////////////////////////////////////////////////////////////

  const { updateFornecedor, updating } = useFornecedores();

  ////////////////////////////////////////////////////////////
  // GUARD
  ////////////////////////////////////////////////////////////

  if (!open || !fornecedor) {
    return null;
  }

  ////////////////////////////////////////////////////////////
  // HANDLERS
  ////////////////////////////////////////////////////////////

  function handleClose() {
    setTab("dados");

    setEditingFornecedor(false);

    setCreatingFazenda(false);

    onClose();
  }

  async function handleUpdateFornecedor(
    data: Parameters<typeof updateFornecedor>[0]["payload"],
  ) {
    if (!fornecedor) {
      return;
    }

    await updateFornecedor({
      id: fornecedor.id,
      payload: data,
    });

    setEditingFornecedor(false);

    await resumoQuery.refetch();
  }

  async function handleCreateFazenda(_data: {
    nome: string;

    cidade?: string;

    estado?: string;

    observacoes?: string;
  }) {
    /**
     * Será ligado
     * ao createFazenda
     * no próximo passo.
     */

    setCreatingFazenda(false);

    await fazendasQuery.refetch();
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div
      className="
        fixed
        inset-0

        isolate

        z-[99999]

        bg-black/40

        flex

        items-start
        md:items-center

        justify-center

        overflow-y-auto

        p-2
        sm:p-4
      "
    >
      <div
        className="
          w-full

          max-w-[1200px]

          max-h-[95vh]

          overflow-hidden

          rounded-[28px]

          border

          border-[color:var(--border-soft)]

          bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))]

          shadow-[0_40px_120px_rgba(15,23,42,0.18)]
          backdrop-blur-xl
        "
      >
        {/* HEADER */}

        <div
          className="
            px-4
            sm:px-7

            py-4
            sm:py-5

            border-b

            border-[color:var(--border-soft)]
            bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.72))]

            flex

            flex-col
            sm:items-center

            justify-between
            gap-3
          "
        >
          <div>
            <h2
              className="
                text-[22px]
                sm:text-[26px]
                font-semibold
                tracking-[-0.04em]
              "
            >
              {fornecedor.nome} {fornecedor.sobrenome}
            </h2>

            <p
              className="
                text-[13px]

                text-[color:var(--muted-soft)]
              "
            >
              Gestão completa do fornecedor
            </p>
          </div>

          <button
            onClick={handleClose}
            className="
  group

  w-[42px]
  h-[42px]

  rounded-[14px]

  border
  border-[color:var(--border-soft)]

  bg-white/70

  flex
  items-center
  justify-center

  transition-all
  duration-300

  hover:border-red-200
  hover:bg-red-50
  hover:text-red-500
"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div
          className="
            grid-cols-1

            lg:grid-cols-[240px_1fr]

            h-auto

            lg:h-[calc(90vh-88px)]
          "
        >
          {/* SIDEBAR */}

          <div
            className="
              border-r

              border-[color:var(--border-soft)]

              p-4
              sm:p-5

              grid

              grid-cols-2
              sm:grid-cols-4

              lg-grid-cols-1

              gap-2
              bg-slate-50/70
            "
          >
            <TabButton
              active={tab === "dados"}
              icon={<User size={16} />}
              label="Dados"
              onClick={() => setTab("dados")}
            />

            <TabButton
              active={tab === "fazendas"}
              icon={<MapPinned size={16} />}
              label="Fazendas"
              onClick={() => setTab("fazendas")}
            />

            <TabButton
              active={tab === "resumo"}
              icon={<Building2 size={16} />}
              label="Resumo"
              onClick={() => setTab("resumo")}
            />

            <TabButton
              active={tab === "historico"}
              icon={<ClipboardList size={16} />}
              label="Histórico"
              onClick={() => setTab("historico")}
            />
          </div>

          {/* CONTENT */}

          <div
            className="
              overflow-y-auto

              p-4
              sm:p-7
              bg-[linear-gradient(180deg,rgba(255,255,255,0.65),rgba(248,250,252,0.58))]
            "
          >
            {tab === "dados" && (
              <>
                {!editingFornecedor ? (
                  <div className="space-y-5">
                    <button
                      onClick={() => setEditingFornecedor(true)}
                      className="
                        flex
                        items-center
                        gap-2

                        h-[42px]

                        px-4

                        rounded-[14px]

                        border
                        border-[color:var(--border-soft)]

bg-white

shadow-[0_6px_20px_rgba(15,23,42,0.04)]

hover:border-indigo-200
hover:bg-indigo-50/60

transition-all
duration-300
                      "
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    <Info label="Nome" value={fornecedor.nome} />

                    <Info label="Sobrenome" value={fornecedor.sobrenome} />

                    <Info label="Telefone" value={fornecedor.telefone} />

                    <Info label="UF" value={fornecedor.estado} />

                    <Info label="Observações" value={fornecedor.observacoes} />
                  </div>
                ) : (
                  <FornecedorForm
                    fornecedor={fornecedor}
                    loading={updating}
                    onSubmit={handleUpdateFornecedor}
                  />
                )}
              </>
            )}

            {tab === "fazendas" && (
              <div className="space-y-5">
                <div
                  className="
                    flex

                    flex-col
                    sm:flex-row

                    gap-3

                    sm:items-center

                    justify-between
                  "
                >
                  <h3
                    className="
                      text-lg
                      font-semibold
                    "
                  >
                    Fazendas
                  </h3>

                  <button
                    onClick={() => setCreatingFazenda(!creatingFazenda)}
                    className="
                      h-[46px]
                      md:h-10

                      px-4

                      rounded-xl

                      border

                      flex
                      items-center
                      gap-2
                    "
                  >
                    <Plus size={16} />
                    Nova Fazenda
                  </button>
                </div>

                {creatingFazenda && (
                  <FazendaForm onSubmit={handleCreateFazenda} />
                )}

                <div className="space-y-3">
                  {fazendasQuery.fazendas.map((fazenda: FazendaFornecedor) => (
                    <div
                      key={fazenda.id}
                      className="
                          p-4

                          rounded-2xl

                          border
                        "
                    >
                      <div className="font-medium">{fazenda.nome}</div>

                      <div className="text-sm text-[color:var(--muted)]">
                        {fazenda.cidade} • {fazenda.estado}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "resumo" && resumoQuery.data && (
              <div className="space-y-6">
                {/* KPI GRID */}

                <div
                  className="
        grid

        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4

        gap-4
      "
                >
                  <ResumoCard
                    title="Compras"
                    value={String(resumoQuery.data.resumo.totalCompras)}
                  />

                  <ResumoCard
                    title="Fazendas"
                    value={String(resumoQuery.data.resumo.quantidadeFazendas)}
                  />

                  <ResumoCard
                    title="KG Total"
                    value={`${resumoQuery.data.resumo.totalKg.toLocaleString()} kg`}
                  />

                  <ResumoCard
                    title="Frutas"
                    value={String(resumoQuery.data.resumo.totalFrutas)}
                  />
                </div>

                {/* FINANCEIRO */}

                <div
                  className="
        rounded-[24px]

        border
        border-[color:var(--border-soft)]

        bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))]

        p-5

        shadow-[0_10px_30px_rgba(15,23,42,0.05)]
      "
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p
                        className="
              text-[11px]

              uppercase

              tracking-[0.18em]

              text-[color:var(--muted-soft)]
            "
                      >
                        Financeiro
                      </p>

                      <h3
                        className="
              mt-2

              text-[24px]

              font-semibold

              tracking-[-0.04em]
            "
                      >
                        R${" "}
                        {resumoQuery.data.resumo.totalComprado.toLocaleString(
                          "pt-BR",
                        )}
                      </h3>
                    </div>

                    <div
                      className="
            px-4
            py-3

            rounded-full

            bg-emerald-50

            text-emerald-600

            text-[11px]
            font-medium
          "
                    >
                      Limite: R${" "}
                      {resumoQuery.data.resumo.limiteFinanceiroValor.toLocaleString(
                        "pt-BR",
                      )}
                    </div>
                  </div>
                </div>

                {/* ÚLTIMA COMPRA */}

                <div
                  className="
        rounded-[24px]

        border
        border-[color:var(--border-soft)]

        bg-white/80

        p-5
      "
                >
                  <p
                    className="
          text-[11px]

          uppercase

          tracking-[0.18em]

          text-[color:var(--muted-soft)]
        "
                  >
                    Última compra
                  </p>

                  <div className="mt-4">
                    {resumoQuery.data.resumo.ultimaCompra ? (
                      <div className="space-y-2">
                        <div className="font-medium">
                          {resumoQuery.data.resumo.ultimaCompra.placa}
                        </div>

                        <div className="text-sm text-[color:var(--muted)]">
                          {
                            resumoQuery.data.resumo.ultimaCompra
                              .quantidadeFrutas
                          }{" "}
                          frutas
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-[color:var(--muted)]">
                        Nenhuma compra registrada
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {tab === "historico" && (
              <FornecedorHistorico fornecedorId={fornecedor.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// TAB BUTTON
////////////////////////////////////////////////////////////

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;

  icon: React.ReactNode;

  label: string;

  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
  group
  relative

  w-full

  h-[46px]

  px-4

  rounded-[14px]

  flex
  items-center
  gap-3

  border

  transition-all
  duration-300

  ${
    active
      ? `
        border-indigo-400/20

        bg-[linear-gradient(135deg,#6366f1,#4f46e5)]

        text-white

        shadow-[0_10px_24px_rgba(99,102,241,0.24)]
      `
      : `
        border-[color:var(--border-soft)]

        bg-white/70

        text-[color:var(--foreground)]

        hover:border-indigo-200
        hover:bg-indigo-50/60
      `
  }
`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResumoCard({
  title,
  value,
}: {
  title: string;

  value: string;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden

        rounded-[22px]

        border
        border-[color:var(--border-soft)]

        bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.88))]

        px-5
        py-4

        shadow-[0_8px_24px_rgba(15,23,42,0.04)]
      "
    >
      <div
        className="
          text-[10px]

          uppercase

          tracking-[0.18em]

          text-[color:var(--muted-soft)]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-3

          text-[24px]

          font-semibold

          tracking-[-0.04em]

          text-[color:var(--foreground)]
        "
      >
        {value}
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// INFO
////////////////////////////////////////////////////////////

function Info({
  label,
  value,
}: {
  label: string;

  value?: string | null;
}) {
  return (
    <div>
      <div
        className="
    group
    relative

    rounded-[16px]

    border
    border-[color:var(--border-soft)]

    bg-white/80

    px-4
    py-3

    shadow-[0_6px_20px_rgba(15,23,42,0.03)]
  "
      >
        {label}
      </div>

      <div
        className="
          text-[10px]

          mt-1

          tracking-[0.18em]
font-medium
        "
      >
        {value || "-"}
      </div>
    </div>
  );
}
