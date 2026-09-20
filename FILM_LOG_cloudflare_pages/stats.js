const fs=require('fs');
const src=fs.readFileSync('/workspace/filmlog_site/app.js','utf8');
const seedArr=eval('('+src.match(/function seed\(\)\{\s*return (\[[\s\S]*?\]);\n\}/)[1]+')');
const ALIASES=eval('('+src.match(/const ALIASES = (\{[\s\S]*?\});/)[1]+')');
const FUNC_KEYWORDS=eval('('+src.match(/const FUNC_KEYWORDS = (\[[^\]]*\]);/)[1]+')');
const FUNC_RE=eval('('+src.match(/const FUNC_RE = ([^;]*);/)[1]+')');
function stripFuncReal(name){ if(!name) return name; const mm=String(name).match(FUNC_RE); if(!mm) return name; const L=mm[1].trim(),R=mm[2].trim(); if(!L||!R) return (L||R||name); if(FUNC_KEYWORDS.some(k=>R.includes(k))) return L; if(!/[a-zA-Z0-9]/.test(R)&&R.length<=8) return L; return name; }
const canon=n=>(n==null)?n:(ALIASES[(''+n).trim()]||(''+n).trim());

let shows=0,zero=0,watched=0,total=0; const uniq=new Set(); const c={}; const byM={}; let blaze=new Set();
for(const f of seedArr){ const ws=f.watches||[]; if(ws.length)watched++; for(const w of ws){ shows++; const p=w.people||[]; if(p.length===0)zero++; let cnt=0; for(const x of p){const n=canon(stripFuncReal(x)); if(n){uniq.add(n);c[n]=(c[n]||0)+1;total++;cnt++;}} if(p.length>8)for(const x of p){const n=canon(stripFuncReal(x));if(n)blaze.add(n);} if(w.date){const mm=w.date.slice(0,7);byM[mm]=(byM[mm]||0)+1;} } }

const club10=Object.entries(c).filter(([k,v])=>v>=10).sort((a,b)=>b[1]-a[1]);
const club20=Object.entries(c).filter(([k,v])=>v>=20).sort((a,b)=>b[1]-a[1]);
// jz 鸡爪+: 与林三共看 >=1
let jzPair=0; const jzTop=[];
for(const f of seedArr)for(const w of (f.watches||[])){ const p=(w.people||[]).map(x=>canon(stripFuncReal(x))); if(p.includes('林三')){ const others=p.filter(x=>x!=='林三'); for(const o of others){} } }
// compute co-watch with 林三 properly
const co={};
for(const f of seedArr)for(const w of (f.watches||[])){ const p=(w.people||[]).map(x=>canon(stripFuncReal(x))); if(p.includes('林三')){ for(const o of p){ if(o!=='林三') co[o]=(co[o]||0)+1; } } }
const jzPlus=Object.entries(co).filter(([k,v])=>v>=1).sort((a,b)=>b[1]-a[1]);

const com=seedArr.filter(f=>(f.tags||'').includes('喜剧'));
const ccm={}; for(const f of com)for(const w of (f.watches||[]))for(const x of (w.people||[]||[])){const n=canon(stripFuncReal(x)); if(n)ccm[n]=(ccm[n]||0)+1;}
const comedian=Object.entries(ccm).filter(([k,v])=>v>=5);

// 按月
const months=Object.entries(byM).sort();
// 9月观影者 + 9月观影帝
const sep=new Set(); const sepCount={};
for(const f of seedArr)for(const w of (f.watches||[]))if(w.date&&w.date.startsWith('2026-09'))for(const x of (w.people||[]||[])){const n=canon(stripFuncReal(x)); if(n){sep.add(n); sepCount[n]=(sepCount[n]||0)+1;}}
const sepKing=Object.entries(sepCount).sort((a,b)=>b[1]-a[1]).slice(0,3);

// 0人影片数
const zeroFilms=seedArr.filter(f=>(f.watches||[]).length>0 && (f.watches||[]).every(w=>(w.people||[]).length===0)).map(f=>f.id+':'+f.title);
const noWatchFilms=seedArr.filter(f=>(f.watches||[]).length===0).map(f=>f.id+':'+f.title);

const out={
  '影片总数':seedArr.length,
  '已放映(≥1场)':watched,
  '0人空场数(影片)':zeroFilms.length,
  '0人空场场次':zero,
  '无放映影片':noWatchFilms.length,
  '放映总场数':shows,
  '累计参与人次(归一)':total,
  '唯一观影者':uniq.size,
  'club10':club10.length,
  'club20':club20.length,
  'club20名单':club20.map(x=>x[0]+'('+x[1]+')').join(', '),
  'blaze':blaze.size,
  'comedian':comedian.length,
  '鸡爪+人数':jzPlus.length,
  '9月场数':byM['2026-09']||0,
  '9月参与观影者':sep.size,
  '9月观影帝':sepKing.map(x=>x[0]+'('+x[1]+')').join(', '),
};
console.log('==== 当前权威基线 (BUILD 20260904140746) ====');
for(const[k,v]of Object.entries(out))console.log(`  ${k}: ${v}`);
console.log('\n  club10名单:', club10.map(x=>x[0]+'('+x[1]+')').join(', '));
console.log('  TOP5观影者:', Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>x[0]+'('+x[1]+')').join(', '));
console.log('  鸡爪+TOP5:', jzPlus.slice(0,5).map(x=>x[0]+'('+x[1]+')').join(', '));
console.log('  0人空场影片:', zeroFilms.join(' | '));
console.log('  无放映影片:', noWatchFilms.join(' | '));
console.log('  按月场数:', months.map(x=>x[0]+':'+x[1]).join('  '));
console.log('  max id:', Math.max(...seedArr.map(f=>f.id)));
console.log('  ALIASES条目数:', Object.keys(ALIASES).length);
console.log('  ALIASES:', JSON.stringify(ALIASES));
