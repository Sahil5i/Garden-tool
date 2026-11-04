/* Garden Calculator Pro rebuilt — vanilla JS, same verified formula as the old site.
   Base: er(plant,weight) piecewise flat / coeff*weight^2, or weight^2 fallback.
   Variant: none 1, silver 5, gold 20, rainbow 50, diamond 50.
   Mutations: additive above x1 — bracket = sum(multipliers) - count + 1, only formula-active (Qn) keys count.
   Friend: 1, 1.1, 1.2, 1.3, 1.4, 1.5. Final = ceil(er * variant * bracket) * amount * friend, rounded.
   Pets: effective weight = w<=100 ? w : 100+(w-100)/4; hatch = base*(100-bonus)/100, bonus capped 99;
   XP cumulative = 125*level*(level-1). */
let DATA = null;
const $ = (s, el=document) => el.querySelector(s);
const norm = s => String(s||'').replace(/[^a-zA-Z0-9]/g,'').toLowerCase();
const displayName = id => id.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^\w/, c=>c.toUpperCase()).replace(/_/g,' ');
const fmt = n => '≈$' + Math.round(n).toLocaleString('en-US');
function plantValue(plantId, weight, tier, mutKeys, amount, friends){
  const p = DATA.plants[plantId];
  const base = p ? (weight <= p.threshold ? p.flat : p.coeff * weight * weight) : weight * weight;
  const variant = tier==='rainbow'||tier==='diamond' ? 50 : tier==='gold' ? 20 : tier==='silver' ? 5 : 1;
  let sum=0, cnt=0, active=[];
  (mutKeys||[]).forEach(k=>{ const m=DATA.formulaMutations[k]; if(m!==undefined){sum+=m; cnt++; active.push(k);} });
  const bracket = cnt ? (sum - cnt + 1) : 1;
  const core = Math.ceil(base * variant * bracket);
  const friend = [1,1.1,1.2,1.3,1.4,1.5][Math.max(0,Math.min(5, friends||0))];
  const total = Math.round(core * (amount||1) * friend);
  return {base, variant, bracket, core, friend, total, active};
}
function valueToWeight(plantId, target, tier, mutKeys, amount, friends){
  let best=null;
  for(let w=0.01; w<=200; w+=0.03){
    const v = plantValue(plantId, w, tier, mutKeys, amount, friends).total;
    const d = Math.abs(v-target);
    if(!best || d<best.d) best={w, v, d};
  }
  return best;
}
function buildPlantCalculator(root, opts={}){
  const prefix = opts.prefix || 'c';
  const plants = Object.keys(DATA.baseWeights).sort();
  const cats = Object.keys(DATA.categories).filter(c=>c!=='All'&&c!=='BaseValue');
  root.innerHTML = `
  <div class="grid-two">
    <div>
      <div class="field"><label>Category</label><select id="${prefix}-cat"><option value="">All plants</option>${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
      <div class="field"><label>Plant</label><select id="${prefix}-plant">${plants.map(p=>`<option value="${p}">${displayName(p)}</option>`).join('')}</select></div>
      <div class="field"><label>Weight (kg)</label><input id="${prefix}-weight" type="number" step="0.01" min="0.01" value="1"></div>
      <div class="field"><label>Fruit tier / variant</label><select id="${prefix}-tier"><option value="none">None ×1</option><option value="silver">Silver ×5</option><option value="gold">Gold ×20</option><option value="rainbow">Rainbow ×50</option><option value="diamond">Diamond ×50</option></select></div>
      <div class="field"><label>Amount</label><input id="${prefix}-amount" type="number" min="1" value="1"></div>
      <div class="field"><label>Friend boost (0–5 friends, +10% each)</label><input id="${prefix}-friends" type="range" min="0" max="5" step="1" value="0"> <span id="${prefix}-friends-label">0 friends (+0%)</span></div>
      <div class="field"><label>Target value (Value → Weight mode, optional)</label><input id="${prefix}-target" type="number" placeholder="Leave blank for normal mode"></div>
    </div>
    <div>
      <div class="field"><label>Search mutations</label><input id="${prefix}-mutsearch" type="search" placeholder="e.g. Shocked…"></div>
      <div class="mut-list" id="${prefix}-mutlist"></div>
      <div id="${prefix}-warn"></div>
    </div>
  </div>
  <div class="card" style="margin:1rem 0 0"><div class="big-value" id="${prefix}-result">—</div><div id="${prefix}-breakdown" class="small muted"></div><div style="margin-top:.8rem;display:flex;gap:.5rem;flex-wrap:wrap"><button class="btn" id="${prefix}-save">Add to trade list</button><button class="btn secondary" id="${prefix}-clear">Clear mutations</button></div></div>
  <div class="card"><h3>Saved trade list</h3><ul id="${prefix}-list"></ul><p><strong>Total: <span id="${prefix}-listtotal">≈$0</span></strong></p><button class="btn secondary" id="${prefix}-clearlist">Clear list</button></div>`;
  const plantSel=$('#'+prefix+'-plant',root), weightEl=$('#'+prefix+'-weight',root), catSel=$('#'+prefix+'-cat',root);
  const mutList=$('#'+prefix+'-mutlist',root), mutSearch=$('#'+prefix+'-mutsearch',root);
  let saved=[]; try{saved=JSON.parse(localStorage.getItem('gcp_trade_list_v2')||'[]')}catch(e){saved=[]}
  function renderMutations(){
    const q=norm(mutSearch.value);
    const keys=Object.keys(DATA.formulaMutations).sort((a,b)=>DATA.formulaMutations[b]-DATA.formulaMutations[a]);
    mutList.innerHTML=keys.filter(k=>!q||k.includes(q)).map(k=>`<label><input type="checkbox" value="${k}" class="${prefix}-mut"> <span><strong>${k}</strong> <span class="mut-x">×${DATA.formulaMutations[k]}</span></span></label>`).join('');
    mutList.querySelectorAll('input').forEach(i=>i.addEventListener('change',calc));
  }
  function refreshPlants(){
    const cat=catSel.value; const allowed=cat?new Set(DATA.categories[cat]||[]):null;
    const list=plants.filter(p=>!allowed||allowed.has(p));
    plantSel.innerHTML=list.map(p=>`<option value="${p}">${displayName(p)}</option>`).join('');
    if(list.length){ plantSel.value=list[0]; weightEl.value=DATA.baseWeights[list[0]]||1; }
    calc();
  }
  function calc(){
    const pid=plantSel.value, w=parseFloat(weightEl.value)||0, tier=$('#'+prefix+'-tier',root).value, amt=parseInt($('#'+prefix+'-amount',root).value)||1, fr=parseInt($('#'+prefix+'-friends',root).value)||0;
    const friendsLabel=$('#'+prefix+'-friends-label',root); if(friendsLabel) friendsLabel.textContent=`${fr} friend${fr===1?'':'s'} (+${fr*10}%)`;
    const muts=[...root.querySelectorAll('.'+prefix+'-mut:checked')].map(i=>i.value);
    const target=parseFloat($('#'+prefix+'-target',root).value);
    const warn=$('#'+prefix+'-warn',root);
    let warns=[];
    if(muts.includes('wet')&&muts.includes('chilled')) warns.push('Wet + Chilled can fuse to Frozen — check Frozen instead of counting all three.');
    if(muts.includes('gold')||muts.includes('rainbow')) warns.push('Note: Gold/Rainbow here are mutation keys, not the fruit tier — tier is selected separately above.');
    warn.innerHTML=warns.length?`<div class="warn">${warns.join('<br>')}</div>`:'';
    const r=plantValue(pid,w,tier,muts,amt,fr);
    $('#'+prefix+'-result',root).textContent=fmt(r.total);
    $('#'+prefix+'-breakdown',root).innerHTML=`Base (from weight) ${fmt(r.base)} · Variant ×${r.variant} · Mutation bracket ×${r.bracket} (${r.active.length} formula mutations) · Amount ×${amt} · Friend ×${r.friend}<br>Plant: ${displayName(pid)} · Weight ${w} kg · Tier ${tier}`;
    if(target){
      const est=valueToWeight(pid,target,tier,muts,amt,fr);
      $('#'+prefix+'-breakdown',root).innerHTML+=`<br><strong>Value → Weight:</strong> about ${est.w.toFixed(2)} kg gives ${fmt(est.v)} for target ${fmt(target)} (estimate, scanned in 0.03 kg steps).`;
    }
    renderList();
  }
  function renderList(){
    const ul=$('#'+prefix+'-list',root); if(!ul) return;
    ul.innerHTML=saved.length?saved.map((s,i)=>`<li>${s.label} — ${fmt(s.value)}</li>`).join(''):'<li class="muted">No lines yet. Calculate a plant, then Add to trade list.</li>';
    const tot=saved.reduce((a,s)=>a+s.value,0); const el=$('#'+prefix+'-listtotal',root); if(el) el.textContent=fmt(tot);
    if(opts.onListTotal) opts.onListTotal(tot);
  }
  $('#'+prefix+'-save',root).addEventListener('click',()=>{
    const pid=plantSel.value, w=parseFloat(weightEl.value)||0, tier=$('#'+prefix+'-tier',root).value, amt=parseInt($('#'+prefix+'-amount',root).value)||1, fr=parseInt($('#'+prefix+'-friends',root).value)||0;
    const muts=[...root.querySelectorAll('.'+prefix+'-mut:checked')].map(i=>i.value);
    const r=plantValue(pid,w,tier,muts,amt,fr);
    saved.push({label:`${displayName(pid)} · ${w}kg · ${tier} · ${muts.length} mutations`, value:r.total});
    try{localStorage.setItem('gcp_trade_list_v2', JSON.stringify(saved))}catch(e){}
    renderList();
  });
  $('#'+prefix+'-clear',root).addEventListener('click',()=>{root.querySelectorAll('.'+prefix+'-mut:checked').forEach(i=>i.checked=false); calc();});
  $('#'+prefix+'-clearlist',root).addEventListener('click',()=>{saved=[]; try{localStorage.removeItem('gcp_trade_list_v2')}catch(e){} renderList();});
  catSel.addEventListener('change',refreshPlants);
  plantSel.addEventListener('change',()=>{weightEl.value=DATA.baseWeights[plantSel.value]||1; calc();});
  ['weight','tier','amount','friends','target'].forEach(id=>{const el=$('#'+prefix+'-'+id,root); if(el) el.addEventListener('input',calc);});
  mutSearch.addEventListener('input',renderMutations);
  renderMutations(); refreshPlants(); renderList();
  return {getTotal:()=>saved.reduce((a,s)=>a+s.value,0)};
}
function buildPetCalculator(root){
  root.innerHTML=`
  <div class="grid-two">
    <div class="field"><label>Displayed weight (kg)</label><input id="pet-weight" type="number" value="110" step="0.1"></div>
    <div class="field"><label>Base hatch time (seconds)</label><input id="pet-hatch" type="number" value="300"></div>
    <div class="field"><label>Hatch speed bonus (%)</label><input id="pet-bonus" type="number" value="25" min="0" max="99"></div>
    <div class="field"><label>Target level</label><input id="pet-level" type="number" value="10" min="2" max="999"></div>
  </div>
  <div class="big-value" id="pet-result"></div><div id="pet-breakdown" class="small muted"></div>`;
  function calc(){
    const w=parseFloat($('#pet-weight',root).value)||0, base=parseFloat($('#pet-hatch',root).value)||0, bonus=Math.max(0,Math.min(99,parseFloat($('#pet-bonus',root).value)||0)), lvl=Math.max(2,parseInt($('#pet-level',root).value)||2);
    const eff = w<=100 ? w : 100+(w-100)/4;
    const hatch = base*(100-bonus)/100;
    const xp = 125*lvl*(lvl-1);
    $('#pet-result',root).textContent=`Effective weight ${eff.toFixed(2)} kg`;
    $('#pet-breakdown',root).innerHTML=`Displayed ${w} kg · Past 100 kg only one-quarter of extra mass counts · Hatch time ${hatch.toFixed(1)}s (bonus ${bonus}%, capped at 99%) · Cumulative XP to level ${lvl}: ${xp.toLocaleString('en-US')}`;
  }
  root.querySelectorAll('input').forEach(i=>i.addEventListener('input',calc)); calc();
}
function buildValueList(root){
  root.innerHTML=`<div class="field"><label>Search plants</label><input id="vl-search" type="search" placeholder="e.g. carrot…"></div><div class="field"><label>Sort</label><select id="vl-sort"><option value="value-desc">Base value high → low</option><option value="value-asc">Base value low → high</option><option value="name">Name A → Z</option></select></div><div class="table-wrap"><table><thead><tr><th>Plant</th><th>Base value</th><th>Base weight (kg)</th><th>Category</th></tr></thead><tbody id="vl-body"></tbody></table></div><p class="small muted">Base value is the flat value from the calculator's piecewise table at base weight. 354 plants from the calculator data; plants without a piecewise entry use weight² only and are shown with their base weight.</p>`;
  const allPlants=Object.keys(DATA.baseWeights).sort();
  function catOf(pid){ for(const [c,list] of Object.entries(DATA.categories)){ if(c!=='All'&&c!=='BaseValue'&&list.includes(pid)) return c; } return 'Other'; }
  function render(){
    const q=norm($('#vl-search',root).value), sort=$('#vl-sort',root).value;
    let rows=allPlants.filter(p=>!q||norm(p).includes(q)).map(p=>({p, v: DATA.plants[p]?DATA.plants[p].flat:0, w: DATA.baseWeights[p]||1, c: catOf(p)}));
    if(sort==='value-desc') rows.sort((a,b)=>b.v-a.v); else if(sort==='value-asc') rows.sort((a,b)=>a.v-b.v); else rows.sort((a,b)=>a.p.localeCompare(b.p));
    $('#vl-body',root).innerHTML=rows.map(r=>`<tr><td><strong>${displayName(r.p)}</strong></td><td>${r.v?fmt(r.v):'— (weight² only)'}</td><td>${r.w}</td><td>${r.c}</td></tr>`).join('');
  }
  $('#vl-search',root).addEventListener('input',render); $('#vl-sort',root).addEventListener('change',render); render();
}
document.addEventListener('DOMContentLoaded', async ()=>{
  try{ const res=await fetch('/assets/data.json'); DATA=await res.json(); }catch(e){ return; }
  document.querySelectorAll('[data-calculator]').forEach(el=>buildPlantCalculator(el,{prefix: el.dataset.calculator, onListTotal: el.dataset.ontotal?null:null}));
  document.querySelectorAll('[data-pet]').forEach(el=>buildPetCalculator(el));
  document.querySelectorAll('[data-valuelist]').forEach(el=>buildValueList(el));
  // Trade page: two calculators, ratio + verdict
  const tradeA=$('#trade-a'), tradeB=$('#trade-b');
  if(tradeA && tradeB){
    const a=buildPlantCalculator(tradeA,{prefix:'ta'}), b=buildPlantCalculator(tradeB,{prefix:'tb'});
    const out=$('#trade-verdict');
    const update=()=>{ const ta=a.getTotal(), tb=b.getTotal(); if(!ta||!tb){out.textContent='Add at least one line to each side to get a verdict.'; return;} const ratio=ta/tb; const verdict=ratio>=1.1?'WIN':ratio>=0.9?'FAIR':'LOSE'; out.innerHTML=`<strong>${verdict}</strong> — Your side ${fmt(ta)} vs their side ${fmt(tb)} · Ratio ${ratio.toFixed(2)} · Difference ${fmt(Math.abs(ta-tb))} · Win ≥1.10, Fair 0.90–1.10, Lose &lt;0.90`; };
    setInterval(update, 1000);
  }
});
