"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { useCompras } from "@/modules/compras/hooks/useCompras";
import { useVendas } from "@/modules/vendas/hooks/useVendas";

type TipoRelatorio = "todos" | "compras" | "vendas";

type UsuarioOption = {
  id: string;
  nome: string;
};

type LinhaRelatorio = {
  id: string;
  tipo: "COMPRA" | "VENDA";
  data: string;
  usuarioNome: string;
  documento: string;
  parceiro: string;
  kg: number;
  valor: number;
};

function toSafeNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatKg(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  })} kg`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("pt-BR");
}

function getMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    inicio: start.toISOString().split("T")[0],
    fim: end.toISOString().split("T")[0],
  };
}

function isDateInRange(value: string, inicio: string, fim: string): boolean {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const start = new Date(`${inicio}T00:00:00`);

  const end = new Date(`${fim}T23:59:59`);

  return date >= start && date <= end;
}

export function RelatorioProducao() {
  const defaultRange = useMemo(() => getMonthRange(), []);

  const [dataInicio, setDataInicio] = useState(defaultRange.inicio);

  const [dataFim, setDataFim] = useState(defaultRange.fim);

  const [usuarioSelecionado, setUsuarioSelecionado] = useState("todos");

  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("todos");

  const { compras, loading: loadingCompras } = useCompras();

  const { vendas, loading: loadingVendas } = useVendas();

  const loading = loadingCompras || loadingVendas;

  const usuarios = useMemo<UsuarioOption[]>(() => {
    const map = new Map<string, UsuarioOption>();

    compras.forEach((compra) => {
      const nome = compra.usuarioResponsavelNome?.trim();

      if (!nome) {
        return;
      }

      const id = compra.usuarioResponsavelId ?? nome;

      map.set(id, {
        id,
        nome,
      });
    });

    vendas.forEach((venda) => {
      const nome = venda.usuarioResponsavelNome?.trim();

      if (!nome) {
        return;
      }

      const id = venda.usuarioResponsavelId ?? nome;

      map.set(id, {
        id,
        nome,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }, [compras, vendas]);

  const comprasFiltradas = useMemo(() => {
    return compras.filter((compra) => {
      if (compra.status === "CANCELADA") {
        return false;
      }

      if (!isDateInRange(compra.dataCompra, dataInicio, dataFim)) {
        return false;
      }

      if (usuarioSelecionado !== "todos") {
        const usuarioId = compra.usuarioResponsavelId ?? "";
        const usuarioNome = compra.usuarioResponsavelNome ?? "";

        return (
          usuarioId === usuarioSelecionado || usuarioNome === usuarioSelecionado
        );
      }

      return true;
    });
  }, [compras, dataInicio, dataFim, usuarioSelecionado]);

  const vendasFiltradas = useMemo(() => {
    return vendas.filter((venda) => {
      if (venda.status === "CANCELADA") {
        return false;
      }

      const dataBase = venda.dataVenda ?? venda.createdAt;

      if (!isDateInRange(dataBase, dataInicio, dataFim)) {
        return false;
      }

      if (usuarioSelecionado !== "todos") {
        const usuarioId = venda.usuarioResponsavelId ?? "";
        const usuarioNome = venda.usuarioResponsavelNome ?? "";

        return (
          usuarioId === usuarioSelecionado || usuarioNome === usuarioSelecionado
        );
      }

      return true;
    });
  }, [vendas, dataInicio, dataFim, usuarioSelecionado]);

  const linhas = useMemo<LinhaRelatorio[]>(() => {
    const linhasCompras: LinhaRelatorio[] = comprasFiltradas.map((compra) => ({
      id: compra.id,
      tipo: "COMPRA",
      data: compra.dataCompra,
      usuarioNome: compra.usuarioResponsavelNome ?? "Sem usuário",
      documento: compra.numeroFolha ?? "-",
      parceiro:
        compra.fornecedor?.nome ??
        compra.cliente?.nome ??
        compra.clienteNomeSnapshot ??
        "Sem fornecedor",
      kg: toSafeNumber(compra.kgLiquido),
      valor: toSafeNumber(compra.valorTotal),
    }));

    const linhasVendas: LinhaRelatorio[] = vendasFiltradas.map((venda) => ({
      id: venda.id,
      tipo: "VENDA",
      data: venda.dataVenda ?? venda.createdAt,
      usuarioNome: venda.usuarioResponsavelNome ?? "Sem usuário",
      documento: venda.numeroPedido ?? venda.numeroRomaneio ?? "-",
      parceiro: venda.cliente?.nome ?? "Sem cliente",
      kg: toSafeNumber(venda.quantidadeKg),
      valor: toSafeNumber(venda.valorTotal),
    }));

    const linhasPorTipo =
      tipoRelatorio === "compras"
        ? linhasCompras
        : tipoRelatorio === "vendas"
          ? linhasVendas
          : [...linhasCompras, ...linhasVendas];

    return linhasPorTipo.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
    );
  }, [comprasFiltradas, vendasFiltradas, tipoRelatorio]);

  const kpis = useMemo(() => {
    const totalCompras =
      tipoRelatorio === "vendas" ? 0 : comprasFiltradas.length;

    const totalVendas =
      tipoRelatorio === "compras" ? 0 : vendasFiltradas.length;

    const kgCompras =
      tipoRelatorio === "vendas"
        ? 0
        : comprasFiltradas.reduce(
            (total, compra) => total + toSafeNumber(compra.kgLiquido),
            0,
          );

    const kgVendas =
      tipoRelatorio === "compras"
        ? 0
        : vendasFiltradas.reduce(
            (total, venda) => total + toSafeNumber(venda.quantidadeKg),
            0,
          );

    const valorCompras =
      tipoRelatorio === "vendas"
        ? 0
        : comprasFiltradas.reduce(
            (total, compra) => total + toSafeNumber(compra.valorTotal),
            0,
          );

    const valorVendas =
      tipoRelatorio === "compras"
        ? 0
        : vendasFiltradas.reduce(
            (total, venda) => total + toSafeNumber(venda.valorTotal),
            0,
          );

    const totalOperacoes = totalCompras + totalVendas;

    const valorMovimentado = valorCompras + valorVendas;

    return {
      totalCompras,
      totalVendas,
      kgMovimentado: kgCompras + kgVendas,
      valorMovimentado,
      ticketMedio: totalOperacoes > 0 ? valorMovimentado / totalOperacoes : 0,
    };
  }, [comprasFiltradas, vendasFiltradas, tipoRelatorio]);

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
            onClick={() => {
              console.log("Exportar PDF", {
                dataInicio,
                dataFim,
                usuarioSelecionado,
                tipoRelatorio,
                linhas,
                kpis,
              });
            }}
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
            Exportar PDF
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard label="Compras" value={String(kpis.totalCompras)} />
        <KpiCard label="Vendas" value={String(kpis.totalVendas)} />
        <KpiCard label="KG movimentado" value={formatKg(kpis.kgMovimentado)} />
        <KpiCard
          label="Valor movimentado"
          value={formatCurrency(kpis.valorMovimentado)}
          helper={`Ticket médio: ${formatCurrency(kpis.ticketMedio)}`}
        />
      </div>

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
          <div className="min-w-[900px]">
            <div
              className="
                grid
                grid-cols-[100px_110px_150px_130px_1fr_120px_140px]
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

              {!loading &&
                linhas.map((linha, index) => (
                  <motion.div
                    key={`${linha.tipo}-${linha.id}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.01 }}
                    className="
                      grid
                      grid-cols-[100px_110px_150px_130px_1fr_120px_140px]
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

                    <span className="text-[color:var(--muted)]">
                      {formatKg(linha.kg)}
                    </span>

                    <span className="font-semibold text-[color:var(--foreground)]">
                      {formatCurrency(linha.valor)}
                    </span>
                  </motion.div>
                ))}

              {!loading && linhas.length === 0 && (
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
