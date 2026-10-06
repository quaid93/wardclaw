const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync('wardclaw_v27.html','utf8').replace('setInterval(tick, TICK_MS);','').replace('setInterval(save, 5000);','').replace('})();\n</script>','window.t={freshState,migrateSave,genBossItem,durabilityCap,wearItem,repairCost,repairGoldCost,repairItem,save,renderAll,get:()=>S,set:s=>{S=s}};})();\n</script>');
 await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('https://wardclaw.test');
 const result=await page.evaluate(()=>{
  const caps={common:12000,rare:24000,epic:48000,legendary:96000},old={common:1200,rare:2400,epic:4800,legendary:9600};
  const check=(v,m)=>{if(!v)throw Error(m)};
  for(const rarity of Object.keys(caps)){
   const gear=t.genBossItem('weapon','Endurance blade',rarity,10);check(gear.durability===caps[rarity],'new cap');
   for(let n=0;n<old[rarity];n++)t.wearItem(gear,1);
   check(gear.durability===caps[rarity]*.9 && !gear.durabilityWarned,'tenfold endurance');
   const state=t.freshState();state.inventory=[gear];t.set(state);state.materials=1000;state.gold=1e9;
   check(t.repairCost(gear)===Math.ceil(({common:4,rare:10,epic:24,legendary:60}[rarity])*.1),'unchanged material price');
   check(t.repairItem(gear.id),'repair');check(gear.durability===caps[rarity],'repair full cap');
   t.wearItem(gear,caps[rarity]*.75);check(gear.durability===caps[rarity]*.25 && gear.durabilityWarned,'25% warning');
   check(t.repairItem(gear.id,'gold') && !gear.durabilityWarned,'gold repair clears warning');
   for(const fraction of [0,.25,.5,1]){
    const before=t.freshState(),i={...gear,durability:old[rarity]*fraction};delete i.durabilityMax;before.inventory=[i];
    const migrated=t.migrateSave({game:'wardclaw',version:12,state:before});check(migrated.inventory[0].durability===caps[rarity]*fraction,'migration preserves wear');
    const twice=t.migrateSave({game:'wardclaw',version:13,state:migrated});check(twice.inventory[0].durability===migrated.inventory[0].durability,'migration idempotence');
    check(t.migrateSave(migrated).inventory[0].durability===migrated.inventory[0].durability,'raw roundtrip');
   }
  }
  const state=t.freshState();for(const [index,location] of ['inventory','legacy','overflow','equipped','exchangeStock'].entries()){
   const gear=t.genBossItem('weapon','Migration '+location,'rare',10);gear.durability=1200;delete gear.durabilityMax;
   if(location==='equipped')state.equipped.weapon=gear;else if(location==='exchangeStock')state.exchangeStock={rare:{item:gear,sold:false}};else state[location].push(gear);
  }
  const migrated=t.migrateSave({game:'wardclaw',version:12,state});
  for(const gear of [...migrated.inventory,...migrated.legacy,...migrated.overflow,migrated.equipped.weapon,migrated.exchangeStock.rare.item])check(gear.durability===12000,'all locations migrated');
  t.set(migrated);t.renderAll();t.save();return {saved:migrated.inventory[0].durability};
 });assert.equal(result.saved,12000);await page.reload();assert.equal(await page.evaluate(()=>t.get().inventory[0].durability),12000);assert.deepEqual(errors,[]);
 console.log('PASS: tenfold endurance at all rarities, 25% warning, both repair currencies, proportional old-save migration, broken gear preservation, all storage locations, idempotent schema/raw migration and reload.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
