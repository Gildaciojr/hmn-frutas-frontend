// Run against a local production build and a headless Chromium CDP endpoint.
// Every request outside the local frontend is intercepted; no production API access.
import assert from "node:assert/strict";

const origin = process.env.REPORT_TEST_ORIGIN ?? "http://localhost:3102";
const debuggerOrigin = process.env.REPORT_TEST_CDP ?? "http://127.0.0.1:9227";
const target = await (await fetch(`${debuggerOrigin}/json/new?about:blank`, { method: "PUT" })).json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let sequence = 0;
const pending = new Map();
let failPurchases = false;
const requests = [];
const runtimeErrors = [];
function send(method, params = {}) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
const row = (index, status = "FECHADA") => ({
  id: `purchase-${index}`, numeroFolha: String(index), dataCompra: "2026-10-01T00:00:00.000Z",
  fornecedor: { nome: "Fornecedor teste" }, fazendaFornecedor: { nome: "Fazenda teste" },
  placa: "ABC1D23", kgLiquido: 10, quantidadeFrutas: 2, precoKg: "2", valorTotal: "15", status,
});
function response(url) {
  const route = url.pathname.replace(/^\/api/, "");
  if (route === "/dashboard/compras") return {
    comprasHoje: 0, kgMovimentado: 0, mediaCompra: 0, fornecedoresAtivos: 0,
    totalFornecedores: 0, totalFazendas: 0, totalFrutas: 0, mediaFrutaGeral: 0,
    totalDespesasOperacionais: 0, quantidadeDespesasOperacionais: 0,
    totalOperacoes: 0, ultimasCompras: [],
  };
  if (route === "/financeiro/resumo") return { totalEntradas: 0, totalSaidas: 0, saldo: 0 };
  if (route === "/compras/search") {
    const page = Number(url.searchParams.get("page") ?? 1);
    const status = url.searchParams.get("status") ?? "FECHADA";
    const total = 51;
    return {
      items: Array.from({ length: Math.min(25, total - (page - 1) * 25) }, (_, i) => row(i + (page - 1) * 25, status)),
      summary: { operacoes: total, kgLiquido: 510, valorLiquido: 765, precoComercialMedioKg: 2, ticketMedioLiquido: 15 },
      pagination: { total, page, pageSize: 25, totalPages: 3 },
    };
  }
  if (route === "/financeiro/producao") {
    const tipo = url.searchParams.get("tipo") ?? "AMBOS";
    const vendas = tipo === "COMPRAS" ? [] : Array.from({ length: 205 }, (_, i) => ({
      id: `sale-${i}`, dataVenda: "2026-10-01T00:00:00.000Z", numeroPedido: String(i),
      usuarioResponsavelNome: "Ana", cliente: { nome: "Cliente teste" }, pesoLiquido: 1.25,
      valorTotal: "10", modeloCaminhao: "TRUCK",
    }));
    const compras = tipo === "VENDAS" ? [] : [row(1)];
    return {
      filtros: { dataInicial: url.searchParams.get("dataInicial"), dataFinal: url.searchParams.get("dataFinal"), tipo },
      compras, vendas, usuariosDisponiveis: [{ id: "123e4567-e89b-42d3-a456-426614174000", nome: "Ana" }],
      producaoPorUsuario: [], usuarioSelecionado: "Todos",
      totais: { compras: compras.length, vendas: vendas.length, kgComprado: compras.length * 10,
        kgVendido: vendas.length * 1.25, valorComprado: compras.length * 15, valorVendido: vendas.length * 10 },
    };
  }
  if (route === "/estoque/resumo") return { timeline: [] };
  return [];
}
socket.addEventListener("message", async (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task?.reject(new Error(JSON.stringify(message.error)));
    else task?.resolve(message.result);
    return;
  }
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails);
  if (message.method !== "Fetch.requestPaused") return;
  const { requestId, request } = message.params;
  const url = new URL(request.url);
  if (url.origin === origin || !/^https?:$/.test(url.protocol)) {
    await send("Fetch.continueRequest", { requestId });
    return;
  }
  requests.push(url.pathname + url.search);
  const failed = (failPurchases && url.pathname.endsWith("/compras/search")) || url.pathname.endsWith("/producao/pdf");
  const data = request.method === "OPTIONS" ? "" : JSON.stringify(failed ? { message: "Simulated offline API" } : { success: true, data: response(url) });
  await send("Fetch.fulfillRequest", {
    requestId, responseCode: failed ? 500 : 200,
    responseHeaders: [
      { name: "Content-Type", value: "application/json" },
      { name: "Access-Control-Allow-Origin", value: origin },
      { name: "Access-Control-Allow-Headers", value: "authorization,content-type" },
      { name: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
    ], body: Buffer.from(data).toString("base64"),
  });
});
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function waitFor(expression, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate("Boolean(" + expression + ")")) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out: " + expression + " BODY " + await evaluate("document.body.innerText") + " REQUESTS " + JSON.stringify(requests));
}
const click = async (label) => { await new Promise(resolve => setTimeout(resolve, 500)); return evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(b => b.textContent.trim().endsWith(${JSON.stringify(label)})); if (!button) throw Error('missing button'); button.click(); })()`); };
try {
  await send("Page.enable"); await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  await send("Network.setCookie", { name: "token", value: "local-test", url: origin, path: "/" });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `sessionStorage.setItem('auth_token','local-test'); localStorage.setItem('app_mode','COMPRAS');` });
  for (const width of [360, 375, 390, 393, 412, 430, 768, 1024, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    await send("Page.navigate", { url: origin + "/select-mode" });
    await waitFor("[...document.querySelectorAll('.cursor-pointer')].some(b => b.textContent.includes('Compras'))");
    await evaluate("[...document.querySelectorAll('.cursor-pointer')].find(b => b.textContent.includes('Compras')).click()");
    await waitFor(`document.querySelector('[aria-label="Períodos rápidos"]')`);
    await click("Hoje");
    await click("Gerar relatório");
    await waitFor(`document.body.innerText.includes('Página 1 de 3')`);
    const bounds = await evaluate(`(() => { const root = document.querySelector('[aria-label="Períodos rápidos"]'); return { width: innerWidth, left: root.getBoundingClientRect().left, right: root.getBoundingClientRect().right, children: [...root.children].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})) }; })()`);
    assert.ok(bounds.left >= 0 && bounds.right <= bounds.width + 1, "preset container overflow " + width);
    assert.ok(bounds.children.every((r) => r.left >= bounds.left - 1 && r.right <= bounds.right + 1), "preset chips overflow " + width);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), true, "dashboard page overflow " + width);
    assert.ok(await evaluate(`document.body.innerText.includes('01/10/2026')`));
    await click("Próxima");
    await waitFor(`document.body.innerText.includes('Página 2 de 3')`);
    await send("Page.navigate", { url: origin + "/financeiro" });
    await waitFor(`document.body.innerText.includes('Vendas registradas') || [...document.querySelectorAll('button')].some(b=>b.textContent.trim().endsWith('Produção'))`);
    await click("Produção");
    await waitFor(`document.body.innerText.includes('206 registros encontrados')`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), true, "production page overflow " + width);
    console.log("Browser: compras/paginação/presets/produção completos sem overflow global em " + width + "px");
  }
  await click("Exportar PDF");
  await waitFor(`document.querySelector('[role="alert"]')?.textContent.includes('Não foi possível buscar o PDF')`);
  assert.ok(requests.some((url) => url.includes("/financeiro/producao/pdf?")));
  failPurchases = true;
  await send("Page.navigate", { url: origin + "/select-mode" });
    await waitFor("[...document.querySelectorAll('.cursor-pointer')].some(b => b.textContent.includes('Compras'))");
    await evaluate("[...document.querySelectorAll('.cursor-pointer')].find(b => b.textContent.includes('Compras')).click()");
  await waitFor(`document.querySelector('[aria-label="Períodos rápidos"]')`);
  await click("Gerar relatório");
  await waitFor(`document.body.innerText.includes('Tentar novamente')`);
  failPurchases = false;
  await click("Tentar novamente");
  await waitFor(`document.body.innerText.includes('Página 1 de 3')`);
  assert.equal(runtimeErrors.length, 0, JSON.stringify(runtimeErrors));
  console.log("Browser: erro de PDF visível e erro de compras recuperável; zero exceções de runtime; APIs simuladas.");
} finally {
  await send("Page.close").catch(() => {});
  socket.close();
}
