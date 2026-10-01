"use client";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getClientes,
  getClienteRelatorio,
} from "@/modules/clientes/services/clientes.service";
import { getFornecedores } from "@/modules/fornecedores/services/fornecedores.service";
import { ClienteRelatorioCard } from "@/modules/clientes/components/ClienteRelatorioCard";
import { FornecedorHistorico } from "@/modules/fornecedores/components/FornecedorHistorico";
import { useDocumentActions } from "@/shared/hooks/useDocumentActions";

function ClientReport({ id }: { id: string }) {
  const report = useQuery({
    queryKey: ["cliente-relatorio", id],
    queryFn: () => getClienteRelatorio(id),
    staleTime: 0,
  });
  const { download } = useDocumentActions();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const busy = useRef(false);
  async function pdf() {
    if (busy.current) return;
    busy.current = true;
    setPdfLoading(true);
    setPdfError(null);
    try {
      await download({
        url: `/clientes/${id}/relatorio-pdf`,
        filename: `extrato-cliente-${id}.pdf`,
      });
    } catch (cause: unknown) {
      setPdfError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível gerar o PDF. Tente novamente.",
      );
    } finally {
      busy.current = false;
      setPdfLoading(false);
    }
  }
  return (
    <ClienteRelatorioCard
      data={report.data}
      loading={report.isFetching}
      error={report.error?.message}
      onRetry={() => void report.refetch()}
      onPdf={() => void pdf()}
      pdfLoading={pdfLoading}
      pdfError={pdfError}
    />
  );
}
export function PartyReports({ kind }: { kind: "clientes" | "fornecedores" }) {
  const [search, setSearch] = useState("");
  const [id, setId] = useState("");
  const parties = useQuery({
    queryKey: ["relatorios-parceiros", kind],
    queryFn: async () => {
      if (kind === "clientes")
        return (await getClientes()).map((item) => ({
          id: item.id,
          nome: item.nome,
        }));
      return (await getFornecedores()).map((item) => ({
        id: item.id,
        nome: [item.nome, item.sobrenome].filter(Boolean).join(" "),
      }));
    },
  });
  const matches = (parties.data ?? []).filter((item) =>
    item.nome
      .toLocaleLowerCase("pt-BR")
      .includes(search.trim().toLocaleLowerCase("pt-BR")),
  );
  return (
    <section className="space-y-4 min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-sm min-w-0">
          Localizar {kind}
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input-base w-full min-w-0 text-base mt-1"
            placeholder="Digite o nome"
          />
        </label>
        <label className="text-sm min-w-0">
          Selecionar {kind === "clientes" ? "cliente" : "fornecedor"}
          <select
            value={id}
            disabled={parties.isFetching}
            onChange={(event) => setId(event.target.value)}
            className="input-base w-full min-w-0 text-base mt-1"
          >
            <option value="">Selecione...</option>
            {matches.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      {parties.isFetching && (
        <p role="status" className="text-sm">
          Carregando {kind}...
        </p>
      )}
      {parties.error && (
        <p role="alert" className="text-sm text-red-600">
          Não foi possível carregar {kind}.{" "}
          <button
            type="button"
            onClick={() => void parties.refetch()}
            className="underline min-h-[44px]"
          >
            Tentar novamente
          </button>
        </p>
      )}
      {!parties.isFetching && !parties.error && !matches.length && (
        <p className="text-sm">Nenhum cadastro encontrado.</p>
      )}
      {id ? (
        kind === "clientes" ? (
          <ClientReport key={id} id={id} />
        ) : (
          <div className="min-w-0 max-w-full overflow-x-auto">
            <FornecedorHistorico key={id} fornecedorId={id} />
          </div>
        )
      ) : (
        <p className="text-sm text-[color:var(--muted)]">
          Selecione um cadastro para consultar o relatório e gerar o PDF.
        </p>
      )}
    </section>
  );
}
