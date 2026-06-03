"use client";

import { useEffect } from "react";

import { useForm } from "react-hook-form";

import type {
  CreateFornecedorPayload,
  Fornecedor,
} from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  fornecedor?: Fornecedor | null;

  loading?: boolean;

  onSubmit: (data: FormData) => Promise<void> | void;
}

////////////////////////////////////////////////////////////
// FORM DATA
////////////////////////////////////////////////////////////

type FormData = CreateFornecedorPayload & {
  criarFazenda?: boolean;

  nomeFazenda?: string;

  cidadeFazenda?: string;

  estadoFazenda?: string;
};

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedorForm({
  fornecedor,
  loading = false,
  onSubmit,
}: Props) {
  ////////////////////////////////////////////////////////////
  // FORM
  ////////////////////////////////////////////////////////////

  const {
    register,
    handleSubmit,
    reset,
    resetField,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",

      sobrenome: "",

      telefone: "",

      estado: "",

      limiteFinanceiroValor: 0,

      limiteFinanceiroDias: 0,

      observacoes: "",

      criarFazenda: false,

      nomeFazenda: "",

      cidadeFazenda: "",

      estadoFazenda: "",
    },
  });

  const criarFazenda = watch("criarFazenda");

  useEffect(() => {
    if (!criarFazenda) {
      resetField("nomeFazenda");

      resetField("cidadeFazenda");

      resetField("estadoFazenda");
    }
  }, [criarFazenda, resetField]);

  ////////////////////////////////////////////////////////////
  // LOAD DATA
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!fornecedor) {
      reset();

      return;
    }

    const limiteFinanceiroValor = fornecedor.limiteFinanceiroValor
      ? Number(fornecedor.limiteFinanceiroValor)
      : 0;

    reset({
      nome: fornecedor.nome,

      sobrenome: fornecedor.sobrenome ?? "",

      telefone: fornecedor.telefone ?? "",

      estado: fornecedor.estado ?? "",

      limiteFinanceiroValor,

      limiteFinanceiroDias: fornecedor.limiteFinanceiroDias ?? 0,

      observacoes: fornecedor.observacoes ?? "",
    });
  }, [fornecedor, reset]);

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function submit(data: FormData) {
    const limiteFinanceiroValor = data.limiteFinanceiroValor ?? 0;

    const limiteFinanceiroDias = data.limiteFinanceiroDias ?? 0;

    await onSubmit({
      nome: data.nome.trim(),

      sobrenome: data.sobrenome?.trim() || undefined,

      telefone: data.telefone?.trim() || undefined,

      estado: data.estado?.trim().toUpperCase() || undefined,

      limiteFinanceiroValor,

      limiteFinanceiroDias,

      observacoes: data.observacoes?.trim() || undefined,

      criarFazenda: data.criarFazenda,

      nomeFazenda: data.nomeFazenda?.trim() || undefined,

      cidadeFazenda: data.cidadeFazenda?.trim() || undefined,

      estadoFazenda: data.estadoFazenda?.trim().toUpperCase() || undefined,
    });
  }

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="
        w-full

        space-y-5

        sm:space-y-4
      "
    >
      <div
        className="
    grid

    grid-cols-1
    md:grid-cols-2

    gap-3
  "
      >
        {/* NOME */}

        <div className="space-y-1.5">
          <label
            className="
        text-[13px]

        sm:text-[12px]

        font-medium
      "
          >
            Nome
          </label>

          <input
            {...register("nome", {
              required: "Nome é obrigatório",

              minLength: {
                value: 2,

                message: "Nome muito curto",
              },
            })}
            className="
        w-full

        h-[46px]
        sm:h-[40px]

        px-3

        rounded-xl

        border

        border-[color:var(--border-soft)]

        bg-[color:var(--surface-100)]

        text-[16px]
        md:text-[14px]

        outline-none
      "
          />

          {errors.nome && (
            <p
              className="
          text-xs

          text-red-500
        "
            >
              {errors.nome.message}
            </p>
          )}
        </div>

        {/* SOBRENOME */}

        <div className="space-y-1.5">
          <label
            className="
        text-[13px]

        sm:text-[12px]

        font-medium
      "
          >
            Sobrenome
          </label>

          <input
            {...register("sobrenome")}
            className="
        w-full

        h-[46px]

        sm:h-[40px]

        px-3

        rounded-xl

        border

        border-[color:var(--border-soft)]

        bg-[color:var(--surface-100)]

        text-[16px]
        md:text-[14px]

        outline-none
      "
          />
        </div>
      </div>

      {/* TELEFONE */}

      <div
        className="
    grid

    grid-cols-1
    md:grid-cols-[1fr_120px]

    gap-3
  "
      >
        {/* TELEFONE */}

        <div className="space-y-1.5">
          <label
            className="
        text-[13px]

        sm:text-[12px]

        font-medium
      "
          >
            Telefone
          </label>

          <input
            {...register("telefone")}
            className="
        w-full

        h-[46px]
        sm:h-[40px]

        px-3

        rounded-xl

        border

        border-[color:var(--border-soft)]

        bg-[color:var(--surface-100)]

        text-[16px]
        md:text-[14px]

        outline-none
      "
          />
        </div>

        {/* UF */}

        <div className="space-y-1.5">
          <label
            className="
        text-[13px]

        sm:text-[12px]

        font-medium
      "
          >
            UF
          </label>

          <input
            {...register("estado")}
            maxLength={2}
            className="
        w-full

        h-[46px]
        sm:h-[40px]

        px-3

        rounded-xl

        border

        border-[color:var(--border-soft)]

        bg-[color:var(--surface-100)]

        text-[16px]
        md:text-[14px]

        outline-none

        uppercase
      "
          />
        </div>
      </div>

      {/* FAZENDA OPCIONAL */}

      <div
        className="
    rounded-[18px]

    border
    border-[color:var(--border-soft)]

    bg-[color:var(--surface-100)]

    p-4
    sm:p-5

    space-y-5
    sm:space-y-4
  "
      >
        <label
          className="
      flex
      items-start

      gap-3

      cursor-pointer
    "
        >
          <input
            type="checkbox"
            {...register("criarFazenda")}
            className="
        mt-1

        h-5
        w-5

        md:h-4
        md:w-4
      "
          />

          <div>
            <p
              className="
          text-sm

          font-semibold
        "
            >
              Cadastrar fazenda
            </p>

            <p
              className="
          text-xs

          text-[color:var(--muted)]
        "
            >
              Opcional.
            </p>
          </div>
        </label>

        {criarFazenda && (
          <>
            <div className="space-y-1.5">
              <label
                className="
      text-[13px]
      sm:text-[12px]

      font-medium
    "
              >
                Nome da Fazenda
              </label>

              <input
                {...register("nomeFazenda", {
                  validate: (value) => {
                    if (criarFazenda && !value?.trim()) {
                      return "Informe o nome da fazenda";
                    }

                    return true;
                  },
                })}
                className="
      w-full

      h-[46px]
      sm:h-[40px]

      px-3

      rounded-xl

      border

      border-[color:var(--border-soft)]

      text-[16px]
      md:text-[14px]

      bg-white

      outline-none
    "
              />

              {errors.nomeFazenda && (
                <p
                  className="
        text-xs

        text-red-500
      "
                >
                  {errors.nomeFazenda.message}
                </p>
              )}
            </div>

            <div
              className="
          grid

          grid-cols-1
          md:grid-cols-[1fr_120px]

          gap-3
        "
            >
              <div className="space-y-1.5">
                <label
                  className="
              text-[13px]
              sm:text-[12px]

              font-medium
            "
                >
                  Cidade
                </label>

                <input
                  {...register("cidadeFazenda")}
                  className="
              w-full

              h-[46px]
              sm:h-[40px]

              px-3

              rounded-xl

              border

              border-[color:var(--border-soft)]

              text-[16px]
              md:text-[14px]

              bg-white

              outline-none
            "
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="
              text-[13px]
              sm:text-[12px]

              font-medium
            "
                >
                  UF
                </label>

                <input
                  {...register("estadoFazenda")}
                  maxLength={2}
                  className="
              w-full

              h-[46px]
              sm:h-[40px]

              px-3

              rounded-xl

              border

              border-[color:var(--border-soft)]

              text-[16px]
              md:text-[14px]

              bg-white

              outline-none

              uppercase
            "
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* OBSERVAÇÕES */}

      <div className="space-y-2">
        <label
          className="

            text-[13px]
            sm:text-[12px]

            font-medium
          "
        >
          Observações
        </label>

        <textarea
          rows={3}
          {...register("observacoes")}
          className="
            w-full

            px-3
            py-2

            rounded-xl

            border

            border-[color:var(--border-soft)]

            bg-[color:var(--surface-100)]

            resize-none

            outline-none
          "
        />
      </div>

      {/* AÇÕES */}

      <div
        className="
    pt-3

    flex

    flex-col

    sm:flex-row

    sm:justify-end

    gap-3
  "
      >
        <button
          type="submit"
          disabled={loading}
          className="
      w-full
      
      sm:w-auto

      h-[48px]

      sm:h-[42px]

      px-4

      rounded-[14px]

      bg-[color:var(--brand)]

      text-white

      text-[14px]
      font-medium

      shadow-[0_10px_24px_rgba(99,102,241,0.18)]

      transition-all
      duration-300

      hover:translate-y-[-1px]

      hover:shadow-[0_14px_30px_rgba(99,102,241,0.24)]

      disabled:opacity-50
    "
        >
          {loading
            ? "Salvando..."
            : fornecedor
              ? "Atualizar fornecedor"
              : "Cadastrar fornecedor"}
        </button>
      </div>
    </form>
  );
}
