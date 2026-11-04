/* Garden Calculator Pro — real gardening calculators. All formulas are standard, unit-based, and shown on each page. */
function num(id, defv){ const el=document.getElementById(id); const v=parseFloat(el&&el.value); return isFinite(v)?v:defv; }
function out(id, html){ const el=document.getElementById(id); if(el) el.innerHTML=html; }
function fmt(n, d){ return (d===undefined?2:d)===0 ? Math.round(n).toLocaleString('en-US') : n.toLocaleString('en-US',{maximumFractionDigits:d}); }
// Soil / mulch volume: L ft x W ft x D in -> cu ft = L*W*D/12, cu yd = cu ft/27, bags at bagSize cu ft
function calcVolume(){
  const L=num('vol-length',4), W=num('vol-width',8), D=num('vol-depth',12), bag=num('vol-bag',2);
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
  out('fert-result', `<strong>${fmt(product)} lb of ${grade}-${grade}-${grade} style product</strong> to supply ${need} lb of nitrogen per 1,000 sq ft over ${area} sq ft. For a real grade, use the first number (N) only — e.g. 10-10-10 means 10% N.`);
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
  const greens=num('comp-greens',10), ratio=num('comp-ratio',30);
  const browns=greens*ratio/15; // target C:N ~30:1, greens ~15:1, browns ~60:1 simplified: browns = greens * (30-15)/(60-30) approx? Use simple rule below instead
  // Simpler honest rule: for 30:1 target with greens 15:1 and browns 60:1, browns:greens = 1:1 by nitrogen, by volume roughly 2-3 parts browns to 1 part greens. Show that, not a false precise formula.
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
