import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as React from "react";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loaded = new Map();
let harness;
let supplierResult;
let reportResult;
let download;
let view;
let apiResponse;
const apiCalls = [];
const queries = [];
function load(relative) {
  const filename = path.resolve(root, relative);
  if (loaded.has(filename)) return loaded.get(filename);
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => {
    if (id === "react") return { ...React, useState: initial => harness.state(initial), useMemo: fn => fn(), useEffect: () => {} };
    if (id === "react-dom") return { createPortal: tree => tree };
    if (id === "framer-motion") return { motion: { div: "div", button: "button" }, AnimatePresence: "section" };
    if (id === "@tanstack/react-query") return { useQuery: options => { queries.push(options); return options.queryKey[0] === "cliente-relatorio" ? reportResult : { data: undefined, isLoading: false }; } };
    if (id.endsWith("useFornecedores")) return { useFornecedorHistorico: () => supplierResult };
    if (/ClienteForm|ClienteFinanceiroModal|CompraEditModal/.test(id)) return Object.fromEntries(["ClienteForm", "ClienteFinanceiroModal", "CompraEditModal"].map(name => [name, name]));
    if (id === "@/shared/hooks/useDocumentActions") return { useDocumentActions: () => ({ download, view, share: () => Promise.resolve() }) };
    if (id === "@/core/http/api") return { api: { get: (...args) => { apiCalls.push(args); return Promise.resolve({ data: apiResponse }); } } };
    if (id.startsWith("@/")) return load("src/" + id.slice(2) + ".ts");
    if (id.startsWith(".")) {
      const target = path.resolve(path.dirname(filename), id);
      for (const ext of [".ts", ".tsx"]) if (fs.existsSync(target + ext)) return load(target + ext);
    }
    return originalRequire(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  loaded.set(filename, mod.exports);
  return mod.exports;
}
function mount(component, props) {
  const values = [];
  let cursor = 0;
  const instance = {
    state(initial) {
      const slot = cursor++;
      if (!(slot in values)) values[slot] = typeof initial === "function" ? initial() : initial;
      return [values[slot], value => { values[slot] = typeof value === "function" ? value(values[slot]) : value; }];
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
  return typeof value === "object" ? text(value.props?.children) : String(value);
}
function button(tree, label) {
  const found = nodes(tree).find(node => node.type === "button" && text(node).includes(label));
  assert.ok(found, label);
  return found;
}
const report = {
  cliente: { id: "c1", nome: "Cliente" },
  resumo: { quantidadeVendas: 2, kgLiquidoVendido: 123, totalVendido: 200, totalRecebido: 70, totalAReceber: 130, totalVencido: 30, ultimaVenda: "2026-10-01T00:00:00.000Z", ultimoPagamento: "2026-10-02T01:00:00.000Z" },
  operacoes: [{ id: "v1", dataVenda: "2026-10-01", numeroPedido: "PEDIDO-OFICIAL", numeroRomaneio: null, placa: null, pesoLiquido: 123, valorTotal: 200, status: "FINALIZADA", statusPagamento: "PARCIAL" }],
  financeiro: { titulos: [{ id: "t1", descricao: "TÍTULO-MANUAL", valor: 90, valorPago: 20, valorRestante: 70, statusFinanceiro: "PARCIAL", vencimento: "2026-10-03", pagamentos: [{ id: "p1", pagoEm: "2026-10-02T01:00:00.000Z", formaPagamento: "PIX", valor: 20, observacoes: "RECIBO-OFICIAL" }] }] },
};
globalThis.window = {};
globalThis.document = { body: { style: {} } };
test("client renders canonical metrics, separate operations/titles and bounded mobile cards", () => {
  const { ClienteRelatorioCard } = load("src/modules/clientes/components/ClienteRelatorioCard.tsx");
  const props = { data: report, loading: false, onRetry() {}, onPdf() {}, pdfLoading: false, pdfError: null };
  const output = ClienteRelatorioCard(props);
  for (const expected of ["200,00", "70,00", "130,00", "30,00", "123 kg", "01/10/2026", "22:00", "PEDIDO-OFICIAL", "TÍTULO-MANUAL", "RECIBO-OFICIAL"]) assert.ok(text(output).includes(expected), expected);
  assert.equal(nodes(output).filter(node => node.type === "article").length, 2);
  assert.ok(nodes(output).some(node => node.props?.className?.includes("grid-cols-1 sm:grid-cols-2")));
  for (const node of nodes(output).filter(node => node.type === "article")) assert.match(node.props.className, /min-w-0.*break-words/);
  assert.match(text(ClienteRelatorioCard({ ...props, loading: true })), /Carregando/);
  let retries = 0;
  button(ClienteRelatorioCard({ ...props, error: "offline", onRetry: () => retries++ }), "Tentar novamente").props.onClick();
  assert.equal(retries, 1);
  assert.match(text(ClienteRelatorioCard({ ...props, data: { ...report, operacoes: [], financeiro: { titulos: [] } } })), /Nenhuma venda.*Nenhum título/);
  const pending = ClienteRelatorioCard({ ...props, pdfLoading: true, pdfError: "Falha PDF" });
  assert.equal(button(pending, "Gerando PDF").props.disabled, true);
  assert.match(text(pending), /Falha PDF/);
});
test("client modal requests fresh authenticated report and correct PDF with error feedback", async () => {
  reportResult = { data: report, isFetching: false, error: null, refetch() {} };
  const downloads = [];
  download = options => { downloads.push(options); return Promise.resolve(); };
  const { ClienteModal } = load("src/modules/clientes/components/ClienteModal.tsx");
  const { ClienteRelatorioCard } = load("src/modules/clientes/components/ClienteRelatorioCard.tsx");
  const instance = mount(ClienteModal, { open: true, onClose() {}, cliente: report.cliente });
  button(instance.render(), "Relatório / Extrato").props.onClick();
  const card = () => nodes(instance.render()).find(node => node.type === ClienteRelatorioCard);
  assert.ok(card());
  const query = queries.at(-2);
  assert.equal(query.enabled, true);
  assert.equal(query.staleTime, 0);
  card().props.onPdf();
  assert.equal(card().props.pdfLoading, true);
  await new Promise(setImmediate);
  assert.deepEqual(downloads[0], { url: "/clientes/c1/relatorio-pdf", filename: "extrato-cliente-c1.pdf" });
  assert.equal(card().props.pdfLoading, false);
  download = () => Promise.reject(new Error("offline"));
  card().props.onPdf();
  await new Promise(setImmediate);
  assert.match(card().props.pdfError, /Não foi possível gerar/);
  apiResponse = { success: true, data: report };
  const { getClienteRelatorio } = load("src/modules/clientes/services/clientes.service.ts");
  assert.equal(await getClienteRelatorio("c1"), report);
  assert.equal(apiCalls.at(-1)[0], "/clientes/c1/relatorio");
});
test("supplier uses canonical summary/manual titles and existing authenticated PDF blob flow", async () => {
  supplierResult = { data: { resumo: { totalComprado: 150, totalPago: 45, totalAPagar: 105, saldoAtual: 999, totalVencido: 15, quantidadeCompras: 2, kgComprado: 150, ultimaCompra: { dataCompra: "2026-10-01" }, ultimoPagamento: { pagoEm: "2026-10-02T01:00:00.000Z" } }, historicoOperacional: [], financeiro: { titulos: [{ ...report.financeiro.titulos[0], descricao: "MANUAL-SAIDA" }] } }, isLoading: false, error: null };
  const { FornecedorHistorico } = load("src/modules/fornecedores/components/FornecedorHistorico.tsx");
  const instance = mount(FornecedorHistorico, { fornecedorId: "f1" });
  let tree = instance.render();
  for (const [label, value] of [["Total Comprado", "150,00"], ["Total Pago", "45,00"], ["A pagar", "105,00"]]) {
    const card = nodes(tree).find(node => node.props?.title === label);
    assert.ok(card?.props.value.includes(value), label);
  }
  for (const expected of ["15,00", "150 kg", "01/10/2026", "22:00", "MANUAL-SAIDA"]) assert.ok(text(tree).replace(/\s+/g, " ").includes(expected), expected);
  assert.ok(nodes(tree).some(node => node.props?.text === "Nenhuma operação encontrada."));
  const views = [];
  apiResponse = new Blob(["%PDF-1.4"]);
  view = options => { views.push(options); return Promise.resolve(); };
  tree = instance.render();
  const pending = button(tree, "Gerar PDF").props.onClick();
  assert.equal(button(instance.render(), "Gerando PDF").props.disabled, true);
  await pending;
  assert.deepEqual(apiCalls.at(-1), ["/fornecedores/f1/relatorio-pdf", { responseType: "blob" }]);
  assert.equal(views[0].blob, apiResponse);
  assert.equal(views[0].newTab, true);
  assert.equal(button(instance.render(), "Gerar PDF").props.disabled, false);
  const originalError = console.error;
  view = () => Promise.reject(new Error("offline"));
  console.error = () => {};
  try {
    await button(instance.render(), "Gerar PDF").props.onClick();
    assert.match(text(instance.render()), /Não foi possível gerar o PDF/);
    assert.equal(button(instance.render(), "Gerar PDF").props.disabled, false);
  } finally {
    console.error = originalError;
  }
  supplierResult = { ...supplierResult, isLoading: true };
  assert.match(text(instance.render()), /Carregando/);
  supplierResult = { ...supplierResult, isLoading: false, error: new Error("offline") };
  assert.match(text(instance.render()), /Erro ao carregar/);
});
