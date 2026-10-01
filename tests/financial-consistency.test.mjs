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

let download;
let mutationOptions;
let mutationResult;
let supplierResult;
const invalidations = [];
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
      useState: (initial) => harness.state(initial), useMemo: (fn) => fn(), useEffect: () => {},
    };
    if (id.endsWith("useFinanceiroModalStore")) return { useFinanceiroModalStore: () => ({ openModal: () => {} }) };
    if (id.endsWith("useClientes")) return { useClientes: () => ({ clientes: [], loading: false }) };
    if (id.endsWith("/KpiCard")) return { KpiCard: function KpiCard() {} };
    if (id.endsWith("useFornecedorFinanceiro")) return { useFornecedorFinanceiroCompleto: () => supplierResult };
    if (id === "react-dom") return { createPortal: tree => tree };
    if (id === "@tanstack/react-query") return { useMutation: options => { mutationOptions = options; return mutationResult; }, useQueryClient: () => ({ invalidateQueries: async options => { invalidations.push(options.queryKey); } }), useQuery: () => {
      return queryResult;
    } };
    if (id === "framer-motion") return { motion: { div: "div", button: "button" } };
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


globalThis.window = {}; globalThis.document = { body: { style: {} } };
test("financial summary separates nominal, realized and open indicators", () => {
  queryResult = { data: { totalEntradas: 200, totalSaidas: 150, totalRecebido: 70, totalPago: 45, totalAReceber: 130, totalAPagar: 105, resultadoCaixa: 25 }, isLoading: false, error: null };
  const { FinanceiroResumo } = load("src/modules/vendas/components/FinanceiroResumo.tsx");
  const view = mount(FinanceiroResumo); const output = text(view.render());
  for(const label of ["Recebido realizado", "Pago realizado", "A receber", "A pagar", "Resultado de caixa realizado", "nominal"]) assert.ok(output.includes(label));
  for(const value of ["70,00", "45,00", "130,00", "105,00", "25,00"]) assert.ok(output.includes(value));
  assert.doesNotMatch(output, /Saldo atual|Lucro|Margem/);
  let retries=0; queryResult={...queryResult,error:new Error("offline"),refetch:()=>retries++};
  const error=view.render(); assert.match(text(error),/Não foi possível carregar/);button(error,"Tentar novamente").props.onClick();assert.equal(retries,1);
});
test("admin indicators use operational amounts and receivables, no profit formula", () => {
  queryResult = { data: { totalComprado: 150, totalVendido: 200, totalAReceber: 130, totalEntradas: 900, totalSaidas: 800 }, isLoading: false };
  const { AdminKpiGrid } = load("src/modules/vendas/components/AdminKpiGrid.tsx");
  const cards = nodes(mount(AdminKpiGrid).render()).filter(node=>node.props?.label);
  assert.deepEqual(cards.map(node=>node.props.label),["Total Comprado","Total Vendido","A receber","Clientes"]);
  assert.match(cards[0].props.value,/150,00/); assert.match(cards[1].props.value,/200,00/);assert.match(cards[2].props.value,/130,00/);
});
test("client payment preserves a real timestamp, notes and invalidates synchronized views", async () => {
  let submitted;mutationResult={isPending:false,isError:false,mutate:payload=>{submitted=payload;}};
  const { ClienteFinanceiroModal } = load("src/modules/clientes/components/ClienteFinanceiroModal.tsx");
  const props={open:true,onClose:()=>{},clienteId:"client",transacao:{id:"title",tipo:"ENTRADA",valorRestante:100,statusFinanceiro:"PENDENTE"}};
  const view=mount(ClienteFinanceiroModal,props);let tree=view.render();
  nodes(tree).find(node=>node.type==="input"&&node.props.placeholder==="0,00").props.onChange({target:{value:"4000"}});
  const input=nodes(tree).find(node=>node.type==="input"&&node.props.type==="datetime-local"); assert.equal(input.props.step,"1");
  input.props.onChange({target:{value:"2026-10-02T12:34:56"}});
  nodes(tree).find(node=>node.type==="textarea").props.onChange({target:{value:"parcial"}});
  button(view.render(),"Registrar pagamento").props.onClick();
  assert.equal(submitted.payload.valor,40);assert.equal(submitted.payload.formaPagamento,"PIX");assert.equal(submitted.payload.observacoes,"parcial");
  assert.equal(submitted.payload.pagoEm,new Date("2026-10-02T12:34:56").toISOString());
  await mutationOptions.onSuccess();assert.ok(invalidations.some(key=>key[0]==="vendas"));assert.ok(invalidations.some(key=>key[0]==="financeiro-fluxo"));
  mutationResult={...mutationResult,isPending:true};assert.equal(button(view.render(),"Registrando").props.disabled,true);
  mutationResult={...mutationResult,isPending:false,isError:true,error:{response:{data:{message:"Título cancelado não recebe pagamentos"}}}};
  assert.match(text(view.render()),/Título cancelado/);
  props.transacao={...props.transacao,statusFinanceiro:"CANCELADO",valorRestante:0};assert.equal(button(view.render(),"Registrar pagamento").props.disabled,true);
});
test("supplier finance uses paid/open/due fields and shows mutation errors", async () => {
  let calls=0;supplierResult={financeiro:{resumo:{totalComprado:150,totalPago:45,totalAPagar:105,totalVencido:20,percentualLimite:10},transacoes:[]},financeiroLoading:false,pagamentos:{pagamentos:[]},pagamentosLoading:false,registrandoPagamento:false,registrarPagamentoFornecedor:async()=>{calls++;throw Error("offline");},registrarPagamentoError:{response:{data:{message:"Pagamento excede o total em aberto"}}}};
  const { FornecedorFinanceiroModal }=load("src/modules/fornecedores/components/FornecedorFinanceiroModal.tsx");
  const view=mount(FornecedorFinanceiroModal,{open:true,onClose:()=>{},fornecedorId:"supplier",fornecedorNome:"Fornecedor"});let tree=view.render();
  const open=nodes(tree).find(node=>node.props?.title==="A pagar");assert.ok(open);assert.match(open.props.value,/105,00/);
  assert.match(text(tree),/Vencido:.*20,00/);assert.match(text(tree),/Pagamento excede/);
  nodes(tree).find(node=>node.type==="input").props.onChange({target:{value:"10"}});
  await button(view.render(),"Registrar Pagamento").props.onClick();assert.equal(calls,1);
});
test("payment time/error helpers preserve instants and typed backend feedback", () => {
  const {localPaymentDateTime,paymentErrorMessage}=load("src/shared/utils/payment-time.ts");
  const local=new Date(2026,9,2,12,34,56);assert.equal(localPaymentDateTime(local),"2026-10-02T12:34:56");
  assert.equal(paymentErrorMessage({response:{data:{message:["Conflito","Tente novamente"]}}}),"Conflito Tente novamente");
  assert.equal(paymentErrorMessage(null),"Não foi possível registrar o pagamento.");
});
