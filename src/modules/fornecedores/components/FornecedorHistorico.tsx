"use client";

import { api } from "@/core/http/api";
import { AlertTriangle, CreditCard, TrendingUp, Wallet } from "lucide-react";

import { useFornecedorHistorico } from "../hooks/useFornecedores";
import { CompraEditModal } from "@/modules/compras/components/CompraEditModal";

import { Fragment, useState } from "react";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  fornecedorId: string;
}

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

function formatCurrency(value: string | number | null | undefined) {
  return Number(value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedorHistorico({ fornecedorId }: Props) {
  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const { data, isLoading, error } = useFornecedorHistorico(fornecedorId);

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const [compraSelecionadaId, setCompraSelecionadaId] = useState<string | null>(
    null,
  );

  const [editarCompraOpen, setEditarCompraOpen] = useState(false);

  ////////////////////////////////////////////////////////////
  // LOADING
  ////////////////////////////////////////////////////////////

  if (isLoading) {
    return (
      <div
        className="
          py-16

          text-center

          text-sm

          text-[color:var(--muted)]
        "
      >
        Carregando histórico...
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // ERROR
  ////////////////////////////////////////////////////////////

  if (error || !data) {
    return (
      <div
        className="
          py-16

          text-center

          text-sm

          text-red-500
        "
      >
        Erro ao carregar histórico
      </div>
    );
  }

  ////////////////////////////////////////////////////////////
  // DATA
  ////////////////////////////////////////////////////////////

  const resumo = data.resumo;

  const historico = data.historicoOperacional;

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <div className="space-y-5">
      {/* RESUMO */}

      <div
        className="

          max-w-[1400px]
          mx-auto

          px-1

          grid

          grid-cols-1
          sm:grid-cols-2

          xl:grid-cols-3

          gap-3
        "
      >
        <ResumoCard
          icon={<TrendingUp size={18} />}
          title="Total Comprado"
          value={formatCurrency(resumo.totalComprado)}
        />

        <ResumoCard
          icon={<Wallet size={18} />}
          title="Total Pago"
          value={formatCurrency(resumo.totalPago)}
          variant="success"
        />

        <ResumoCard
          icon={<CreditCard size={18} />}
          title="Saldo Devedor"
          value={formatCurrency(resumo.saldoDevedor)}
          variant="danger"
        />
      </div>

      {/* EXTRATO OPERACIONAL */}

      <section className="space-y-4">
        <div
          className="
            flex

            flex-col
            sm:flex-row

            sm:items-center

            justify-between

            gap-3
          "
        >
          <h3
            className="
              text-[22px]
              sm:text-[20px]

              font-semibold
              tracking-[-0.03em]
            "
          >
            Extrato Operacional
          </h3>

          <div
            className="
    flex

    flex-col
    sm:flex-row

    items-stretch
    sm:items-center

    gap-2
  "
          >
            <button
              type="button"
              onClick={async () => {
                try {
                  const response = await api.get<Blob>(
                    `/fornecedores/${fornecedorId}/relatorio-pdf`,
                    {
                      responseType: "blob",
                    },
                  );

                  const file = response.data;

                  const url = window.URL.createObjectURL(file);

                  setPdfBlob(file);

                  setPdfUrl(url);

                  const isMobile = /Android|iPhone|iPad|iPod/i.test(
                    navigator.userAgent,
                  );
                  if (isMobile) {
                    window.location.href = url;
                  } else {
                    window.open(url, "_blank", "noopener,noreferrer");
                  }
                } catch (error) {
                  console.error("Erro ao gerar PDF:", error);
                }
              }}
              className="
      inline-flex

      items-center
      justify-center

      gap-2

      rounded-xl

      border
      border-[color:var(--border-soft)]

      bg-white

      h-[46px]

      px-5

      text-sm
      font-medium

      shadow-sm

      transition-all
      duration-200

      hover:border-[color:var(--brand)]

      hover:text-[color:var(--brand)]

      hover:shadow-md

      w-full
      sm:w-auto
    "
            >
              📄 Gerar PDF
            </button>

            {pdfBlob && pdfUrl && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const file = new File(
                      [pdfBlob],
                      "relatorio-fornecedor.pdf",
                      {
                        type: "application/pdf",
                      },
                    );

                    if (
                      navigator.share &&
                      navigator.canShare?.({
                        files: [file],
                      })
                    ) {
                      await navigator.share({
                        title: "Relatório de Fornecedor",
                        text: "Relatório gerado pelo sistema HMN Frutas",
                        files: [file],
                      });

                      return;
                    }

                    const link = document.createElement("a");

                    link.href = pdfUrl;

                    link.download = "relatorio-fornecedor.pdf";

                    document.body.appendChild(link);

                    link.click();

                    document.body.removeChild(link);
                  } catch (error) {
                    console.error("Erro ao exportar PDF:", error);
                  }
                }}
                className="
        inline-flex

        items-center
        justify-center

        gap-2

        rounded-xl

        border
        border-emerald-200

        bg-emerald-50

        h-[46px]

        px-5

        text-sm
        font-medium

        text-emerald-700

        shadow-sm

        transition-all
        duration-200

        hover:bg-emerald-100

        hover:border-emerald-300

        hover:shadow-md

        w-full
        sm:w-auto
      "
              >
                📤 Exportar
              </button>
            )}
          </div>
        </div>

        {historico.length === 0 && (
          <EmptyState text="Nenhuma operação encontrada." />
        )}

        {historico.length > 0 && (
          <div
            className="
        overflow-x-auto

        rounded-[24px]

        border
        border-[color:var(--border-soft)]

        bg-white
      "
          >
            <table className="min-w-[1900px] text-sm">
              <thead
                className="
            bg-slate-50

            border-b
            border-[color:var(--border-soft)]
          "
              >
                <tr className="text-left">
                  <th className="px-4 py-3">Data</th>

                  <th className="px-4 py-3">Folha</th>

                  <th className="px-4 py-3">Fazenda</th>

                  <th className="px-4 py-3">Modelo</th>

                  <th className="px-4 py-3">Placa</th>

                  <th className="px-4 py-3">Peso Bruto</th>

                  <th className="px-4 py-3">Frutas</th>

                  <th className="px-4 py-3">Média</th>

                  <th className="px-4 py-3">Desc.</th>

                  <th className="px-4 py-3">Peso Líquido</th>

                  <th className="px-4 py-3">Preço Kg</th>

                  <th className="px-4 py-3">Total Bruto</th>

                  <th className="px-4 py-3">Despesas</th>

                  <th className="px-4 py-3">Valor Final</th>

                  <th className="px-4 py-3">Pago</th>

                  <th className="px-4 py-3">Restante</th>

                  <th className="px-4 py-3">Status Compra</th>

                  <th className="px-4 py-3">Status Financeiro</th>

                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>

              <tbody>
                {historico.map((item) => (
                  <Fragment key={item.compraId}>
                    <tr
                      className="
                  border-b
                  border-[color:var(--border-soft)]

                  hover:bg-slate-50/70
                "
                    >
                      <td className="px-4 py-4">
                        {formatDate(item.dataCompra)}
                      </td>

                      <td className="px-4 py-4">{item.numeroFolha ?? "-"}</td>

                      <td className="px-4 py-4">{item.fazenda ?? "-"}</td>

                      <td className="px-4 py-4">
                        {item.modeloCaminhao ?? "-"}
                      </td>

                      <td className="px-4 py-4">{item.placa ?? "-"}</td>

                      <td className="px-4 py-4">
                        {item.kgBruto.toFixed(0)} kg
                      </td>

                      <td className="px-4 py-4">{item.quantidadeFrutas}</td>

                      <td className="px-4 py-4">
                        {item.mediaFruta.toFixed(2)}
                      </td>

                      <td className="px-4 py-4">
                        {item.descontoKgCalculado.toFixed(0)} kg
                      </td>

                      <td className="px-4 py-4">
                        {item.kgLiquido.toFixed(0)} kg
                      </td>

                      <td className="px-4 py-4">
                        {formatCurrency(item.precoKg)}
                      </td>

                      <td className="px-4 py-4">
                        {formatCurrency(item.totalBruto)}
                      </td>

                      <td className="px-4 py-4">
                        {formatCurrency(item.despesas)}
                      </td>

                      <td
                        className="
                    px-4 py-4

                    font-semibold

                    text-[color:var(--brand)]
                  "
                      >
                        {formatCurrency(item.valorTotal)}
                      </td>

                      <td className="px-4 py-4 text-emerald-600">
                        {formatCurrency(item.valorPago)}
                      </td>

                      <td className="px-4 py-4 font-semibold text-red-600">
                        {formatCurrency(item.valorRestante)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`
      inline-flex

      rounded-full

      px-2
      py-1

      text-[11px]
      font-medium

      ${
        item.statusCompra === "FECHADA"
          ? "bg-emerald-100 text-emerald-700"
          : item.statusCompra === "ABERTA"
            ? "bg-blue-100 text-blue-700"
            : item.statusCompra === "CANCELADA"
              ? "bg-red-100 text-red-700"
              : "bg-slate-100 text-slate-700"
      }
    `}
                        >
                          {item.statusCompra ?? "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`
      inline-flex

      rounded-full

      px-2
      py-1

      text-[11px]
      font-medium

      ${
        item.statusFinanceiro === "PAGO"
          ? "bg-emerald-100 text-emerald-700"
          : item.statusFinanceiro === "PARCIAL"
            ? "bg-amber-100 text-amber-700"
            : item.statusFinanceiro === "VENCIDO"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
      }
    `}
                        >
                          {item.statusFinanceiro}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {Number(item.valorPago ?? 0) === 0 &&
                        item.pagamentos.length === 0 &&
                        item.statusCompra === "FECHADA" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCompraSelecionadaId(item.compraId);
                              setEditarCompraOpen(true);
                            }}
                            className="
        inline-flex
        items-center
        justify-center

        px-3
        py-2

        rounded-xl

        border
        border-blue-200

        bg-blue-50

        text-blue-700
        text-xs
        font-semibold

        hover:bg-blue-100

        transition-all
      "
                          >
                            Editar
                          </button>
                        ) : (
                          <span
                            className="
        text-[11px]
        text-slate-400
      "
                          >
                            Bloqueado
                          </span>
                        )}
                      </td>
                    </tr>

                    {item.pagamentos.length > 0 && (
                      <tr
                        className="
                    border-b
                    border-[color:var(--border-soft)]

                    bg-slate-50/40
                  "
                      >
                        <td colSpan={19} className="px-6 py-4">
                          <div className="space-y-2">
                            <div
                              className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide

                          text-[color:var(--brand)]
                        "
                            >
                              Pagamentos
                            </div>

                            {item.pagamentos.map((pagamento) => (
                              <div
                                key={pagamento.id}
                                className="
                              flex

                              flex-col

                              sm:flex-row
                              sm:items-center
                              justify-between

                              gap-2

                              rounded-xl

                              border
                              border-[color:var(--border-soft)]

                              bg-white

                              px-4
                              py-3
                            "
                              >
                                <div className="space-y-1">
                                  <div
                                    className="
                                      inline-flex

                                      rounded-full

                                      bg-slate-100

                                      px-2
                                      py-1

                                      text-xs
                                      font-semibold
                                    "
                                  >
                                    {pagamento.formaPagamento}
                                  </div>

                                  <div
                                    className="
                                  text-xs

                                  text-[color:var(--muted)]
                                "
                                  >
                                    {formatDate(pagamento.pagoEm)}
                                  </div>
                                </div>

                                <div
                                  className="
                                font-semibold
                                text-emerald-600
                              "
                                >
                                  {formatCurrency(pagamento.valor)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <CompraEditModal
        open={editarCompraOpen}
        compraId={compraSelecionadaId}
        onClose={() => {
          setEditarCompraOpen(false);
          setCompraSelecionadaId(null);
        }}
      />
    </div>
  );
}

////////////////////////////////////////////////////////////
// RESUMO CARD
////////////////////////////////////////////////////////////

function ResumoCard({
  icon,
  title,
  value,
  variant = "default",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const iconClasses =
    variant === "success"
      ? "bg-emerald-50 text-emerald-600"
      : variant === "danger"
        ? "bg-red-50 text-red-600"
        : variant === "warning"
          ? "bg-amber-50 text-amber-600"
          : "bg-indigo-50 text-indigo-600";
  return (
    <div
      className="
    w-full  
    sm:w-[200px]

    rounded-[18px]

    border
    border-[color:var(--border-soft)]

    bg-white

    px-2
    py-1.5

    shadow-sm

    transition-all
    duration-200

    hover:border-[color:var(--brand)]

    hover:shadow-md
  "
    >
      <div
        className="
          flex
          items-center
          gap-1
        "
      >
        <div
          className={`
  flex
  items-center
  justify-center

  w-8
  h-8

  rounded-[12px]

  ${iconClasses}
`}
        >
          {icon}
        </div>

        <span
          className="
            text-[13px]
            font-medium

            text-[color:var(--muted-soft)]
          "
        >
          {title}
        </span>
      </div>

      <div
        className="
          text-[20px]

          font-semibold
          tracking-[-0.04em]
        "
      >
        {value}
      </div>
    </div>
  );
}

////////////////////////////////////////////////////////////
// EMPTY
////////////////////////////////////////////////////////////

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="
  rounded-[20px]

  border
  border-dashed
  border-[color:var(--border-soft)]

  bg-slate-50/60

  py-10
  sm:py-14

  text-center

  text-[13px]

  text-[color:var(--muted-soft)]
"
    >
      {text}
    </div>
  );
}
