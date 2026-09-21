"use client";

import { FornecedoresTable } from "./FornecedoresTable";

////////////////////////////////////////////////////////////
// COMPONENT
////////////////////////////////////////////////////////////

export function FornecedoresList() {
  return (
    <div className="space-y-4">
      {/* HEADER */}

      <div
        className="
          relative
          overflow-visible

          rounded-none
          sm:rounded-[20px]

          border-0
          sm:border
          sm:border-[color:var(--border-soft)]

          bg-transparent
          sm:bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.88))]

          px-0
          sm:px-5

          py-2
          sm:py-4

          shadow-none
          sm:shadow-[0_12px_40px_rgba(15,23,42,0.05)]
        "
      >
        <div className="space-y-1.5">
          <h1
            className="
              text-[20px]
              sm:text-[22px]

              xl:text-[24px]

              font-semibold

              tracking-[-0.04em]
            "
          >
            Cadastro de fornecedores
          </h1>

          <p
            className="
              hidden
              sm:block

              text-[14px]
              sm:text-[13px]

              text-[color:var(--muted-soft)]
            "
          >
            Gerencie fornecedores, fazendas e informações financeiras.
          </p>
        </div>
      </div>

      {/* TABELA */}

      <FornecedoresTable />
    </div>
  );
}
