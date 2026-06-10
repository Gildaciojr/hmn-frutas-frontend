"use client";

import { useMemo } from "react";

import type {
  CreateCompraPayload,
  ModeloCaminhao,
  TipoDescontoCompra,
} from "../hooks/useCompras";

import { FornecedorSelect } from "@/modules/fornecedores/components/FornecedorSelect";

import { FazendaSelect } from "@/modules/fornecedores/components/FazendaSelect";

function formatIntegerBR(value: string): string {
  if (!value) {
    return "";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return value;
  }

  return numeric.toLocaleString("pt-BR");
}

function formatCurrencyInput(value: string): string {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");

  const numeric = Number(digits) / 100;

  return numeric.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export interface CompraFormValues {
  fornecedorId: string;

  fazendaFornecedorId: string;

  safra: string;

  dataCompra: string;

  modeloCaminhao: ModeloCaminhao;

  placa: string;

  numeroFolha?: string;

  kgBruto: string;

  controleInterno: boolean;

  qualidadeFruta: "GRAUDA" | "MEDIA" | "MIUDA" | "";

  cargueiro: string;

  motoristaNome: string;

  motoristaTelefone: string;

  icmsOutros: string;

  quantidadeFrutas: string;

  tipoDesconto: TipoDescontoCompra;

  descontoPercentualAplicado: string;

  descontoKgManual: string;

  precoKg: string;

  despesas: string;

  valorTotalManual: string;

  editarValorFinal: boolean;

  caminhoes: string;

  observacoes: string;
}

export type CompraFormChangeHandler = <K extends keyof CompraFormValues>(
  field: K,
  value: CompraFormValues[K],
) => void;

interface CompraFormProps {
  mode: "create" | "edit";

  values: CompraFormValues;

  loading: boolean;

  submitLabel: string;

  onChange: CompraFormChangeHandler;

  onSubmit: (payload: CreateCompraPayload) => Promise<void>;
}

export function CompraForm({
  mode,
  values,
  loading,
  submitLabel,
  onChange,
  onSubmit,
}: CompraFormProps) {
  ////////////////////////////////////////////////////////////
  // NORMALIZAÇÃO
  ////////////////////////////////////////////////////////////

  const parsed = useMemo(() => {
    const toNumber = (value: string): number => {
      if (!value || !value.trim()) {
        return 0;
      }

      const normalized = value
        .trim()
        .replace(/\s/g, "")
        .replace(/\.(?=\d{3}(,|$))/g, "")
        .replace(",", ".");

      const parsed = Number(normalized);

      if (Number.isNaN(parsed)) {
        return 0;
      }

      return parsed;
    };

    return {
      kgBruto: toNumber(values.kgBruto),

      quantidadeFrutas: toNumber(values.quantidadeFrutas),

      precoKg: Number(values.precoKg.replace(/\D/g, "")) / 100,

      despesas: Number(values.despesas.replace(/\D/g, "")) / 100,

      icmsOutros: Number(values.icmsOutros.replace(/\D/g, "")) / 100,

      descontoPercentualAplicado: toNumber(values.descontoPercentualAplicado),

      descontoKgManual: toNumber(values.descontoKgManual),

      caminhoes: toNumber(values.caminhoes),
    };
  }, [values]);

  ////////////////////////////////////////////////////////////
  // CÁLCULO
  ////////////////////////////////////////////////////////////

  const calculo = useMemo(() => {
    const mediaFruta =
      parsed.quantidadeFrutas > 0
        ? Math.floor((parsed.kgBruto / parsed.quantidadeFrutas) * 10) / 10
        : 0;

    let descontoKgCalculado = 0;

    if (values.tipoDesconto === "AUTOMATICO_MODELO") {
      const descontoPercentual = parsed.kgBruto * 0.02;

      const pesoParcial = parsed.kgBruto - descontoPercentual;

      let descontoFixo = 0;

      switch (values.modeloCaminhao) {
        case "TRUCK":
          descontoFixo = 1000;
          break;

        case "BITRUCK":
          descontoFixo = 1500;
          break;

        case "CARRETA":
          descontoFixo = 2000;
          break;
      }

      descontoKgCalculado = parsed.kgBruto - (pesoParcial - descontoFixo);

      descontoKgCalculado = Math.round(descontoKgCalculado);
    }

    if (values.tipoDesconto === "PERCENTUAL") {
      descontoKgCalculado =
        parsed.kgBruto * (parsed.descontoPercentualAplicado / 100);
    }

    if (values.tipoDesconto === "MANUAL_KG") {
      descontoKgCalculado = parsed.descontoKgManual;
    }

    const kgLiquido = parsed.kgBruto - descontoKgCalculado;

    const totalBruto = kgLiquido * parsed.precoKg;

    const valorTotal = totalBruto - parsed.despesas;

    return {
      mediaFruta,
      descontoKgCalculado,
      kgLiquido,
      totalBruto,
      valorTotal,
    };
  }, [parsed, values]);

  ////////////////////////////////////////////////////////////
  // VALOR FINAL EFETIVO
  ////////////////////////////////////////////////////////////

  const valorFinalEfetivo = useMemo(() => {
    if (!values.editarValorFinal) {
      return calculo.valorTotal;
    }

    const parsedManual =
      Number(values.valorTotalManual.replace(/\D/g, "")) / 100;

    if (parsedManual > 0 && !Number.isNaN(parsedManual)) {
      return parsedManual;
    }

    return calculo.valorTotal;
  }, [values.editarValorFinal, values.valorTotalManual, calculo.valorTotal]);

  ////////////////////////////////////////////////////////////
  // VALIDAÇÃO
  ////////////////////////////////////////////////////////////

  const isValid =
    values.fornecedorId.length > 0 &&
    values.fazendaFornecedorId.length > 0 &&
    parsed.kgBruto > 0 &&
    parsed.quantidadeFrutas > 0 &&
    parsed.precoKg > 0 &&
    values.placa.trim().length > 0 &&
    values.dataCompra.trim().length > 0;

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function handleSubmit() {
    if (!isValid) {
      return;
    }

    const payload: CreateCompraPayload = {
      fornecedorId: values.fornecedorId,

      fazendaFornecedorId: values.fazendaFornecedorId,

      safra: values.safra.trim() || undefined,

      dataCompra: values.dataCompra,

      controleInterno: values.controleInterno,

      qualidadeFruta: values.qualidadeFruta || undefined,

      modeloCaminhao: values.modeloCaminhao,

      placa: values.placa,

      cargueiro: values.cargueiro.trim() || undefined,

      motoristaNome: values.motoristaNome.trim() || undefined,

      motoristaTelefone: values.motoristaTelefone.trim() || undefined,

      numeroFolha: values.numeroFolha,

      kgBruto: parsed.kgBruto,

      quantidadeFrutas: parsed.quantidadeFrutas,

      tipoDesconto: values.tipoDesconto,

      descontoPercentualAplicado:
        values.tipoDesconto === "PERCENTUAL"
          ? parsed.descontoPercentualAplicado
          : undefined,

      descontoKgManual:
        values.tipoDesconto === "MANUAL_KG"
          ? parsed.descontoKgManual
          : undefined,

      precoKg: parsed.precoKg,

      despesas: parsed.despesas,

      icmsOutros: parsed.icmsOutros > 0 ? parsed.icmsOutros : undefined,

      caminhoes: parsed.caminhoes,

      observacoes: values.observacoes,
    };

    if (values.editarValorFinal) {
      payload.valorTotal = valorFinalEfetivo;
    }

    await onSubmit(payload);
  }

  return (
    <div className="space-y-6">
      {/* FORNECEDOR + FAZENDA */}

      <div
        className="
        grid
        gap-4

        lg:grid-cols-2
      "
      >
        <div>
          <label
            className="
            mb-2
            block

            text-sm
            font-medium
          "
          >
            Fornecedor
          </label>

          <FornecedorSelect
            fornecedorSelecionadoId={values.fornecedorId}
            onSelectFornecedor={(fornecedor) => {
              onChange("fornecedorId", fornecedor.id);

              onChange("fazendaFornecedorId", "");
            }}
          />
        </div>

        <div>
          <label
            className="
            mb-2
            block

            text-sm
            font-medium
          "
          >
            Fazenda
          </label>

          <FazendaSelect
            fornecedorId={values.fornecedorId}
            fazendaSelecionadaId={values.fazendaFornecedorId}
            onSelectFazenda={(fazenda) => {
              onChange("fazendaFornecedorId", fazenda.id);
            }}
          />
        </div>
      </div>

      {/* IDENTIFICAÇÃO */}

      <div
        className="
    grid
    gap-4

    md:grid-cols-2
    xl:grid-cols-5
  "
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Safra</label>

          <input
            value={values.safra}
            onChange={(e) => onChange("safra", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Data da Compra
          </label>

          <input
            type="date"
            value={values.dataCompra}
            onChange={(e) => onChange("dataCompra", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Nº Folha</label>

          <input
            value={values.numeroFolha ?? ""}
            disabled={mode === "edit"}
            readOnly={mode === "edit"}
            onChange={(e) => onChange("numeroFolha", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Controle Interno
          </label>

          <div
            className="
        h-11

        rounded-xl

        border

        px-3

        flex
        items-center
      "
          >
            <input
              type="checkbox"
              checked={values.controleInterno}
              onChange={(e) => onChange("controleInterno", e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Qualidade da Fruta
          </label>

          <select
            value={values.qualidadeFruta}
            onChange={(e) =>
              onChange(
                "qualidadeFruta",
                e.target.value as "GRAUDA" | "MEDIA" | "MIUDA" | "",
              )
            }
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          >
            <option value="">Selecionar</option>
            <option value="GRAUDA">Graúda</option>
            <option value="MEDIA">Média</option>
            <option value="MIUDA">Miúda</option>
          </select>
        </div>
      </div>

      {/* TRANSPORTE */}

      <div
        className="
    grid
    gap-4

    md:grid-cols-2
    xl:grid-cols-5
  "
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Modelo do Caminhão
          </label>

          <select
            value={values.modeloCaminhao}
            onChange={(e) =>
              onChange("modeloCaminhao", e.target.value as ModeloCaminhao)
            }
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          >
            <option value="TRUCK">Truck</option>
            <option value="BITRUCK">Bitruck</option>
            <option value="CARRETA">Carreta</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Placa</label>

          <input
            value={values.placa}
            onChange={(e) => onChange("placa", e.target.value.toUpperCase())}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Cargueiro</label>

          <input
            value={values.cargueiro}
            onChange={(e) => onChange("cargueiro", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Motorista</label>

          <input
            value={values.motoristaNome}
            onChange={(e) => onChange("motoristaNome", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Telefone Motorista
          </label>

          <input
            value={values.motoristaTelefone}
            onChange={(e) => onChange("motoristaTelefone", e.target.value)}
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          />
        </div>
      </div>

      {/* DESCONTO */}

      <div
        className="
    grid
    gap-4

    lg:grid-cols-4
  "
      >
        <div>
          <label className="mb-2 block text-sm font-medium">
            Tipo Desconto
          </label>

          <select
            value={values.tipoDesconto}
            onChange={(e) =>
              onChange("tipoDesconto", e.target.value as TipoDescontoCompra)
            }
            className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
          >
            <option value="AUTOMATICO_MODELO">Automático</option>

            <option value="PERCENTUAL">Percentual</option>

            <option value="MANUAL_KG">Manual KG</option>
          </select>
        </div>

        {values.tipoDesconto === "PERCENTUAL" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Percentual %
            </label>

            <Input
              label="Percentual"
              value={values.descontoPercentualAplicado}
              onChange={(value) =>
                onChange("descontoPercentualAplicado", value)
              }
            />
          </div>
        )}

        {values.tipoDesconto === "MANUAL_KG" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Desconto KG
            </label>

            <Input
              label="Desconto KG"
              value={values.descontoKgManual}
              onChange={(value) => onChange("descontoKgManual", value)}
            />
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium">
            KG Descontado
          </label>

          <div
            className="
        h-11

        rounded-xl

        border

        bg-slate-50

        px-3

        flex
        items-center

        font-medium
      "
          >
            {calculo.descontoKgCalculado.toFixed(0)}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">KG Líquido</label>

          <div
            className="
        h-11

        rounded-xl

        border

        bg-slate-50

        px-3

        flex
        items-center

        font-medium
      "
          >
            {calculo.kgLiquido.toFixed(0)}
          </div>
        </div>
      </div>

      {/* FINANCEIRO */}

      <div
        className="
    grid
    gap-4

    md:grid-cols-2
    xl:grid-cols-5
  "
      >
        <div>
          <label className="mb-2 block text-sm font-medium">Preço KG</label>

          <Input
            label="Preço KG"
            value={values.precoKg}
            onChange={(value) => onChange("precoKg", value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Despesas</label>

          <Input
            label="Despesas"
            value={values.despesas}
            onChange={(value) => onChange("despesas", value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            ICMS / Outros
          </label>

          <Input
            label="ICMS / Outros"
            value={values.icmsOutros}
            onChange={(value) => onChange("icmsOutros", value)}
          />
        </div>

        {mode === "create" && (
          <div>
            <label className="mb-2 block text-sm font-medium">
              Valor Final Manual
            </label>

            <Input
              label="Valor Final Manual"
              value={values.valorTotalManual}
              onChange={(value) => onChange("valorTotalManual", value)}
            />
          </div>
        )}
      </div>

      {mode === "create" && (
        <div
          className="
      flex
      items-center
      gap-3
    "
        >
          <input
            type="checkbox"
            checked={values.editarValorFinal}
            onChange={(e) => onChange("editarValorFinal", e.target.checked)}
          />

          <span className="text-sm font-medium">
            Editar valor final manualmente
          </span>
        </div>
      )}

      {/* RESULTADOS */}

      <div
        className="
    grid
    gap-4

    md:grid-cols-2
    xl:grid-cols-4
  "
      >
        <Result label="Total Bruto" value={calculo.totalBruto} />

        <Result label="Despesas" value={parsed.despesas} />

        <Result label="Valor Final" value={valorFinalEfetivo} />

        <Result label="Peso Líquido" value={calculo.kgLiquido} suffix="kg" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Observações</label>

        <textarea
          value={values.observacoes}
          onChange={(e) => onChange("observacoes", e.target.value)}
          rows={4}
          className="
      w-full

      rounded-xl

      border

      px-3
      py-3
    "
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="
    px-5
    py-3

    rounded-xl

    bg-blue-600

    text-white

    disabled:opacity-50
  "
      >
        {submitLabel}
      </button>
    </div>
  );
}

function Result({
  label,
  value,
  suffix,
}: {
  label: string;

  value: number;

  suffix?: string;
}) {
  return (
    <div
      className="
        rounded-xl

        border

        bg-slate-50

        p-4
      "
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

          text-lg
          font-semibold
        "
      >
        {value.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
        {suffix ? ` ${suffix}` : ""}
      </div>
    </div>
  );
}
function Input({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}: {
  label: string;

  value: string;

  onChange?: (value: string) => void;

  placeholder?: string;

  disabled?: boolean;

  type?: "text" | "date";
}) {
  const normalizedLabel = label.toLowerCase();

  const isMoneyField =
    normalizedLabel.includes("valor") ||
    normalizedLabel.includes("r$") ||
    normalizedLabel.includes("preço") ||
    normalizedLabel.includes("despesa") ||
    normalizedLabel.includes("icms");

  const isIntegerField =
    !isMoneyField &&
    (normalizedLabel.includes("kg") ||
      normalizedLabel.includes("quantidade") ||
      normalizedLabel.includes("qtd") ||
      normalizedLabel.includes("caminhões") ||
      normalizedLabel.includes("folha"));

  const displayValue =
    type === "date"
      ? value
      : isMoneyField
        ? formatCurrencyInput(value)
        : isIntegerField
          ? formatIntegerBR(value)
          : value;

  return (
    <input
      type={type}
      value={displayValue}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => {
        if (!onChange) {
          return;
        }

        let raw = event.target.value;

        if (type === "date") {
          onChange(raw);
          return;
        }

        if (isMoneyField) {
          raw = raw.replace(/\D/g, "");

          onChange(raw);

          return;
        }

        if (isIntegerField) {
          raw = raw.replace(/\D/g, "");

          onChange(raw);

          return;
        }

        onChange(raw);
      }}
      className="
        w-full
        h-11

        rounded-xl

        border

        px-3
      "
    />
  );
}
