const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const html=fs.readFileSync(path.join(__dirname,'..','wardclaw_v22.html'),'utf8').replace('})();\n</script>','window.__test={freshState,getState:()=>S,setState:s=>{S=s},genBossItem,resetBossFight,tick,triggerHitLogic,derived,applyPlayerHit,doPrestige,renderAll,save};\n})();\n</script>');
 await page.route('https://wardclaw.test/**',r=>r.fulfill({contentType:'text/html',body:html}));await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.goto('https://wardclaw.test/');
 assert.ok(await page.locator('html').evaluate(e=>e.classList.contains('reduced-motion')));
 assert.match(await page.locator('.currencies').innerText(),/Gold[\s\S]*Essence[\s\S]*Materials[\s\S]*Favor/);
 await page.waitForTimeout(1100);
 const hp=await page.evaluate(()=>__test.getState().bossHp);
 await page.keyboard.press('Space');assert.ok(await page.evaluate(()=>__test.getState().bossHp)<hp);
 const capped=await page.evaluate(()=>__test.getState().bossHp);await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__test.getState().bossHp),capped);
 await page.waitForTimeout(1100);await page.locator('#bossSvgWrap').focus();await page.keyboard.press('Enter');assert.ok(await page.evaluate(()=>__test.getState().bossHp)<capped);
 await page.locator('[data-tab="prestige"]').click();
 const hidden=await page.evaluate(()=>__test.getState().bossHp);await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>__test.getState().bossHp),hidden);
 await page.locator('#motionSetting').selectOption('full');assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('reduced-motion')),false);
 await page.locator('#motionSetting').selectOption('reduce');await page.reload();assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('reduced-motion')),true);
 await page.locator('[data-tab="combat"]').click();
 // Exercise actual combat paths with deterministic outcomes.
 await page.evaluate(()=>{
   const t=__test,s=t.freshState();s.bossLevel=30;s.pbBossLevel=30;t.setState(s);t.resetBossFight(false);s.playerHp=10;s.bossHp=100000;
   for(const [slot,stat,value] of [['necklace','lifestealPct',100],['legs','thornDmg',100],['shield','blockChance',100]]){
     const i=t.genBossItem(slot,'Test '+slot,'common',1);i.bonuses=[{stat,value,label:stat,suffix:'%'}];s.equipped[slot]=i;
   }
   t.applyPlayerHit('test');
 });
 assert.ok(await page.locator('.floater.heal').count()>0);assert.match(await page.locator('.floater.heal').first().innerText(),/LIFESTEAL/);
 assert.ok(await page.locator('.floater.reflect').count()>0);
 await page.evaluate(()=>{const old=Math.random;try{Math.random=()=>0.99;__test.getState().atkTimerMs=3000;__test.tick();}finally{Math.random=old;}});
 assert.ok(await page.locator('.floater.block').count()>0);
 await page.evaluate(()=>{const s=__test.getState(),i=__test.genBossItem('helmet','Dodge Helm','common',1);i.bonuses=[{stat:'dodgeFlat',value:75,label:'Dodge',suffix:'%'}];s.equipped.helmet=i;const old=Math.random;try{Math.random=()=>0;s.atkTimerMs=3000;__test.tick();}finally{Math.random=old;}});
 assert.ok(await page.locator('.floater.dodge').count()>0);assert.match(await page.locator('#combatFeedback').innerText(),/DODGED/);
 assert.equal(await page.locator('.floater').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await page.locator('[data-tab="prestige"]').click();await page.locator('#autoLegacySetting').uncheck();
 const manual=await page.evaluate(()=>{const t=__test,s=t.freshState();s.bossLevel=20;s.pbBossLevel=20;const i=t.genBossItem('weapon','Keepsake','common',1);s.equipped.weapon=i;t.setState(s);t.doPrestige(i.id);return {stored:t.getState().legacy.length,equipped:t.getState().equipped.weapon};});
 assert.equal(manual.stored,1);assert.equal(manual.equipped,null);
 await page.locator('#autoLegacySetting').check();
 const automatic=await page.evaluate(()=>{const t=__test,s=t.freshState();s.bossLevel=20;s.pbBossLevel=20;for(const slot of ['weapon','chest']){const i=t.genBossItem(slot,'Legacy '+slot,'common',1);i.keptAtPrestige=1;s.legacy.push(i);}t.setState(s);t.doPrestige(null);return {weapon:!!t.getState().equipped.weapon,chest:!!t.getState().equipped.chest,hp:t.getState().playerHp,max:t.getState().playerMaxHp,stored:t.getState().legacy.length};});
 assert.ok(automatic.weapon&&automatic.chest);assert.equal(automatic.hp,automatic.max);assert.equal(automatic.stored,0);
 // Failed prestige must not move or duplicate equipped Legacy gear.
 const atomic=await page.evaluate(()=>{const t=__test,s=t.freshState();s.bossLevel=20;for(let n=0;n<25;n++){const i=t.genBossItem('weapon','Vault '+n,'common',1);i.keptAtPrestige=1;s.legacy.push(i);}const old=t.genBossItem('chest','Old chest','common',1);old.keptAtPrestige=1;s.equipped.chest=old;const keep=t.genBossItem('boots','New boots','common',1);s.equipped.boots=keep;t.setState(s);const ok=t.doPrestige(keep.id);return {ok,stored:s.legacy.length,chest:s.equipped.chest.id===old.id};});assert.equal(atomic.ok,false);assert.equal(atomic.stored,25);assert.ok(atomic.chest);
 assert.deepEqual(errors,[]);console.log('PASS: keyboard attacks/cooldown/focus guards, currency labels, device and saved motion preferences, actual lifesteal/reflection/block/dodge feedback, Legacy auto/manual equipment and full-health restart, atomic full-vault failure.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
