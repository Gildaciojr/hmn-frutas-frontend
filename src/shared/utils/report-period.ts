export const PERIOD_PRESETS = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "last7", label: "Últimos 7 dias" },
  { id: "month", label: "Este mês" },
  { id: "previousMonth", label: "Mês anterior" },
  { id: "year", label: "Este ano" },
  { id: "custom", label: "Personalizado" },
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["id"];

function calendarYmd(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function getBusinessTodayYmd(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: Intl.DateTimeFormatPartTypes): string => {
    const value = parts.find((item) => item.type === name)?.value;
    if (!value) throw new Error("Calendário de São Paulo indisponível");
    return value;
  };
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getPeriodPreset(
  preset: PeriodPreset,
  now: Date = new Date(),
): { inicio: string; fim: string } | null {
  if (preset === "custom") return null;
  const today = getBusinessTodayYmd(now);
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7)) - 1;
  const day = Number(today.slice(8, 10));
  const start = new Date(Date.UTC(year, month, day));
  const end = new Date(start.getTime());
  if (preset === "yesterday") {
    start.setUTCDate(day - 1);
    end.setUTCDate(day - 1);
  } else if (preset === "last7") {
    start.setUTCDate(day - 6);
  } else if (preset === "month") {
    start.setUTCDate(1);
    end.setUTCMonth(month + 1, 0);
  } else if (preset === "previousMonth") {
    start.setUTCMonth(month - 1, 1);
    end.setUTCDate(0);
  } else if (preset === "year") {
    start.setUTCMonth(0, 1);
    end.setUTCMonth(11, 31);
  }
  return { inicio: calendarYmd(start), fim: calendarYmd(end) };
}

// Civil date label, never a timezone conversion of a payment/audit timestamp.
export function formatOperationalDate(value: string): string {
  const ymd = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "-";
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`;
}
