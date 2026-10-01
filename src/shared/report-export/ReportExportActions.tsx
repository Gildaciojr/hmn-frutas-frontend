"use client";
import { useRef, useState } from "react";
import {
  saveReport,
  type ExportFormat,
  type ExportReport,
} from "./report-export";

export function ReportExportActions({
  getReport,
  disabled = false,
}: {
  getReport: () => Promise<ExportReport>;
  disabled?: boolean;
}) {
  const busy = useRef(false);
  const [format, setFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function exportReport(next: ExportFormat) {
    if (busy.current || disabled) return;
    busy.current = true;
    setFormat(next);
    setError(null);
    try {
      await saveReport(await getReport(), next);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível exportar. Tente novamente.",
      );
    } finally {
      busy.current = false;
      setFormat(null);
    }
  }
  return (
    <div className="space-y-2 min-w-0">
      <div
        className="flex flex-wrap gap-2"
        aria-label="Exportar relatório completo"
      >
        {(
          [
            ["pdf", "PDF"],
            ["xlsx", "Excel"],
            ["csv", "CSV"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            disabled={disabled || Boolean(format)}
            onClick={() => void exportReport(value)}
            className="min-h-[44px] rounded-xl border px-4 text-sm disabled:opacity-50"
          >
            {format === value ? "Exportando..." : label}
          </button>
        ))}
      </div>
      {format && (
        <p role="status" className="text-sm">
          Preparando todas as páginas do relatório filtrado...
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
