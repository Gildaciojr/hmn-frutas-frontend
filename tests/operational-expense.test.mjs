import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import ts from 'typescript';
import * as React from 'react';
let state;
let save;
const cache = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (cache.has(filename)) return cache.get(filename);
  const mod = new Module(filename); mod.filename = filename; mod.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = mod.require.bind(mod);
  mod.require = id => {
    if (id === 'react') return {...React, useState: initial => state.useState(initial)};
    if (id.endsWith('useDespesasOperacionais')) return {useDespesasOperacionais: () => ({createDespesa: save, creating: false})};
    if (id === 'framer-motion') return {motion: {button: 'button'}};
    if (id === '@/shared/utils/payment-time') return load('src/shared/utils/payment-time.ts');
    return original(id);
  };
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true}}).outputText, filename);
  cache.set(filename, mod.exports); return mod.exports;
}
function mount(onClose) {
  const values = []; let cursor;
  state = {useState(initial) {const i=cursor++;if(!(i in values))values[i]=typeof initial==='function'?initial():initial;return [values[i], value=>values[i]=typeof value==='function'?value(values[i]):value];}};
  const {DespesaOperacionalModal} = load('src/modules/despesas-operacionais/components/DespesaOperacionalModal.tsx');
  return () => {cursor=0;return DespesaOperacionalModal({open:true,onClose});};
}
function nodes(value) {if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return [];return [value,...nodes(value.props?.children)];}
function text(value) {if(Array.isArray(value))return value.map(text).join(' ');if(!value||typeof value==='boolean')return '';if(typeof value!=='object')return String(value);return text(value.props?.children);}
function fill(render) {
  const tree=render(); const all=nodes(tree);
  all.find(n=>n.type==='input'&&n.props.placeholder?.startsWith('Ex:')).props.onChange({target:{value:'Combustível'}});
  const amount=all.find(n=>n.props.placeholder==='0,00'); for(const key of ['1','2','3'])amount.props.onKeyDown({key,preventDefault(){}});
  return tree;
}
const submit=render=>nodes(render()).find(n=>n.type==='form').props.onSubmit({preventDefault(){}});

test('expense submits explicit method and ISO instant, then resets and closes', async()=>{
  let payload;let closed=0;save=async data=>{payload=data;};const render=mount(()=>closed++);fill(render);
  let all=nodes(render());const date=all.find(n=>n.props.id==='despesa-pago-em');assert.equal(date.props.required,true);assert.match(date.props.value,/T\d{2}:\d{2}:\d{2}$/);
  const method=all.find(n=>n.type==='select');assert.equal(method.props.required,true);assert.equal(method.props.value,'');
  assert.deepEqual(nodes(method).filter(n=>n.type==='option').map(n=>n.props.value),['','PIX','DINHEIRO','CHEQUE','TRANSFERENCIA','BOLETO']);
  method.props.onChange({target:{value:'BOLETO'}});date.props.onChange({target:{value:'2026-10-02T12:34:56'}});
  all.find(n=>n.type==='textarea').props.onChange({target:{value:' Recibo 42 '}});
  await submit(render);assert.equal(payload.formaPagamento,'BOLETO');assert.equal(payload.pagoEm,new Date('2026-10-02T12:34:56').toISOString());assert.equal(payload.valor,123);assert.equal(payload.observacoes,'Recibo 42');assert.equal(closed,1);
  assert.equal(nodes(render()).find(n=>n.type==='select').props.value,'');
});
test('missing method or payment time prevents save with visible feedback',async()=>{
  let count=0;save=async()=>count++;const render=mount(()=>{});fill(render);await submit(render);assert.match(text(render()),/Informe a forma/);
  nodes(render()).find(n=>n.type==='select').props.onChange({target:{value:'PIX'}});nodes(render()).find(n=>n.props.id==='despesa-pago-em').props.onChange({target:{value:''}});
  await submit(render);assert.match(text(render()),/Informe a data e hora/);assert.equal(count,0);
});
test('backend error stays visible and preserves inputs without closing; cancel still closes',async()=>{
  let closed=0;save=async()=>{throw {response:{data:{message:'Despesa não registrada'}}};};const render=mount(()=>closed++);fill(render);
  nodes(render()).find(n=>n.type==='select').props.onChange({target:{value:'PIX'}});await submit(render);
  assert.match(text(nodes(render()).find(n=>n.props.role==='alert')),/Despesa não registrada/);assert.equal(closed,0);assert.equal(nodes(render()).find(n=>n.type==='select').props.value,'PIX');
  nodes(render()).find(n=>n.type==='button'&&text(n)==='Cancelar').props.onClick();assert.equal(closed,1);
});
test('new fields keep the existing scroll container and single-column mobile layout',()=>{
  save=async()=>{};const render=mount(()=>{});const all=nodes(render());assert.ok(all.some(n=>n.props.className?.includes('max-h-[92dvh]')&&n.props.className.includes('overflow-y-auto')));
  assert.ok(all.some(n=>n.props.className==='grid grid-cols-1 sm:grid-cols-2 gap-4'));
  assert.ok(all.find(n=>n.props.id==='despesa-pago-em').props.className.includes('max-w-full'));
});
