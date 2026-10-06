const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync(path.join(__dirname,'..','wardclaw_v21.html'),'utf8').replace('})();\n</script>',`window.__test={freshState,migrateSave,getState:()=>S,setState:s=>S=s,renderAll,save,resetBossFight,genBossItem,genCraftedItem,doPrestige,makeBounty,BOUNTY_TEMPLATES,updateBountyStat,claimBounty,ensureBountiesExist,acquireItem,toggleItemLock,dismantleInventory,dismantleLegacy,dismantleFrom,reclaimOverflow,equipFromInventory,equipFromLegacy,equipFromOverflow,unequipSlot,findDuplicate,performFusion,findFusionPartner,allOwnedItems,craft,setRarity:r=>craftRaritySelection=r,availableCraftRecipes,makeAdventurer,encounterOptions,resolveEncounter,expeditionExclusiveRewards};\n})();\n</script>`);
 await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('https://wardclaw.test/');
 const evaluate=fn=>page.evaluate(fn);
 await evaluate(()=>{
  const t=__test,s=t.freshState();s.campActive=true;s.lifetimeMaterials=100;s.bossLevel=20;s.pbBossLevel=20;s.bountyStats.clicksLanded=500;t.setState(s);t.resetBossFight(false);
  const click=t.makeBounty(t.BOUNTY_TEMPLATES.find(b=>b.id==='click'));click.target=10;
  const kill=t.makeBounty(t.BOUNTY_TEMPLATES.find(b=>b.id==='kill')),reach=t.makeBounty(t.BOUNTY_TEMPLATES.find(b=>b.id==='prestige'));reach.target=30;
  s.bounties=[click,kill,reach];s.bountyResetAt=Date.now()+1000000;t.updateBountyStat('clicksLanded',3);t.updateBountyStat('bossLevelReached',20);
  const assignments=JSON.stringify(s.bounties.map(b=>({id:b.templateId,target:b.target,rewards:b.rewards,progress:b.progress}))),deadline=s.bountyResetAt;
  t.doPrestige(null);if(s.bountyResetAt!==deadline||JSON.stringify(s.bounties.map(b=>({id:b.templateId,target:b.target,rewards:b.rewards,progress:b.progress})))!==assignments)throw Error('contracts reset on Prestige');
  if(s.bountyStats.clicksLanded!==0||click.startAt!==0||click.carriedProgress!==3)throw Error('counter rebase');
  t.updateBountyStat('clicksLanded',1);if(click.progress!==4)throw Error('first post-Prestige action stalled');
  t.updateBountyStat('bossLevelReached',2);if(reach.progress!==20)throw Error('boss objective added levels');
  s.bossLevel=25;s.pbBossLevel=25;t.doPrestige(null);t.updateBountyStat('clicksLanded',1);if(click.progress!==5)throw Error('second Prestige progress');
  t.updateBountyStat('clicksLanded',5);const reward=click.rewards;if(!t.claimBounty(0)||s.merchantReputation!==1)throw Error('carried claim failed');
  s.bossLevel=32;s.pbBossLevel=32;t.doPrestige(null);if(!click.completed||t.claimBounty(0)!==false||s.merchantReputation!==1)throw Error('Prestige repeated reward');
  s.bountyStats.clicksLanded=9999;s.bountyResetAt=Date.now()-1;s.bossLevel=41;s.pbBossLevel=41;t.doPrestige(null);
  if(s.bounties.some(b=>b.startAt!==0||b.carriedProgress!==0)||s.bountyStats.clicksLanded!==0)throw Error('expired contracts generated before reset');
  const old=t.freshState();old.bounties=[{...t.makeBounty(t.BOUNTY_TEMPLATES.find(b=>b.id==='click')),startAt:999,progress:0}];delete old.bounties[0].carriedProgress;old.bountyStats.clicksLanded=0;
  const migrated=t.migrateSave({game:'wardclaw',version:6,state:old});t.setState(migrated);t.updateBountyStat('clicksLanded',1);if(migrated.bounties[0].progress!==1)throw Error('legacy stalled baseline');
 });
 // Populate a full bag, preserve old IDs, and receive excess drops through the real acquisition path.
 const overflowId=await evaluate(()=>{
  const t=__test,s=t.freshState();s.campActive=true;s.equipped.weapon=t.genBossItem('weapon','Equipped','common',1);s.inventory=Array.from({length:10},(_,n)=>t.genBossItem('boots','Bag '+n,'rare',1));t.setState(s);t.resetBossFight(false);
  const oldIds=s.inventory.map(i=>i.id),drop=t.genBossItem('weapon','Overflow Blade','epic',15);t.acquireItem(drop,'Boss drop');
  if(JSON.stringify(s.inventory.map(i=>i.id))!==JSON.stringify(oldIds)||s.overflow.length!==1||s.overflow[0].id!==drop.id)throw Error('full bag lost loot');
  const duplicate=t.genBossItem('weapon','Equipped','legendary',30);s.equipped.weapon=duplicate;t.acquireItem(t.genBossItem('weapon','Equipped','legendary',30),'Academy drop');if(s.overflow.length!==2||s.inventory.length!==10)throw Error('legendary duplicate lost');
  if(t.reclaimOverflow(drop.id)!==false)throw Error('claim bypassed capacity');t.renderAll();return drop.id;
 });
 await page.locator('[data-tab="items"]').click();assert.match(await page.locator('#overflowStash').innerText(),/Overflow Stash \(2\)/);assert.ok(await page.locator(`[data-claimoverflow="${overflowId}"]`).isDisabled());
 await page.locator(`#overflowStash [data-lock="${overflowId}"]`).click();assert.ok(await page.locator(`[data-dismantleoverflow="${overflowId}"]`).isDisabled());
 assert.equal(await evaluate(()=>__test.dismantleFrom('overflow',__test.getState().overflow[0].id)),false);
 await evaluate(()=>{const t=__test,s=t.getState();const item=s.inventory[0];t.toggleItemLock(item.id);const before=s.inventory.length;if(t.dismantleInventory(item.id)!==false||s.inventory.length!==before)throw Error('locked inventory dismantled');t.toggleItemLock(item.id);t.dismantleInventory(item.id);t.reclaimOverflow(s.overflow[0].id);if(s.inventory.length!==10||s.overflow.length!==1)throw Error('reclaim failed');t.equipFromInventory(s.inventory.find(i=>i.name==='Overflow Blade').id);if(!s.equipped.weapon.locked||s.inventory.length!==10)throw Error('lock lost on equip');t.unequipSlot('weapon');if(s.overflow.length!==2||!s.overflow.some(i=>i.name==='Overflow Blade'&&i.locked))throw Error('unequip overflow lost item');t.save();});
 await page.reload();assert.ok(await evaluate(()=>__test.getState().overflow.some(i=>i.name==='Overflow Blade'&&i.locked)));
 await evaluate(()=>{
  const t=__test,s=t.freshState();s.campActive=true;s.bossLevel=20;s.pbBossLevel=20;const item=t.genBossItem('weapon','Locked Keepsake','epic',20);item.locked=true;s.inventory=[item];t.setState(s);t.resetBossFight(false);
  if(t.doPrestige(null)!==false||s.prestigeCount!==0||s.inventory.length!==1)throw Error('Prestige deleted lock');t.equipFromInventory(item.id);if(!t.doPrestige(item.id)||!s.equipped.weapon.locked||!s.equipped.weapon.keptAtPrestige)throw Error('locked keepsake not retained');
  const next=t.freshState();next.campActive=true;const primary=t.genBossItem('boots','Matching Boots','legendary',30),sacrifice=t.genBossItem('boots','Matching Boots','legendary',30);primary.keptAtPrestige=1;sacrifice.keptAtPrestige=1;sacrifice.locked=true;next.legacy=[primary,sacrifice];t.setState(next);t.resetBossFight(false);
  if(t.findFusionPartner(primary)||t.performFusion(primary.id,sacrifice.id)!==false||next.legacy.length!==2)throw Error('locked sacrifice lost');t.toggleItemLock(sacrifice.id);primary.fusionLevel=5;if(t.performFusion(primary.id,sacrifice.id)!==false||next.legacy.length!==2)throw Error('max-level fusion consumed');primary.fusionLevel=0;primary.locked=true;if(!t.performFusion(primary.id,sacrifice.id)||next.legacy.length!==1||!primary.locked)throw Error('safe fusion failed');
  const full=t.freshState();full.campActive=true;full.bossLevel=20;full.pbBossLevel=20;full.legacy=Array.from({length:25},(_,n)=>{const i=t.genBossItem('weapon','Vault '+n,'common',1);i.keptAtPrestige=1;return i;});const old=t.genBossItem('chest','Overflow Legacy','rare',1);old.keptAtPrestige=1;old.locked=true;full.equipped.chest=old;t.setState(full);t.resetBossFight(false);t.unequipSlot('chest');if(!full.overflow.some(i=>i.id===old.id))throw Error('full vault unequip lost');t.doPrestige(null);if(!t.allOwnedItems().some(i=>i.id===old.id&&i.locked))throw Error('Legacy overflow reset');
 });
 // A constant RNG cannot cause duplicate crafting; exhausting every recipe is safe.
 await evaluate(()=>{
  const t=__test,s=t.freshState();s.campActive=true;s.materials=1000;s.blueprints.common=40;t.setState(s);t.setRarity('common');t.resetBossFight(false);document.getElementById('craftSlot').value='weapon';
  const old=Math.random;try{Math.random=()=>0;for(let n=0;n<15;n++){t.craft();s.overflow.push(...s.inventory);s.inventory=[];}}finally{Math.random=old;}
  const items=t.allOwnedItems();if(items.length!==15||new Set(items.map(i=>i.name)).size!==15||s.blueprints.common!==25||s.materials!==955)throw Error('duplicate crafting');
  const before=JSON.stringify({materials:s.materials,blueprints:s.blueprints,items});if(t.craft()!==false||JSON.stringify({materials:s.materials,blueprints:s.blueprints,items:t.allOwnedItems()})!==before)throw Error('exhausted recipe spent');t.renderAll();
 });
 await page.locator('[data-tab="items"]').click();
 assert.ok(await page.locator('#craftBtn').isDisabled());assert.match(await page.locator('#craftBtn').innerText(),/All recipes owned/);await page.locator('#craftSlot').selectOption('boots');assert.equal(await page.locator('#craftBtn').isDisabled(),false);
 // Encounter-specific choices exercise distinct costs and payouts, not just different text.
 const variants=await evaluate(()=>{
  const t=__test,out={};function setup(kind,tierKey='short'){const s=t.freshState();s.campActive=true;s.prestigeCount=3;s.bossLevel=30;s.pbBossLevel=30;s.gold=1e9;s.resources.supplies=20;s.academy.unlocked=true;const a=t.makeAdventurer();a.encounter={kind,mission:{tierKey,routeKey:'safe',provision:'none',startedAt:0,returnAt:1}};s.academy.adventurers=[a];t.setState(s);t.resetBossFight(false);return {s,a};}
  for(const kind of ['caravan','ruins','bridge']){
   const {a}=setup(kind);out[kind]=t.encounterOptions(a);
   for(const choice of ['negotiate','fight','explore']){const {s,a}=setup(kind),o=t.encounterOptions(a)[choice],expected=t.expeditionExclusiveRewards(a.encounter.mission,o),supplies=s.resources.supplies,old=Math.random;try{Math.random=()=>0;if(!t.resolveEncounter(a.id,choice)||s.academySigils!==expected.sigils||Object.values(s.blueprintFragments).reduce((n,v)=>n+v,0)!==expected.fragments||s.resources.supplies!==supplies-o.suppliesCost+o.supplies)throw Error('scenario outcome '+kind+' '+choice);}finally{Math.random=old;}if(t.resolveEncounter(a.id,choice)!==false)throw Error('repeated encounter');}
  }
  const {s,a}=setup('bridge');s.resources.supplies=0;const before=JSON.stringify(s);if(t.resolveEncounter(a.id,'explore')!==false||JSON.stringify(s)!==before)throw Error('bridge supply guard');
  const old=Math.random;try{Math.random=()=>0.999;if(!t.resolveEncounter(a.id,'negotiate')||a.injuredUntil)throw Error('guaranteed toll failed');}finally{Math.random=old;}
  for(const [kind,multiplier] of [['ruins',1.25],['bridge',1.5]]){const {s,a}=setup(kind),old=Math.random;try{Math.random=()=>0.999;t.resolveEncounter(a.id,'fight');const remaining=a.injuredUntil-Date.now();if(remaining<30*60000*0.5*multiplier-500||s.academySigils!==0)throw Error('scenario recovery '+kind);}finally{Math.random=old;}}
  const short=setup('ruins','short'),shortFind=t.expeditionExclusiveRewards(short.a.encounter.mission,t.encounterOptions(short.a).explore),long=setup('ruins','long'),longFind=t.expeditionExclusiveRewards(long.a.encounter.mission,t.encounterOptions(long.a).explore);
  if(longFind.sigils/8<=shortFind.sigils/0.5||longFind.fragments/8<=shortFind.fragments/0.5)throw Error('long reward rate not improved');
  setup('caravan');t.renderAll();return out;
 });
 assert.ok(variants.caravan.negotiate.supplies>0);assert.ok(variants.caravan.explore.herbs>0);assert.ok(variants.ruins.explore.fragmentMult>variants.caravan.explore.fragmentMult);assert.equal(variants.bridge.negotiate.chance,1);assert.ok(variants.bridge.explore.suppliesCost>0);
 await page.locator('[data-tab="academy"]').click();assert.match(await page.locator('#academyContent').innerText(),/Aid the caravan/);assert.match(await page.locator('#academyContent').innerText(),/On success:/);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'mobile overflow');
 assert.deepEqual(errors,[]);console.log('PASS: daily contract continuity/counter rebase/absolute boss goals/expiry/legacy baseline repair, loot overflow/reclaim/locking/equipment moves/reload/Prestige/fusion, duplicate-free and exhausted crafting, all nine scenario choices/cost guards/guaranteed passage/injury differences, improved long-mission rates and mobile encounter previews.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
