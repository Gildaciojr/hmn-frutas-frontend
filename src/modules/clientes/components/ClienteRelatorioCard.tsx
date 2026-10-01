"use client";
import { formatOperationalDate } from "@/shared/utils/report-period";
import type { ClienteRelatorioResponse } from "../services/clientes.service";
interface Props {
  data?: ClienteRelatorioResponse;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onPdf: () => void;
  pdfLoading: boolean;
  pdfError: string | null;
}
const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const instant = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(value))
    : "—";
export function ClienteRelatorioCard({
  data,
  loading,
  error,
  onRetry,
  onPdf,
  pdfLoading,
  pdfError,
}: Props) {
  if (loading)
    return (
      <p role="status" className="py-5 text-sm">
        Carregando relatório do cliente...
      </p>
    );
  if (error || !data)
    return (
      <div role="alert" className="text-sm text-red-600">
        <p>Não foi possível carregar o relatório. {error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-[44px] rounded-xl border px-3"
        >
          Tentar novamente
        </button>
      </div>
    );
  const r = data.resumo;
  const cards = [
    ["Total vendido", currency.format(r.totalVendido)],
    ["Recebido", currency.format(r.totalRecebido)],
    ["A receber", currency.format(r.totalAReceber)],
    ["Vencido", currency.format(r.totalVencido)],
    ["Vendas", String(r.quantidadeVendas)],
    ["Kg líquido vendido", r.kgLiquidoVendido.toLocaleString("pt-BR") + " kg"],
    [
      "Última venda",
      r.ultimaVenda ? formatOperationalDate(r.ultimaVenda) : "—",
    ],
    ["Último pagamento (SP)", instant(r.ultimoPagamento)],
  ];
  return (
    <section
      className="space-y-4 min-w-0"
      aria-label="Relatório / Extrato do cliente"
    >
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-lg font-semibold">Relatório / Extrato</h3>
        <button
          type="button"
          disabled={pdfLoading}
          onClick={onPdf}
          className="btn-primary min-h-[44px] px-4"
        >
          {pdfLoading ? "Gerando PDF..." : "Gerar PDF"}
        </button>
      </div>
      {pdfError && (
        <p role="alert" className="text-sm text-red-600">
          {pdfError}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl border p-3">
            <p className="text-xs text-[color:var(--muted)]">{label}</p>
            <p className="font-semibold break-words">{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold">Operações - vendas válidas</h4>
        {!data.operacoes.length && (
          <p className="text-sm">Nenhuma venda registrada.</p>
        )}
        {data.operacoes.map((venda) => (
          <article
            key={venda.id}
            className="min-w-0 rounded-xl border p-3 text-sm break-words [overflow-wrap:anywhere]"
          >
            <p className="font-semibold">
              {formatOperationalDate(venda.dataVenda)} · Pedido{" "}
              {venda.numeroPedido || "—"} · Romaneio{" "}
              {venda.numeroRomaneio || "—"}
            </p>
            <p>
              {venda.placa || "Sem placa"} ·{" "}
              {venda.pesoLiquido.toLocaleString("pt-BR")} kg ·{" "}
              {currency.format(venda.valorTotal)}
            </p>
            <p>
              {venda.status} · Pagamento: {venda.statusPagamento}
            </p>
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <h4 className="font-semibold">
          Financeiro - títulos ENTRADA e recebimentos
        </h4>
        {!data.financeiro.titulos.length && (
          <p className="text-sm">Nenhum título financeiro de entrada registrado.</p>
        )}
        {data.financeiro.titulos.map((title) => (
          <article
            key={title.id}
            className="min-w-0 rounded-xl border p-3 text-sm break-words [overflow-wrap:anywhere]"
          >
            <p className="font-semibold">
              {title.referencia || title.descricao || title.id} ·{" "}
              {title.statusFinanceiro}
            </p>
            <p>
              Nominal: {currency.format(title.valor)} · Recebido:{" "}
              {currency.format(title.valorPago)} · Restante:{" "}
              {currency.format(title.valorRestante)}
            </p>
            <p>
              Vencimento:{" "}
              {title.vencimento ? formatOperationalDate(title.vencimento) : "—"}
            </p>
            {title.pagamentos.length ? (
              title.pagamentos.map((event) => (
                <div key={event.id} className="mt-2 border-t pt-2">
                  <p>
                    {instant(event.pagoEm)} · {event.formaPagamento} ·{" "}
                    {currency.format(event.valor)}
                  </p>
                  {event.observacoes && <p>{event.observacoes}</p>}
                </div>
              ))
            ) : (
              <p className="mt-2 text-[color:var(--muted)]">
                Sem recebimentos registrados.
              </p>
            )}
          </article>
        ))}
      </div>
      <p className="text-xs text-[color:var(--muted)]">
        Histórico completo. Títulos cancelados não compõem o aberto.
      </p>
    </section>
  );
}
