import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import * as React from "react";
import * as XLSX from "xlsx";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const loaded = new Map();
const apiCalls = [];
let apiGet;
let harness;
let saved;
let download;
const queryOptions = [];
let queryResult;
const components = Object.fromEntries(
  [
    "AppLayout",
    "ComprasReport",
    "VendasReport",
    "PartyReports",
    "RelatorioProducao",
    "ClienteRelatorioCard",
    "FornecedorHistorico",
  ].map((name) => [name, function Component() {}]),
);
function load(relative) {
  const filename = path.resolve(root, relative);
  if (loaded.has(filename)) return loaded.get(filename);
  const mod = new Module(filename);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const originalRequire = mod.require.bind(mod);
  mod.require = (id) => {
    if (id === "./reports.css") return {};
    if (id === "react")
      return {
        ...React,
        useState: (initial) => harness.state(initial),
        useRef: (initial) => harness.state({ current: initial })[0],
      };
    if (id === "next/link") return { __esModule: true, default: "a" };
    if (id === "@tanstack/react-query")
      return {
        useQuery: (options) => {
          queryOptions.push(options);
          return queryResult;
        },
      };
    if (id === "@/shared/hooks/useDocumentActions")
      return { useDocumentActions: () => ({ download }) };
    if (/ClienteRelatorioCard|FornecedorHistorico/.test(id)) return components;
    if (/AppLayout|AnalyticalReports|PartyReports|RelatorioProducao/.test(id))
      return components;
    if (id === "@/core/http/api")
      return {
        api: {
          get: (url, options) => {
            apiCalls.push([url, options?.params]);
            return apiGet(url, options?.params);
          },
        },
      };
    if (id === "./report-export")
      return {
        ...load("src/shared/report-export/report-export.ts"),
        saveReport: async (report, format) => {
          saved = { report, format };
        },
      };
    if (id.startsWith("@/")) return load("src/" + id.slice(2) + ".ts");
    return originalRequire(id);
  };
  mod._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );
  loaded.set(filename, mod.exports);
  return mod.exports;
}
function mount(component, props = {}) {
  const values = [];
  let cursor = 0;
  const instance = {
    state(initial) {
      const slot = cursor++;
      if (!(slot in values)) values[slot] = initial;
      return [
        values[slot],
        (value) => {
          values[slot] = value;
        },
      ];
    },
    render() {
      cursor = 0;
      harness = instance;
      return component(props);
    },
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
  return typeof value === "object"
    ? text(value.props?.children)
    : String(value);
}
function button(tree, label) {
  const found = nodes(tree).find(
    (node) => node.type === "button" && text(node) === label,
  );
  assert.ok(found, label);
  return found;
}
const exports = load("src/shared/report-export/report-export.ts");
const analytical = load("src/modules/relatorios/analytical-export.ts");
const sale = (index) => ({
  id: "v" + index,
  dataVenda: "2026-10-01T00:00:00Z",
  cliente: {
    nome: index === 0 ? 'Cliente; "Sul"\nEspecial' : "Cliente " + index,
  },
  clienteNomeSnapshot: "Legado",
  numeroPedido: String(index).padStart(3, "0"),
  numeroRomaneio: "ROM" + index,
  placa: "ABC1D23",
  pesoLiquido: 123.456,
  valorPorKg: "2.50",
  valorTotal: "308.64",
  status: "FATURADA",
  statusPagamento: "PARCIAL",
});
const purchase = (index) => ({
  id: "c" + index,
  dataCompra: "2026-10-01",
  fornecedor: { nome: "Fornecedor " + index, sobrenome: "Sul" },
  fazendaFornecedor: { nome: "Fazenda" },
  numeroFolha: "F" + index,
  placa: "DEF4G56",
  modeloCaminhao: "TRUCK",
  kgLiquido: 250,
  precoKg: "1.25",
  valorTotal: "312.50",
  status: "FECHADA",
});
const salesSummary = {
  operacoes: 205,
  kgLiquidoVendido: 777,
  valorLiquidoVendido: 888,
  precoComercialMedioKg: 1.142,
  ticketMedioLiquido: 4.332,
};
const purchasesSummary = {
  operacoes: 205,
  kgLiquido: 555,
  valorLiquido: 666,
  precoComercialMedioKg: 1.2,
  ticketMedioLiquido: 3.248,
};
let report;
test("exports retain applied filters, begin at page one and fetch the full dataset sequentially", async () => {
  let active = 0;
  let maxActive = 0;
  apiCalls.length = 0;
  apiGet = async (url, params) => {
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise(setImmediate);
    active--;
    const items = Array.from({ length: 205 }, (_, index) =>
      url === "/vendas/search" ? sale(index) : purchase(index),
    );
    return {
      data: {
        data: {
          items: items.slice((params.page - 1) * 100, params.page * 100),
          summary: url === "/vendas/search" ? salesSummary : purchasesSummary,
          pagination: {
            total: 205,
            page: params.page,
            pageSize: 100,
            totalPages: 3,
          },
        },
      },
    };
  };
  const filters = {
    clienteId: "client-1",
    dataInicio: "2026-10-01",
    dataFim: "2026-10-31",
    statusPagamento: "PARCIAL",
    page: 7,
    pageSize: 25,
  };
  report = await analytical.getVendasExport(filters, "Cliente escolhido");
  assert.equal(report.rows.length, 205);
  assert.deepEqual(
    apiCalls.map((call) => call[1].page),
    [1, 2, 3],
  );
  for (const [, params] of apiCalls)
    assert.deepEqual(params, { ...filters, page: params.page, pageSize: 100 });
  assert.equal(maxActive, 1);
  assert.equal(filters.page, 7);
  assert.equal(report.metrics[1].value, 777);
  assert.ok(report.filters.includes("De: 01/10/2026"));
  assert.ok(report.filters.includes("Cliente: Cliente escolhido"));
  apiCalls.length = 0;
  const purchases = await analytical.getComprasExport({
    fornecedorId: "s1",
    fornecedor: "Fornecedor",
    fazendaId: "f1",
    placa: "DEF4G56",
    page: 2,
  });
  assert.equal(purchases.rows.length, 205);
  assert.equal(purchases.metrics[1].value, 555);
  assert.ok(purchases.filters.includes("Fazenda: Fazenda"));
  assert.deepEqual(
    apiCalls.map((call) => call[1].page),
    [1, 2, 3],
  );
  for (const [, params] of apiCalls) {
    assert.equal(params.fornecedorId, "s1");
    assert.equal(params.fazendaId, "f1");
    assert.equal(params.placa, "DEF4G56");
  }
  if (process.env.PATCH4C_PDF_DIR) {
    fs.mkdirSync(process.env.PATCH4C_PDF_DIR, { recursive: true });
    const pdf = await exports.createPdf(purchases);
    fs.writeFileSync(
      path.join(process.env.PATCH4C_PDF_DIR, "compras.pdf"),
      Buffer.from(pdf.output("arraybuffer")),
    );
  }
});
test("CSV has BOM, semicolons, civil dates, escaped quotes/newlines and safe text", () => {
  const csv = exports.createCsv(report);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.match(csv, /Data;Cliente;Pedido \/ Romaneio/);
  assert.match(csv, /01\/10\/2026;"Cliente; ""Sul""\nEspecial"/);
  assert.match(csv, /123,456;2,5;308,64/);
  assert.equal(csv.split("\r\n").length, 206);
  assert.ok(
    exports
      .createCsv({ ...report, rows: [["=HYPERLINK(1)", -5]] })
      .includes("'=HYPERLINK(1);-5"),
  );
});
test("XLSX preserves all rows and numeric values through serialization", async () => {
  const workbook = await exports.createWorkbook(report);
  const read = XLSX.read(
    XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }),
    { type: "buffer" },
  );
  const sheet = read.Sheets.Vendas;
  assert.equal(XLSX.utils.sheet_to_json(sheet, { header: 1 }).length, 206);
  assert.equal(sheet.E2.t, "n");
  assert.equal(sheet.E2.v, 123.456);
  assert.equal(sheet.F2.v, 2.5);
  assert.equal(sheet.A2.v, "01/10/2026");
  assert.ok(
    workbook.Sheets.Vendas["!cols"].every((column) => column.wch <= 36),
  );
});
test("actual analytical PDF contains title, filters, official summary, all rows and page numbers", async () => {
  const pdf = await exports.createPdf(report);
  const content = pdf.output();
  assert.match(content, /HMN Frutas/);
  assert.match(content, /Relatório analítico de vendas/);
  assert.match(content, /01\/10\/2026/);
  assert.match(content, /777/);
  assert.match(content, /ROM204/);
  assert.match(content, /Página 1 de/);
  assert.ok(pdf.getNumberOfPages() > 1);
  assert.equal(
    pdf.internal.pageSize.getWidth() > pdf.internal.pageSize.getHeight(),
    true,
  );
  if (process.env.PATCH4C_PDF_DIR)
    fs.writeFileSync(
      path.join(process.env.PATCH4C_PDF_DIR, "vendas.pdf"),
      Buffer.from(pdf.output("arraybuffer")),
    );
});
test("empty, changing or incomplete datasets fail visibly rather than exporting partial data", async () => {
  await assert.rejects(
    exports.collectReport(async () => ({
      items: [],
      summary: {},
      pagination: { total: 0, page: 1, pageSize: 100, totalPages: 0 },
    })),
    /Nenhum resultado/,
  );
  const first = {
    items: [{ id: "1" }],
    summary: { value: 10 },
    pagination: { total: 2, page: 1, pageSize: 100, totalPages: 2 },
  };
  await assert.rejects(
    exports.collectReport(async (page) =>
      page === 1
        ? first
        : { ...first, pagination: { ...first.pagination, page, total: 3 } },
    ),
    /mudou/,
  );
  await assert.rejects(
    exports.collectReport(async (page) => ({
      ...first,
      pagination: { ...first.pagination, page },
    })),
    /mudou/,
  );
  await assert.rejects(
    exports.collectReport(async () => ({
      ...first,
      pagination: { ...first.pagination, totalPages: 1 },
    })),
    /completo/,
  );
  await assert.rejects(
    exports.createWorkbook({ ...report, rows: [] }),
    /Nenhum resultado/,
  );
  await assert.rejects(
    exports.createPdf({ ...report, rows: [] }),
    /Nenhum resultado/,
  );
  assert.throws(
    () => exports.createCsv({ ...report, rows: [] }),
    /Nenhum resultado/,
  );
});
test("export buttons lock immediately against double clicks and recover after failure", async () => {
  const { ReportExportActions } = load(
    "src/shared/report-export/ReportExportActions.tsx",
  );
  let requests = 0;
  let reject;
  const props = {
    getReport: () => {
      requests++;
      return new Promise((_, fail) => {
        reject = fail;
      });
    },
  };
  const instance = mount(ReportExportActions, props);
  const click = button(instance.render(), "PDF").props.onClick;
  click();
  click();
  assert.equal(requests, 1);
  assert.ok(
    nodes(instance.render())
      .filter((node) => node.type === "button")
      .every((node) => node.props.disabled),
  );
  reject(new Error("Falha recuperável"));
  await new Promise(setImmediate);
  assert.match(text(instance.render()), /Falha recuperável/);
  props.getReport = () => Promise.resolve(report);
  button(instance.render(), "CSV").props.onClick();
  await new Promise(setImmediate);
  assert.equal(saved.format, "csv");
  assert.equal(
    nodes(instance.render()).some((node) => node.props?.role === "alert"),
    false,
  );
});
test("central switches to all five existing report areas and has bounded mobile structure", () => {
  const { default: Page } = load("app/relatorios/page.tsx");
  const instance = mount(Page);
  assert.match(text(instance.render()), /Central de Relatórios/);
  assert.ok(
    nodes(instance.render()).some(
      (node) =>
        node.type === "a" &&
        node.props.href === "/dashboard" &&
        /Voltar ao painel/.test(text(node)),
    ),
  );
  for (const [label, expected] of [
    ["Compras", components.ComprasReport],
    ["Vendas", components.VendasReport],
    ["Financeiro", components.RelatorioProducao],
    ["Clientes", components.PartyReports],
    ["Fornecedores", components.PartyReports],
  ]) {
    const choice = nodes(instance.render()).find(
      (node) => node.type === "button" && text(node).trim().startsWith(label),
    );
    choice.props.onClick();
    assert.equal(
      nodes(instance.render()).find(
          (node) => node.type === "button" && text(node).trim().startsWith(label),
      ).props["aria-pressed"],
      true,
    );
    assert.ok(nodes(instance.render()).some((node) => node.type === expected));
  }
  for (const viewport of [360, 375, 390, 393, 412, 430]) {
    const nav = nodes(instance.render()).find((node) => node.type === "nav");
    assert.match(
      nav.props.className,
      /grid-cols-2 md:grid-cols-3 lg:grid-cols-5/,
    );
    assert.equal(viewport < 640, true);
    for (const node of nodes(nav).filter((node) => node.type === "button"))
      assert.match(node.props.className, /min-w-0 min-h-\[44px\]/);
  }
  for (const file of [
    "app/relatorios/page.tsx",
    "src/modules/relatorios/AnalyticalReports.tsx",
    "src/modules/relatorios/PartyReports.tsx",
    "src/shared/report-export/ReportExportActions.tsx",
  ])
    assert.doesNotMatch(
      fs.readFileSync(path.join(root, file), "utf8"),
      /(?<![\w-])(?:min-w|w)-\[\d{3,}px\]/,
    );
  assert.match(
    fs.readFileSync(path.join(root, "middleware.ts"), "utf8"),
    /\/relatorios\/:path\*/,
  );
  assert.match(
    fs.readFileSync(path.join(root, "src/ui/layout/AppHeader.tsx"), "utf8"),
    /href="\/relatorios"/,
  );
});

test("central selects parties and reuses the authenticated client and supplier report flows", async () => {
  const { PartyReports } = load("src/modules/relatorios/PartyReports.tsx");
  queryResult = {
    data: [{ id: "p1", nome: "Parceiro" }],
    isFetching: false,
    error: null,
  };
  for (const kind of ["clientes", "fornecedores"]) {
    const instance = mount(PartyReports, { kind });
    assert.match(text(instance.render()), /Selecione um cadastro/);
    nodes(instance.render())
      .find((node) => node.type === "select")
      .props.onChange({ target: { value: "p1" } });
    const child = nodes(instance.render()).find(
      (node) =>
        node.type === components.FornecedorHistorico || node.props?.id === "p1",
    );
    assert.ok(child);
    if (kind === "fornecedores") assert.equal(child.props.fornecedorId, "p1");
    else {
      queryResult = {
        data: { resumo: { totalVendido: 123 } },
        isFetching: false,
        error: null,
        refetch() {},
      };
      const client = mount(child.type, child.props);
      const card = client.render();
      assert.equal(card.type, components.ClienteRelatorioCard);
      assert.equal(card.props.data.resumo.totalVendido, 123);
      const calls = [];
      download = (options) => {
        calls.push(options);
        return Promise.resolve();
      };
      const output = client.render();
      output.props.onPdf();
      output.props.onPdf();
      await new Promise(setImmediate);
      assert.deepEqual(calls, [
        {
          url: "/clientes/p1/relatorio-pdf",
          filename: "extrato-cliente-p1.pdf",
        },
      ]);
      const query = queryOptions.findLast(
        (options) => options.queryKey[0] === "cliente-relatorio",
      );
      apiGet = () =>
        Promise.resolve({ data: { data: { cliente: { id: "p1" } } } });
      await query.queryFn();
      assert.equal(apiCalls.at(-1)[0], "/clientes/p1/relatorio");
      queryResult = {
        data: [{ id: "p1", nome: "Parceiro" }],
        isFetching: false,
        error: null,
      };
    }
  }
});
