"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { useCompra, type Compra } from "../hooks/useCompras";

interface Props {
  compraId: string | null;

  open: boolean;

  onClose: () => void;
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

export function CompraViewModal({ compraId, open, onClose }: Props) {
  const { data: compra, isLoading } = useCompra(compraId ?? undefined);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[999]

            bg-black/40

            flex
            items-center
            justify-center

            p-4
          "
        >
          <motion.div
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
            className="
              w-full
              max-w-5xl

              max-h-[95vh]

              overflow-y-auto

              rounded-3xl

              bg-white

              shadow-2xl
            "
          >
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
                className="
                  text-sm
                  text-gray-500
                "
              >
                Compra ID: {compraId}
              </p>
            </div>

            <div className="p-6">
              {isLoading && <div>Carregando compra...</div>}

              {!isLoading && !compra && (
                <div className="text-sm text-gray-500">
                  Compra não encontrada.
                </div>
              )}

              {!isLoading && compra && (
                <div className="space-y-6">
                  <InfoSection title="Identificação">
                    <InfoItem
                      label="Número da folha"
                      value={formatText(compra.numeroFolha)}
                    />
                    <InfoItem label="Data" value={formatDate(compra.dataCompra)} />
                    <InfoItem label="Fornecedor" value={formatFornecedor(compra)} />
                    <InfoItem
                      label="Fazenda"
                      value={formatText(compra.fazendaFornecedor?.nome)}
                    />
                    <InfoItem label="Safra" value={formatText(compra.safra)} />
                    <InfoItem
                      label="Controle interno"
                      value={formatBoolean(compra.controleInterno)}
                    />
                    <InfoItem
                      label="Qualidade"
                      value={formatQualidade(compra.qualidadeFruta)}
                    />
                  </InfoSection>

                  <InfoSection title="Transporte">
                    <InfoItem
                      label="Modelo do caminhão"
                      value={formatText(compra.modeloCaminhao)}
                    />
                    <InfoItem label="Placa" value={formatText(compra.placa)} />
                    <InfoItem
                      label="Cargueiro"
                      value={formatText(compra.cargueiro)}
                    />
                    <InfoItem
                      label="Motorista"
                      value={formatText(compra.motoristaNome)}
                    />
                    <InfoItem
                      label="Telefone do motorista"
                      value={formatText(compra.motoristaTelefone)}
                    />
                  </InfoSection>

                  <InfoSection title="Pesagem">
                    <InfoItem
                      label="KG Bruto"
                      value={`${formatInteger(compra.kgBruto)} kg`}
                    />
                    <InfoItem
                      label="KG Descontado"
                      value={`${formatInteger(compra.kgDescontado)} kg`}
                    />
                    <InfoItem
                      label="KG Líquido"
                      value={`${formatInteger(compra.kgLiquido)} kg`}
                    />
                    <InfoItem
                      label="Quantidade de frutas"
                      value={formatInteger(compra.quantidadeFrutas)}
                    />
                    <InfoItem
                      label="Média por fruta"
                      value={`${formatNumber(compra.mediaFruta)} kg`}
                    />
                  </InfoSection>

                  <InfoSection title="Desconto">
                    <InfoItem
                      label="Tipo de desconto"
                      value={formatTipoDesconto(compra.tipoDesconto)}
                    />
                    <InfoItem
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
                    <InfoItem
                      label="Desconto manual"
                      value={
                        compra.descontoKgManual !== null &&
                        compra.descontoKgManual !== undefined
                          ? `${formatInteger(compra.descontoKgManual)} kg`
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Desconto calculado"
                      value={`${formatInteger(compra.descontoKgCalculado)} kg`}
                    />
                  </InfoSection>

                  <InfoSection title="Financeiro">
                    <InfoItem
                      label="Preço por KG"
                      value={formatCurrency(compra.precoKg)}
                    />
                    <InfoItem
                      label="Valor bruto"
                      value={formatCurrency(compra.totalBruto)}
                    />
                    <InfoItem
                      label="Despesas"
                      value={formatCurrency(compra.despesas)}
                    />
                    <InfoItem
                      label="ICMS / Outros"
                      value={formatCurrency(compra.icmsOutros)}
                    />
                    <InfoItem
                      label="Valor total"
                      value={formatCurrency(compra.valorTotal)}
                    />
                  </InfoSection>

                  <InfoSection title="Observações">
                    <InfoItem
                      label="Observações"
                      value={formatText(compra.observacoes)}
                      wide
                    />
                    <InfoItem
                      label="Responsável pela compra"
                      value={formatText(compra.usuarioResponsavelNome)}
                      wide
                    />
                  </InfoSection>
                </div>
              )}
            </div>

            <div
              className="
                border-t

                p-4

                flex
                justify-end
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4
                  py-2

                  rounded-xl

                  border
                "
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;

  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3
        className="
          text-sm
          font-semibold
          text-gray-700
        "
      >
        {title}
      </h3>

      <div
        className="
          grid
          gap-3

          md:grid-cols-2
          xl:grid-cols-3
        "
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
}: {
  label: string;

  value: string;

  wide?: boolean;
}) {
  return (
    <div
      className={`
        rounded-xl

        border

        bg-slate-50

        p-4

        ${wide ? "md:col-span-2 xl:col-span-3" : ""}
      `}
    >
      <div
        className="
          text-xs

          text-slate-500
        "
      >
        {label}
      </div>

      <div
        className="
          mt-1

          text-sm
          font-semibold

          text-slate-800

          break-words
        "
      >
        {value}
      </div>
    </div>
  );
}
