import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import ts from "typescript";
import * as React from "react";

let harness;
let queryResult;
let queryOptions;
let detailResult;
let documentAction;
const searchCalls = [];
const documentCalls = [];
const cache = new Map();
const stubs = Object.fromEntries(["NovaVendaCard", "ClientesTable", "EstoqueCard", "NovoClienteQuickCard", "VendasFiltersCard", "VendasResumoCard", "VendasRelatorioTable"].map(name => [name, function Component() {}]));
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename);
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = id => {
    if (id === "react") return { ...React, useState: initial => harness.state(initial), useRef: initial => harness.state({ current: initial })[0], useEffect: () => {}, useCallback: callback => callback };
    if (id === "react-dom") return { createPortal: node => node };
    if (id === "framer-motion") return { motion: { div: "div" }, AnimatePresence: "div" };
    if (id === "next/link") return { __esModule: true, default: "a" };
    if (id === "next/image") return { __esModule: true, default: "img" };
    if (id === "@tanstack/react-query") return { useQuery: options => { queryOptions = options; return queryResult; } };
    if (id.endsWith("useCompras")) return { useCompra: () => detailResult };
    if (id.endsWith("useClientes")) return { useClientes: () => ({ clientes: [] }) };
    if (id.endsWith("useVendasRelatorio")) return { useVendasRelatorio: () => ({ vendas: [], loading: false, summary: {}, refetch: () => {}, pagination: {} }) };
    if (id.endsWith("compras-relatorios.service")) return { searchCompras: async params => { searchCalls.push(params); return { items: [] }; } };
    if (id.endsWith("useDocumentActions")) return { useDocumentActions: () => ({ view: options => documentAction("view", options), download: options => documentAction("download", options) }) };
    for (const name of Object.keys(stubs)) if (id.endsWith("/" + name)) return { [name]: stubs[name] };
    if (id.startsWith("@/") || id.startsWith(".")) {
      const target = id.startsWith("@/") ? path.resolve("src", id.slice(2)) : path.resolve(path.dirname(filename), id);
      for (const ext of [".ts", ".tsx"]) if (fs.existsSync(target + ext)) return load(target + ext);
    }
    if (id === "@/core/http/api") return { api: {} };
    return original(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
  cache.set(filename, mod.exports);
  return mod.exports;
}
function mount(component, props = {}) {
  const values = [];
  let cursor;
  const instance = { state(initial) { const i = cursor++; if (!(i in values)) values[i] = typeof initial === "function" ? initial() : initial; return [values[i], value => values[i] = typeof value === "function" ? value(values[i]) : value]; } };
  return () => { cursor = 0; harness = instance; return component(props); };
}
function nodes(value) { if (Array.isArray(value)) return value.flatMap(nodes); if (!value || typeof value !== "object") return []; return [value, ...nodes(value.props?.children)]; }
function text(value) { if (Array.isArray(value)) return value.map(text).join(" "); if (!value || typeof value === "boolean") return ""; return typeof value === "object" ? text(value.props?.children) : String(value); }
function button(tree, label) { const found = nodes(tree).find(node => node.type === "button" && text(node).trim() === label); assert.ok(found, label); return found; }
const { UltimasComprasCard } = load("src/modules/vendas/components/UltimasComprasCard.tsx");
const { CompraViewModal } = load("src/modules/compras/components/CompraViewModal.tsx");
const { VendasAdminDashboard } = load("src/modules/vendas/components/VendasAdminDashboard.tsx");
const purchases = Array.from({ length: 10 }, (_, i) => ({ id: "c" + i, fornecedor: i ? { nome: "Fornecedor", sobrenome: "Real" } : null, clienteNomeSnapshot: "Legado", placa: "abc-1234", kgLiquido: 12345.67, kgBruto: 99999, dataCompra: "2026-10-01T00:00:00Z", status: "FECHADA", modeloCaminhao: "TRUCK", quantidadeFrutas: 5, tipoDesconto: "MANUAL_KG" }));
test("queries exactly ten purchases, shows canonical weight/civil date and opens read-only details", async () => {
  queryResult = { data: { items: purchases }, isPending: false, isError: false, refetch() {} };
  const render = mount(UltimasComprasCard);
  let tree = render();
  await queryOptions.queryFn();
  assert.deepEqual(searchCalls.at(-1), { page: 1, pageSize: 10, status: "FECHADA" });
  assert.equal(nodes(tree).filter(node => node.type === "li").length, 10);
  assert.match(text(tree), /Legado/);
  assert.match(text(tree), /Fornecedor Real/);
  assert.match(text(tree), /12\.345,67\s+kg líquidos/);
  assert.match(text(tree), /01\/10\/2026/);
  assert.match(text(tree), /ABC1234/);
  assert.doesNotMatch(text(tree), /99\.999|undefined/);
  nodes(tree).find(node => node.props["aria-haspopup"] === "dialog").props.onClick();
  tree = render();
  const modal = nodes(tree).find(node => node.type === CompraViewModal);
  assert.equal(modal.props.compraId, "c0");
  assert.equal(modal.props.showDocumentActions, true);
  modal.props.onClose();
  assert.equal(nodes(render()).some(node => node.type === CompraViewModal), false);
});
test("loading, recoverable error, empty and canceled purchase exclusion", () => {
  const render = mount(UltimasComprasCard);
  queryResult = { isPending: true };
  assert.ok(nodes(render()).some(node => node.props["aria-label"] === "Carregando últimas compras"));
  let retried = 0;
  queryResult = { isPending: false, isError: true, refetch: () => retried++ };
  button(render(), "Tentar novamente").props.onClick();
  assert.equal(retried, 1);
  queryResult = { data: { items: [] } };
  assert.match(text(render()), /Nenhuma compra/);
  queryResult = { data: { items: [{ ...purchases[0], status: "CANCELADA" }] } };
  assert.equal(nodes(render()).filter(node => node.type === "li").length, 0);
});
test("modal document actions are opt-in and call existing authenticated helpers; errors recover", async () => {
  detailResult = { data: purchases[0], isLoading: false };
  assert.doesNotMatch(text(mount(CompraViewModal, { compraId: "c0", open: true, onClose() {} })()), /Visualizar PDF|Baixar PDF/);
  const render = mount(CompraViewModal, { compraId: "c0", open: true, onClose() {}, showDocumentActions: true });
  documentAction = async (action, options) => documentCalls.push([action, options]);
  button(render(), "Visualizar PDF").props.onClick();
  await new Promise(setImmediate);
  button(render(), "Baixar PDF").props.onClick();
  await new Promise(setImmediate);
  assert.deepEqual(documentCalls.map(call => call[0]), ["view", "download"]);
  for (const [, options] of documentCalls) assert.deepEqual(options, { url: "/romaneios/compra/c0/pdf", filename: "compra-c0.pdf", newTab: true });
  documentAction = async () => { throw new Error("offline"); };
  button(render(), "Baixar PDF").props.onClick();
  await new Promise(setImmediate);
  assert.match(text(render()), /Não foi possível obter o PDF/);
  assert.equal(button(render(), "Baixar PDF").props.disabled, false);
});
test("report starts collapsed, preserves mounted filters across toggles and links to central", () => {
  const render = mount(VendasAdminDashboard);
  const filters = nodes(render()).find(node => node.type === stubs.VendasFiltersCard);
  assert.equal(nodes(render()).find(node => node.props.id === "vendas-dashboard-relatorio").props.hidden, true);
  assert.equal(button(render(), "Ver relatório").props["aria-expanded"], false);
  button(render(), "Ver relatório").props.onClick();
  filters.props.onSearch({ clienteId: "selected" });
  assert.equal(nodes(render()).find(node => node.props.id === "vendas-dashboard-relatorio").props.hidden, false);
  button(render(), "Recolher relatório").props.onClick();
  button(render(), "Ver relatório").props.onClick();
  assert.ok(nodes(render()).some(node => node.type === stubs.VendasRelatorioTable));
  assert.ok(nodes(render()).some(node => node.type === stubs.NovaVendaCard));
  assert.ok(nodes(render()).some(node => node.type === "a" && node.props.href === "/relatorios"));
});
