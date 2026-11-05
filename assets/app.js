/* Garden Calculator Pro — real gardening calculators. All formulas are standard, unit-based, and shown on each page. */
function num(id, defv){ const el=document.getElementById(id); const v=parseFloat(el&&el.value); return isFinite(v)?v:defv; }
function out(id, html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
function fmt(n, d){ return (d===undefined?2:d)===0 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US',{maximumFractionDigits:d}); }
// Soil / mulch volume: L ft x W ft x D in -> cu ft = L*W*D/12, cu yd = cu ft/27, bags at bagSize cu ft
function calcVolume(){
  const L=convertLen(num('vol-length',4)), W=convertLen(num('vol-width',8)), D=convertDepth(num('vol-depth',12)), bag=num('vol-bag',2);
  const cuft=L*W*D/12, cuyd=cuft/27, bags=Math.ceil(cuft/bag);
  out('vol-result', `<strong>${fmt(cuft)} cubic feet</strong> · ${fmt(cuyd)} cubic yards · about ${bags} bags of ${bag} cu ft (round up, allow for settling).`);
}
function calcSpacing(){
  const area=num('sp-area',32), spacing=num('sp-spacing',12), mode=document.getElementById('sp-mode')?document.getElementById('sp-mode').value:'square';
  const sFt=spacing/12, per = mode==='triangular' ? (area/(sFt*sFt*0.866)) : (area/(sFt*sFt));
  out('sp-result', `<strong>About ${fmt(Math.floor(per),0)} plants</strong> in ${area} sq ft at ${spacing} in spacing (${mode} layout). Triangular spacing fits about 15% more than square.`);
}
function calcSeed(){
  const area=num('seed-area',32), spacing=num('seed-spacing',12), germ=num('seed-germ',85);
  const sFt=spacing/12, plants=area/(sFt*sFt), seeds=Math.ceil(plants/(germ/100));
  out('seed-result', `<strong>About ${fmt(plants,0)} plants, sow about ${fmt(seeds,0)} seeds</strong> at ${germ}% germination. Sow a few extra for losses, then thin to spacing.`);
}
function calcFert(){
  const need=num('fert-need',1), area=num('fert-area',1000), grade=num('fert-grade',10);
  const product=(need*area/1000)/(grade/100);
  out('fert-result', `<strong>${fmt(product)} lb of product at ${grade}% nitrogen</strong> to supply ${need} lb of nitrogen per 1,000 sq ft over ${area} sq ft. Use the first NPK number (N) only — e.g. 10-10-10 means 10% N.`);
}
function calcWater(){
  const area=num('water-area',32), inches=num('water-inches',1);
  const gal=area*inches*0.623, litres=gal*3.785;
  out('water-result', `<strong>About ${fmt(gal)} gallons (${fmt(litres)} litres)</strong> to apply ${inches} inch of water over ${area} sq ft. 1 inch over 1 sq ft = 0.623 gallons.`);
}
function calcContainer(){
  const d=num('pot-d',12), h=num('pot-h',12);
  const r=d/2, cuin=Math.PI*r*r*h, cuft=cuin/1728;
  out('pot-result', `<strong>About ${fmt(cuft)} cubic feet (${fmt(cuin,0)} cubic inches)</strong> of potting mix for a ${d} in diameter × ${h} in tall pot. Tapered pots hold less — use this as an upper estimate.`);
}
function calcCompost(){
  const greens=num('comp-greens',10);
  // Honest rule, not a precise formula: about 2-3 parts browns to 1 part greens by volume for a pile near 30:1 C:N.
  out('comp-result', `<strong>Aim for about 2–3 parts browns (dry leaves, straw) to 1 part greens (fresh clippings, kitchen scraps) by volume</strong> for a pile starting near 30:1 C:N. You entered ${greens} parts greens — add about ${fmt(greens*2.5)} parts browns, keep it moist like a wrung sponge, and turn it regularly.`);
}
function calcCalendar(){
  const frost=document.getElementById('cal-frost')?document.getElementById('cal-frost').value:'';
  const weeks=num('cal-weeks',6);
  if(!frost){ out('cal-result','Enter your last frost date above.'); return; }
  const f=new Date(frost+'T12:00:00Z'), sow=new Date(f), trans=new Date(f);
  sow.setUTCDate(sow.getUTCDate()-weeks*7);
  const fmtD=d=>d.toISOString().slice(0,10);
  out('cal-result', `<strong>Sow indoors around ${fmtD(sow)}, transplant around ${fmtD(trans)}</strong> (last frost). Harden seedlings off for a week before transplanting.`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  const bind=(btn, fn)=>{ const el=document.getElementById(btn); if(el) el.addEventListener('click', fn); };
  bind('vol-calc', calcVolume); bind('sp-calc', calcSpacing); bind('seed-calc', calcSeed); bind('fert-calc', calcFert); bind('water-calc', calcWater); bind('pot-calc', calcContainer); bind('comp-calc', calcCompost); bind('cal-calc', calcCalendar);
  ['vol-length','vol-width','vol-depth','vol-bag'].forEach(id=>{const el=document.getElementById(id); if(el) el.addEventListener('input', calcVolume);});
  if(document.getElementById('vol-result')) calcVolume();
  if(document.getElementById('sp-result')) calcSpacing();
  if(document.getElementById('seed-result')) calcSeed();
  if(document.getElementById('fert-result')) calcFert();
  if(document.getElementById('water-result')) calcWater();
  if(document.getElementById('pot-result')) calcContainer();
});

function calcYield(){
  const plants=num('y-plants',20), per=num('y-per',2);
  out('y-result', `<strong>About ${fmt(plants*per,0)} units</strong> estimated harvest (${plants} plants × ${per} per plant). This is a planning estimate — variety, weather and care change real yield.`);
}
function calcCost(){
  const vol=num('c-vol',32), price=num('c-price',50);
  const yards=vol/27;
  out('c-result', `<strong>About $${fmt(vol/27*price,0)} for soil</strong> (${fmt(yards)} cubic yards × $${price} per yard), before delivery and mulch. Add delivery separately — it is often more than the soil itself for small loads.`);
}
function calcRow(){
  const len=num('r-len',20), spacing=num('r-spacing',12);
  const plants=Math.floor(len/(spacing/12));
  out('r-result', `<strong>About ${fmt(plants,0)} plants in one ${len} ft row</strong> at ${spacing} in spacing, plus a path at each end if you need access.`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  const bind=(btn, fn)=>{ const el=document.getElementById(btn); if(el) el.addEventListener('click', fn); };
  bind('y-calc', calcYield); bind('c-calc', calcCost); bind('r-calc', calcRow);
  if(document.getElementById('y-result')) calcYield();
  if(document.getElementById('c-result')) calcCost();
  if(document.getElementById('r-result')) calcRow();
});

function calcLawn(){
  const area=num('l-area',1000), rate=num('l-rate',5);
  const lb=area/1000*rate;
  out('l-result', `<strong>About ${fmt(lb,1)} lb of seed</strong> for ${fmt(area,0)} sq ft at ${rate} lb per 1,000 sq ft. For overseeding an existing lawn, use a lower rate (often half the new-lawn rate) — check the seed bag.`);
}
function calcGravel(){
  const len=convertLen(num('g-len',10)), wid=convertLen(num('g-wid',4)), dep=convertDepth(num('g-dep',3));
  const cf=len*wid*dep/12, cy=cf/27;
  out('g-result', `<strong>About ${fmt(cf)} cubic feet (${fmt(cy)} cubic yards)</strong> for a ${fmt(len,1)} × ${fmt(wid,1)} ft area at ${fmt(dep,1)} in deep. Ask your supplier for the weight in tons, as it varies by stone type — volume is the reliable number to order by.`);
}
function calcMix(){
  const vol=num('m-vol',32), top=num('m-top',60), comp=num('m-comp',30), aer=num('m-aer',10);
  const sum=top+comp+aer;
  const note = sum===100 ? '' : ` <em>Note: your percentages add to ${sum}%, not 100% — adjust them so they total 100%.</em>`;
  out('m-result', `<strong>Topsoil ${fmt(vol*top/100)} cu ft · Compost ${fmt(vol*comp/100)} cu ft · Aeration ${fmt(vol*aer/100)} cu ft</strong> for ${vol} cu ft total.${note}`);
}
function calcPaver(){
  const area=num('p-area',100), ps=num('p-size',12);
  const paverSq=(ps/12)*(ps/12), count=Math.ceil(area/paverSq - 1e-9), waste=Math.ceil(count*1.10 - 1e-9);
  out('p-result', `<strong>About ${fmt(count,0)} pavers</strong> for ${fmt(area,0)} sq ft at ${ps} in square pavers, or <strong>${fmt(waste,0)} with 10% waste</strong> for cuts and breakage.`);
}
function calcDrip(){
  const em=num('d-em',20), flow=num('d-flow',1), hrs=num('d-hrs',2);
  const gal=em*flow*hrs;
  out('d-result', `<strong>About ${fmt(gal)} gallons per week</strong> (${em} emitters × ${flow} gal/hr × ${hrs} hrs). Check soil moisture before increasing hours — drip systems deliver water slowly, so a long run can overwater clay soil.`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  const bind=(btn, fn)=>{ const el=document.getElementById(btn); if(el) el.addEventListener('click', fn); };
  bind('l-calc', calcLawn); bind('g-calc', calcGravel); bind('m-calc', calcMix); bind('p-calc', calcPaver); bind('d-calc', calcDrip);
  if(document.getElementById('l-result')) calcLawn();
  if(document.getElementById('g-result')) calcGravel();
  if(document.getElementById('m-result')) calcMix();
  if(document.getElementById('p-result')) calcPaver();
  if(document.getElementById('d-result')) calcDrip();
});

function calcRain(){
  const roof=num('rw-roof',1000), rain=num('rw-rain',1);
  const gal=roof*rain*0.623;
  out('rw-result', `<strong>About ${fmt(gal)} gallons</strong> from a ${fmt(roof,0)} sq ft roof in ${rain} inch of rain. A standard 55-gallon barrel fills many times over in a good storm — use multiple barrels or a larger tank if you want to store it.`);
}
function calcConcrete(){
  const len=convertLen(num('cc-len',10)), wid=convertLen(num('cc-wid',4)), dep=convertDepth(num('cc-dep',4));
  const cf=len*wid*dep/12, cy=cf/27, bags=Math.ceil(cf/0.6);
  out('cc-result', `<strong>About ${fmt(cf)} cubic feet (${fmt(cy)} cubic yards)</strong>, or about <strong>${fmt(bags,0)} × 80 lb bags</strong> at roughly 0.6 cu ft per bag — check your bag label, as yields vary by mix.`);
}
function calcLShape(){
  const l1=num('ls-l1',8), w1=num('ls-w1',4), l2=num('ls-l2',4), w2=num('ls-w2',4), dep=num('ls-dep',12);
  const cf=(l1*w1+l2*w2)*dep/12, cy=cf/27;
  out('ls-result', `<strong>About ${fmt(cf)} cubic feet (${fmt(cy)} cubic yards)</strong> for an L-shaped bed: ${fmt(l1,0)}×${fmt(w1,0)} ft main section plus ${fmt(l2,0)}×${fmt(w2,0)} ft wing, at ${fmt(dep,0)} in deep. Measure the wing as the part that sticks out beyond the main rectangle, not the full length including overlap.`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  const bind=(btn, fn)=>{ const el=document.getElementById(btn); if(el) el.addEventListener('click', fn); };
  bind('rw-calc', calcRain); bind('cc-calc', calcConcrete); bind('ls-calc', calcLShape);
  if(document.getElementById('rw-result')) calcRain();
  if(document.getElementById('cc-result')) calcConcrete();
  if(document.getElementById('ls-result')) calcLShape();
});

function calcEdging(){
  const len=num('e-len',20), wid=num('e-wid',10), piece=num('e-piece',24);
  const perim=2*(len+wid), pieces=Math.ceil(perim*12/piece - 1e-9), spare=Math.ceil(pieces*1.05 - 1e-9);
  out('e-result', `<strong>Perimeter about ${fmt(perim)} ft</strong> — about <strong>${fmt(pieces,0)} edging pieces</strong> at ${piece} in each, or <strong>${fmt(spare,0)} with 5% spare</strong> for cuts and breakage.`);
}
function calcLawnArea(){
  const len=num('la-len',40), wid=num('la-wid',25), dia=num('la-dia',0);
  const rect=len*wid, circ=dia>0 ? Math.PI*(dia/2)*(dia/2) : 0, total=rect+circ;
  out('la-result', `<strong>Total about ${fmt(total,0)} sq ft (${fmt(total/9)} sq yd)</strong> — rectangle ${fmt(rect,0)} sq ft${dia>0 ? ` + circle ${fmt(circ,0)} sq ft` : ''}. Use this area in the <a href="/calculators/lawn-seed/">lawn seed</a> and <a href="/calculators/fertilizer/">fertilizer</a> calculators.`);
}
document.addEventListener('DOMContentLoaded', ()=>{
  const bind=(btn, fn)=>{ const el=document.getElementById(btn); if(el) el.addEventListener('click', fn); };
  bind('e-calc', calcEdging); bind('la-calc', calcLawnArea);
  if(document.getElementById('e-result')) calcEdging();
  if(document.getElementById('la-result')) calcLawnArea();
});

/* Homepage calculator search: filters the full calculator list live */
function initSearch(){
  const input=document.getElementById('calc-search');
  const list=document.getElementById('calc-list');
  if(!input || !list) return;
  const items=list.querySelectorAll('li');
  const count=document.getElementById('calc-count');
  input.addEventListener('input', ()=>{
    const q=input.value.trim().toLowerCase(); let shown=0;
    items.forEach(li=>{ const hit=!q || li.textContent.toLowerCase().includes(q); li.style.display=hit?'':'none'; if(hit) shown++; });
    if(count) count.textContent = q ? shown + ' of 22 calculators' : '22 calculators';
  });
}
/* Reset buttons: restore each input to its original value, then recalculate */
function initReset(){
  document.querySelectorAll('.card').forEach(card=>{
    const calcBtn=card.querySelector('.btn[id$="-calc"]');
    if(!calcBtn || card.querySelector('.btn-reset')) return;
    const inputs=card.querySelectorAll('input, select');
    if(!inputs.length) return;
    inputs.forEach(el=>{ el.dataset.defaultValue = el.value; });
    const btn=document.createElement('button');
    btn.type='button'; btn.className='btn secondary btn-reset'; btn.textContent='Reset';
    btn.addEventListener('click', ()=>{
      inputs.forEach(el=>{ el.value = el.dataset.defaultValue; if(el.tagName==='SELECT') el.dispatchEvent(new Event('change')); });
      calcBtn.click();
    });
    const actions=card.querySelector('.calc-actions') || (()=>{ const d=document.createElement('div'); d.className='calc-actions'; calcBtn.parentNode.insertBefore(d, calcBtn.nextSibling); return d; })();
    if(!card.querySelector('.calc-actions')){ actions.appendChild(calcBtn); }
    actions.appendChild(btn);
  });
}
/* Unit selector for volume calculators (soil, mulch, gravel, concrete): metric inputs are converted to ft/in before the formula */
function unitFactor(){
  const sel=document.getElementById('unit-select');
  return sel && sel.value==='metric' ? 'metric' : 'imperial';
}
function convertLen(v){ return unitFactor()==='metric' ? v*3.28084 : v; }
function convertDepth(v){ return unitFactor()==='metric' ? v/2.54 : v; }
function initUnits(){
  const sel=document.getElementById('unit-select');
  if(!sel) return;
  const labels=document.querySelectorAll('.card .field label');
  sel.addEventListener('change', ()=>{
    const metric=sel.value==='metric';
    labels.forEach(l=>{
      if(!l.dataset.orig) l.dataset.orig=l.textContent;
      const orig=l.dataset.orig;
      if(metric){ l.textContent=orig.replace('(feet)','(metres)').replace('(inches)','(cm)').replace('(feet)','(metres)'); }
      else { l.textContent=orig; }
    });
    const btn=document.querySelector('.card .btn[id$="-calc"]'); if(btn) btn.click();
  });
}
document.addEventListener('DOMContentLoaded', ()=>{ initSearch(); initReset(); initUnits();
  document.querySelectorAll('.big-value').forEach(el=>el.setAttribute('aria-live','polite'));
});
