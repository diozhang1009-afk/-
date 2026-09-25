const fs=require('fs');
const src=fs.readFileSync('/workspace/filmlog_site/app.js','utf8');
const seedArr=eval('('+src.match(/function seed\(\)\{\s*return (\[[\s\S]*?\]);\n\}/)[1]+')');
const ALIASES=eval('('+src.match(/const ALIASES = (\{[\s\S]*?\});/)[1]+')');
const FUNC_KEYWORDS=eval('('+src.match(/const FUNC_KEYWORDS = (\[[^\]]*\]);/)[1]+')');
const FUNC_RE=eval('('+src.match(/const FUNC_RE = ([^;]*);/)[1]+')');
function stripFuncReal(name){ if(!name) return name; const mm=String(name).match(FUNC_RE); if(!mm) return name; const L=mm[1].trim(),R=mm[2].trim(); if(!L||!R) return (L||R||name); if(FUNC_KEYWORDS.some(k=>R.includes(k))) return L; if(!/[a-zA-Z0-9]/.test(R)&&R.length<=8) return L; return name; }
const canon=n=>(n==null)?n:(ALIASES[(''+n).trim()]||(''+n).trim());

// 逐月观影帝
const byMonth={};
for(const f of seedArr)for(const w of (f.watches||[])){ if(!w.date)continue; const m=w.date.slice(0,7); (byMonth[m]=byMonth[m]||{}); for(const x of (w.people||[]||[])){const n=canon(stripFuncReal(x)); if(n)byMonth[m][n]=(byMonth[m][n]||0)+1;} }
console.log('==== 逐月观影帝（归一后该月场次最多）====');
for(const m of Object.keys(byMonth).sort()){ const e=byMonth[m]; const max=Math.max(...Object.values(e)); const kings=Object.entries(e).filter(([k,v])=>v===max).map(([k,v])=>`${k}(${v})`).join('/'); console.log(`  ${m}: ${kings}`); }

// fullattend / live: 找函数定义
const fa=src.match(/function isFullAttendance[\s\S]*?\n\}/); console.log('\nfullattend 函数片段:', fa? fa[0].slice(0,160):'未找到');
const live=src.match(/function isLive[\s\S]*?\n\}/); console.log('live 函数片段:', live? live[0].slice(0,160):'未找到');
// 直接统计 fullattend/live 名单
function weekOf(date){ const d=new Date(date+'T00:00:00'); const onejan=new Date(d.getFullYear(),0,1); return Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); }
const fullattend=[], liveList=[];
const viewers=new Set(); for(const f of seedArr)for(const w of (f.watches||[]))for(const x of (w.people||[]||[])){const n=canon(stripFuncReal(x)); if(n)viewers.add(n);}
for(const name of viewers){
  const dates=[]; for(const f of seedArr)for(const w of (f.watches||[])){ if((w.people||[]||[]).map(x=>canon(stripFuncReal(x))).includes(name)) dates.push(w.date); }
  const months=[...new Set(dates.map(d=>d.slice(0,7)))];
  // fullattend: 跨 >=4 月 且 月均? 旧定义待查；用简单近似
  // live: 某月 >8 场 且 跨 >=4 周
  const perMonth={}; for(const d of dates){const m=d.slice(0,7);perMonth[m]=(perMonth[m]||0)+1;}
  for(const m of Object.keys(perMonth)){ if(perMonth[m]>8){ const ws=[...new Set(dates.filter(d=>d.slice(0,7)===m).map(d=>weekOf(d)))]; if(ws.length>=4) liveList.push(name); } }
}
console.log('\nlive 人数(某月>8场且跨>=4周):', liveList.length, '->', [...new Set(liveList)].join(', '));
console.log('（注：fullattend 逻辑需按源码定义，未在本脚本精确复算；沿用旧报告 4 人待你确认）');
