"use client";

import { useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useCompra, useCompras } from "../hooks/useCompras";

import {
  CompraForm,
  type CompraFormChangeHandler,
  type CompraFormValues,
} from "./CompraForm";

interface Props {
  compraId: string | null;

  open: boolean;

  onClose: () => void;
}

export function CompraEditModal({ compraId, open, onClose }: Props) {
  ////////////////////////////////////////////////////////////
  // QUERY
  ////////////////////////////////////////////////////////////

  const { data: compra, isLoading } = useCompra(compraId ?? undefined);

  const { updateCompra, updating } = useCompras();

  ////////////////////////////////////////////////////////////
  // FORM
  ////////////////////////////////////////////////////////////

  const initialValues = useMemo<CompraFormValues | null>(() => {
    if (!compra) {
      return null;
    }

    return {
      fornecedorId: compra.fornecedorId ?? "",

      fazendaFornecedorId: compra.fazendaFornecedorId ?? "",

      safra: compra.safra ?? "",

      dataCompra: compra.dataCompra?.slice(0, 10) ?? "",

      controleInterno: compra.controleInterno ?? false,

      qualidadeFruta: compra.qualidadeFruta ?? "",

      modeloCaminhao: compra.modeloCaminhao,

      placa: compra.placa ?? "",

      cargueiro: compra.cargueiro ?? "",

      motoristaNome: compra.motoristaNome ?? "",

      motoristaTelefone: compra.motoristaTelefone ?? "",

      numeroFolha: compra.numeroFolha ?? "",

      kgBruto: String(compra.kgBruto ?? ""),

      quantidadeFrutas: String(compra.quantidadeFrutas ?? ""),

      tipoDesconto: compra.tipoDesconto,

      descontoPercentualAplicado: compra.descontoPercentualAplicado
        ? String(compra.descontoPercentualAplicado)
        : "",

      descontoKgManual: compra.descontoKgManual
        ? String(compra.descontoKgManual)
        : "",

      precoKg: String(Math.round(Number(compra.precoKg ?? 0) * 100)),

      despesas: String(Math.round(Number(compra.despesas ?? 0) * 100)),

      icmsOutros: String(Math.round(Number(compra.icmsOutros ?? 0) * 100)),

      valorTotalManual: "",

      editarValorFinal: false,

      caminhoes: String(compra.caminhoes ?? 1),

      observacoes: compra.observacoes ?? "",
    };
  }, [compra]);

  ////////////////////////////////////////////////////////////
  // RENDER
  ////////////////////////////////////////////////////////////

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!updating) {
              onClose();
            }
          }}
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
            onClick={(e) => e.stopPropagation()}
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
                Editar Compra
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

              {!isLoading && compra && initialValues && (
                <CompraEditFormState
                  key={compra.id}
                  initialValues={initialValues}
                  updating={updating}
                  onSubmit={async (payload) => {
                    try {
                      await updateCompra({
                        id: compra.id,
                        payload,
                      });

                      onClose();
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                />
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
                onClick={() => {
                  if (!updating) {
                    onClose();
                  }
                }}
                disabled={updating}
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
function CompraEditFormState({
  initialValues,
  updating,
  onSubmit,
}: {
  initialValues: CompraFormValues;

  updating: boolean;

  onSubmit: Parameters<typeof CompraForm>[0]["onSubmit"];
}) {
  const [values, setValues] = useState<CompraFormValues>(initialValues);

  const handleChange: CompraFormChangeHandler = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <CompraForm
      mode="edit"
      values={values}
      loading={updating}
      submitLabel="Salvar alterações"
      onChange={handleChange}
      onSubmit={onSubmit}
    />
  );
}
