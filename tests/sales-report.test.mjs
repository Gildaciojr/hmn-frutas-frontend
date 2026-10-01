import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import ts from 'typescript';
import * as React from 'react';
let state;let queryResult;let queryOptions;
const calls=[];const cache=new Map();
const clients=[{id:'client-id',nome:'Cliente teste'}];
const summary={operacoes:50,kgLiquidoVendido:1000,valorLiquidoVendido:3500,precoComercialMedioKg:4.5,ticketMedioLiquido:70};
const item={id:'sale',clienteId:'client-id',cliente:{id:'client-id',nome:'Cliente teste'},clienteNomeSnapshot:'Snapshot',dataVenda:'2026-10-01T00:00:00Z',numeroPedido:'001',numeroRomaneio:'002',placa:'ABC1D23',pesoLiquido:10,valorPorKg:'5',valorMelancia:'50',valorTotal:'40',status:'ENTREGUE',statusPagamento:'PARCIAL'};
const payload={items:[item],summary,pagination:{total:50,page:1,pageSize:25,totalPages:2}};
function load(file) {
  const filename=path.resolve(file);if(cache.has(filename))return cache.get(filename);
  const mod=new Module(filename);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));const original=mod.require.bind(mod);
  mod.require=id=>{
    if(id==='react')return {...React,useState:initial=>state.useState(initial)};
    if(id==='@tanstack/react-query')return {useQuery:options=>{queryOptions=options;return queryResult;}};
    if(id==='@/core/http/api')return {api:{get:async(...args)=>{calls.push(args);return {data:{success:true,data:payload}};}}};
    if(id.endsWith('useClientes'))return {useClientes:()=>({clientes:clients})};
    if(id==='framer-motion')return {motion:{div:'div'}};
    if(id==='next/image')return ()=>null;
    for(const name of ['NovaVendaCard','ClientesTable','EstoqueCard','NovoClienteQuickCard'])if(id.endsWith('/'+name))return {[name]:()=>null};
    if(id.startsWith('@/')||id.startsWith('.')){
      const target=id.startsWith('@/')?path.resolve('src',id.slice(2)):path.resolve(path.dirname(filename),id);
      for(const ext of ['.ts','.tsx'])if(fs.existsSync(target+ext))return load(target+ext);
    }
    return original(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
  cache.set(filename,mod.exports);return mod.exports;
}
function mount(component,props={}){const values=[];let cursor;const instance={useState(initial){const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i],v=>values[i]=typeof v==='function'?v(values[i]):v];}};return ()=>{cursor=0;state=instance;return component(props);};}
function nodes(value){if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return [];return [value,...nodes(value.props?.children)];}
function text(value){if(Array.isArray(value))return value.map(text).join(' ');if(!value||typeof value==='boolean')return '';if(typeof value!=='object')return String(value);return text(value.props?.children);}
function button(tree,label){const found=nodes(tree).find(n=>n.type==='button'&&text(n)===label);assert.ok(found,label);return found;}
function change(render,id,value){const node=nodes(render()).find(n=>n.props.id===id);assert.ok(node,id);node.props.onChange({target:{value}});}
const {VendasFiltersCard}=load('src/modules/vendas-relatorios/components/VendasFiltersCard.tsx');
const {VendasResumoCard}=load('src/modules/vendas-relatorios/components/VendasResumoCard.tsx');
const {VendasRelatorioTable}=load('src/modules/vendas-relatorios/components/VendasRelatorioTable.tsx');
const {useVendasRelatorio}=load('src/modules/vendas-relatorios/hooks/useVendasRelatorio.ts');
const {getPeriodPreset}=load('src/shared/utils/report-period.ts');

test('sales filters combine client ID, dates, identification and both statuses',()=>{
  let submitted;const render=mount(VendasFiltersCard,{clientes:clients,onSearch:f=>submitted=f,onClear:()=>{}});
  button(render(),'Filtros avançados').props.onClick();
  for(const [field,value]of [['cliente','client-id'],['nome','Nome ignorado por ID'],['inicio','2026-10-01'],['fim','2026-10-02'],['placa','ABC'],['numeroPedido','123'],['numeroRomaneio','456'],['status','CANCELADA'],['pagamento','PARCIAL']])change(render,'vendas-report-'+field,value);
  assert.equal(nodes(render()).find(n=>n.props.id==='vendas-report-nome').props.disabled,true);
  button(render(),'Gerar relatório').props.onClick();assert.deepEqual(submitted,{clienteId:'client-id',cliente:'Nome ignorado por ID',dataInicio:'2026-10-01',dataFim:'2026-10-02',placa:'ABC',numeroPedido:'123',numeroRomaneio:'456',status:'CANCELADA',statusPagamento:'PARCIAL',page:1,pageSize:25});
});
for(const [id,label]of [['today','Hoje'],['yesterday','Ontem'],['last7','Últimos 7 dias'],['month','Este mês'],['previousMonth','Mês anterior'],['year','Este ano']])test('sales period preset '+label,()=>{
  let submitted;const render=mount(VendasFiltersCard,{clientes:[],onSearch:f=>submitted=f,onClear:()=>{}});button(render(),label).props.onClick();button(render(),'Gerar relatório').props.onClick();const expected=getPeriodPreset(id);assert.equal(submitted.dataInicio,expected.inicio);assert.equal(submitted.dataFim,expected.fim);
});
test('manual dates select custom; inverted period blocks search and clear resets',()=>{
  let submitted=0;let cleared=0;const render=mount(VendasFiltersCard,{clientes:[],onSearch:()=>submitted++,onClear:()=>cleared++});button(render(),'Hoje').props.onClick();change(render,'vendas-report-inicio','2026-10-03');change(render,'vendas-report-fim','2026-10-02');assert.equal(button(render(),'Personalizado').props['aria-pressed'],true);button(render(),'Gerar relatório').props.onClick();assert.equal(submitted,0);assert.match(text(render()),/data inicial deve/);button(render(),'Limpar').props.onClick();assert.equal(cleared,1);assert.equal(nodes(render()).find(n=>n.props.id==='vendas-report-inicio').props.value,'');assert.doesNotMatch(text(render()),/data inicial deve/);
});
test('official summary uses server-wide metrics rather than visible items',()=>{
  const output=text(VendasResumoCard({summary}));for(const value of ['50','1.000 kg','3.500,00','4,50','70,00'])assert.ok(output.includes(value));assert.doesNotMatch(output,/lucro|margem/i);
});
test('table preserves loading, recoverable error, empty and real pagination',()=>{
  assert.match(text(VendasRelatorioTable({vendas:[],loading:true})),/Carregando/);let retries=0;const error=VendasRelatorioTable({vendas:[],error:'offline',onRetry:()=>retries++});button(error,'Tentar novamente').props.onClick();assert.equal(retries,1);assert.doesNotMatch(text(error),/Nenhuma venda/);assert.match(text(VendasRelatorioTable({vendas:[]})),/Nenhuma venda/);
  let page;const tree=VendasRelatorioTable({vendas:[item],pagination:payload.pagination,onPageChange:value=>page=value});assert.match(text(tree),/50\s+registro/);assert.match(text(tree),/01\/10\/2026/);assert.match(text(tree),/Pedido 001/);assert.match(text(tree),/5,00/);assert.match(text(tree),/Parcial/);assert.equal(button(tree,'Anterior').props.disabled,true);button(tree,'Próxima').props.onClick();assert.equal(page,2);
});
test('hook sends paginated filters to search endpoint and exposes the official contract',async()=>{
  queryResult={data:payload,isFetching:false,error:null,refetch:()=>{}};const filters={clienteId:'client-id',page:2,pageSize:25};const result=useVendasRelatorio(filters,true);assert.equal(result.summary,summary);assert.equal(result.pagination,payload.pagination);assert.deepEqual(queryOptions.queryKey,['vendas-relatorio',filters]);assert.equal(queryOptions.enabled,true);await queryOptions.queryFn();assert.deepEqual(calls.at(-1),['/vendas/search',{params:filters}]);useVendasRelatorio({},false);assert.equal(queryOptions.enabled,false);
});
test('dashboard client filter keeps the report mounted and retains operation/client areas',()=>{
  queryResult={data:payload,isFetching:false,error:null,refetch:()=>{}};
  const {VendasAdminDashboard}=load('src/modules/vendas/components/VendasAdminDashboard.tsx');const render=mount(VendasAdminDashboard);let tree=render();assert.equal(queryOptions.enabled,false);
  nodes(tree).find(n=>n.type===VendasFiltersCard).props.onSearch({clienteId:'client-id'});tree=render();assert.equal(queryOptions.enabled,true);assert.equal(queryOptions.queryKey[1].clienteId,'client-id');assert.ok(nodes(tree).some(n=>n.type===VendasRelatorioTable));assert.ok(nodes(tree).some(n=>n.type===VendasResumoCard));assert.ok(text(tree).includes('Clientes'));
  nodes(tree).find(n=>n.type===VendasRelatorioTable).props.onPageChange(2);render();assert.equal(queryOptions.queryKey[1].page,2);nodes(render()).find(n=>n.type===VendasFiltersCard).props.onClear();render();assert.equal(queryOptions.enabled,false);
});
test('module uses bounded mobile cards and an internal desktop scroll container',()=>{
  const tree=VendasRelatorioTable({vendas:[{...item,cliente:null,clienteNomeSnapshot:'X'.repeat(500)}]});const all=nodes(tree);assert.ok(all.some(n=>n.props.className?.includes('lg:hidden')));assert.ok(all.some(n=>n.props.className?.includes('overflow-x-auto max-w-full')));assert.ok(all.some(n=>n.props.className?.includes('[overflow-wrap:anywhere]')));
  for(const file of ['VendasFiltersCard.tsx','VendasResumoCard.tsx','VendasRelatorioTable.tsx'])assert.doesNotMatch(fs.readFileSync('src/modules/vendas-relatorios/components/'+file,'utf8'),/min-w-\[\d+px\]/);
});
