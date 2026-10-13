import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const context=vm.createContext({t:(en)=>en,Set,FormData,Math,Number,String,URL});
vm.runInContext(fs.readFileSync(new URL('../docs/experience.js',import.meta.url),'utf8')+fs.readFileSync(new URL('../docs/refinements.js',import.meta.url),'utf8')+'\nthis.calculate=calculateGrowthReport;this.setReport=r=>growthReport=r;this.downloadReport=downloadGrowthReport;',context);
function result(leads,conversions,missed,response='fast') {const fd=new FormData();for(const [k,v] of Object.entries({leads,conversions,missed,response,businessName:'Example business',website:'example.com'}))fd.set(k,String(v));return context.calculate(fd)}
const standard=result(100,20,25);assert.equal(standard.website,'https://example.com/');assert.equal(standard.conversion,20);assert.equal(standard.coverage,75);assert.equal(standard.actions.length,4);
const noneConverted=result(100,0,100);assert.equal(noneConverted.conversion,0);assert.equal(noneConverted.coverage,0);
const allConverted=result(50,50,0);assert.equal(allConverted.conversion,100);assert.equal(allConverted.coverage,100);
const slower=result(100,20,25,'slow');assert.match(slower.actions.join(' '),/first-response/);
for(const values of [[0,0,0],[100,101,0],[100,20,81],[-1,0,0],[1.5,0,0],[100,-1,0],[100,0,-1],['bad',0,0],[1000001,0,0]])assert.ok(result(...values).error,JSON.stringify(values));
console.log('Growth check passed: conversion, coverage, edge cases, response recommendations and input validation');

for(const website of ['javascript:alert(1)','data:text/html,test','file:///tmp/test','https://name:password@example.com','localhost','bad domain']){const fd=new FormData();for(const [k,v] of Object.entries({website,leads:100,conversions:20,missed:25,response:'fast'}))fd.set(k,String(v));assert.ok(context.calculate(fd).error,website)}
console.log('Website address validation passed: URL normalization and unsafe/invalid addresses');

let reportBlob, downloadLink;
Object.assign(context,{
 lang:'en',Blob,Date,
 escapeHTML:value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
 document:{body:{appendChild(){}},createElement:()=>downloadLink={click(){this.clicked=true},remove(){}}},
 URL:{createObjectURL:blob=>(reportBlob=blob,'blob:report-test'),revokeObjectURL(){}},
 setTimeout(){},notify(){}
});
standard.name='<script>alert(1)</script>';
context.setReport(standard);context.downloadReport();
assert.equal(downloadLink.download,'foloop-growth-report-en.html');
assert.equal(downloadLink.clicked,true);
assert.equal(reportBlob.type,'text/html;charset=utf-8');
const html=await reportBlob.text();
assert.ok(html.includes('https://example.com/'));
assert.ok(html.includes('20%')&&html.includes('75%'));
assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
assert.ok(!html.includes('<script>alert(1)</script>'));
console.log('Report export passed: download action, MIME type, results and safe business name escaping');

