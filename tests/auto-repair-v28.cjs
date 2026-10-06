const {chromium}=require('playwright'),fs=require('fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync('wardclaw_v28.html','utf8').replace('setInterval(tick, TICK_MS);','').replace('setInterval(save, 5000);','').replace('})();\n</script>','window.t={freshState,migrateSave,genBossItem,durabilityCap,wearItem,repairCost,runAutoRepair,unlockAutoRepair,rollDungeonExtra,grantDungeonExtra,dungeonDropChance,newDungeonRun,startDungeon,dungeonTurn,dungeonIntent,nextDungeonRoom,dungeonRest,bankDungeon,dungeonBuild,doPrestige,applyPlayerHit,tick,derived,dungeonEntryCost,buyStat,statCost,STAT_DEFS,renderAll,save,get:()=>S,set:s=>{S=s}};})();\n</script>');
 await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('https://wardclaw.test');
 await page.evaluate(()=>{
  const check=(v,m)=>{if(!v)throw Error(m)},caps={common:50000,rare:75000,epic:100000,legendary:200000};
  for(const [version,old] of [[12,{common:1200,rare:2400,epic:4800,legendary:9600}],[13,{common:12000,rare:24000,epic:48000,legendary:96000}]]){
   for(const rarity of Object.keys(caps))for(const fraction of [0,.25,.5,1]){
    const s=t.freshState(),i=t.genBossItem('weapon','Migration',rarity,10);i.durability=old[rarity]*fraction;delete i.durabilityMax;s.inventory=[i];
    const migrated=t.migrateSave({game:'wardclaw',version,state:s});check(migrated.inventory[0].durability===caps[rarity]*fraction,'proportional migration');
    check(t.migrateSave({game:'wardclaw',version:14,state:migrated}).inventory[0].durability===caps[rarity]*fraction,'repeat migration');
    check(t.migrateSave(migrated).inventory[0].durability===caps[rarity]*fraction,'raw roundtrip');
   }
  }
  const s=t.freshState();s.prestigeCount=5;s.gold=1e9;s.materials=1000;s.campActive=true;t.set(s);
  const weapon=t.genBossItem('weapon','Core blade','common',10);s.equipped.weapon=weapon;
  const run=t.newDungeonRun('crypt',[weapon.id]);run.room=4;check(t.dungeonDropChance(run,'repairCore')===0,'minimum room');run.room=5;check(t.dungeonDropChance(run,'repairCore')>.02,'drop odds');
  const rng=Math.random;Math.random=()=>0;t.rollDungeonExtra(run);Math.random=rng;check(run.extra.repairCore===1 && !s.autoRepair.owned,'unbanked core');
  check(t.dungeonDropChance(run,'repairCore')===0,'no duplicate pending drops');t.grantDungeonExtra(run,.75);check(s.autoRepair.owned && !s.autoRepair.enabled,'escape keeps relic, default off');
  const guarantee=t.freshState();guarantee.prestigeCount=5;t.set(guarantee);const guaranteed=t.newDungeonRun('crypt',[]);guaranteed.cleared=10;t.grantDungeonExtra(guaranteed);check(guarantee.autoRepair.owned,'room10 bank guarantee');
  t.set(s);weapon.durability=12500;s.autoRepair.enabled=false;check(!t.runAutoRepair() && weapon.durability===12500,'toggle off');
  s.autoRepair.enabled=true;const before=s.materials;check(t.runAutoRepair() && weapon.durability===50000 && s.materials===before-3,'material repair cost');
  weapon.durability=12501;check(!t.runAutoRepair(),'above threshold untouched');weapon.durability=0;s.materials=0;const gold=s.gold;check(t.runAutoRepair() && weapon.durability===50000 && s.gold<gold,'broken gear and gold fallback');
  weapon.durability=12500;s.gold=0;check(!t.runAutoRepair() && weapon.durability===12500,'no funds waits');
  s.gold=1e9;check(t.startDungeon('crypt',[weapon.id]),'dungeon entry');check(!t.runAutoRepair() && weapon.durability===12500,'reserved gear never auto repaired');s.dungeon.run.enemy.hp=1;t.dungeonTurn('strike');check(t.bankDungeon(),'bank safe');check(t.runAutoRepair() && weapon.durability===50000,'repair after return');
  const inv=t.genBossItem('boots','Carried boots','rare',10);inv.durability=18750;inv.locked=true;s.inventory.push(inv);
  const stored=t.genBossItem('shield','Stored shield','epic',10);stored.durability=25000;s.overflow.push(stored);check(t.runAutoRepair() && inv.durability===75000 && stored.durability===25000,'locked carried gear repaired, overflow manual');
  s.bossLevel=100;s.pbBossLevel=100;t.doPrestige(null);check(t.get().autoRepair.owned && t.get().autoRepair.enabled,'Prestige persistence');t.save();t.renderAll();
 });
 await page.locator('[data-tab="items"]').click();await page.locator('[data-subtab="forge"]').click();assert.ok(await page.locator('#autoRepairToggle').isChecked());await page.locator('#autoRepairToggle').uncheck();assert.equal(await page.evaluate(()=>t.get().autoRepair.enabled),false);await page.reload();assert.equal(await page.evaluate(()=>t.get().autoRepair.owned),true);assert.equal(await page.evaluate(()=>t.get().autoRepair.enabled),false);
 const fixture=JSON.parse(fs.readFileSync('tests/playthrough-v28-results.json','utf8'))[0].dungeonReadyState;
 const earned=await page.evaluate(fixture=>{
  const s=t.migrateSave({game:'wardclaw',version:14,state:fixture});t.set(s);s.campActive=true;
  s.campActive=false;let attackElapsed=0;let now=Date.now();const clock=Date.now;Date.now=()=>now;
  for(let step=0;step<10000 && s.gold<t.dungeonEntryCost()*2;step++){
    now+=200;attackElapsed+=200;t.tick();
    if(attackElapsed>=1000/t.derived().attackSpeed){attackElapsed=0;t.applyPlayerHit('manual');}
  }
  Date.now=clock;s.campActive=true;
  const reserve=Math.max(s.gold*.2,t.dungeonEntryCost());
  for(let i=0;i<500;i++){
   const choices=t.STAT_DEFS.filter(d=>['hp','def'].includes(d.key)).sort((a,b)=>t.statCost(a,s.stats[a.key])-t.statCost(b,s.stats[b.key]));
   let purchased=false;for(const d of choices){const before=s.gold;if(s.gold-t.statCost(d,s.stats[d.key])>=reserve){t.buyStat(d.key);if(s.gold<before){purchased=true;break;}}}if(!purchased)break;
  }
  const ids=Object.values(s.equipped).filter(Boolean).map(i=>i.id);
  const build=t.dungeonBuild(ids),expected=t.derived();if(build.finalAttack!==expected.finalAttack || build.defReduction!==expected.defReduction)throw Error('equipped dungeon bonuses lost');
  if(!t.startDungeon('crypt',ids))throw Error('earned save cannot enter Crypt');
  const rng=Math.random;Math.random=()=>.5;let turns=0;
  while(s.dungeon.run && s.dungeon.run.cleared<10 && turns++<2000){const r=s.dungeon.run;if(r.state==='fight')t.dungeonTurn(t.dungeonIntent(r.enemy)==='heavy'?'guard':'strike');else if(r.state==='rest')t.dungeonRest('heal');else t.nextDungeonRoom('safe');}
  Math.random=rng;if(!s.dungeon.run || s.dungeon.run.cleared<10)throw Error('room10 not reachable from earned save');
  if(s.dungeon.run.extra.repairCore!==1)throw Error('guaranteed Core missing from haul');
  const pending=t.migrateSave({game:'wardclaw',version:14,state:s});if(pending.dungeon.run.extra.repairCore!==1)throw Error('pending Core lost on reload');
  t.bankDungeon();if(!s.autoRepair.owned)throw Error('guaranteed relic not secured');return {turns,core:s.autoRepair.owned};
 },fixture);assert.ok(earned.core);
 assert.deepEqual(errors,[]);console.log('PASS: exact rarity caps, v12/v13 proportional migration and idempotence, depth/drop guards, unbanked relic and salvage, guaranteed unlock, threshold, toggle, costs/gold fallback/no-funds, reserved and stored gear, Prestige and reload.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
