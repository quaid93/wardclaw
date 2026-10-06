const {chromium}=require('playwright');
const fs=require('fs'), assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({acceptDownloads:true});
 const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync(require('path').join(__dirname,'..','wardclaw_v22.html'),'utf8');
 await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html.replace('})();\n</script>','window.__test={migrateSave,freshState,save,doPrestige,getState:()=>S,setState:v=>{S=v},genBossItem,DISPATCH_TIERS,generateDailyBounties};\n})();\n</script>')}));
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.goto('https://wardclaw.test/');
 await page.locator('[data-tab="prestige"]').click();
 assert.match(await page.locator('#tab-prestige').innerText(),/Garden upgrades carry|garden upgrades/);
 const migration=await page.evaluate(()=>{
   const t=window.__test;
   const old={gold:123,bossLevel:7,stats:{atk:4},perks:{extraHp:2},academy:{unlocked:true,adventurers:[]},harvests:{seeds:[]},materials:20};
   const m=t.migrateSave(old);
   if(m.stats.hp!==0||m.stats.atk!==4||m.perks.goldBonusPct!==0||m.harvests.plots.length!==0||m.lifetimeMaterials!==20)throw Error('nested migration failed');
   return m.gold;
 });
 assert.equal(migration,123);
 const populated=await page.evaluate(()=>{
   const t=__test,s=t.freshState(),now=Date.now();s.materials=20;s.lifetimeMaterials=20;s.prestigeCount=3;
   s.harvests={seeds:[{id:1,templateId:'wheat',obtainedAt:now}],plots:[null,{id:2,templateId:'herb',plantedAt:now,harvestedAt:null}],lastAutoHarvest:now};
   s.academy={unlocked:true,adventurers:[{id:3,name:'Rowan',level:2,xp:3,gear:{tool:1,armor:2},busy:{tierKey:Object.keys(t.DISPATCH_TIERS)[0],startedAt:now,returnAt:now+999999},injuredUntil:null}]};
   // Use a real generated mission key rather than assumptions about tiers.
   s.exchangeStock=Object.fromEntries(['common','rare','epic','legendary'].map(r=>[r,{item:t.genBossItem('weapon','Market Blade',r,30),sold:false}]));
   t.setState(s);s.bounties=t.generateDailyBounties();s.bountyResetAt=now+86400000;s.exchangeRefreshAt=now+21600000;
   const restored=t.migrateSave(JSON.parse(JSON.stringify(s)));
   if(restored.academy.adventurers[0].gear.armor!==2||restored.harvests.plots[1].templateId!=='herb'||restored.bounties.length!==3)throw Error('populated migration failed');
   t.setState(t.freshState());return true;
 });
 assert.ok(populated);
 // Full real save roundtrip with nested item, crop, bounty and stock data.
 const roundtrip=await page.evaluate(()=>{const t=__test,s=t.getState();s.inventory.push(t.genBossItem('weapon','Test Blade','legendary',30));t.save();const raw=JSON.parse(localStorage.getItem('wardclaw_save_v2'));return JSON.stringify(t.migrateSave(raw))===JSON.stringify(t.migrateSave(raw.state));});assert.ok(roundtrip);
 await page.locator('#backupSaveBtn').click();await page.locator('#backupConfirm').click();
 const backup=await page.evaluate(()=>localStorage.getItem('wardclaw_backup_v1'));assert.ok(backup);
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#exportSaveBtn').click()]);
 const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.game,'wardclaw');assert.equal(exported.version,10);
 exported.state.gold=54321;
 await page.locator('#importSaveFile').setInputFiles({name:'save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
 await page.locator('#saveReplaceCancel').click();assert.notEqual(await page.evaluate(()=>__test.getState().gold),54321);
 await page.locator('#importSaveFile').setInputFiles({name:'save.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});
 await page.locator('#saveReplaceConfirm').click();assert.equal(await page.evaluate(()=>__test.getState().gold),54321);
 await page.locator('#restoreSaveBtn').click();await page.locator('#saveReplaceConfirm').click();assert.notEqual(await page.evaluate(()=>__test.getState().gold),54321);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('wardclaw_backup_v1')).state.gold),54321);
 const before=await page.evaluate(()=>localStorage.getItem('wardclaw_save_v2'));
 for(const bad of ['{bad',JSON.stringify({hello:1}),JSON.stringify({...exported,version:999}),JSON.stringify({...exported,state:{...exported.state,stats:null}}),JSON.stringify({...exported,state:{...exported.state,inventory:[{...exported.state.inventory[0],name:'<img src=x onerror=alert(1)>'}]}})]){
   await page.locator('#importSaveFile').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(bad)});
   await page.waitForTimeout(50);assert.equal(await page.locator('#saveReplaceConfirm').count(),0);
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('wardclaw_save_v2')),before);
 await page.evaluate(()=>{window.removeEventListener('beforeunload',__test.save);localStorage.setItem('wardclaw_save_v2','broken original');});
 await page.reload();await page.waitForTimeout(5200);
 assert.equal(await page.evaluate(()=>localStorage.getItem('wardclaw_save_v2')),'broken original');
 await page.locator('[data-tab="prestige"]').click();assert.match(await page.locator('#saveStatus').innerText(),/Autosave is paused/);
 await page.locator('#restoreSaveBtn').click();await page.locator('#saveReplaceConfirm').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('wardclaw_save_v2_recovery')),'broken original');
 assert.equal(await page.evaluate(()=>__test.getState().gold),54321);
 const prestige=await page.evaluate(()=>{const t=__test,s=t.freshState();s.bossLevel=20;s.pbBossLevel=20;s.gold=200;s.materials=15;s.favor=3;s.harvestUpgrades.slots2=true;s.harvestBossesEncountered=[10];s.lifetimeMaterials=30;const item=t.genBossItem('weapon','Legacy Blade','common',1);item.keptAtPrestige=1;s.equipped.weapon=item;t.setState(s);t.doPrestige(null);return t.getState();});
 assert.equal(prestige.gold,0);assert.equal(prestige.bossLevel,1);assert.equal(prestige.materials,15);assert.equal(prestige.favor,3);assert.equal(prestige.harvestUpgrades.slots2,true);assert.equal(prestige.legacy.length,0);assert.equal(prestige.equipped.weapon.name,"Legacy Blade");assert.deepEqual(prestige.harvestBossesEncountered,[10]);
 await page.reload();assert.equal(await page.evaluate(()=>__test.getState().prestigeCount),1);
 assert.deepEqual(errors,[]); console.log('PASS: nested legacy migration, save roundtrip, export, backup, import/cancel, backup swap, invalid/future/malicious rejection, corrupted-save protection/recovery, prestige carry-over and reload; no browser errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
