import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as React from "react";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
let harness;
let queryResult;
let queryOptions;
let download;
const apiCalls = [];
const loaded = new Map();
const selectors = {
  FornecedorSelect: function FornecedorSelect() {},
  FazendaSelect: function FazendaSelect() {},
};
function load(relative) {
  const filename = path.resolve(root, relative);
  if (loaded.has(filename)) return loaded.get(filename);
  const source = fs.readFileSync(filename, "utf8");
  const js = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => {
    if (id === "react") return { ...React,
      useState: (initial) => harness.state(initial), useMemo: (fn) => fn(),
    };
    if (id === "@tanstack/react-query") return { useQuery: (options) => {
      queryOptions = options; return queryResult;
    } };
    if (id === "framer-motion") return { motion: { div: "div" } };
    if (id.endsWith("FornecedorSelect")) return { FornecedorSelect: selectors.FornecedorSelect };
    if (id.endsWith("FazendaSelect")) return { FazendaSelect: selectors.FazendaSelect };
    if (id === "@/shared/hooks/useDocumentActions") return { useDocumentActions: () => ({ download }) };
    if (id === "@/core/http/api") return { api: { get: async (...args) => {
      apiCalls.push(args); return { data: { success: true, data: {} } };
    } } };
    if (id.startsWith("@/")) return load("src/" + id.slice(2) + ".ts");
    if (id.startsWith(".") && !id.endsWith(".json")) {
      const target = path.resolve(path.dirname(filename), id);
      for (const ext of [".ts", ".tsx"]) if (fs.existsSync(target + ext)) return load(target + ext);
    }
    return originalRequire(id);
  };
  mod._compile(js, filename);
  loaded.set(filename, mod.exports);
  return mod.exports;
}
function mount(component, props = {}) {
  const values = [];
  let cursor = 0;
  const instance = {
    state(initial) {
      const slot = cursor++;
      if (!(slot in values)) values[slot] = typeof initial === "function" ? initial() : initial;
      return [values[slot], (value) => { values[slot] = typeof value === "function" ? value(values[slot]) : value; }];
    },
    render() { cursor = 0; harness = instance; return component(props); },
  };
  return instance;
}
function nodes(value) {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object") return [];
  return [value, ...nodes(value.props?.children)];
}
function text(value) {
  if (Array.isArray(value)) return value.map(text).join(" ");
  if (!value || typeof value === "boolean") return "";
  if (typeof value !== "object") return String(value);
  return text(value.props?.children);
}
function button(tree, label) {
  const found = nodes(tree).find((n) => n.type === "button" && text(n).includes(label));
  assert.ok(found, "button " + label); return found;
}

test("civil presets preserve calendar dates at UTC/SP month and year boundaries", () => {
  const helper = load("src/shared/utils/report-period.ts");
  const now = new Date("2027-01-01T01:00:00Z");
  assert.equal(helper.getBusinessTodayYmd(now), "2026-12-31");
  assert.equal(helper.formatOperationalDate("2026-10-01T00:00:00Z"), "01/10/2026");
  const expected = {
    today: ["2026-12-31", "2026-12-31"], yesterday: ["2026-12-30", "2026-12-30"],
    last7: ["2026-12-25", "2026-12-31"], month: ["2026-12-01", "2026-12-31"],
    previousMonth: ["2026-11-01", "2026-11-30"], year: ["2026-01-01", "2026-12-31"],
  };
  for (const [preset, range] of Object.entries(expected)) assert.deepEqual(helper.getPeriodPreset(preset, now), { inicio: range[0], fim: range[1] });
  assert.deepEqual(helper.getPeriodPreset("previousMonth", new Date("2028-03-10T12:00:00Z")), { inicio: "2028-02-01", fim: "2028-02-29" });
  assert.equal(helper.getPeriodPreset("custom", now), null);
});

test("existing purchase filters combine IDs, dates, plate, sheet and status; manual dates leave preset and clear resets", () => {
  const { ComprasFiltersCard } = load("src/modules/compras-relatorios/components/ComprasFiltersCard.tsx");
  let submitted; let cleared = 0;
  const view = mount(ComprasFiltersCard, { onSearch: (f) => { submitted = f; }, onClear: () => cleared++ });
  let tree = view.render();
  nodes(tree).find((n) => n.type === selectors.FornecedorSelect).props.onSelectFornecedor({ id: "supplier", nome: "Produtor" });
  tree = view.render();
  nodes(tree).find((n) => n.type === selectors.FazendaSelect).props.onSelectFazenda({ id: "farm", nome: "Sítio" });
  button(tree, "Hoje").props.onClick();
  tree = view.render();
  assert.equal(button(tree, "Hoje").props["aria-pressed"], true);
  const dates = nodes(tree).filter((n) => n.type === "input" && n.props.type === "date");
  dates[0].props.onChange({ target: { value: "2026-10-01" } });
  dates[1].props.onChange({ target: { value: "2026-10-31" } });
  tree = view.render();
  assert.equal(button(tree, "Personalizado").props["aria-pressed"], true);
  button(tree, "Filtros avançados").props.onClick();
  tree = view.render();
  const inputs = nodes(tree).filter((n) => n.type === "input" && n.props.type !== "date");
  inputs[0].props.onChange({ target: { value: "abc1d23" } });
  inputs[1].props.onChange({ target: { value: "123" } });
  nodes(tree).find((n) => n.type === "select").props.onChange({ target: { value: "CANCELADA" } });
  button(view.render(), "Gerar relatório").props.onClick();
  assert.deepEqual(submitted, { fornecedor: "Produtor", fornecedorId: "supplier", fazenda: "Sítio", fazendaId: "farm", placa: "ABC1D23", numeroFolha: "123", status: "CANCELADA", dataInicio: "2026-10-01", dataFim: "2026-10-31" });
  button(view.render(), "Limpar").props.onClick();
  button(view.render(), "Gerar relatório").props.onClick();
  assert.equal(cleared, 1);
  assert.ok(Object.values(submitted).every((v) => v === undefined));
});

test("purchase report distinguishes loading/error/empty and keeps full-result pagination", () => {
  const { ComprasRelatorioTable } = load("src/modules/compras-relatorios/components/ComprasRelatorioTable.tsx");
  assert.match(text(ComprasRelatorioTable({ compras: [], loading: true })), /Carregando/);
  assert.doesNotMatch(text(ComprasRelatorioTable({ compras: [], loading: true })), /Nenhuma compra/);
  let retry = 0;
  const error = ComprasRelatorioTable({ compras: [], error: "offline", onRetry: () => retry++ });
  button(error, "Tentar novamente").props.onClick(); assert.equal(retry, 1);
  assert.doesNotMatch(text(error), /Nenhuma compra/);
  assert.match(text(ComprasRelatorioTable({ compras: [] })), /Nenhuma compra/);
  let page;
  const paged = ComprasRelatorioTable({ compras: [], pagination: { total: 50, page: 1, pageSize: 25, totalPages: 2 }, onPageChange: (p) => { page = p; } });
  button(paged, "Próxima").props.onClick(); assert.equal(page, 2);
  assert.match(text(paged), /50\s+operações/);
});

test("production uses backend filters and same PDF parameters, shows export progress and recoverable failures", async () => {
  const { RelatorioProducao } = load("src/modules/vendas/components/financeiro/RelatorioProducao.tsx");
  queryResult = { isFetching: false, isError: false, error: null, refetch: () => {}, data: {
    usuariosDisponiveis: [{ id: "uuid", nome: "Ana" }], compras: [], vendas: [],
    totais: { compras: 0, vendas: 0, kgComprado: 0, kgVendido: 0, valorComprado: 0, valorVendido: 0 },
  } };
  let finish; let pdfOptions;
  download = (options) => { pdfOptions = options; return new Promise((resolve) => { finish = resolve; }); };
  const view = mount(RelatorioProducao);
  let tree = view.render();
  const dates = nodes(tree).filter((n) => n.type === "input" && n.props.type === "date");
  dates[0].props.onChange({ target: { value: "2026-10-01" } });
  dates[1].props.onChange({ target: { value: "2026-10-31" } });
  const selects = nodes(tree).filter((n) => n.type === "select");
  selects[0].props.onChange({ target: { value: "uuid" } });
  selects[1].props.onChange({ target: { value: "vendas" } });
  tree = view.render();
  assert.deepEqual(queryOptions.queryKey[1], { dataInicial: "2026-10-01", dataFinal: "2026-10-31", tipo: "VENDAS", usuarioId: "uuid" });
  await queryOptions.queryFn();
  const pending = button(tree, "Exportar PDF").props.onClick();
  assert.equal(button(view.render(), "Exportando PDF").props.disabled, true);
  assert.equal(pdfOptions.url.replace("/pdf?", "?"), apiCalls.at(-1)[0]);
  finish(); await pending;
  download = async () => { throw new Error("PDF offline"); };
  await button(view.render(), "Exportar PDF").props.onClick();
  assert.match(text(view.render()), /PDF offline/);
  queryResult = { ...queryResult, isFetching: true };
  assert.match(text(view.render()), /Carregando produção/);
  assert.equal(button(view.render(), "Exportar PDF").props.disabled, true);
  queryResult = { ...queryResult, isFetching: false, isError: true, error: new Error("API offline") };
  assert.match(text(view.render()), /API offline/);
  assert.doesNotMatch(text(view.render()), /Nenhuma produção/);
  queryResult = { ...queryResult, isError: false, error: null };
  assert.match(text(view.render()), /Nenhuma produção/);
});

for (const filter of ["supplier", "farm", "plate", "sheet", "status", "period"]) {
  test("purchase filter works independently: " + filter, () => {
    const { ComprasFiltersCard } = load("src/modules/compras-relatorios/components/ComprasFiltersCard.tsx");
    let submitted;
    const view = mount(ComprasFiltersCard, { onSearch: f => { submitted = f; }, onClear: () => {} });
    let tree = view.render();
    let expected;
    if (filter === "supplier") {
      nodes(tree).find(n => n.type === selectors.FornecedorSelect).props.onSelectFornecedor({ id: "supplier", nome: "Produtor" });
      expected = { fornecedor: "Produtor", fornecedorId: "supplier" };
    } else if (filter === "farm") {
      nodes(tree).find(n => n.type === selectors.FazendaSelect).props.onSelectFazenda({ id: "farm", nome: "Sítio" });
      expected = { fazenda: "Sítio", fazendaId: "farm" };
    } else if (filter === "period") {
      const dates = nodes(tree).filter(n => n.type === "input" && n.props.type === "date");
      dates[0].props.onChange({ target: { value: "2026-10-01" } });
      dates[1].props.onChange({ target: { value: "2026-10-01" } });
      expected = { dataInicio: "2026-10-01", dataFim: "2026-10-01" };
    } else {
      button(tree, "Filtros avançados").props.onClick(); tree = view.render();
      if (filter === "status") {
        nodes(tree).find(n => n.type === "select").props.onChange({ target: { value: "ABERTA" } });
        expected = { status: "ABERTA" };
      } else {
        const inputs = nodes(tree).filter(n => n.type === "input" && n.props.type !== "date");
        inputs[filter === "plate" ? 0 : 1].props.onChange({ target: { value: filter === "plate" ? "abc1d23" : "12" } });
        expected = filter === "plate" ? { placa: "ABC1D23" } : { numeroFolha: "12" };
      }
    }
    button(view.render(), "Gerar relatório").props.onClick();
    assert.deepEqual(Object.fromEntries(Object.entries(submitted).filter(([,value]) => value !== undefined)), expected);
  });
}
test("purchase inverted period blocks query with visible feedback", () => {
  const { ComprasFiltersCard } = load("src/modules/compras-relatorios/components/ComprasFiltersCard.tsx");
  let calls = 0;
  const view = mount(ComprasFiltersCard, { onSearch: () => calls++, onClear: () => {} });
  const dates = nodes(view.render()).filter(n => n.type === "input" && n.props.type === "date");
  dates[0].props.onChange({ target: { value: "2026-10-02" } });
  dates[1].props.onChange({ target: { value: "2026-10-01" } });
  button(view.render(), "Gerar relatório").props.onClick();
  assert.equal(calls, 0);
  assert.match(text(view.render()), /data inicial deve ser anterior/);
});
