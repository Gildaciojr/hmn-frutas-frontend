"use client";
import { formatOperationalDate } from "@/shared/utils/report-period";
import type {
  VendaRelatorioItem,
  VendasReportResponse,
} from "../services/vendas-relatorios.service";
interface Props {
  vendas: VendaRelatorioItem[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  pagination?: VendasReportResponse["pagination"];
  onPageChange?: (page: number) => void;
}
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const operationalStatus = {
  ABERTA: "Aberta",
  FATURADA: "Faturada",
  ENTREGUE: "Entregue",
  CANCELADA: "Cancelada",
};
const paymentStatus = {
  PENDENTE: "Pendente",
  PARCIAL: "Parcial",
  PAGO: "Pago",
};
function cells(venda: VendaRelatorioItem) {
  return [
    venda.cliente?.nome || venda.clienteNomeSnapshot || "Cliente pendente",
    formatOperationalDate(venda.dataVenda),
    [
      venda.numeroPedido && `Pedido ${venda.numeroPedido}`,
      venda.numeroRomaneio && `Romaneio ${venda.numeroRomaneio}`,
    ]
      .filter(Boolean)
      .join(" · ") || "—",
    venda.placa || "—",
    `${venda.pesoLiquido.toLocaleString("pt-BR")} kg`,
    currency.format(Number(venda.valorPorKg)),
    currency.format(Number(venda.valorTotal)),
    operationalStatus[venda.status],
    paymentStatus[venda.statusPagamento],
  ];
}
const headers = [
  "Cliente",
  "Data",
  "Pedido / romaneio",
  "Placa",
  "Kg líquido",
  "Preço comercial/kg",
  "Valor total",
  "Status operacional",
  "Pagamento",
];
export function VendasRelatorioTable({
  vendas,
  loading,
  error,
  onRetry,
  pagination,
  onPageChange,
}: Props) {
  return (
    <section
      className="soft-card rounded-[20px] overflow-hidden min-w-0"
      aria-label="Resultado do relatório de vendas"
    >
      <div className="p-3 sm:p-5 border-b">
        <h2 className="text-sm font-semibold">Resultado da pesquisa</h2>
        <p className="text-xs text-[color:var(--muted)]">
          {pagination?.total ?? vendas.length} registro(s) encontrado(s)
        </p>
      </div>
      {loading && (
        <p role="status" className="p-5 text-sm">
          Carregando relatório de vendas...
        </p>
      )}
      {!loading && error && (
        <div role="alert" className="p-5 text-sm text-red-700">
          <p>Não foi possível carregar o relatório. {error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-[44px] mt-2 rounded-lg border px-3"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {!loading && !error && vendas.length === 0 && (
        <p className="p-5 text-center text-sm">
          Nenhuma venda encontrada para os filtros informados.
        </p>
      )}
      {!loading && !error && vendas.length > 0 && (
        <>
          <div className="lg:hidden p-3 space-y-3">
            {vendas.map((venda) => (
              <article
                key={venda.id}
                className="rounded-[18px] border p-3 min-w-0"
              >
                <div className="grid grid-cols-2 gap-3">
                  {cells(venda).map((value, index) => (
                    <div
                      key={headers[index]}
                      className={`min-w-0 ${index === 0 || index === 2 ? "col-span-2" : ""}`}
                    >
                      <p className="text-[11px] text-[color:var(--muted)]">
                        {headers[index]}
                      </p>
                      <p className="text-sm font-medium break-words [overflow-wrap:anywhere]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto max-w-full">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {headers.map((header) => (
                    <th key={header} className="text-left p-3 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr
                    key={venda.id}
                    className="border-b hover:bg-[color:var(--surface-200)]"
                  >
                    {cells(venda).map((value, index) => (
                      <td
                        key={headers[index]}
                        className="p-3 max-w-[220px] break-words [overflow-wrap:anywhere]"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!error && pagination && pagination.totalPages > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-3 border-t p-3 text-sm">
          <span>
            Página {pagination.page} de {pagination.totalPages} ·{" "}
            {pagination.total} operações
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading || pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
              className="min-h-[44px] rounded-lg border px-3 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={loading || pagination.page >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
              className="min-h-[44px] rounded-lg border px-3 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
