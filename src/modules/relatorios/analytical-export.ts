import {
  collectReport,
  type ExportReport,
} from "@/shared/report-export/report-export";
import { formatOperationalDate } from "@/shared/utils/report-period";
import {
  searchCompras,
  type SearchCompraParams,
} from "@/modules/compras-relatorios/services/compras-relatorios.service";
import {
  searchVendas,
  type SearchVendaParams,
} from "@/modules/vendas-relatorios/services/vendas-relatorios.service";

const filterLabels: Record<string, string> = {
  fornecedor: "Fornecedor",
  fazenda: "Fazenda",
  cliente: "Cliente",
  placa: "Placa",
  numeroFolha: "Folha",
  numeroPedido: "Pedido",
  numeroRomaneio: "Romaneio",
  status: "Status",
  statusPagamento: "Pagamento",
  dataInicio: "De",
  dataFim: "Até",
};
function describeFilters(
  filters: SearchCompraParams | SearchVendaParams,
  partnerName?: string,
) {
  const descriptions = Object.entries(filters).flatMap(([key, value]) =>
    value && filterLabels[key]
      ? [
          `${filterLabels[key]}: ${key.startsWith("data") ? formatOperationalDate(String(value)) : value}`,
        ]
      : [],
  );
  if (
    partnerName &&
    !descriptions.some((value) => /^(Cliente|Fornecedor):/.test(value))
  )
    descriptions.unshift(partnerName);
  if (!filters.status) descriptions.push("Canceladas excluídas");
  if (!filters.dataInicio && !filters.dataFim)
    descriptions.push("Período: histórico completo");
  return descriptions;
}
function number(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    throw new Error("O relatório contém um valor inválido. Gere novamente.");
  return parsed;
}
export async function getComprasExport(
  filters: SearchCompraParams,
): Promise<ExportReport> {
  const applied = { ...filters };
  const { items, summary } = await collectReport((page, pageSize) =>
    searchCompras({ ...applied, page, pageSize }),
  );
  return {
    name: "compras",
    title: "Relatório analítico de compras",
    filters: describeFilters({
      ...applied,
      fornecedor:
        applied.fornecedor ??
        (applied.fornecedorId ? items[0].fornecedor?.nome : undefined),
      fazenda:
        applied.fazenda ??
        (applied.fazendaId ? items[0].fazendaFornecedor?.nome : undefined),
    }),
    metrics: [
      { label: "Operações", value: summary.operacoes },
      { label: "Kg líquido", value: summary.kgLiquido, unit: "kg" },
      { label: "Valor líquido", value: summary.valorLiquido, unit: "currency" },
      {
        label: "Preço comercial médio/kg",
        value: summary.precoComercialMedioKg,
        unit: "currency",
      },
      {
        label: "Ticket médio líquido",
        value: summary.ticketMedioLiquido,
        unit: "currency",
      },
    ],
    columns: [
      { label: "Data", width: 23 },
      { label: "Fornecedor", width: 43 },
      { label: "Fazenda", width: 35 },
      { label: "Folha", width: 22 },
      { label: "Placa", width: 23 },
      { label: "Modelo", width: 25 },
      { label: "Kg líquido", width: 25, numeric: true },
      { label: "Preço/kg", width: 25, numeric: true },
      { label: "Valor total", width: 29, numeric: true },
      { label: "Status", width: 23 },
    ],
    rows: items.map((item) => [
      formatOperationalDate(item.dataCompra),
      [item.fornecedor?.nome, item.fornecedor?.sobrenome]
        .filter(Boolean)
        .join(" ") ||
        item.clienteNomeSnapshot ||
        "—",
      item.fazendaFornecedor?.nome || "—",
      item.numeroFolha || "—",
      item.placa || "—",
      item.modeloCaminhao,
      item.kgLiquido,
      number(item.precoKg),
      number(item.valorTotal),
      item.status,
    ]),
  };
}
export async function getVendasExport(
  filters: SearchVendaParams,
  clientName?: string,
): Promise<ExportReport> {
  const applied = { ...filters };
  const { items, summary } = await collectReport((page, pageSize) =>
    searchVendas({ ...applied, page, pageSize }),
  );
  return {
    name: "vendas",
    title: "Relatório analítico de vendas",
    filters: describeFilters(
      applied,
      applied.clienteId
        ? `Cliente: ${clientName || items[0].cliente?.nome || items[0].clienteNomeSnapshot}`
        : undefined,
    ),
    metrics: [
      { label: "Operações", value: summary.operacoes },
      {
        label: "Kg líquido vendido",
        value: summary.kgLiquidoVendido,
        unit: "kg",
      },
      {
        label: "Valor líquido vendido",
        value: summary.valorLiquidoVendido,
        unit: "currency",
      },
      {
        label: "Preço comercial médio/kg",
        value: summary.precoComercialMedioKg,
        unit: "currency",
      },
      {
        label: "Ticket médio líquido",
        value: summary.ticketMedioLiquido,
        unit: "currency",
      },
    ],
    columns: [
      { label: "Data", width: 23 },
      { label: "Cliente", width: 44 },
      { label: "Pedido / Romaneio", width: 33 },
      { label: "Placa", width: 22 },
      { label: "Kg líquido", width: 24, numeric: true },
      { label: "Preço comercial/kg", width: 25, numeric: true },
      { label: "Valor total", width: 30, numeric: true },
      { label: "Status", width: 33 },
      { label: "Pagamento", width: 29 },
    ],
    rows: items.map((item) => [
      formatOperationalDate(item.dataVenda),
      item.cliente?.nome || item.clienteNomeSnapshot || "—",
      `${item.numeroPedido || "—"} / ${item.numeroRomaneio || "—"}`,
      item.placa || "—",
      item.pesoLiquido,
      number(item.valorPorKg),
      number(item.valorTotal),
      item.status,
      item.statusPagamento,
    ]),
  };
}
