"use client";

import { useEffect } from "react";

import { Controller, useForm } from "react-hook-form";

import { Autocomplete } from "@/components/ui/Autocomplete";
import { ESTADOS_UF } from "@/constants/estados";

import type {
  CreateFazendaPayload,
  FazendaFornecedor,
} from "../services/fornecedores.service";

////////////////////////////////////////////////////////////
// TYPES
////////////////////////////////////////////////////////////

interface Props {
  fazenda?: FazendaFornecedor | null;

  loading?: boolean;

  onSubmit: (data: CreateFazendaPayload) => Promise<void> | void;
}

////////////////////////////////////////////////////////////
// FORM DATA
////////////////////////////////////////////////////////////

type FormData = CreateFazendaPayload;

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FazendaForm({ fazenda, loading = false, onSubmit }: Props) {
  ////////////////////////////////////////////////////////////
  // FORM
  ////////////////////////////////////////////////////////////

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",

      cidade: "",

      estado: "",

      observacoes: "",
    },
  });

  ////////////////////////////////////////////////////////////
  // LOAD DATA
  ////////////////////////////////////////////////////////////

  useEffect(() => {
    if (!fazenda) {
      return;
    }

    reset({
      nome: fazenda.nome,

      cidade: fazenda.cidade ?? "",

      estado: fazenda.estado ?? "",

      observacoes: fazenda.observacoes ?? "",
    });
  }, [fazenda, reset]);

  ////////////////////////////////////////////////////////////
  // SUBMIT
  ////////////////////////////////////////////////////////////

  async function submit(data: FormData) {
    await onSubmit({
      nome: data.nome.trim(),

      cidade: data.cidade?.trim() || undefined,

      estado: data.estado?.trim().toUpperCase() || undefined,

      observacoes: data.observacoes?.trim() || undefined,
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

        flex
        flex-col

        gap-5
      "
    >
      {/* NOME */}

      <div className="space-y-2">
        <label
          className="
            text-sm

            font-medium
          "
        >
          Nome da Fazenda
        </label>

        <input
          {...register("nome", {
            required: "Nome da fazenda é obrigatório",

            minLength: {
              value: 2,

              message: "Nome muito curto",
            },
          })}
          className="
            w-full

            h-[46px]

            px-4

            rounded-xl

            border

            border-[color:var(--border-soft)]

            bg-[color:var(--surface-100)]

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

      {/* CIDADE */}

      <div className="space-y-2">
        <label
          className="
            text-sm

            font-medium
          "
        >
          Cidade
        </label>

        <input
          {...register("cidade")}
          placeholder="Uruana"
          className="
            w-full

            h-[46px]

            px-4

            rounded-xl

            border

            border-[color:var(--border-soft)]

            bg-[color:var(--surface-100)]

            outline-none
          "
        />
      </div>

      {/* UF */}

      <div className="space-y-2">
        <label
          className="
            text-sm

            font-medium
          "
        >
          Estado (UF)
        </label>

        <Controller
          control={control}
          name="estado"
          render={({ field }) => (
            <Autocomplete
              value={field.value ?? ""}
              onChange={(value) => field.onChange(value.toUpperCase())}
              options={[...ESTADOS_UF]}
              placeholder="Selecione a UF"
              className="
        w-full

        h-[46px]

        px-4

        rounded-xl

        border

        border-[color:var(--border-soft)]

        bg-[color:var(--surface-100)]

        outline-none

        uppercase
      "
            />
          )}
        />
      </div>

      {/* OBSERVAÇÕES */}

      <div className="space-y-2">
        <label
          className="
            text-sm

            font-medium
          "
        >
          Observações
        </label>

        <textarea
          rows={5}
          {...register("observacoes")}
          className="
            w-full

            px-4
            py-3

            rounded-xl

            border

            border-[color:var(--border-soft)]

            bg-[color:var(--surface-100)]

            resize-none

            outline-none
          "
        />
      </div>

      {/* BOTÃO */}

      <button
        type="submit"
        disabled={loading}
        className="
          h-[48px]

          rounded-xl

          bg-[color:var(--brand)]

          text-white

          font-medium

          transition-all

          disabled:opacity-50
        "
      >
        {loading
          ? "Salvando..."
          : fazenda
            ? "Atualizar Fazenda"
            : "Cadastrar Fazenda"}
      </button>
    </form>
  );
}
