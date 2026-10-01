import { getBusinessTodayYmd } from "@/shared/utils/report-period";

export type ExportFormat = "pdf" | "xlsx" | "csv";
export type ReportCell = string | number;
export interface ExportReport {
  name: "compras" | "vendas";
  title: string;
  filters: string[];
  metrics: { label: string; value: number; unit?: "currency" | "kg" }[];
  columns: { label: string; width: number; numeric?: boolean }[];
  rows: ReportCell[][];
}
interface ReportPage<T, S> {
  items: T[];
  summary: S;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

// Both approved analytical contracts cap pageSize at 100.
export async function collectReport<T extends { id: string }, S>(
  fetchPage: (page: number, pageSize: number) => Promise<ReportPage<T, S>>,
): Promise<{ items: T[]; summary: S }> {
  const first = await fetchPage(1, 100);
  if (!first.pagination.total)
    throw new Error("Nenhum resultado para exportar. Ajuste os filtros.");
  const total = first.pagination.total;
  const pages = first.pagination.totalPages;
  if (
    !Number.isSafeInteger(total) ||
    total < 0 ||
    !Number.isSafeInteger(pages) ||
    pages < 1
  )
    throw new Error("Paginação inválida. Gere o relatório novamente.");
  const items: T[] = [];
  const ids = new Set<string>();
  function append(result: ReportPage<T, S>, page: number) {
    if (
      result.pagination.page !== page ||
      result.pagination.total !== total ||
      result.pagination.totalPages !== pages ||
      result.pagination.pageSize !== first.pagination.pageSize ||
      JSON.stringify(result.summary) !== JSON.stringify(first.summary) ||
      !result.items.length
    )
      throw new Error(
        "O relatório mudou durante a exportação. Tente novamente.",
      );
    for (const item of result.items) {
      if (ids.has(item.id))
        throw new Error(
          "O relatório mudou durante a exportação. Tente novamente.",
        );
      ids.add(item.id);
      items.push(item);
    }
  }
  append(first, 1);
  for (let page = 2; page <= pages; page++)
    append(await fetchPage(page, 100), page);
  if (items.length !== total)
    throw new Error(
      "Não foi possível obter o relatório completo. Tente novamente.",
    );
  return { items, summary: first.summary };
}

function assertRows(report: ExportReport) {
  if (!report.rows.length)
    throw new Error("Nenhum resultado para exportar. Ajuste os filtros.");
}
function safeText(value: string) {
  // Text supplied by partners must remain text in spreadsheet applications.
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}
function csvCell(value: ReportCell) {
  const text =
    typeof value === "number"
      ? String(value).replace(".", ",")
      : safeText(value);
  return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}
export function createCsv(report: ExportReport): string {
  assertRows(report);
  return (
    "\uFEFF" +
    [report.columns.map((column) => column.label), ...report.rows]
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n")
  );
}
export async function createWorkbook(report: ExportReport) {
  assertRows(report);
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.aoa_to_sheet([
    report.columns.map((column) => column.label),
    ...report.rows,
  ]);
  sheet["!cols"] = report.columns.map((column, index) => ({
    wch: Math.min(
      36,
      Math.max(
        12,
        column.label.length + 2,
        ...report.rows
          .slice(0, 200)
          .map((row) => String(row[index] ?? "").length + 2),
      ),
    ),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    sheet,
    report.name === "compras" ? "Compras" : "Vendas",
  );
  return workbook;
}
export async function createPdf(report: ExportReport) {
  assertRows(report);
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const generated = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(18);
  doc.text("HMN Frutas", 12, 16);
  doc.setFontSize(13);
  doc.text(report.title, 12, 24);
  doc.setTextColor(60);
  doc.setFontSize(8);
  doc.text(`Gerado em ${generated} (SP)`, width - 12, 16, { align: "right" });
  doc.setFontSize(9);
  const filters: string[] = doc.splitTextToSize(
    report.filters.join(" | "),
    width - 24,
  );
  doc.text(filters, 12, 32);
  const metricsY = 32 + filters.length * 4 + 5;
  const metricWidth = (width - 24) / report.metrics.length;
  report.metrics.forEach((metric, index) => {
    const x = 12 + metricWidth * index;
    const label: string[] = doc.splitTextToSize(metric.label, metricWidth - 4);
    doc.text(label, x, metricsY);
    doc.setFont("helvetica", "bold");
    const value = metric.value.toLocaleString(
      "pt-BR",
      metric.unit === "currency"
        ? { style: "currency", currency: "BRL" }
        : { maximumFractionDigits: 3 },
    );
    doc.text(value + (metric.unit === "kg" ? " kg" : ""), x, metricsY + 10);
    doc.setFont("helvetica", "normal");
  });
  const totalWidth = report.columns.reduce(
    (sum, column) => sum + column.width,
    0,
  );
  autoTable(doc, {
    startY: metricsY + 16,
    margin: { left: 12, right: 12, top: 22, bottom: 15 },
    head: [report.columns.map((column) => column.label)],
    body: report.rows.map((row) =>
      row.map((value) =>
        typeof value === "number"
          ? value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 3,
            })
          : value,
      ),
    ),
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: { fillColor: [22, 101, 52], textColor: 255 },
    columnStyles: Object.fromEntries(
      report.columns.map((column, index) => [
        index,
        {
          cellWidth: (column.width / totalWidth) * (width - 24),
          halign: column.numeric ? "right" : "left",
        },
      ]),
    ),
    rowPageBreak: "avoid",
    didDrawPage: ({ pageNumber }) => {
      if (pageNumber > 1) {
        doc.setFontSize(10);
        doc.setTextColor(22, 101, 52);
        doc.text(`HMN Frutas - ${report.title}`, 12, 14);
      }
    },
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setTextColor(100);
    doc.setFontSize(8);
    doc.text(
      `Página ${page} de ${pages}`,
      width - 12,
      doc.internal.pageSize.getHeight() - 7,
      { align: "right" },
    );
  }
  return doc;
}
function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
export async function saveReport(report: ExportReport, format: ExportFormat) {
  const filename = `hmn-${report.name}-${getBusinessTodayYmd()}.${format}`;
  if (format === "csv")
    saveBlob(
      new Blob([createCsv(report)], { type: "text/csv;charset=utf-8" }),
      filename,
    );
  else if (format === "xlsx") {
    const XLSX = await import("xlsx");
    const workbook = await createWorkbook(report);
    const buffer: ArrayBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveBlob(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      filename,
    );
  } else (await createPdf(report)).save(filename);
}
