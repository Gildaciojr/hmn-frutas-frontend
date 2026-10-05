"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Truck } from "lucide-react";
import { useDocumentActions } from "@/shared/hooks/useDocumentActions";
import { DocumentError } from "@/shared/services/document.service";
import { formatOperationalDate } from "@/shared/utils/report-period";

import { useCompra, type Compra } from "../hooks/useCompras";

interface Props {
  compraId: string | null;

  open: boolean;

  onClose: () => void;
  showDocumentActions?: boolean;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

function formatNumber(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return parsed.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatInteger(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return Math.trunc(parsed).toLocaleString("pt-BR");
}

function formatCurrency(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return "-";
  }

  return parsed.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatText(value?: string | number | null): string {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatBoolean(value?: boolean | null): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return value ? "Sim" : "Não";
}

function formatFornecedor(compra: Compra): string {
  const fornecedorNome = [compra.fornecedor?.nome, compra.fornecedor?.sobrenome]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fornecedorNome ||
    compra.clienteNomeSnapshot ||
    compra.cliente?.nome ||
    "Sem fornecedor"
  );
}

function formatQualidade(value?: Compra["qualidadeFruta"]): string {
  switch (value) {
    case "GRAUDA":
      return "Graúda";
    case "MEDIA":
      return "Média";
    case "MIUDA":
      return "Miúda";
    default:
      return "-";
  }
}

function formatTipoDesconto(value: Compra["tipoDesconto"]): string {
  switch (value) {
    case "AUTOMATICO_MODELO":
      return "Automático";
    case "PERCENTUAL":
      return "Percentual";
    case "MANUAL_KG":
      return "Manual KG";
  }
}

export function CompraViewModal({ compraId, open, onClose, showDocumentActions = false }: Props) {
  const { data: compra, isLoading } = useCompra(compraId ?? undefined);
  const { view, download } = useDocumentActions();
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const documentBusy = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !showDocumentActions) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const targets = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)");
      if (!targets?.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open, showDocumentActions, onClose]);

  async function handleDocument(action: "view" | "download") {
    if (!compra || documentBusy.current) return;
    documentBusy.current = true;
    setDocumentLoading(true);
    setDocumentError(null);
    try {
      await (action === "view" ? view : download)({
        url: `/romaneios/compra/${compra.id}/pdf`,
        filename: `compra-${compra.numeroFolha ?? compra.id}.pdf`,
        newTab: true,
      });
    } catch (error: unknown) {
      setDocumentError(error instanceof DocumentError ? error.message : "Não foi possível obter o PDF. Tente novamente.");
    } finally {
      documentBusy.current = false;
      setDocumentLoading(false);
    }
  }

  const modal = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={showDocumentActions ? "fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-2 sm:p-5" : `
            fixed
            inset-0
            z-[999]

            bg-black/40

            flex
            items-center
            justify-center

            p-4
          `}
        >
          <motion.div
            ref={dialogRef}
            role={showDocumentActions ? "dialog" : undefined}
            aria-modal={showDocumentActions ? true : undefined}
            aria-label={showDocumentActions ? "Visualizar Compra" : undefined}
            tabIndex={showDocumentActions ? -1 : undefined}
            initial={{
              opacity: 0,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.98,
            }}
            onClick={(event) => event.stopPropagation()}
            className={showDocumentActions ? "flex w-full max-w-[960px] min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/60 max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)]" : `max-h-[95vh] overflow-y-auto
              w-full
              max-w-5xl

              rounded-3xl

              bg-white

              shadow-2xl
            `}
          >
            {showDocumentActions ? (
              <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Truck size={20} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Visualizar compra</h2>
                    {compra && <p className="mt-0.5 break-words text-sm font-medium text-slate-600">{formatFornecedor(compra)}</p>}
                  </div>
                  {compra && <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${compra.status === "FECHADA" ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{compra.status}</span>}
                </div>
                {compra && (
                  <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xs text-slate-500">
                    <span>Folha {formatText(compra.numeroFolha)}</span><span aria-hidden="true">•</span>
                    <span>{formatOperationalDate(compra.dataCompra)}</span><span aria-hidden="true">•</span>
                    <span className="min-w-0 break-all">Placa {formatText(compra.placa)}</span>
                  </div>
                )}
                <p className="mt-2 break-all text-[10px] text-slate-400">Compra ID: {compraId}</p>
              </div>
            ) : (
            <div className="p-6 border-b">
              <h2
                className="
                  text-xl
                  font-semibold
                "
              >
                Visualizar Compra
              </h2>

              <p
                className="text-sm text-gray-500"
              >
                Compra ID: {compraId}
              </p>
            </div>
            )}

            <div className={showDocumentActions ? "min-h-0 overflow-y-auto overflow-x-hidden bg-slate-50/70 p-4 sm:p-6" : "p-6"}>
              {isLoading && <div>Carregando compra...</div>}

              {!isLoading && !compra && (
                <div className="text-sm text-gray-500">
                  Compra não encontrada.
                </div>
              )}

              {!isLoading && compra && (
                <div className={showDocumentActions ? "space-y-4" : "space-y-6"}>
                  {showDocumentActions && (
                    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                      <div className="col-span-2 min-w-0 rounded-xl border border-emerald-100 bg-emerald-50/80 p-3 sm:col-span-1">
                        <p className="break-words text-xl font-semibold tabular-nums text-emerald-800">{Number(compra.kgLiquido).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <span className="text-sm font-medium">kg</span></p>
                        <p className="mt-1 text-xs text-emerald-700">Peso líquido</p>
                      </div>
                      <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="inline-block max-w-full break-all rounded-md bg-slate-100 px-2 py-0.5 font-mono text-base font-semibold text-slate-800">{formatText(compra.placa)}</p>
                        <p className="mt-1 text-xs text-slate-500">Placa</p>
                      </div>
                      <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="break-words text-xl font-semibold tabular-nums text-slate-800">{formatInteger(compra.quantidadeFrutas)}</p>
                        <p className="mt-1 text-xs text-slate-500">Frutas</p>
                      </div>
                    </div>
                  )}
                  <InfoSection modern={showDocumentActions} title="Identificação">
                    <InfoItem modern={showDocumentActions}
                      label="Número da folha"
                      value={formatText(compra.numeroFolha)}
                    />
                    <InfoItem modern={showDocumentActions} label="Data" value={showDocumentActions ? formatOperationalDate(compra.dataCompra) : formatDate(compra.dataCompra)} />
                    {showDocumentActions && <InfoItem modern={showDocumentActions} label="Status" value={compra.status} />}
                    <InfoItem modern={showDocumentActions} label="Fornecedor" value={formatFornecedor(compra)} />
                    <InfoItem modern={showDocumentActions}
                      label="Fazenda"
                      value={formatText(compra.fazendaFornecedor?.nome)}
                    />
                    <InfoItem modern={showDocumentActions} label="Safra" value={formatText(compra.safra)} />
                    <InfoItem modern={showDocumentActions}
                      label="Controle interno"
                      value={formatBoolean(compra.controleInterno)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Qualidade"
                      value={formatQualidade(compra.qualidadeFruta)}
                    />
                  </InfoSection>

                  <InfoSection modern={showDocumentActions} title="Transporte">
                    <InfoItem modern={showDocumentActions}
                      label="Modelo do caminhão"
                      value={formatText(compra.modeloCaminhao)}
                    />
                    <InfoItem modern={showDocumentActions} label="Placa" value={formatText(compra.placa)} />
                    <InfoItem modern={showDocumentActions}
                      label="Cargueiro"
                      value={formatText(compra.cargueiro)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Motorista"
                      value={formatText(compra.motoristaNome)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Telefone do motorista"
                      value={formatText(compra.motoristaTelefone)}
                    />
                  </InfoSection>

                  <InfoSection modern={showDocumentActions} title="Pesagem">
                    <InfoItem modern={showDocumentActions}
                      label="KG Bruto"
                      value={`${formatInteger(compra.kgBruto)} kg`}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="KG Descontado"
                      value={`${formatInteger(compra.kgDescontado)} kg`}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="KG Líquido"
                      value={`${showDocumentActions ? Number(compra.kgLiquido).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : formatInteger(compra.kgLiquido)} kg`}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Quantidade de frutas"
                      value={formatInteger(compra.quantidadeFrutas)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Média por fruta"
                      value={`${formatNumber(compra.mediaFruta)} kg`}
                    />
                  </InfoSection>

                  <InfoSection modern={showDocumentActions} title="Desconto">
                    <InfoItem modern={showDocumentActions}
                      label="Tipo de desconto"
                      value={formatTipoDesconto(compra.tipoDesconto)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Percentual"
                      value={
                        compra.descontoPercentualAplicado !== null &&
                        compra.descontoPercentualAplicado !== undefined
                          ? `${formatNumber(
                              compra.descontoPercentualAplicado,
                            )}%`
                          : "-"
                      }
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Desconto manual"
                      value={
                        compra.descontoKgManual !== null &&
                        compra.descontoKgManual !== undefined
                          ? `${formatInteger(compra.descontoKgManual)} kg`
                          : "-"
                      }
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Desconto calculado"
                      value={`${formatInteger(compra.descontoKgCalculado)} kg`}
                    />
                  </InfoSection>

                  <InfoSection modern={showDocumentActions} title="Financeiro">
                    <InfoItem modern={showDocumentActions}
                      label="Preço por KG"
                      value={formatCurrency(compra.precoKg)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Valor bruto"
                      value={formatCurrency(compra.totalBruto)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Despesas"
                      value={formatCurrency(compra.despesas)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="ICMS / Outros"
                      value={formatCurrency(compra.icmsOutros)}
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Valor total"
                      value={formatCurrency(compra.valorTotal)}
                    />
                  </InfoSection>

                  <InfoSection modern={showDocumentActions} title="Observações">
                    <InfoItem modern={showDocumentActions}
                      label="Observações"
                      value={formatText(compra.observacoes)}
                      wide
                    />
                    <InfoItem modern={showDocumentActions}
                      label="Responsável pela compra"
                      value={formatText(compra.usuarioResponsavelNome)}
                      wide
                    />
                  </InfoSection>
                </div>
              )}
            </div>

            <div
              className={showDocumentActions ? "sticky bottom-0 flex shrink-0 flex-wrap justify-end gap-2 border-t border-slate-200 bg-white p-3 sm:px-6 sm:py-4" : `
                border-t

                p-4

                flex
                justify-end
              `}
            >
              {showDocumentActions && (
                <>
                  {documentError && <p role="alert" className="w-full rounded-xl bg-red-50 p-3 text-sm text-red-700">{documentError}</p>}
                  <button type="button" disabled={!compra || documentLoading} onClick={() => void handleDocument("view")} className="min-h-11 flex-1 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 sm:flex-none">Visualizar PDF</button>
                  <button type="button" disabled={!compra || documentLoading} onClick={() => void handleDocument("download")} className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 sm:flex-none">Baixar PDF</button>
                  {documentLoading && <p role="status" className="w-full text-xs text-slate-500">Preparando PDF...</p>}
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className={showDocumentActions ? "min-h-11 w-full rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:w-auto" : `
                  px-4
                  py-2

                  rounded-xl

                  border
                `}
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return showDocumentActions && open && typeof document !== "undefined"
    ? createPortal(modal, document.body)
    : modal;
}

function InfoSection({
  title,
  children,
  modern = false,
}: {
  title: string;
  modern?: boolean;

  children: ReactNode;
}) {
  return (
    <section className={modern ? "min-w-0 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" : "space-y-3"}>
      <h3
        className={modern ? "text-xs font-semibold tracking-wide text-slate-600" : `
          text-sm
          font-semibold
          text-gray-700
        `}
      >
        {title}
      </h3>

      <div
        className={modern ? "grid min-w-0 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3" : `
          grid
          gap-3

          md:grid-cols-2
          xl:grid-cols-3
        `}
      >
        {children}
      </div>
    </section>
  );
}

function InfoItem({
  label,
  value,
  wide = false,
  modern = false,
}: {
  label: string;
  modern?: boolean;

  value: string;

  wide?: boolean;
}) {
  return (
    <div
      className={modern ? `min-w-0 rounded-lg ${wide ? "sm:col-span-2 lg:col-span-3" : ""} ${label === "KG Líquido" ? "bg-emerald-50 p-3" : ""}` : `
        rounded-xl

        border

        bg-slate-50

        p-4

        ${wide ? "md:col-span-2 xl:col-span-3" : ""}
      `}
    >
      <div
        className={modern ? "text-[11px] text-slate-500" : `
          text-xs

          text-slate-500
        `}
      >
        {label}
      </div>

      <div
        className={modern ? `mt-1 break-words ${label === "KG Líquido" ? "text-lg font-semibold text-emerald-800" : label === "KG Descontado" ? "text-sm font-medium text-amber-700" : label === "Placa" ? "inline-block max-w-full break-all rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-sm font-medium text-slate-800" : "text-sm font-medium text-slate-800"}` : `
          mt-1

          text-sm
          font-semibold

          text-slate-800

          break-words
        `}
      >
        {value}
      </div>
    </div>
  );
}
