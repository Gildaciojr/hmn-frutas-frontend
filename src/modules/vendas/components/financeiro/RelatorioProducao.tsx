"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { getProducao, getProducaoParams, type ProducaoFilters } from "../../services/producao.service";
import { formatOperationalDate, getPeriodPreset, getBusinessTodayYmd } from "@/shared/utils/report-period";
import { useDocumentActions } from "@/shared/hooks/useDocumentActions";

type TipoRelatorio = "todos" | "compras" | "vendas";

type TipoRelatorioPdf = "AMBOS" | "COMPRAS" | "VENDAS";

type LinhaRelatorio = {
  id: string;
  tipo: "COMPRA" | "VENDA";
  data: string;
  usuarioNome: string;
  documento: string;
  parceiro: string;
  modeloCaminhao: string;
  kg: number;
  valor: number;
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatKg(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 3,
  })} kg`;
}

function formatDate(value: string): string {
  return formatOperationalDate(value);
}

function getTipoRelatorioPdf(tipo: TipoRelatorio): TipoRelatorioPdf {
  if (tipo === "compras") {
    return "COMPRAS";
  }

  if (tipo === "vendas") {
    return "VENDAS";
  }

  return "AMBOS";
}

export function RelatorioProducao() {
  const defaultRange = useMemo(() => getPeriodPreset("month") ?? {
    inicio: getBusinessTodayYmd(), fim: getBusinessTodayYmd(),
  }, []);
  const [dataInicio, setDataInicio] = useState(defaultRange.inicio);
  const [dataFim, setDataFim] = useState(defaultRange.fim);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState("todos");
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("todos");
  const [exportando, setExportando] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const { download } = useDocumentActions();
  const periodoValido = Boolean(dataInicio && dataFim && dataInicio <= dataFim);
  const filtros: ProducaoFilters = {
    dataInicial: dataInicio,
    dataFinal: dataFim,
    tipo: getTipoRelatorioPdf(tipoRelatorio),
    usuarioId: usuarioSelecionado === "todos" ? undefined : usuarioSelecionado,
  };
  const query = useQuery({
    queryKey: ["relatorio-producao", filtros],
    queryFn: () => getProducao(filtros),
    enabled: periodoValido,
    refetchOnWindowFocus: false,
  });
  const loading = query.isFetching;
  const usuarios = query.data?.usuariosDisponiveis ?? [];
  const linhas = useMemo<LinhaRelatorio[]>(() => {
    const compras = (query.data?.compras ?? []).map((compra): LinhaRelatorio => ({
      id: compra.id, tipo: "COMPRA", data: compra.dataCompra,
      usuarioNome: compra.usuarioResponsavelNome ?? "Sem usuário",
      documento: compra.numeroFolha ?? "-",
      parceiro: compra.fornecedor?.nome ?? compra.clienteNomeSnapshot ?? "Sem fornecedor",
      modeloCaminhao: compra.modeloCaminhao ?? "-", kg: compra.kgLiquido,
      valor: Number(compra.valorTotal),
    }));
    const vendas = (query.data?.vendas ?? []).map((venda): LinhaRelatorio => ({
      id: venda.id, tipo: "VENDA", data: venda.dataVenda,
      usuarioNome: venda.usuarioResponsavelNome ?? "Sem usuário",
      documento: venda.numeroRomaneio ?? venda.numeroPedido ?? "-",
      parceiro: venda.cliente?.nome ?? venda.clienteNomeSnapshot ?? "Sem cliente",
      modeloCaminhao: venda.modeloCaminhao ?? "-", kg: venda.pesoLiquido,
      valor: Number(venda.valorTotal),
    }));
    return [...compras, ...vendas].sort((a, b) =>
      b.data.localeCompare(a.data) || b.id.localeCompare(a.id),
    );
  }, [query.data]);
  const kpis = query.data?.totais;

  async function handleExportarPdf() {
    if (!periodoValido || exportando || loading || query.isError) return;
    setPdfError(null);
    setExportando(true);
    try {
      await download({
        filename: "relatorio-producao.pdf",
        url: "/financeiro/producao/pdf?" + getProducaoParams(filtros).toString(),
      });
    } catch (error: unknown) {
      setPdfError(error instanceof Error ? error.message : "Não foi possível exportar o PDF.");
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        className="
          relative overflow-hidden rounded-[20px]
          border border-[color:var(--border-soft)]
          bg-[color:var(--surface-100)]
          shadow-[0_8px_24px_rgba(0,0,0,0.04)]
          p-4
          space-y-4
        "
      >
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-[color:var(--brand)]" />

              <span className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted-soft)]">
                Fechamento mensal
              </span>
            </div>

            <h2 className="text-[20px] sm:text-[18px] font-semibold tracking-tight text-[color:var(--foreground)]">
              Relatório de Produção
            </h2>

            <p className="text-[12px] text-[color:var(--muted)]">
              Consolide compras e vendas por usuário para conferência de
              produção.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportarPdf}
            disabled={exportando || loading || !periodoValido || query.isError || !query.data}
            className="
              h-[40px]
              px-4
              rounded-[14px]
              border border-[color:var(--border-soft)]
              bg-[color:var(--surface-200)]
              text-[12px]
              font-medium
              text-[color:var(--foreground)]
              hover:border-[color:var(--border-strong)]
              transition
            "
          >
            {exportando ? "Exportando PDF..." : "Exportar PDF"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              Data inicial
            </span>

            <input
              type="date"
              value={dataInicio}
              onChange={(event) => setDataInicio(event.target.value)}
              className="
                w-full h-[40px]
                rounded-[14px]
                border border-[color:var(--border-soft)]
                bg-white
                px-3
                text-[12px]
                outline-none
                focus:border-[color:var(--brand)]
              "
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              Data final
            </span>

            <input
              type="date"
              value={dataFim}
              onChange={(event) => setDataFim(event.target.value)}
              className="
                w-full h-[40px]
                rounded-[14px]
                border border-[color:var(--border-soft)]
                bg-white
                px-3
                text-[12px]
                outline-none
                focus:border-[color:var(--brand)]
              "
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              Usuário
            </span>

            <select
              value={usuarioSelecionado}
              onChange={(event) => setUsuarioSelecionado(event.target.value)}
              className="
                w-full h-[40px]
                rounded-[14px]
                border border-[color:var(--border-soft)]
                bg-white
                px-3
                text-[12px]
                outline-none
                focus:border-[color:var(--brand)]
              "
            >
              <option value="todos">Todos</option>

              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
              Tipo
            </span>

            <select
              value={tipoRelatorio}
              onChange={(event) =>
                setTipoRelatorio(event.target.value as TipoRelatorio)
              }
              className="
                w-full h-[40px]
                rounded-[14px]
                border border-[color:var(--border-soft)]
                bg-white
                px-3
                text-[12px]
                outline-none
                focus:border-[color:var(--brand)]
              "
            >
              <option value="todos">Todos</option>
              <option value="compras">Compras</option>
              <option value="vendas">Vendas</option>
            </select>
          </div>
        </div>
      </div>

      {!periodoValido && <p role="alert" className="text-sm text-red-700">Informe um período válido, com data inicial anterior ou igual à final.</p>}
      {loading && <p role="status" className="text-sm">Carregando produção...</p>}
      {query.isError && <div role="alert" className="text-sm text-red-700"><p>Não foi possível carregar a produção. {query.error.message}</p><button type="button" className="min-h-[44px] border rounded-lg px-3 mt-2" onClick={() => void query.refetch()}>Tentar novamente</button></div>}
      {pdfError && <p role="alert" className="text-sm text-red-700">{pdfError}</p>}
      {!loading && !query.isError && periodoValido && kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <KpiCard label="Compras" value={String(kpis.compras)} />
          <KpiCard label="Vendas" value={String(kpis.vendas)} />
          <KpiCard label="Kg líquido comprado" value={formatKg(kpis.kgComprado)} />
          <KpiCard label="Kg líquido vendido" value={formatKg(kpis.kgVendido)} />
          <KpiCard label="Valor líquido comprado" value={formatCurrency(kpis.valorComprado)} />
          <KpiCard label="Valor líquido vendido" value={formatCurrency(kpis.valorVendido)} />
        </div>
      )}

      <div
        className="
          overflow-hidden
          rounded-[18px]
          border border-[color:var(--border-soft)]
          bg-[color:var(--surface-100)]
        "
      >
        <div
          className="
            flex items-center justify-between
            px-4 py-3
            border-b border-[color:var(--border-soft)]
          "
        >
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight text-[color:var(--foreground)]">
              Operações do período
            </h3>

            <p className="text-[11px] text-[color:var(--muted)]">
              {linhas.length} registros encontrados
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1020px]">
            <div
              className="
                grid
                grid-cols-[100px_110px_150px_130px_1fr_120px_120px_140px]
                px-4 py-2
                text-[10px]
                uppercase tracking-[0.14em]
                text-[color:var(--muted-soft)]
                border-b border-[color:var(--border-soft)]
                bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.92))]
              "
            >
              <span>Data</span>
              <span>Tipo</span>
              <span>Usuário</span>
              <span>Documento</span>
              <span>Parceiro</span>
              <span>Caminhão</span>
              <span>KG</span>
              <span>Valor</span>
            </div>

            <div className="max-h-[520px] overflow-auto">
              {loading && (
                <div className="p-4 space-y-2">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="
                        h-[46px]
                        rounded-xl
                        bg-[color:var(--surface-200)]
                        animate-pulse
                      "
                    />
                  ))}
                </div>
              )}

              {!loading && !query.isError && periodoValido &&
                linhas.map((linha, index) => (
                  <motion.div
                    key={`${linha.tipo}-${linha.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    className="
                      grid
                      grid-cols-[100px_110px_150px_130px_1fr_120px_120px_140px]
                      items-center
                      px-4 py-3
                      text-[12px]
                      border-b border-[color:var(--border-soft)]
                      odd:bg-white
                      even:bg-[color:var(--surface-200)]/35
                      hover:bg-[rgba(99,102,241,0.04)]
                      transition
                    "
                  >
                    <span className="text-[color:var(--muted)]">
                      {formatDate(linha.data)}
                    </span>

                    <span>
                      <span
                        className={`
                          inline-flex items-center
                          px-2 py-[3px]
                          rounded-full
                          border
                          text-[9px]
                          font-medium
                          ${
                            linha.tipo === "COMPRA"
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-emerald-200 bg-emerald-50 text-emerald-600"
                          }
                        `}
                      >
                        {linha.tipo}
                      </span>
                    </span>

                    <span className="truncate text-[color:var(--muted)]">
                      {linha.usuarioNome}
                    </span>

                    <span className="font-medium text-[color:var(--foreground)]">
                      {linha.documento}
                    </span>

                    <span className="truncate text-[color:var(--foreground)]">
                      {linha.parceiro}
                    </span>

                    <span className="font-medium text-[color:var(--foreground)]">
                      {linha.modeloCaminhao}
                    </span>

                    <span className="text-[color:var(--muted)]">
                      {formatKg(linha.kg)}
                    </span>

                    <span className="font-semibold text-[color:var(--foreground)]">
                      {formatCurrency(linha.valor)}
                    </span>
                  </motion.div>
                ))}

              {!loading && !query.isError && periodoValido && linhas.length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <div
                    className="
                      mx-auto
                      w-10 h-10
                      rounded-2xl
                      bg-[color:var(--surface-200)]
                      flex items-center justify-center
                      text-[color:var(--muted-soft)]
                    "
                  >
                    —
                  </div>

                  <p className="text-[13px] font-medium text-[color:var(--foreground)]">
                    Nenhuma produção encontrada
                  </p>

                  <p className="text-[11px] text-[color:var(--muted)]">
                    Ajuste o período, usuário ou tipo para visualizar registros.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="
        relative
        overflow-hidden
        rounded-[16px]
        border border-[color:var(--border-soft)]
        bg-[linear-gradient(135deg,#ffffff,#f8fafc)]
        px-4 py-3
        shadow-[0_8px_24px_rgba(0,0,0,0.04)]
      "
    >
      <div className="relative z-10 space-y-1">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[color:var(--muted-soft)]">
          {label}
        </span>

        <p className="text-[20px] sm:text-[18px] font-semibold tracking-tight text-[color:var(--foreground)]">
          {value}
        </p>

        {helper && (
          <p className="text-[10px] text-[color:var(--muted)]">{helper}</p>
        )}
      </div>
    </motion.div>
  );
}
