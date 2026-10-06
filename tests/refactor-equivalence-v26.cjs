const {chromium}=require('playwright');
const fs=require('fs'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const baseline=execFileSync('git',['show','329828b:wardclaw_v26.html'],{encoding:'utf8'});
const candidate=fs.readFileSync('wardclaw_v26.html','utf8');
const fixture=JSON.parse(fs.readFileSync('tests/playthrough-v26-results.json','utf8'))[0].endState;
const expose=`window.refactorTest={freshState,migrateSave,renderAll,genBossItem,genCraftedItem,findDuplicate,findFusionPartner,statCost,statValue,STAT_DEFS,SLOT_LIST,RARITIES,set:s=>{S=s},get:()=>S};})();\n</script>`;
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const results=[];
  for(const html of [baseline,candidate]){
   const context=await browser.newContext({viewport:{width:390,height:900}});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{Date.now=()=>1800000000000;let rng=123;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};});
   await page.route('https://fonts.googleapis.com/**',r=>r.abort());
   await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html.replace('setInterval(tick, TICK_MS);','').replace('setInterval(save, 5000);','').replace('})();\n</script>',expose)}));
   await page.goto('https://wardclaw.test');
   const result=await page.evaluate(fixture=>{
    const t=refactorTest;let rng=2468;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
    const generated=[];
    for(const level of [1,10,40,100])for(const rarity of t.RARITIES)for(const slot of t.SLOT_LIST){generated.push(t.genBossItem(slot,'Test Gear',rarity,level),t.genCraftedItem(slot,rarity,level),t.genCraftedItem(slot,rarity,level,'Fixed Recipe'));}
    const snapshots=[];
    for(const source of [t.freshState(),fixture]){
     const s=t.migrateSave({game:'wardclaw',version:12,state:source});s.campActive=true;t.set(s);t.renderAll();
     const markup=document.getElementById('app').innerHTML;
     const styles=[...document.querySelectorAll('#app *')].map(e=>{const c=getComputedStyle(e);return [e.tagName,c.display,c.color,c.backgroundColor,c.gridTemplateColumns,c.fontSize,c.padding,c.borderRadius];});
     const costs=t.STAT_DEFS.map(d=>[d.key,t.statCost(d,s.stats[d.key]),t.statValue(d,s.stats[d.key])]);
     snapshots.push({markup,styles,costs,state:structuredClone(s)});
    }
    const s=t.get();s.inventory=generated.slice(0,3);s.legacy=[{...generated[0],id:900001},{...generated[0],id:900002,locked:true},{...generated[0],id:900003}];
    return {generated,snapshots,duplicate:t.findDuplicate(generated[0].name,generated[0].slot,generated[0].rarity).id,partner:t.findFusionPartner(s.legacy[0]).id};
   },fixture);
   assert.deepEqual(errors,[]);results.push(result);await context.close();
  }
  assert.deepEqual(results[1],results[0]);
  console.log('PASS: original/refactored seeded generation (384 items), fresh/endgame markup, computed mobile styles, state, stat costs and values, duplicate/fusion selection are identical.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
